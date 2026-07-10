import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { fetchTrendingKeywords } from '@/lib/trends'
import { fetchFeaturedImage } from '@/lib/unsplash'
import { getWorldLinkUrl } from '@/lib/world-link-markets'
import { calculateSeoScore } from '@/lib/seo-score'
import { generateEmbedding, storeArticleEmbedding, findRelatedArticles } from '@/lib/embeddings'
import type { Brand } from '@/lib/types'

export const maxDuration = 120

// ─── Existing-slug cache (1h TTL) — prevents slug collisions with existing articles ─
let _soroCache: { slugs: Set<string>; at: number } | null = null
async function getSoroSlugs(): Promise<Set<string>> {
  if (_soroCache && Date.now() - _soroCache.at < 3_600_000) return _soroCache.slugs
  try {
    const res = await fetch('https://littlesynergy.com/sitemap.xml', {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return new Set()
    const xml = await res.text()
    const slugs = new Set<string>()
    for (const m of xml.matchAll(/<loc>[^<]*\/blog\/([^/<]+)<\/loc>/g)) {
      slugs.add(m[1])
    }
    _soroCache = { slugs, at: Date.now() }
    return slugs
  } catch { return new Set() }
}

function sanitizeProductUrls(
  content: string,
  brand: { owner_id?: string; affiliate_base_url?: string },
  verifiedSlugs: Set<string>,
  worldLinkUrl?: string,
): string {
  // World-link markets: redirect ANY doTERRA shop/product URL in the body to the gateway.
  // Anchor text is preserved; only the href changes. (Normal markets fall through unchanged.)
  if (worldLinkUrl) {
    return content.replace(/https?:\/\/(?:shop|www)\.doterra\.com\/[^\s)"'\]]+/g, worldLinkUrl)
  }
  const affiliateUrl = brand.affiliate_base_url
  const ownerId = brand.owner_id
  if (!affiliateUrl || !ownerId) return content

  // Pattern 1: shop.doterra.com/XX/xx_XX/shop/ (ES-style)
  const shopMatch = affiliateUrl.match(/^(https:\/\/shop\.doterra\.com\/[^/]+\/[^/]+\/shop)/)
  if (shopMatch) {
    const shopBase = shopMatch[1]
    const escapedBase = shopBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`${escapedBase}\\/([^/?]+)\\/?\\?OwnerID=${ownerId}`, 'g')
    return content.replace(regex, (match, slug) =>
      verifiedSlugs.has(slug) ? match : affiliateUrl
    )
  }

  // Pattern 2: www.doterra.com/XX/xx/p/ (EN/US-style)
  const wwwMatch = affiliateUrl.match(/^(https:\/\/www\.doterra\.com\/[^/]+\/[^/]+)/)
  if (wwwMatch) {
    const marketBase = wwwMatch[1]  // e.g. "https://www.doterra.com/US/en"
    const escapedBase = marketBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`${escapedBase}\\/p\\/([^/?]+)\\/?(?:\\?OwnerID=\\d+)?`, 'g')
    return content.replace(regex, (match, slug) =>
      verifiedSlugs.has(slug) ? `${marketBase}/p/${slug}/?OwnerID=${ownerId}` : affiliateUrl
    )
  }

  return content
}


// Extended anti-em-dash law (deterministic post-processing): strip spaced AND attached em/en-dashes
// (—, –) from the article body, EXCEPT the byline (the italic author line, which legitimately uses " — ").
// Byline detection: an italic line (starts with "*") that names the brand. Covers EN + ES bylines.
function stripEmDashes(content: string): string {
  return content.split('\n').map((line) => {
    const t = line.trim()
    if (t.startsWith('*') && /LittleSynergy/i.test(line)) return line // byline: leave intact
    return line
      .replace(/\s*[—–]\s*/g, ', ')      // "a — b" and "a—b" → "a, b"
      .replace(/ ,/g, ',')
      .replace(/,\s*,/g, ',')
      .replace(/,\s*([.!?;:])/g, '$1')
  }).join('\n')
}
// Plain strip for single-line fields (title, meta) — no byline present there.
function stripDashLine(s: string): string {
  return s.replace(/\s*[—–]\s*/g, ', ').replace(/,\s*,/g, ',').replace(/,\s*([.!?;:])/g, '$1').trim()
}

interface LinkExpertEntry { anchor_text: string; full_url: string }

// Oils that must NEVER carry an affiliate link on a kids blog (mirrors the
// "NO AFFILIATE LINK ON AVOID-LIST OILS" rule in childrenSafety). Linking ≠ endorsing:
// an oil we warn about is named in plain text, never linked, not even via the fallback.
const AVOID_LINK_SLUG = /(peppermint|eucalyptus|rosemary|wintergreen|cinnamon|clove|oregano|thyme)/i

function countDoterraLinks(md: string): number {
  return (md.match(/\[[^\]]+\]\(https?:\/\/[^)]*doterra[^)]*\)/gi) ?? []).length
}
function escapeRe(s: string): string { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

/**
 * LINK FLOOR — every article must carry at least 2 doTERRA links.
 * If the model produced fewer, linkify plain-text mentions of SAFE products that are
 * already in the body. Never invents sentences, never links an avoid-list oil, never
 * touches text already inside a markdown link.
 * World-link markets (pt/ja/ar) have no link_expert: their body links already funnel to
 * the gateway via sanitizeProductUrls, so nothing is injected there.
 */
function ensureDoterraBridge(content: string, linkExpert: LinkExpertEntry[], worldLinkUrl?: string): string {
  let out = content
  if (countDoterraLinks(out) >= 2 || worldLinkUrl) return out

  const candidates = linkExpert.filter(
    (e) => e.anchor_text && e.anchor_text.length >= 3 && !AVOID_LINK_SLUG.test(e.full_url)
  )

  for (const e of candidates) {
    if (countDoterraLinks(out) >= 2) break
    const anchor = e.anchor_text
    // already linked somewhere in the body → don't duplicate
    if (new RegExp(`\\[[^\\]]*${escapeRe(anchor)}[^\\]]*\\]\\(`, 'i').test(out)) continue

    // spans of existing markdown links — a match inside one must be skipped
    const spans: Array<[number, number]> = []
    for (const m of out.matchAll(/\[[^\]]*\]\([^)]*\)/g)) {
      const i = m.index ?? 0
      spans.push([i, i + m[0].length])
    }

    const re = new RegExp(`\\b${escapeRe(anchor)}\\b`, 'i')
    let idx = -1
    let from = 0
    for (;;) {
      const m = re.exec(out.slice(from))
      if (!m) break
      const abs = from + m.index
      if (!spans.some(([s, t]) => abs >= s && abs < t)) { idx = abs; break }
      from = abs + m[0].length
    }
    if (idx < 0) continue

    const matched = out.slice(idx, idx + anchor.length)
    out = `${out.slice(0, idx)}[${matched}](${e.full_url})${out.slice(idx + anchor.length)}`
  }
  return out
}

// GEO v3.1 — localized author attribution line (E-E-A-T signal, rendered in italics right after H1)
const AUTHOR_LINES: Record<string, string> = {
  en: 'By the LittleSynergy Team — moms, Wellness Advocates & doTERRA enthusiasts',
  es: 'Por el Equipo LittleSynergy — mamás, Wellness Advocates y entusiastas doTERRA',
  de: 'Vom LittleSynergy-Team, Mamas, Wellness Advocates und doTERRA-Fans',
  fr: "De l'équipe LittleSynergy, mamans, Wellness Advocates et passionnées de doTERRA",
  pt: 'Da equipa LittleSynergy, mães, Wellness Advocates e entusiastas de doTERRA',
  ro: 'De la echipa LittleSynergy, mame, Wellness Advocates și pasionate de doTERRA',
  ja: 'LittleSynergyチームより、ママ、ウェルネスアドボケイト、doTERRA愛好家',
  ar: 'من فريق LittleSynergy، أمهات ومستشارات عافية ومحبات لـ doTERRA',
  it: 'Dal team LittleSynergy, mamme, Wellness Advocates e appassionate di doTERRA',
  nl: "Van het LittleSynergy-team, mama's, Wellness Advocates en doTERRA-liefhebbers",
  pl: 'Od zespołu LittleSynergy, mamy, Wellness Advocates i miłośniczki doTERRA',
}

function buildSystemPrompt(brand: Brand, linkExpert: LinkExpertEntry[], worldLinkUrl?: string): string {
  const fallbackUrl = worldLinkUrl ?? brand.affiliate_base_url ?? 'https://www.doterra.com/US/en/shop/essential-oils'
  const authorLine = AUTHOR_LINES[brand.language_code] ?? AUTHOR_LINES.en

  // v3.9 — Japan 薬機法 compliance: ja-only hardening vs medical/physiological claims.
  // Additive; fires ONLY for ja → en/es/de/fr/pt/ro prompts are byte-identical.
  const jpCompliance = brand.language_code === 'ja'
    ? `

═══ JAPAN COMPLIANCE (薬機法) — MANDATORY, THIS MARKET ONLY ═══
Japan's 薬機法 strictly forbids medical/physiological claims for non-pharmaceutical wellness products. You MUST obey:
- NEVER reference specific biological mechanisms, body systems, organs, hormones, or neurotransmitters.
  FORBIDDEN: 自律神経・副交感神経・交感神経 (nervous system), ホルモン (hormones),
  セロトニン/GABA/メラトニン/コルチゾール (neurotransmitters), 血圧・血流・免疫系・消化器官・脳
  (blood pressure/flow, immune system, organs, brain).
- NEVER claim the product treats, prevents, cures, diagnoses, or alters any condition, symptom, or bodily function.
- NEVER cite 科学的研究 / "studies show" to imply a physiological effect.
- STAY on EXPERIENTIAL & TRADITIONAL framing ONLY: 「リラックスしたいときに」「多くの方が〜のために
  使っています」「伝統的に〜として親しまれてきました」「穏やかな香り」「気分転換に」.
  Describe scent, mood, ambiance and daily-life use — never physiology.
- Keep the soft, non-clinical register required above.
═══════════════════════════════════════════════════════`
    : ''

  // v3.11 — Gulf/UAE compliance: ar-only hardening vs medical/therapeutic & miracle claims (GCC/GSO).
  // Additive; fires ONLY for ar → other brands' prompts byte-identical.
  const arCompliance = brand.language_code === 'ar'
    ? `

═══ GULF/UAE COMPLIANCE (GCC/GSO health-claim rules) — MANDATORY, THIS MARKET ONLY ═══
UAE & Gulf (GCC/GSO) law forbids medical/therapeutic claims for non-medicinal wellness products, in the article body AND any promotional text. You MUST obey:
- NEVER claim the product prevents, cures, treats, diagnoses or heals any disease, ailment, condition or symptom (such claims can reclassify it as a medicine).
- NEVER use miracle/guarantee wording: no «معجزة» (miracle), «مضمون» (guaranteed), «فعّال 100٪» (100% effective), «نتائج أكيدة» (certain results), «شفاء» (cure).
- NEVER claim the product is "safe / harmless / no side effects" (آمن تمامًا / بلا آثار جانبية / لا ضرر منه).
- NEVER cite unverified "studies/science" to imply a therapeutic effect.
- STAY on EXPERIENTIAL, TRADITIONAL and GENERAL-WELLNESS framing ONLY: «للاسترخاء», «يستخدمه كثيرون لـ», «يُستخدم تقليديًا لـ», «رائحة مهدّئة», «لأجواء منعشة». Describe scent, mood, ambiance and daily-life use — never disease, physiology or cure.
- Keep the soft, non-clinical register required above.
═══════════════════════════════════════════════════════`
    : ''

  // LittleSynergy — PT = PORTUGAL (pt_PT). Force EUROPEAN Portuguese, block Brazilian leakage. Additive, fires ONLY for pt.
  const ptRegister = brand.language_code === 'pt'
    ? `

═══ PORTUGUESE VARIANT — EUROPEAN (pt_PT), MANDATORY, THIS MARKET ONLY ═══
This blog targets PORTUGAL. Write in EUROPEAN Portuguese (pt_PT), NEVER Brazilian (pt_BR). This governs the TITLE, body, FAQ and meta.
- ADDRESS THE READER AS "tu" (informal European), or impersonally — NEVER "você". Use tu-conjugations and European clitics ("ajuda-te", "lembra-te", "podes", "sente-te"), not "te ajuda" / "você pode".
- SPELLING & LEXICON — use the European form, NOT the Brazilian one:
  * "stress" (NOT "estresse"), "autocarro"-register vocabulary, "pequeno-almoço" (NOT "café da manhã"), "casa de banho" (NOT "banheiro"), "telemóvel" (NOT "celular"), "bebé" (NOT "bebê"), "partilhar" (NOT "compartilhar"), "ecrã", "constipação".
  * Verb construction: prefer "estou a fazer" (European) over "estou fazendo" (Brazilian gerund).
- Keep the warm mum-to-mum voice, but in the natural register of a Portuguese mother from Portugal, not Brazil.
═══════════════════════════════════════════════════════`
    : ''

  // v3.12 — doTERRA purchase mechanism (product-pattern markets with buying pillars: it/nl/pl/fr). Additive, gated.
  const productMechanism = ['it', 'nl', 'pl', 'fr', 'en', 'de', 'ro'].includes(brand.language_code)
    ? `

═══ doTERRA PURCHASE MECHANISM (mandatory for this market) ═══
- Registration is FREE and quick (~5 min): the reader simply enters email + details and adds ANY product to the cart. A kit is NOT required and there is NO obligation.
- Membership (the 25% discount) carries a small annual fee that is WAIVED when an order exceeds 150 PV (often with free shipping too).
- Enrolment kits are a RECOMMENDED OPTION (they usually exceed 150 PV, so the fee is waived, and they offer good value) — NEVER the only way and NEVER mandatory.
- NEVER write or imply that buying a kit is required to become a member.
- NEVER state the exact fee amount (it varies by market and promotion) — refer to it generally (e.g. "a small annual fee, waived on orders over 150 PV").`
    : ''

  // v3.12 — universal doTERRA facts + style (ALL markets, all languages)
  const universalDoterraRules = `

═══ doTERRA FACTS + STYLE — ALWAYS APPLY ═══
- The 25% is a DISCOUNT on the doTERRA catalogue (member price vs retail price). NEVER describe it as "lifetime" / "forever" / "permanent" / "permanente" / "standing" / "définitif" / "a vita" / "à vie" / "voor het leven" / "na zawsze" or any perpetual/standing-guarantee wording — it is simply the member price, applied to member purchases, not a perpetual guarantee.
- CPTG = "Certified Pure Tested Grade" — doTERRA's OWN purity and testing standard. NEVER write "therapeutic grade", "therapeutic quality" or any local "therapeutic" equivalent (terapéutico / terapeutico / therapeutische / terapeutic). Describe it as doTERRA's testing and purity standard, attributed to doTERRA.
- PRICES: NEVER state specific prices in any currency (€, $, zł, CHF, etc.) for products, kits or the membership fee. You cannot know accurate current prices and invented figures damage credibility. Speak relatively only: "member price", "25% off the retail price", "a small annual fee waived on orders over 150 PV".
- STYLE: NEVER use an em-dash or en-dash (—, –) anywhere, whether spaced ( — ) or attached (word—word). This is mandatory. Use commas, parentheses, colons or full stops instead. (A deterministic post-processor also strips them, so write clean.)

═══ INCOME CLAIMS — ZERO TOLERANCE (highest legal risk: FTC / DSA / regulators) ═══
This rule applies to EVERY language and EVERY market, with no exception.
- NEVER state income figures, monthly or annual earnings, "earning potential", per-rank earnings, ROI, or ANY money amount a reader might make — not as a number, a range, an "up to X", or in any currency.
- NEVER build or fill a rank/earnings table that pairs a rank or a volume with an income amount. Ranks may ONLY be described as VOLUME milestones (e.g. PV / OV requirements), never as income or earning potential.
- NEVER imply expected, typical, or achievable earnings ("most earn X", "you can reach X per month", "replace your salary", "passive income of…").
- Describe the business opportunity ONLY in terms of effort, flexibility, structure and the compensation MECHANISM (e.g. retail margin = member price vs retail price; team bonuses exist) — NEVER the amounts.
- Frame ranks as volume milestones, not income. If earnings context is unavoidable, state plainly that most people who join direct-selling companies earn little or no income, some spend more than they earn, and doTERRA does not guarantee any income.

═══ PRODUCT NAMES — always native (ALL products) ═══
Applies to EVERY product name (frankincense, peppermint, lavender, wild orange, etc.).
Even when the keyword contains the ENGLISH product name, in the TITLE and BODY always use the NATIVE product name of the target language. The English keyword name is for SEO matching ONLY and must NEVER appear as the product name in the text.
Example — frankincense → Kadzidłowiec (PL) · اللبان (AR) · Incenso (IT/PT) · Weihrauch (DE) · Encens (FR) · Incienso (ES) · Tămâie (RO) · Wierook (NL) · 乳香/フランキンセンス (JA).
ALWAYS follow the brand's DNA product-name list for the exact spelling. Keep only the names the DNA marks as staying English (e.g. "Tea Tree") or doTERRA blend brand names (On Guard, Deep Blue, Serenity, Balance).`

  // LittleSynergy — CHILDREN & BABIES safety. ALWAYS ON for this project (whole niche = kids/moms).
  // Universal (every language). Highest safety/legal risk on this site.
  const childrenSafety = `

═══ CHILDREN & BABIES SAFETY — ZERO TOLERANCE (this niche's highest risk) ═══
This blog is read by PARENTS of babies, toddlers and children, and by mothers (including pregnant and postpartum). Essential-oil content aimed at children carries the highest safety and legal risk on this site. You MUST obey every rule below.

- NEVER give numeric TOPICAL dosages or skin-dilution amounts for children, babies or pregnant/breastfeeding women: no drop counts, ratios or percentages for anything applied to the body or added to a bath (FORBIDDEN: "1 drop on the skin", "1 drop to the bath", "2%", "1:10", "X drops per ml of carrier oil"). Skin/bath dilution may ONLY be described qualitatively: "always dilute generously with a carrier oil", "use sparingly", "far more diluted than for an adult". Topical numbers are the pediatrician's job, never yours.
  * EXCEPTION — ambient DIFFUSER drop counts ARE allowed (the oil is not applied to the child), e.g. "2-3 drops in the diffuser". Keep them small and framed as "less than for an adult". This exception applies ONLY to diffusing, NEVER to skin, bath or ingestion.
- NEVER claim an oil treats, cures, heals, prevents, relieves or manages ANY condition, symptom, illness or developmental issue in a child (no colic, teething, reflux, fever, cough, cold, ear infection, eczema, ADHD, autism, anxiety, etc.). This is a medical claim about a minor and is absolutely forbidden.
- NEVER suggest use on NEWBORNS or INFANTS, and NEVER state a specific age in numbers as a fact of your own: FORBIDDEN to write "under 6 years", "over 2 years old", "from 3 months", "under six months", "menores de 6 años", "a partir de los 2 años", "poniżej szóstego miesiąca", "sotto i sei mesi" or any self-authored age threshold, minimum or cutoff. This holds EVEN when the number is meant as a CAUTION or warning (e.g. "especially babies under 6 months"): still do NOT attach a specific month/year figure. Refer to the youngest group only in WORDS, never a number: "newborns and infants", "the very young", "babies and young children", "los más pequeños", "die ganz Kleinen", "de allerkleinsten", "cei mai mici", "najmłodsze dzieci". Age guidance is doTERRA's and the pediatrician's job: always defer to "doTERRA's official age guidance on the product label" and "your pediatrician", never a number you chose. A wrong number is a real risk.
- NEVER describe any oil as "safe for babies", "gentle enough for newborns", "100% safe", "harmless" or "no side effects" for children.
- NAMED HIGH-RISK OILS, NEVER present these as suitable or safe for children:
  * "HOT" / irritant oils (Cinnamon, Clove, Oregano, Thyme): NEVER on a child's skin.
  * PHOTOTOXIC citrus oils (Bergamot, Lemon, Wild Orange and other citrus): NEVER on skin that will be exposed to sunlight.
  * HIGH-MENTHOL / 1,8-CINEOLE oils (Peppermint, Eucalyptus, Rosemary, Wintergreen): NOT for young children, do not imply otherwise.
  If any of these is mentioned, state plainly it is best kept away from young children / off children's skin, and to ask a pediatrician.
- DIFFUSION SAFETY — HIGH-MENTHOL / 1,8-CINEOLE oils (Peppermint, Eucalyptus, Rosemary, Wintergreen): the diffuser-drop exception above does NOT apply to these oils around the very young. NEVER suggest DIFFUSING them around newborns, infants or very young children: the respiratory risk exists through INHALATION, not only skin contact. If diffusing them is mentioned at all, restrict it to well-ventilated SHARED spaces, NEVER a young child's bedroom or nursery, and always say to ask the pediatrician first.
- NO AFFILIATE LINK ON AVOID-LIST OILS. Product/shop links exist to sell what you RECOMMEND. NEVER attach a markdown link (shop.doterra.com, office.doterra.com or any URL) to an oil while you are telling the reader NOT to use it around children, i.e. any oil named in a warning, an "avoid" / "to keep away" list, or a "not for young children" caution (Peppermint, Eucalyptus, Rosemary, Wintergreen, Cinnamon, Clove, Oregano, Thyme, etc.). Name those oils as PLAIN TEXT only. Links belong ONLY on the recommended, child-safe oils. Linking an oil you just said to avoid is incoherent and pushes the reader to buy exactly the wrong product.
- NO "OWN USE" LOOPHOLE (the ENVIRONMENT governs, not who the oil is "for"). A diffuser or open bottle fills a SHARED space a baby or child also breathes, so the rules above hold EVEN when framed as the mother's own personal use ("for your own relaxation", "for yourself", "the parents' diffuser", "not for the baby", "para ti", "uso personal de mamá"). Specifically: (a) NEVER suggest diffusing high-menthol/1,8-cineole oils (Peppermint, Eucalyptus, Rosemary, Wintergreen) "for yourself" in a room a baby or young child shares; (b) NEVER slip a TOPICAL drop count, ml or percentage past the rule by reframing it as the mom's own amount. When a child is (or may be) in the environment, the child's safety governs, no matter who the oil is nominally "for". (The ambient diffuser-drop exception for gentle non-menthol oils still stands, kept small.)
- NO AGE×DOSE SCALE OR TABLE — ABSOLUTE. NEVER build, imply or fill a scale/table/list that pairs an AGE (or age band like "6 months-2 years", "2-6 years", "over 6 years") with a drop count, a dose, a diffusion time, or a dilution. This is exactly the self-authored age-and-dose guidance that belongs ONLY to doTERRA's official label and the pediatrician, never to you. FORBIDDEN examples: a column "Age | Drops", "under 2s: 1-2 drops", "for a 3-year-old use 2-3 drops by age". You MAY say generally that children need far fewer drops than an adult and that the amount depends on the child and the oil, then defer to the pediatrician and the doTERRA label, but you must NEVER turn that into an age-graded number scheme of your own.
- NEWBORN NUMBERS — ZERO. When the subject is a NEWBORN or a baby under about six months, give NO drop count at all, not even for the diffuser: the ambient diffuser-drop exception does NOT apply to newborns. Describe amounts only qualitatively ("a tiny amount", "very sparingly", "far less than for an adult") and defer to the pediatrician. FORBIDDEN for newborns: "1-2 drops", "a couple of drops", any number of drops/ml/%.
- PREGNANCY & BREASTFEEDING — RIGHT PROFESSIONAL. For content about pregnancy, the first trimester, or breastfeeding/nursing, direct the reader to their DOCTOR, OB or MIDWIFE, using the correct native term (ES: "médico, ginecólogo o matrona"; IT: "medico o ostetrica"; FR: "médecin ou sage-femme"; PT: "médico ou obstetra"), NOT only "your pediatrician" (the pediatrician is for the child, not the mother). Never give numeric dilutions for the mother either, and never claim an oil treats a pregnancy or postpartum condition.
- HANDLING "is it safe for kids?" QUERIES (these searches are welcome, the answer must be cautious): NEVER answer "yes, it's safe". Answer that it DEPENDS on the specific oil and the child's age, give the general caution principles above (dilute generously, avoid the high-risk oils listed, prefer diffusing in shared spaces over applying to skin), and always send the reader to their pediatrician and the doTERRA label.
- NEVER position essential oils as a substitute for pediatric medical care, vaccines, prescribed treatment or a doctor's visit.
- ALWAYS include, naturally and in the article's language, an explicit reminder to CONSULT A PEDIATRICIAN before using any essential oil on or around a child, and to follow doTERRA's official age guidance and product labels.
- ALWAYS add a "keep out of reach of children" style note where use around kids is discussed.
- STAY on an EXPERIENTIAL, GENTLE, PARENT-TO-PARENT register: calming bedtime routines, pleasant aromas in the home, diffusing in shared family spaces, mom's own self-care. Describe scent, mood, cozy atmosphere and daily-life rituals, NEVER physiology, disease or cure. When in doubt, be MORE cautious, not less.
═══════════════════════════════════════════════════════`

  const linkBlock = linkExpert.length > 0
    ? `═══ LINK EXPERT — USE THESE LINKS WHEN MENTIONING PRODUCTS ═══
You MUST use the following pre-verified affiliate links when mentioning these products.
NEVER invent your own URLs. If a product is not listed below, use the FALLBACK URL.

${linkExpert.map(l => `${l.anchor_text} → ${l.full_url}`).join('\n')}

FALLBACK URL (for any product NOT listed above):
${fallbackUrl}
═══════════════════════════════════════════════════════`
    : worldLinkUrl
      ? `PRODUCT LINKS: This market uses ONE worldwide enrollment link. For ANY doTERRA product or oil you mention in the body, link to EXACTLY this URL (keep the anchor text natural in ${brand.language_name}, e.g. ラベンダーオイル): ${worldLinkUrl}
NEVER link to a doTERRA shop or product page — always use this single URL.`
      : `PRODUCT LINKS: For any doTERRA product, use: ${fallbackUrl}`

  return `You are an SEO content writer for ${brand.brand_name}.

CRITICAL RULES — MUST FOLLOW WITHOUT EXCEPTION:
1. ${linkBlock}
2. NEVER write a footer, CTA, or closing section after the article. Your article ends at the horizontal rule (---). Nothing after it.
3. Use wellness language only — NEVER make medical/scientific claims (no GABA, melatonin, cortisol, ADHD, depression, anxiety disorder).
4. Article MUST be complete: intro + body + FAQ (5-8 questions) + conclusion. Do NOT stop early.
5. Do NOT add any CTA, footer, or "¿Listo para empezar?" section — the footer is added automatically after.

BUSINESS TYPE:
${brand.brand_dna_business_type}

SERVICE AREA:
${brand.brand_dna_service_area}

TOPICS TO AVOID:
${brand.brand_dna_topics_to_avoid}

KEY THEMES:
${brand.brand_dna_key_themes}

BRAND VOICE:
${brand.brand_dna_brand_voice}

═══ GEO OPTIMIZATION REQUIREMENTS (mandatory for every article) ═══
1. OPENING = ONE VARIED HOOK, THEN THE DIRECT ANSWER. Start with ONE short hook sentence that is DIFFERENT every time, a relatable scenario, a real question, a surprising fact, or a concrete everyday moment. Do NOT open every article with the same phrase (e.g. avoid always starting with the short answer): vary the lead-in. Then, within the first 100-150 words, give the direct answer, the passage AI assistants extract for AI Overviews.
2. FAQ SECTION (mandatory). Include 4-6 real questions users actually ask, under the natural FAQ heading for ${brand.language_name}. Format each as **Question?** followed by a direct 2-3 sentence answer.
3. STRUCTURED CONTENT. Use numbered lists for step-by-step processes, bullet points for benefits/options, and AT LEAST 1 markdown comparison table where relevant. Add an H2 every 200-300 words.
4. EXPERIENCE SIGNALS (E-E-A-T). Weave in 1-2 natural first-person phrases ("In our experience…", "What we recommend most often is…"), translated naturally into ${brand.language_name}. Do NOT overclaim therapeutic benefits, do NOT invent customer numbers, and NEVER promise specific income, earnings, or financial results.
5. CITATIONS. When referencing research, phrase it generally ("Research published in [journal] suggests…") — never invent specific studies, and never contradict the wellness-only rule above (no medical/clinical claims).
6. CONVERSATIONAL TONE. Write like answering a friend's question — use "you"/"we" and contractions, avoid corporate jargon.
7. AUTHOR ATTRIBUTION (mandatory). Immediately after the H1 title, on its own line, output this EXACT italic author line:
*${authorLine}*
8. CONCISENESS (IMPORTANT). Warm does NOT mean long-winded. Moms read in a hurry, so make every sentence earn its place. Stay WITHIN the word-count target in the user prompt and do NOT exceed it, a tight warm 1000-word article beats a rambling 1400-word one. Cut filler, keep the heart.
═══════════════════════════════════════════════════════${jpCompliance}${arCompliance}${ptRegister}${productMechanism}${universalDoterraRules}${childrenSafety}`
}

const LENGTH_CONFIG = {
  short:  { words: '450-550',  sections: '2-3', faqs: '3' },
  medium: { words: '700-850', sections: '3-4', faqs: '4-5' },
  long:   { words: '1400-1600', sections: '5-6', faqs: '6-8' },
}

// Cron-safe word ceiling per language (Hobby 60s cap). Verbose/slow languages get a tighter target
// so generation stays text-safe under 60s. Latin new markets = 550-650; RTL/CJK world-link = 450-550.
const LANG_LENGTH_OVERRIDE: Record<string, string> = {
  // Tightened after prod timing (RO 550-650 → 867w/58s, too close to the 60s cap; no text backfill).
  de: '450-550', nl: '450-550', ro: '450-550', pl: '450-550',
  ar: '450-550', ja: '450-550',
}

function buildUserPrompt(brand: Brand, keyword: string, length: 'short' | 'medium' | 'long' = 'medium'): string {
  const cfg = LENGTH_CONFIG[length]
  const words = LANG_LENGTH_OVERRIDE[brand.language_code] ?? cfg.words
  // Purchase/getting-started cornerstone (footer-linked, conversion pillar): warmest, most personal mom-to-mom voice.
  const purchaseTone = /how to buy|buy doterra|join doterra|get started with doterra|become a member|c[oó]mo comprar|comprar doterra|empezar con doterra|hazte miembro|membres[ií]a/i.test(keyword)
    ? `\n\nPILLAR TONE (IMPORTANT — this is the getting-started / how-to-buy cornerstone, read by a mom deciding whether to register): make this the MOST personal, warm, mom-to-mom piece on the site. Open by meeting the reader exactly where she is ("if you're here, you're probably wondering…", "I remember feeling confused too when I first looked into this"). Tell it as your OWN lived experience in the first person ("what I figured out was…", "here's how it actually worked for me"). Reassure, never sell: no pressure, no hype, no salesy lines. The warmth must be the BACKBONE of the whole article, not a few sprinkled phrases. Keep every safety and factual rule intact (free registration, no kit required, no prices, CPTG wording, no income claims, no "lifetime" discount, children safety): only the VOICE gets warmer, never the facts.`
    : ''
  return `Write a complete SEO article (${words} words, HARD CAP, do NOT exceed) in ${brand.language_name} about: "${keyword}"
Keep it TIGHT: warmth lives in the VOICE, not in length. Moms skim, so ${words} words is the CEILING, never a floor to pad toward.

REQUIRED STRUCTURE (follow exactly):
1. SEO-optimized H1 title (include the keyword)
2. Author attribution line in italics immediately under the H1 — use the EXACT line given in the GEO rules of the system prompt
3. Introduction that OPENS with ONE varied hook (a relatable scenario, a real question, a surprising fact, or a concrete everyday moment, DIFFERENT for every article), THEN gives the direct 100-150 word answer to the topic (AI-Overview friendly), then leads into the article
4. ${cfg.sections} H2 sections with focused content — include AT LEAST 1 markdown comparison table and AT LEAST 1 numbered step-by-step list
5. FAQ section with ${cfg.faqs} questions and answers (use the appropriate FAQ heading in ${brand.language_name})
6. Brief conclusion in ${brand.language_name} — 2-3 sentences MAX, no CTA, no links, no promotional phrases
7. Horizontal rule (---)
8. STOP. Do NOT write anything after the horizontal rule. The footer is injected automatically by the system — if you write it yourself it will appear TWICE. Your article ends at ---.

CRITICAL: Do NOT add any call-to-action, footer, purchase links, or contact prompts after the conclusion. The conclusion must be a pure editorial wrap-up. Everything after --- is handled by the system.

LINK RULES:
- Use ONLY the pre-verified links from the LINK EXPERT block in the system prompt
- LINK FLOOR (mandatory): include AT LEAST 2 doTERRA product links in the body, 2-3 is ideal. NEVER zero, NEVER only one. Place them naturally where you recommend a specific oil, not bunched together.
- ANCHOR TEXT = the NATIVE product name in the article's language (Lavanda / Lavendel / Lawenda…), NEVER the English name and never a bare URL.
- For any product NOT in the Link Expert list, use the FALLBACK URL from the system prompt — with ONE EXCEPTION: an oil you are WARNING AGAINST (any oil in an avoid / "not for young children" / caution list, see CHILDREN & BABIES SAFETY) is NEVER linked, not even to the FALLBACK. Name it as PLAIN TEXT. Linking is endorsing.
- Never link to third parties

TITLE REQUIREMENTS (HARD CONSTRAINT):
- MUST be 45-58 characters total. Count strictly before writing.
- NEVER use a colon ":" in the title. The "X: Y" subtitle pattern is FORBIDDEN — not because of length, but because a colon is the single biggest "written by AI" tell. No colon, ever, even if it would fit. This rule is absolute.
- Write ONE natural, punchy phrase a real person would type, not a headline with a tagline bolted on. Drop secondary descriptors instead of adding a colon.
- ❌ BAD (colon): "How to Buy doTERRA: A Complete Guide"
- ❌ BAD (colon): "Essential Oils for Kids Sleep: Gentle Support"
- ✅ GOOD (34): "How to Buy doTERRA, Step by Step"
- ✅ GOOD (38): "Gentle Essential Oils for Kids Sleep"
- If your draft title exceeds 58 characters or contains a colon, rewrite it before outputting.

Output format (use exactly these markers):
---TITLE---
[Your title here — 45-58 characters, absolutely NO colon]
---META---
[Meta description, 150-160 characters]
---SLUG---
[URL slug: lowercase Latin letters and hyphens only, no accents. If the title is in a non-Latin script (e.g. Arabic), TRANSLITERATE the title's sounds into Latin letters — do NOT translate it to English. Example: "كيفية شراء دوتيرا" → "kayfiyat-shira-doterra"]
---CONTENT---
[Full article in markdown — MUST include FAQ + Conclusión + horizontal rule (---). STOP at the horizontal rule. Do NOT write anything after it.]${purchaseTone}`
}

function parseArticleResponse(text: string) {
  const extract = (marker: string, nextMarker: string) => {
    const start = text.indexOf(`---${marker}---\n`)
    if (start === -1) return ''
    const contentStart = start + `---${marker}---\n`.length
    const end = text.indexOf(`---${nextMarker}---`, contentStart)
    return end === -1 ? text.slice(contentStart).trim() : text.slice(contentStart, end).trim()
  }

  return {
    title: extract('TITLE', 'META'),
    meta_description: extract('META', 'SLUG'),
    slug: extract('SLUG', 'CONTENT')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80),
    content_markdown: extract('CONTENT', 'END'),
  }
}

export async function POST(req: NextRequest) {
  try {
    const { brand_id, keyword, length = 'medium', draft = false, status: requestStatus } = await req.json()
    const isDraft = draft === true || requestStatus === 'draft'

    if (!brand_id) {
      return NextResponse.json({ error: 'brand_id required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const [{ data: brand, error: brandError }, { data: linkExpertRows }] = await Promise.all([
      supabase.from('brands').select('*').eq('id', brand_id).single(),
      supabase.from('link_expert').select('anchor_text, full_url').eq('brand_id', brand_id).eq('active', true).order('priority', { ascending: false }),
    ])

    if (brandError || !brand) {
      return NextResponse.json({ error: `Brand not found: ${brandError?.message}` }, { status: 404 })
    }

    const linkExpert: LinkExpertEntry[] = linkExpertRows ?? []
    const worldLinkUrl = getWorldLinkUrl(brand.language_code) // gateway for JP; undefined for product-link markets (RO/PT/etc)
    const verifiedSlugs = new Set(
      linkExpert
        .map(l => {
          // ES pattern: /shop/[slug]/
          const shopMatch = l.full_url.match(/\/shop\/([^/?]+)/)
          if (shopMatch) return shopMatch[1]
          // EN/US pattern: /p/[slug]/
          const pMatch = l.full_url.match(/\/p\/([^/?]+)/)
          if (pMatch) return pMatch[1]
          return null
        })
        .filter(Boolean) as string[]
    )

    let finalKeyword = keyword
    let keywordSource: 'pytrends' | 'claude_fallback' = 'pytrends'

    if (!finalKeyword) {
      const { data: recentKeywords } = await supabase
        .from('keywords_history')
        .select('keyword')
        .eq('brand_id', brand_id)
        .order('used_at', { ascending: false })
        .limit(30)

      const usedKeywords = new Set(recentKeywords?.map((r: { keyword: string }) => r.keyword) ?? [])
      const { keywords, source } = await fetchTrendingKeywords(brand.language_code)
      finalKeyword = keywords.find((k) => !usedKeywords.has(k)) ?? keywords[0]
      keywordSource = source === 'claude_fallback' ? 'claude_fallback' : 'pytrends'
    }

    // ── Internal linking: embed keyword → find semantically related articles ────
    let internalLinkHint = ''
    try {
      const kwEmbedding = await generateEmbedding(finalKeyword)
      const related = await findRelatedArticles(brand_id, kwEmbedding, undefined, 2, 0.4)
      if (related.length > 0) {
        const domainBase = 'https://littlesynergy.com'
        // EN: /blog/[slug]  |  every other language: /xx/blog/[slug] (uniform, incl. DE).
        // v3.9: public path segment may differ from language_code (ja → /jp). Additive map; default = language_code.
        const LANG_PATH_OVERRIDE: Record<string, string> = { ja: 'jp' }
        const pathLang = LANG_PATH_OVERRIDE[brand.language_code] ?? brand.language_code
        const langPath = pathLang === 'en' ? '' : `/${pathLang}`
        const blogPath = '/blog'
        const linkLines = related.map((r, i) =>
          `${i + 1}. "${r.title}" → ${domainBase}${langPath}${blogPath}/${r.slug} (relevance: ${Math.round(r.similarity * 100)}%)`
        ).join('\n')
        internalLinkHint = `\n\nINTERNAL LINKS TO INCLUDE (semantically related articles on this site):\n${linkLines}\n\nNaturally include 1-2 of these as markdown links MAX. Only link where genuinely contextual. Prefer 1 high-quality link over 2 forced ones.`
      }
    } catch { /* non-blocking — internal linking failure never stops publish */ }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message = await (client.messages.create as any)({
      model: 'claude-sonnet-4-5',
      max_tokens: 8000,
      system: [{ type: 'text', text: buildSystemPrompt(brand as Brand, linkExpert, worldLinkUrl), cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: buildUserPrompt(brand as Brand, finalKeyword, length as 'short' | 'medium' | 'long') + internalLinkHint }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = parseArticleResponse(responseText)

    if (!parsed.title || !parsed.content_markdown) {
      return NextResponse.json({
        error: 'Claude returned invalid format',
        raw: responseText.slice(0, 500),
      }, { status: 500 })
    }

    // Title length warning (non-blocking)
    if (parsed.title.length > 65) {
      console.warn(`[generate-article] Title too long (${parsed.title.length} chars): "${parsed.title}"`)
    }

    // Slug collision check: avoid overriding existing Soro articles at same /blog/[slug]
    let safeSlug = parsed.slug || parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80)
    const soroSlugs = await getSoroSlugs()
    if (soroSlugs.has(safeSlug)) {
      safeSlug = `${safeSlug}-${brand.language_code}`
    }

    // Post-processing: sanitize any invented URLs, then strip em/en-dashes (byline preserved)
    let finalContent = parsed.content_markdown
    finalContent = sanitizeProductUrls(finalContent, brand as Brand, verifiedSlugs, worldLinkUrl)
    finalContent = stripEmDashes(finalContent)
    finalContent = ensureDoterraBridge(finalContent, linkExpert, worldLinkUrl) // floor: >= 2 doTERRA links, safe oils only
    parsed.title = stripDashLine(parsed.title)
    parsed.meta_description = stripDashLine(parsed.meta_description)

    // Featured image + SEO score (parallel)
    const [featuredImage, seoScore] = await Promise.all([
      fetchFeaturedImage(finalKeyword),
      Promise.resolve(calculateSeoScore(finalContent, parsed.title, parsed.meta_description, finalKeyword, false)),
    ])
    const finalSeoScore = calculateSeoScore(finalContent, parsed.title, parsed.meta_description, finalKeyword, !!featuredImage)

    const wordCount = finalContent.split(/\s+/).length

    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert([{
        brand_id,
        title: parsed.title,
        slug: safeSlug,
        meta_description: parsed.meta_description,
        content_markdown: finalContent,
        keyword_source: finalKeyword,
        featured_image: featuredImage,
        seo_score: finalSeoScore.score,
        status: isDraft ? 'draft' : 'published',
        published_at: isDraft ? null : new Date().toISOString(),
      }])
      .select()
      .single()

    if (articleError || !article) {
      return NextResponse.json({ error: `DB save failed: ${articleError?.message}` }, { status: 500 })
    }

    // Store embedding for new article (fire-and-forget — used by future articles for internal linking)
    void (async () => {
      try {
        const articleText = [parsed.title, parsed.meta_description, finalContent.slice(0, 2000)].join('\n')
        const embedding = await generateEmbedding(articleText)
        await storeArticleEmbedding(article.id, brand_id, embedding)
      } catch { /* non-blocking */ }
    })()

    await supabase.from('keywords_history').insert([{
      brand_id,
      keyword: finalKeyword,
      source: keywordSource,
      article_id: article.id,
    }])

    // Log cost (no extra API calls — usage already in message.usage)
    const inputTokens = message.usage.input_tokens
    const outputTokens = message.usage.output_tokens
    const cacheReadTokens = (message.usage as unknown as Record<string, number>).cache_read_input_tokens ?? 0
    const costUsd =
      ((inputTokens - cacheReadTokens) * 3 + cacheReadTokens * 0.3) / 1_000_000 +
      (outputTokens * 15) / 1_000_000
    void supabase.from('cost_log').insert([{
      brand_id,
      article_id: article.id,
      model: 'claude-sonnet-4-5',
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cache_read_tokens: cacheReadTokens,
      cost_usd: costUsd,
    }])

    void seoScore // unused intermediate var
    return NextResponse.json({ article, keyword: finalKeyword, word_count: wordCount, seo_score: finalSeoScore, cost_usd: costUsd })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
