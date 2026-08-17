/**
 * ═══ MAGLIA INTERNA v1 — weave-links (1 ago 2026, SOLO pilota) ═══
 * Per ogni articolo pubblicato negli ultimi 7 giorni: trova i 2-3 correlati PIÙ VECCHI via
 * find_related_articles (embeddings, threshold prudente) e innesta in QUEI vecchi un blocco
 * "Leggi anche" (heading localizzato) con il link al nuovo → maglia bidirezionale (il nuovo
 * linka i vecchi già in generazione via internal-link hint; questa rete chiude il verso opposto).
 *
 * REGOLE DI SICUREZZA (vincolanti dall'ordine):
 *  - blocco delimitato da marker HTML-comment deterministici (WEAVE_START/END): re-run = SOSTITUISCE
 *    il blocco (mai due blocchi), i link esistenti nel blocco vengono preservati e mergiati;
 *    rollback = rimozione pulita di ciò che sta tra i marker.
 *  - mai dentro FAQ/disclaimer/footer: placement PRIMA dell'heading FAQ se esiste, altrimenti prima
 *    del `---` finale, altrimenti in coda.
 *  - max 3 link per blocco; mai self-link; correlato sotto threshold → nessun blocco.
 *  - si innesta SOLO in articoli published più VECCHI del nuovo.
 *
 * Consuma anche `sniper_reinforce` (Operazione Cecchino): nei correlati della pagina da rinforzare
 * innesta un link VERSO di essa con anchor naturale derivato dalla query GSC.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { findRelatedArticles } from './embeddings'

export const WEAVE_START = '<!-- weave-links:start -->'
export const WEAVE_END = '<!-- weave-links:end -->'

const HEADINGS: Record<string, string> = {
  en: 'Related reading', es: 'Lecturas relacionadas', de: 'Weiterlesen',
  fr: 'À lire aussi', pt: 'Leia também', ro: 'Citește și',
  it: 'Leggi anche', nl: 'Lees ook', pl: 'Przeczytaj także',
  ja: 'あわせて読みたい', ar: 'اقرأ أيضاً',
}

// Stessa mappa della pipeline generate-article (v3.9) — VERIFICATA sul sito vivo 1 ago:
// /de/{slug} 200, /de/blog/{slug} 404. (publicArticleUrl di lib/indexnow appende sempre /blog → per
// DE è sbagliata: bug pre-esistente segnalato al capofila, qui NON la usiamo.)
// ⚠️ 17 ago 2026 — il dominio NON va hardcoded. Era `https://essentialsynergybr.com` fisso: copiando
// il motore sui brand fratelli, tutti i loro link interni sono finiti verso il dominio del Main
// (percorsi giusti, dominio sbagliato). Fonte di verità = il campo `brands.domain` del brand stesso,
// che porta già dentro il path della lingua (es. "essentialsynergybr.com/de") — la stessa usata da
// publicArticleUrl in lib/indexnow. Fallback all'env solo se la colonna fosse vuota.
const FALLBACK_BASE = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || '')
  .trim().replace(/\/+$/, '')
const LANG_PATH_OVERRIDE: Record<string, string> = { ja: 'jp' }
// 🚨 17 ago 2026 — allineato al sito VIVO (verificato: /de/blog/{slug} 200, /de/{slug} 404).
// La costante ['de'] era ereditata dal Main, dove è giusta; qui produceva 404 nel weave.
const LANGS_WITHOUT_BLOG = new Set<string>([])

/** URL pubblico dell'articolo. `brandDomain` = brands.domain (già comprensivo del path lingua). */
export function publicUrl(languageCode: string, slug: string, brandDomain?: string | null): string {
  const pathLang = LANG_PATH_OVERRIDE[languageCode] ?? languageCode
  const blogPath = LANGS_WITHOUT_BLOG.has(pathLang) ? '' : '/blog'
  if (brandDomain && brandDomain.trim()) {
    const base = brandDomain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '')
    return `https://${base}${blogPath}/${slug}`
  }
  const langPath = pathLang === 'en' ? '' : `/${pathLang}`
  return `${FALLBACK_BASE}${langPath}${blogPath}/${slug}`
}

const MAX_LINKS = 3
const SIM_THRESHOLD = 0.5 // prudente: l'hint interno in generazione usa 0.4
// Cap 60s Hobby: la prima run misurata (77 nuovi, 192 update) sequenziale = 60.2s → morte su prod.
// Rimedio d'impero: lavoro parallelo a lotti + TETTO update per invocazione; le chiamate successive
// CONVERGONO da sole (il merge è idempotente: articolo già maglato → nessun add → nessun update).
// Il cron settimanale si arma con 2-3 fire ravvicinati (pattern catchup), non con un fire solo.
const CONCURRENCY = 8
const MAX_UPDATES_PER_RUN = 100

async function inBatches<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = []
  for (let i = 0; i < items.length; i += size) {
    out.push(...await Promise.all(items.slice(i, i + size).map(fn)))
  }
  return out
}

type WeaveLink = { anchor: string; url: string }

/** Estrae i link già presenti nel blocco weave esistente (per il merge, mai accumulo). */
export function parseExistingWeave(content: string): WeaveLink[] {
  const s = content.indexOf(WEAVE_START)
  const e = content.indexOf(WEAVE_END)
  if (s === -1 || e === -1 || e < s) return []
  const block = content.slice(s, e)
  return [...block.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)].map(m => ({ anchor: m[1], url: m[2] }))
}

/**
 * Sostituisce (o inserisce) il blocco weave con i link dati. links vuoto → rimuove il blocco.
 * Placement: prima dell'heading FAQ; fallback prima del --- finale; fallback coda.
 */
export function upsertWeaveBlock(content: string, languageCode: string, links: WeaveLink[]): string {
  // 1. rimozione pulita del blocco esistente (rollback-safe by construction)
  let out = content
  const s = out.indexOf(WEAVE_START)
  const e = out.indexOf(WEAVE_END)
  if (s !== -1 && e !== -1 && e > s) {
    out = (out.slice(0, s) + out.slice(e + WEAVE_END.length)).replace(/\n{3,}/g, '\n\n')
  }
  if (!links.length) return out

  const heading = HEADINGS[languageCode] ?? HEADINGS.en
  const block = `\n${WEAVE_START}\n## ${heading}\n\n${links.map(l => `- [${l.anchor}](${l.url})`).join('\n')}\n${WEAVE_END}\n`

  // 2. placement: prima dell'heading FAQ (mai dentro FAQ/disclaimer/footer)
  const FAQ_HEAD_RE = /^#{2,6}\s+.*(faq|frequently asked|preguntas frecuentes|häufig gestellte fragen|questions fréquentes|foire aux questions|perguntas frequentes|întrebări frecvente|domande frequenti|veelgestelde vragen|często zadawane|よくある|أسئلة|الأسئلة).*$/im
  const faqMatch = out.match(FAQ_HEAD_RE)
  if (faqMatch && faqMatch.index !== undefined) {
    return out.slice(0, faqMatch.index) + block + '\n' + out.slice(faqMatch.index)
  }
  const hr = out.lastIndexOf('\n---')
  if (hr !== -1) return out.slice(0, hr) + block + out.slice(hr)
  return out.trimEnd() + '\n' + block
}

export type WeaveReport = {
  new_articles: number
  reinforce_rows: number
  old_touched: number
  links_grafted: number
  skipped_no_embedding: number
  skipped_no_related: number
  skipped_block_full: number
  warnings: string[]
  touched: { slug: string; language_code: string; added: string[] }[]
}

type ArticleRow = { id: string; brand_id: string; slug: string; title: string; status: string; published_at: string | null; content_markdown: string }

function parseEmbedding(raw: unknown): number[] | null {
  if (Array.isArray(raw)) return raw as number[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) as number[] } catch { return null }
  }
  return null
}

/**
 * `windowDays` (default 7) = ampiezza della finestra "articoli nuovi" da cui parte l'innesto.
 * A regime bastano 7 giorni (il cron settimanale). Ma un sito che non ha mai avuto la maglia ha
 * centinaia di articoli ORFANI più vecchi, che nessuno linka e che Google non scopre mai
 * ("URL is unknown to Google", misurato il 17 ago sull'impero). Passando `windowDays=3650` la
 * stessa rete tratta TUTTO l'archivio come "nuovo" e costruisce la maglia completa in più passate
 * (c'è un tetto di update per run: si richiama finché links_grafted = 0). Idempotente: i marker
 * WEAVE_START/END fanno sostituire il blocco, mai duplicarlo.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any — i brand con schema DB custom
// (yardforge, networktruth, …) hanno un client tipizzato sul loro schema: tipo permissivo così il
// motore resta IDENTICO in tutti i repo, senza fork per-brand.
export async function runWeave(supabase: SupabaseClient<any, any, any>, opts: { dry: boolean; windowDays?: number }): Promise<WeaveReport> {
  const report: WeaveReport = {
    new_articles: 0, reinforce_rows: 0, old_touched: 0, links_grafted: 0,
    skipped_no_embedding: 0, skipped_no_related: 0, skipped_block_full: 0,
    warnings: [], touched: [],
  }
  const { data: brands } = await supabase.from('brands').select('id, language_code, domain')
  const langByBrand = new Map((brands ?? []).map(b => [b.id as string, b.language_code as string]))
  // dominio per brand: è la fonte di verità dell'URL pubblico (vedi publicUrl)
  const domainByBrand = new Map((brands ?? []).map(b => [b.id as string, (b as { domain?: string | null }).domain ?? null]))

  // piano di innesto: oldArticleId → link da aggiungere (aggregato prima di scrivere: 1 update/articolo)
  const plan = new Map<string, WeaveLink[]>()
  const addToPlan = (oldId: string, link: WeaveLink) => {
    const arr = plan.get(oldId) ?? []
    if (!arr.some(l => l.url === link.url)) arr.push(link)
    plan.set(oldId, arr)
  }

  // ── 1. articoli pubblicati nella finestra (default 7 giorni, vedi windowDays) ──
  const cutoff = new Date(Date.now() - (opts.windowDays ?? 7) * 864e5).toISOString()
  const { data: fresh } = await supabase
    .from('articles')
    .select('id, brand_id, slug, title, published_at')
    .eq('status', 'published')
    .gte('published_at', cutoff)
    .order('published_at', { ascending: true })
  report.new_articles = (fresh ?? []).length

  await inBatches(fresh ?? [], CONCURRENCY, async (n) => {
    const lang = langByBrand.get(n.brand_id)
    if (!lang) return
    const { data: embRow } = await supabase
      .from('article_embeddings').select('embedding').eq('article_id', n.id).single()
    const embedding = parseEmbedding(embRow?.embedding)
    if (!embedding) { report.skipped_no_embedding++; return }

    const related = await findRelatedArticles(n.brand_id, embedding, n.id, MAX_LINKS, SIM_THRESHOLD)
    if (!related.length) { report.skipped_no_related++; return }

    for (const r of related.slice(0, MAX_LINKS)) {
      if (r.slug === n.slug) continue // mai self-link
      addToPlan(r.article_id, { anchor: n.title, url: publicUrl(lang, n.slug, domainByBrand.get(n.brand_id)) })
    }
  })

  // ── 2. sniper_reinforce (tabella può non esistere ancora: graceful) ──
  try {
    const { data: reinforce, error } = await supabase
      .from('sniper_reinforce')
      .select('id, brand_id, language_code, page, query')
      .eq('status', 'pending')
    if (error) throw new Error(error.message)
    report.reinforce_rows = (reinforce ?? []).length
    for (const r of reinforce ?? []) {
      const slug = String(r.page).replace(/\/+$/, '').split('/').pop() ?? ''
      const { data: target } = await supabase
        .from('articles').select('id, slug, title').eq('brand_id', r.brand_id).eq('slug', slug).eq('status', 'published').limit(1).single()
      if (!target) { report.warnings.push(`reinforce: articolo non trovato per slug "${slug}"`); continue }
      const { data: embRow } = await supabase
        .from('article_embeddings').select('embedding').eq('article_id', target.id).single()
      const embedding = parseEmbedding(embRow?.embedding)
      if (!embedding) { report.skipped_no_embedding++; continue }
      const related = await findRelatedArticles(r.brand_id, embedding, target.id, MAX_LINKS, SIM_THRESHOLD)
      if (!related.length) { report.skipped_no_related++; continue }
      const anchor = String(r.query).charAt(0).toUpperCase() + String(r.query).slice(1)
      for (const rel of related.slice(0, MAX_LINKS)) {
        if (rel.slug === target.slug) continue
        addToPlan(rel.article_id, { anchor, url: publicUrl(r.language_code, target.slug, domainByBrand.get(r.brand_id)) })
      }
      if (!opts.dry) {
        await supabase.from('sniper_reinforce').update({ status: 'consumed', consumed_at: new Date().toISOString() }).eq('id', r.id)
      }
    }
  } catch (e) {
    report.warnings.push(`sniper_reinforce non disponibile (DDL non ancora girato?): ${e instanceof Error ? e.message : String(e)}`)
  }

  // ── 3. innesto nei vecchi (1 update per articolo, blocco SOSTITUITO mai accumulato) ──
  let budget = MAX_UPDATES_PER_RUN
  const entries = [...plan.entries()]
  await inBatches(entries, CONCURRENCY, async ([oldId, newLinks]) => {
    if (budget <= 0) return
    const { data: oldArt } = await supabase
      .from('articles')
      .select('id, brand_id, slug, title, status, published_at, content_markdown')
      .eq('id', oldId).single<ArticleRow>()
    if (!oldArt || oldArt.status !== 'published') return
    const lang = langByBrand.get(oldArt.brand_id)
    if (!lang) return

    const existing = parseExistingWeave(oldArt.content_markdown)
    const selfUrl = publicUrl(lang, oldArt.slug, domainByBrand.get(oldArt.brand_id))
    const merged: WeaveLink[] = [...existing]
    const added: string[] = []
    for (const l of newLinks) {
      if (l.url === selfUrl) continue // mai self-link
      if (merged.some(m => m.url === l.url)) continue
      if (merged.length >= MAX_LINKS) { report.skipped_block_full++; continue }
      merged.push(l)
      added.push(l.anchor)
    }
    if (!added.length) return
    if (budget-- <= 0) { report.warnings.push('tetto update/run raggiunto: la prossima chiamata converge sul resto'); return }

    const updated = upsertWeaveBlock(oldArt.content_markdown, lang, merged)
    if (!opts.dry) {
      const { error } = await supabase.from('articles').update({ content_markdown: updated }).eq('id', oldId)
      if (error) { report.warnings.push(`update ${oldArt.slug}: ${error.message}`); return }
    }
    report.old_touched++
    report.links_grafted += added.length
    report.touched.push({ slug: oldArt.slug, language_code: lang, added })
  })

  return report
}
