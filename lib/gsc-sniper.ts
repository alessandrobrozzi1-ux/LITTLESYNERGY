/**
 * ═══ OPERAZIONE CECCHINO v1 — gsc-sniper (1 ago 2026, SOLO pilota) ═══
 * Loop GSC → keyword "striking distance" (posizione 5-20, impression ≥20/settimana) iniettate nel
 * pool `keywords` esistente. IL CECCHINO NON GENERA ARTICOLI: il volume resta 1/giorno/lingua.
 *
 * CANALE D'INIEZIONE: status='scheduled' + scheduled_date su una data libera → il ramo 1 di
 * getKeywordForBrand (daily-publish) la pesca AL POSTO della pesca cieca, senza toccare una riga
 * di daily-publish. L'indice anti-race per-giorno resta sovrano.
 *
 * ANTI-DOPPIONE BY DESIGN (paura esplicita del capofila, annullata per costruzione):
 *  - GUARDIA 1 pre-iniezione: char-trigram Jaccard (stesso algoritmo di ensureTitleVariety,
 *    script-agnostic) della query vs TUTTI i titoli del brand (ogni status) + keywords_history +
 *    pool keywords. Simile (≥0.55) o duplicato esatto → NON si inietta: va in `sniper_reinforce`
 *    (pagina da rinforzare + query) = cibo per la maglia interna, non per un doppione.
 *  - mirror di isAllowed: token-Jaccard >0.6 vs le ultime 7 keyword usate → killed.
 *  - Le guardie esistenti in generazione (classificatore anti-dup, ensureTitleVariety) restano
 *    2° e 3° filtro.
 *  - Cap: max 2 iniezioni/settimana/lingua.
 *
 * DRY-RUN di default: nessuna scrittura, report per lingua (candidate, uccise-con-match,
 * iniettabili). Le scritture avvengono SOLO con apply=true, e il cron vero si arma solo dopo
 * l'ok del capofila sul report.
 */
import { JWT } from 'google-auth-library'
import type { SupabaseClient } from '@supabase/supabase-js'

// ── trigram (identico a ensureTitleVariety: script-agnostic, funziona su ja/ar) ──
function trigrams(s: string): Set<string> {
  const packed = s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').replace(/\s+/g, ' ').trim()
  const out = new Set<string>()
  for (let i = 0; i < packed.length - 2; i++) out.add(packed.slice(i, i + 3))
  return out
}
export function similarity(a: string, b: string): number {
  const A = trigrams(a), B = trigrams(b)
  if (!A.size || !B.size) return 0
  let inter = 0
  for (const g of A) if (B.has(g)) inter++
  return inter / (A.size + B.size - inter)
}
const SIM_THRESHOLD = 0.55

// mirror di isAllowed (daily-publish): token-Jaccard vs ultime 7 usate
const STOP_WORDS = new Set(['de','para','el','la','los','las','en','con','y','o','a','del','al','se','su','un','una','lo','le','the','for','of','and','to','in'])
function tokenize(s: string): Set<string> {
  return new Set(s.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w)))
}
function tokenJaccard(a: string, b: string): number {
  const ta = tokenize(a), tb = tokenize(b)
  const inter = [...ta].filter(w => tb.has(w)).length
  const union = new Set([...ta, ...tb]).size
  return union === 0 ? 0 : inter / union
}

// ── hard exclusions deterministiche (specchio compliance pilota: brand-nav, income FTC, claim medici) ──
const EXCLUDE_RES: RegExp[] = [
  /essential\s*synergy|essentialsynergybr/i,                        // brand-name / navigational
  /\b(login|back\s*office|accedi|iniciar sesi[oó]n|mi cuenta|my account)\b/i,
  /\b(income|earn(ing)?s?|make money|salary|commission|mlm|pyramid|guadagn\w+|ganar dinero|verdienen|revenu|zarabia\w+)\b/i,
  /\b(cure|cura(re)? (il|la|per)|treat(s|ment)? for|heal(s|ing)? (of|for)|cancer|c[aá]ncer|tumor|covid|adhd|tdah|depress\w+|antidepres\w+|epilep\w+|diabet\w+)\b/i,
  /\b(price|prezzo|precio|preis|prix|cena|pre[çt]o|cost[oe]?s?|cheap|discount|sconto|rebaja|g[uü]nstig)\b/i, // cost-intent → articoli-prezzo vietati
]
export function isExcluded(query: string): boolean {
  return EXCLUDE_RES.some(re => re.test(query))
}

// ── GSC: coppie query+page ultimi 7 giorni (finestra chiusa a oggi-2 per il lag GSC) ──
function ymd(d: Date) { return d.toISOString().slice(0, 10) }
const SUBFOLDER_LANGS = new Set(['es', 'de', 'fr', 'pt', 'ro', 'jp', 'ar', 'it', 'nl', 'pl'])
export function langOfPage(pageUrl: string): string {
  try {
    const seg = new URL(pageUrl).pathname.split('/').filter(Boolean)[0]?.toLowerCase() ?? ''
    if (SUBFOLDER_LANGS.has(seg)) return seg === 'jp' ? 'ja' : seg
    return 'en'
  } catch { return 'en' }
}

type GscRow = { keys?: string[]; clicks: number; impressions: number; position: number }

export type SniperCandidate = {
  language_code: string
  query: string
  page: string
  impressions: number
  position: number
}
export type KilledCandidate = SniperCandidate & { match_kind: 'ranking-page' | 'article-title' | 'keywords-history' | 'keyword-pool' | 'recent-7'; match_text: string; sim: number }
export type Injectable = SniperCandidate & { schedule_date?: string }

export type SniperReport = {
  window: { start: string; end: string }
  site: string | null
  per_language: Record<string, {
    candidates: number
    killed: KilledCandidate[]
    injectable: Injectable[]
    reinforce: { query: string; page: string }[]
  }>
  totals: { rows_gsc: number; candidates: number; killed: number; injectable: number }
  applied?: { injected: number; reinforced: number; warnings: string[] }
}

// Soglie DA ORDINE DEL CAPOFILA (default vincolanti): pos 5-20, impression ≥20/settimana, cap 2.
// Parametrizzabili SOLO per collaudo/tuning esplicito — il cron armato gira coi default.
const MIN_IMPRESSIONS = 20
const POS_MIN = 5
const POS_MAX = 20
const CAP_PER_LANG = 2

export async function runSniper(
  gsc: JWT,
  // schema dinamico (SUPABASE_DB_SCHEMA): il client non e piu tipizzato "public"
  supabase: SupabaseClient<any, any, any, any, any>,
  opts: { apply: boolean; siteMatch?: string[]; minImpressions?: number; posMin?: number; posMax?: number }
): Promise<SniperReport> {
  const minImpr = opts.minImpressions ?? MIN_IMPRESSIONS
  const posMin = opts.posMin ?? POS_MIN
  const posMax = opts.posMax ?? POS_MAX
  const match = opts.siteMatch ?? ['essentialsynergybr']

  // 1. proprietà GSC del pilota
  const sitesRes = await gsc.request<{ siteEntry?: { siteUrl: string; permissionLevel: string }[] }>({
    url: 'https://www.googleapis.com/webmasters/v3/sites',
  })
  const entries = (sitesRes.data.siteEntry ?? []).filter(e => e.permissionLevel !== 'siteUnverifiedUser')
  const matched = entries.filter(e => match.some(k => e.siteUrl.toLowerCase().includes(k.toLowerCase())))
  if (!matched.length) return { window: { start: '', end: '' }, site: null, per_language: {}, totals: { rows_gsc: 0, candidates: 0, killed: 0, injectable: 0 } }
  const site = (matched.find(e => e.siteUrl.startsWith('sc-domain:')) ?? matched[0]).siteUrl

  // 2. query+page, 7 giorni
  const end = new Date(Date.now() - 2 * 864e5)
  const start = new Date(end.getTime() - 6 * 864e5)
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`
  const res = await gsc.request<{ rows?: GscRow[] }>({
    url, method: 'POST',
    data: { startDate: ymd(start), endDate: ymd(end), dimensions: ['query', 'page'], rowLimit: 3000 },
  })
  const rows = res.data.rows ?? []

  // 3. filtro striking-distance + esclusioni, poi group by (lang, query)
  const grouped = new Map<string, { language_code: string; query: string; pages: Map<string, number>; impressions: number; posSum: number }>()
  for (const r of rows) {
    const query = r.keys?.[0] ?? ''
    const page = r.keys?.[1] ?? ''
    if (!query || !page) continue
    if (r.position < posMin || r.position > posMax) continue
    if (isExcluded(query)) continue
    const lang = langOfPage(page)
    const key = `${lang}|${query.toLowerCase()}`
    const g = grouped.get(key) ?? { language_code: lang, query, pages: new Map(), impressions: 0, posSum: 0 }
    g.pages.set(page, (g.pages.get(page) ?? 0) + r.impressions)
    g.impressions += r.impressions
    g.posSum += r.position * r.impressions
    grouped.set(key, g)
  }
  const candidates: SniperCandidate[] = [...grouped.values()]
    .filter(g => g.impressions >= minImpr)
    .map(g => ({
      language_code: g.language_code,
      query: g.query,
      page: [...g.pages.entries()].sort((a, b) => b[1] - a[1])[0][0],
      impressions: g.impressions,
      position: g.posSum / g.impressions,
    }))

  // 4. contesto per-brand per la GUARDIA 1
  const { data: brands } = await supabase.from('brands').select('id, language_code')
  const brandByLang = new Map((brands ?? []).map(b => [b.language_code, b.id]))

  const report: SniperReport = {
    window: { start: ymd(start), end: ymd(end) },
    site,
    per_language: {},
    totals: { rows_gsc: rows.length, candidates: candidates.length, killed: 0, injectable: 0 },
  }

  const byLang = new Map<string, SniperCandidate[]>()
  for (const c of candidates) {
    if (!brandByLang.has(c.language_code)) continue // lingua senza brand → fuori
    const arr = byLang.get(c.language_code) ?? []
    arr.push(c)
    byLang.set(c.language_code, arr)
  }

  const toInject: { brand_id: string; inj: Injectable }[] = []
  const toReinforce: { brand_id: string; c: KilledCandidate }[] = []

  for (const [lang, cands] of byLang) {
    const brandId = brandByLang.get(lang)!
    const [{ data: arts }, { data: hist }, { data: pool }] = await Promise.all([
      supabase.from('articles').select('title, slug').eq('brand_id', brandId),
      supabase.from('keywords_history').select('keyword, used_at').eq('brand_id', brandId).order('used_at', { ascending: false }),
      supabase.from('keywords').select('keyword').eq('brand_id', brandId).in('status', ['pending', 'scheduled']),
    ])
    const titles = (arts ?? []).map(a => a.title as string)
    const titleBySlug = new Map((arts ?? []).map(a => [String(a.slug), String(a.title)]))
    const histKw = (hist ?? []).map(h => h.keyword as string)
    const last7 = histKw.slice(0, 7)
    const poolKw = (pool ?? []).map(p => p.keyword as string)

    const killed: KilledCandidate[] = []
    const clean: SniperCandidate[] = []

    for (const c of cands) {
      let hit: { kind: KilledCandidate['match_kind']; text: string; sim: number } | null = null
      // GUARDIA 0 — anti-cannibalizzazione (scovata al collaudo 1 ago): la pagina che GIÀ ranka per
      // la query è un nostro articolo. Va in RINFORZO (mai articolo nuovo) se:
      //  (a) il suo titolo somiglia alla query (sim ≥ 0.45 — soglia più bassa della guardia 1:
      //      la pagina sta già intercettando quell'intento), OPPURE
      //  (b) ranka già in prima pagina o quasi (pos ≤ 12): Google considera GIÀ quella pagina la
      //      risposta — il trigram non vede i sinonimi ("verwendung"≈"anwendung", misurato 0.39) ma
      //      il ranking sì; creare un articolo nuovo qui = cannibalizzare, spingerla su = vincere.
      // Restano iniettabili solo query pos 13-20 con titolo dissimile = ranking incidentale, intento
      // probabilmente scoperto — e comunque le legge il capofila nel report dry-run.
      const rankSlug = c.page.replace(/\/+$/, '').split('/').pop() ?? ''
      const rankTitle = titleBySlug.get(rankSlug)
      if (rankTitle) {
        const s = similarity(c.query, rankTitle)
        if (s >= 0.45 || c.position <= 12) hit = { kind: 'ranking-page', text: rankTitle, sim: s }
      }
      if (!hit) for (const t of titles) {
        const s = similarity(c.query, t)
        if (s >= SIM_THRESHOLD) { hit = { kind: 'article-title', text: t, sim: s }; break }
      }
      if (!hit) for (const k of histKw) {
        const s = similarity(c.query, k)
        if (s >= SIM_THRESHOLD || c.query.toLowerCase() === k.toLowerCase()) { hit = { kind: 'keywords-history', text: k, sim: s }; break }
      }
      if (!hit) for (const k of poolKw) {
        const s = similarity(c.query, k)
        if (s >= SIM_THRESHOLD || c.query.toLowerCase() === k.toLowerCase()) { hit = { kind: 'keyword-pool', text: k, sim: s }; break }
      }
      if (!hit) for (const k of last7) {
        if (tokenJaccard(c.query, k) > 0.6) { hit = { kind: 'recent-7', text: k, sim: tokenJaccard(c.query, k) }; break }
      }
      if (hit) killed.push({ ...c, match_kind: hit.kind, match_text: hit.text, sim: Math.round(hit.sim * 100) / 100 })
      else clean.push(c)
    }

    // 5. cap 2/lingua, ranking per impression
    const injectable: Injectable[] = clean
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, CAP_PER_LANG)

    // 6. date libere (domani..+14) senza altra keyword scheduled, distanziate ≥3 giorni
    const { data: sched } = await supabase
      .from('keywords').select('scheduled_date').eq('brand_id', brandId).eq('status', 'scheduled')
      .not('scheduled_date', 'is', null)
    const taken = new Set((sched ?? []).map(s => s.scheduled_date as string))
    let lastPicked: Date | null = null
    for (const inj of injectable) {
      for (let d = 1; d <= 14; d++) {
        const day = new Date(Date.now() + d * 864e5)
        const dstr = ymd(day)
        if (taken.has(dstr)) continue
        if (lastPicked && (day.getTime() - lastPicked.getTime()) < 3 * 864e5) continue
        inj.schedule_date = dstr
        taken.add(dstr)
        lastPicked = day
        break
      }
    }

    report.per_language[lang] = {
      candidates: cands.length,
      killed,
      injectable,
      reinforce: killed.filter(k => k.match_kind === 'article-title' || k.match_kind === 'ranking-page').map(k => ({ query: k.query, page: k.page })),
    }
    report.totals.killed += killed.length
    report.totals.injectable += injectable.length

    for (const inj of injectable) if (inj.schedule_date) toInject.push({ brand_id: brandId, inj })
    for (const k of killed) if (k.match_kind === 'article-title' || k.match_kind === 'ranking-page') toReinforce.push({ brand_id: brandId, c: k })
  }

  // 7. APPLY (mai in dry-run)
  if (opts.apply) {
    const warnings: string[] = []
    let injected = 0, reinforced = 0
    for (const { brand_id, inj } of toInject) {
      const { error } = await supabase.from('keywords').insert([{
        brand_id,
        keyword: inj.query,
        score: 95,
        volume: 'medium',
        difficulty: 'easy',
        relevance: 10,
        status: 'scheduled',
        scheduled_date: inj.schedule_date,
        source: 'gsc_sniper',
      }])
      if (error) warnings.push(`inject "${inj.query}": ${error.message}`)
      else injected++
    }
    for (const { brand_id, c } of toReinforce) {
      const { error } = await supabase.from('sniper_reinforce').insert([{
        brand_id,
        language_code: c.language_code,
        page: c.page,
        query: c.query,
        position: Math.round(c.position * 10) / 10,
        impressions: c.impressions,
        matched_title: c.match_text,
      }])
      if (error) warnings.push(`reinforce "${c.query}": ${error.message}`)
      else reinforced++
    }
    report.applied = { injected, reinforced, warnings }
  }

  return report
}
