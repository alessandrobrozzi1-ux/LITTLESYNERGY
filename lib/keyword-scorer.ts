import Anthropic from '@anthropic-ai/sdk'

export interface ScoredKeyword {
  keyword: string
  score: number        // 0-100 composite score
  volume: 'low' | 'medium' | 'high'
  difficulty: 'easy' | 'medium' | 'hard'
  relevance: number    // 1-10
}

export const NICHE_CONTEXT: Record<string, string> = {
  es: `Blog doTERRA para MAMÁS y NIÑOS. Aceites esenciales para bebés, niños pequeños y niños, y para mamás (embarazo, posparto, lactancia, autocuidado). SIEMPRE en contexto infantil/materno: aceites para dormir niños, aceites relajantes para niños pequeños, difusión segura en cuarto infantil, aceites suaves para bebés, aceites para mamás cansadas, autocuidado posparto, aceites seguros en el embarazo, cómo comprar doTERRA para la familia. NUNCA keywords genéricas de adultos.`,
  en: `Blog doTERRA for MOMS and KIDS. Essential oils for babies, toddlers and children, and for moms (pregnancy, postpartum, breastfeeding, self-care). ALWAYS a kids/baby/mom/pregnancy angle: essential oils for kids' sleep, calming oils for toddlers, safe diffusing in a kids' room, gentle oils for babies, essential oils for tired moms, postpartum self-care oils, safe oils during pregnancy, how to buy doTERRA for the family. NEVER generic adult keywords.`,
  fr: `Blog doTERRA pour les MAMANS et les ENFANTS. Huiles essentielles pour bébés, tout-petits et enfants, et pour les mamans (grossesse, post-partum, allaitement, soin de soi). TOUJOURS un angle enfant/bébé/maman/grossesse: huiles pour le sommeil des enfants, huiles calmantes pour tout-petits, diffusion sûre dans la chambre d'enfant, huiles douces pour bébé, huiles pour mamans fatiguées, soin de soi post-partum, huiles sûres pendant la grossesse, comment acheter doTERRA pour la famille. JAMAIS de keywords génériques pour adultes.`,
  de: `doTERRA ätherische Öle, Aromatherapie, natürliches Wohlbefinden, Lavendelöl, Pfefferminzöl,
       Weihrauch doTERRA, ätherische Öle kaufen, Wellness Öle Deutschland`,
  it: `Blog doTERRA per MAMME e BAMBINI. Oli essenziali per neonati, bambini piccoli e bambini, e per le mamme (gravidanza, post parto, allattamento, cura di sé). SEMPRE in contesto bambini/mamma: oli per il sonno dei bambini, oli calmanti per bambini piccoli, diffusione sicura nella cameretta, oli delicati per neonati, oli per mamme stanche, cura di sé post parto, oli sicuri in gravidanza, come comprare doTERRA per la famiglia. MAI keywords generiche per adulti.`,
  pt: `Blog doTERRA para MÃES e CRIANÇAS. Óleos essenciais para bebês, crianças pequenas e crianças, e para as mães (gravidez, pós-parto, amamentação, autocuidado). SEMPRE em contexto infantil/materno: óleos para o sono das crianças, óleos calmantes para crianças pequenas, difusão segura no quarto do bebê, óleos suaves para bebês, óleos para mães cansadas, autocuidado pós-parto, óleos seguros na gravidez, como comprar doTERRA para a família. NUNCA keywords genéricas de adultos.`,
}

const NICHE_CONTEXT_DEFAULT = `doTERRA essential oils for kids, babies and moms: kids' sleep, calming oils for toddlers,
  gentle oils for babies, oils for tired moms, safe oils during pregnancy, how to buy doTERRA for the family`

// L3 GUARD — a keyword is on-niche ONLY if it carries a kids/baby/toddler/child/mom/pregnancy modifier.
// Whitelist per lingua. Le lingue senza guardia passano (return true).
const NICHE_MODIFIER: Record<string, RegExp> = {
  en: /\b(kids?|bab(y|ies)|toddlers?|child(ren)?|infants?|newborns?|pregnan(t|cy)|nursing|breastfeeding|moms?|mothers?|maternity|nursery)\b/i,
  es: /\b(niñ[oa]s?|beb[eé]s?|embaraz(o|ada|adas)|lactancia|mam[áa]s?|madres?|pequeñ[oa]s?|infantil(es)?)\b/i,
  it: /\b(bambin[oi]|neonat[oi]|lattante|gravidanza|incinta|mamm[ae]|madre|piccol[oi]|infantile)\b/i,
  fr: /\b(enfants?|b[ée]b[ée]s?|tout-petits?|nourrissons?|grossesse|enceinte|mamans?|m[èe]res?|allaitement)\b/i,
  pt: /\b(crian[çc]as?|beb[êé]s?|rec[ée]m-nascidos?|gravidez|gr[áa]vida|m[ãa]es?|mam[ãa]e|amamenta[çc][ãa]o|pequen[oa]s?|infantil)\b/i,
}
export function hasNicheModifier(keyword: string, languageCode: string): boolean {
  const re = NICHE_MODIFIER[languageCode]
  return re ? re.test(keyword) : true
}

export async function scoredKeywords(languageCode: string, usedKeywords: Set<string>, nicheContext?: string): Promise<ScoredKeyword[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const niche = nicheContext ?? NICHE_CONTEXT[languageCode] ?? NICHE_CONTEXT_DEFAULT
  const langLabel = languageCode
  const usedList = Array.from(usedKeywords).slice(0, 20).join(', ')

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `You are an SEO keyword research expert for a doTERRA essential oils affiliate blog targeting speakers of language code "${langLabel}".

Niche context: ${niche}

Recently used keywords (avoid these): ${usedList || 'none'}

Generate 6 SEO keyword ideas. For each keyword provide:
- keyword: the search term (write in the language matching code "${langLabel}")
- volume: estimated monthly searches category ("low" <500, "medium" 500-5000, "high" >5000)
- difficulty: competition level ("easy" = few competing articles, "medium", "hard" = very competitive)
- relevance: relevance to doTERRA/essential oils niche 1-10

Prioritize: high relevance (8-10) + medium/high volume + easy/medium difficulty = best opportunity.
Focus on informational and commercial intent keywords.

CRITICAL NICHE RULE (mandatory): EVERY keyword MUST be in the context of CHILDREN, BABIES, TODDLERS, MOMS, PREGNANCY or BREASTFEEDING (e.g. "essential oils for kids' sleep", "safe oils during pregnancy", "calming oils for toddlers", "aceites para dormir niños"). NEVER return a generic adult essential-oil keyword (e.g. "essential oils for sleep", "lavender oil benefits", "aromatherapy at home", "aceites para dormir mejor"). If a keyword lacks a kids/baby/toddler/child/mom/pregnancy angle, do NOT include it.

Return ONLY valid JSON array, no explanation:
[{"keyword":"...","volume":"medium","difficulty":"easy","relevance":9}, ...]`,
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) return []

  const raw = JSON.parse(match[0]) as Array<{
    keyword: string
    volume: 'low' | 'medium' | 'high'
    difficulty: 'easy' | 'medium' | 'hard'
    relevance: number
  }>

  const volumeScore = { low: 10, medium: 30, high: 50 }
  const difficultyScore = { easy: 30, medium: 15, hard: 0 }

  return raw
    .filter((k) => k.keyword && !usedKeywords.has(k.keyword.toLowerCase()))
    .filter((k) => hasNicheModifier(k.keyword, languageCode))  // L3 guard: scarta keyword senza modificatore nicchia
    .map((k) => ({
      ...k,
      score: (k.relevance * 2) + volumeScore[k.volume] + difficultyScore[k.difficulty],
    }))
    .sort((a, b) => b.score - a.score)
}

export async function bestKeywordForToday(languageCode: string, usedKeywords: Set<string>, nicheContext?: string): Promise<string> {
  const keywords = await scoredKeywords(languageCode, usedKeywords, nicheContext)
  return keywords[0]?.keyword ?? (NICHE_CONTEXT[languageCode]?.split(',')[0]?.trim() ?? 'doTERRA essential oils')
}
