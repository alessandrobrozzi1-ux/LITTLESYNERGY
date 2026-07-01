/**
 * Audit automatico 5 brand attivi — skill v2.7
 * Checks: A1-A6, B1-B4, B6, C3, C5
 * Manual/browser checks skipped: B5, C1, C2, C4, D1-D3
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY,
  { global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) } })

const LANGS = ['en', 'es', 'de', 'fr', 'pt']

// Fetch all brands
const { data: brands } = await sb.from('brands')
  .select('id,language_code,active,owner_id,affiliate_base_url,brand_dna_business_type,brand_dna_service_area,brand_dna_topics_to_avoid,brand_dna_key_themes,brand_dna_brand_voice,brand_dna_mandatory_footer,domain,created_at')
  .in('language_code', LANGS)

const now = new Date()
const H48 = new Date(now - 48 * 3600 * 1000)
const D7  = new Date(now - 7  * 24 * 3600 * 1000)
const D30 = new Date(now - 30 * 24 * 3600 * 1000)
const LAUNCH = new Date('2026-06-23')

for (const lang of LANGS) {
  const brand = brands.find(b => b.language_code === lang)
  const id = brand?.id

  console.log(`\n${'═'.repeat(62)}`)
  console.log(`AUDIT ${lang.toUpperCase()} — ${new Date().toISOString().slice(0,10)}`)
  console.log('═'.repeat(62))

  const scores = {}

  // A1: brand esiste
  scores.A1 = brand ? '✅' : '❌'

  // A2: active
  scores.A2 = brand?.active ? '✅' : '❌'

  // A3: DNA 5+1 campi non-null
  const dnaFields = [
    brand?.brand_dna_business_type,
    brand?.brand_dna_service_area,
    brand?.brand_dna_topics_to_avoid,
    brand?.brand_dna_key_themes,
    brand?.brand_dna_brand_voice,
  ]
  const isRoot = !brand?.domain?.includes('/' + lang)
  const dnaOk = dnaFields.every(f => f && f.length > 10)
  const footerOk = isRoot || (brand?.brand_dna_mandatory_footer?.length > 10)
  scores.A3 = (dnaOk && footerOk) ? '✅' : '⚠️'
  const a3Note = dnaOk ? (isRoot ? 'root brand, footer Lovable-side' : '6/6') : 'campo mancante'

  // A4: Link Expert ≥100
  const { count: leCount } = await sb.from('link_expert')
    .select('*', { count: 'exact', head: true }).eq('brand_id', id).eq('active', true)
  scores.A4 = (leCount >= 100) ? '✅' : (leCount >= 50 ? '⚠️' : '❌')
  const a4Note = `${leCount} entries`

  // A5: Themes ≥5 + pool ≥25
  const { data: themes } = await sb.from('editorial_themes')
    .select('keywords').eq('brand_id', id).eq('active', true)
  const themeCount = themes?.length ?? 0
  const kwPool = themes?.reduce((sum, t) => sum + (t.keywords?.length ?? 0), 0) ?? 0
  scores.A5 = (themeCount >= 5 && kwPool >= 25) ? '✅' : '⚠️'
  const a5Note = `${themeCount} themes, ${kwPool} keywords`

  // A6: owner_id + affiliate_base_url
  scores.A6 = (brand?.owner_id && brand?.affiliate_base_url) ? '✅' : '❌'

  // B1: ultimo articolo ≤48h
  const { data: lastArt } = await sb.from('articles')
    .select('title,published_at').eq('brand_id', id).eq('status', 'published')
    .order('published_at', { ascending: false }).limit(1)
  const lastPub = lastArt?.[0]?.published_at ? new Date(lastArt[0].published_at) : null
  const brandAge = brand?.created_at ? (now - new Date(brand.created_at)) / (3600 * 1000) : 9999
  scores.B1 = !lastPub ? '⚠️' : (lastPub > H48 ? '✅' : '⚠️')
  const b1Note = lastPub ? lastPub.toISOString().slice(0,16) : 'nessun articolo'

  // B2: cron_runs 7gg
  const { count: cronCount } = await sb.from('cron_runs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', D7.toISOString())
  // cron è globale, non per brand — OK se brand < 14gg
  const brandAgeDays = brandAge / 24
  scores.B2 = brandAgeDays < 14 ? '⚠️' : (cronCount >= 5 ? '✅' : '⚠️')
  const b2Note = brandAgeDays < 14 ? `brand ${Math.round(brandAgeDays)}gg — expected` : `${cronCount} runs/7gg`

  // B3: cost_log
  const { data: costs } = await sb.from('cost_log')
    .select('cost_usd').eq('brand_id', id).gte('created_at', D30.toISOString())
  const avgCost = costs?.length ? costs.reduce((s, c) => s + c.cost_usd, 0) / costs.length : null
  scores.B3 = brandAgeDays < 14 ? '⚠️' : (avgCost === null ? '⚠️' : avgCost <= 0.15 ? '✅' : '❌')
  const b3Note = brandAgeDays < 14 ? 'brand nuovo — expected' : (avgCost !== null ? `$${avgCost.toFixed(3)}/art` : '0 records')

  // B4: titoli post-23/6 ≤65 chars
  const { data: titles } = await sb.from('articles')
    .select('title').eq('brand_id', id).eq('status', 'published')
    .gte('published_at', LAUNCH.toISOString())
  const longTitles = titles?.filter(a => a.title?.length > 65) ?? []
  scores.B4 = longTitles.length === 0 ? '✅' : '⚠️'
  const b4Note = `${longTitles.length} outlier su ${titles?.length ?? 0}`

  // B6: immagini ≥80%
  const { count: totalPub } = await sb.from('articles')
    .select('*', { count: 'exact', head: true }).eq('brand_id', id).eq('status', 'published')
  const { count: withImg } = await sb.from('articles')
    .select('*', { count: 'exact', head: true }).eq('brand_id', id).eq('status', 'published')
    .not('featured_image', 'is', null)
  const imgPct = totalPub > 0 ? Math.round((withImg / totalPub) * 100) : 0
  scores.B6 = imgPct >= 80 ? '✅' : (imgPct >= 60 ? '⚠️' : '❌')
  const b6Note = `${withImg}/${totalPub} (${imgPct}%)`

  // C3: force-dynamic — check via curl
  let c3Status = '⚠️'
  try {
    const r = await fetch(`https://soloseo-alpha.vercel.app/api/public/articles/${lang}`, { method: 'HEAD', signal: AbortSignal.timeout(5000) })
    const cc = r.headers.get('cache-control') ?? ''
    c3Status = cc.includes('no-store') ? '✅' : '⚠️'
  } catch { c3Status = '⚠️' }

  // C5: embeddings
  const { count: embCount } = await sb.from('article_embeddings')
    .select('*', { count: 'exact', head: true }).eq('brand_id', id)
  scores.C5 = embCount >= (totalPub ?? 0) ? '✅' : (embCount > 0 ? '⚠️' : '❌')
  const c5Note = `${embCount} embeddings / ${totalPub} articoli`

  // Output tabella
  console.log(`
| # | Check | Stato | Note |
|---|---|---|---|
| A1 | Brand exists | ${scores.A1} | ${id?.slice(0,8)}... |
| A2 | active = true | ${scores.A2} | |
| A3 | DNA 6/6 | ${scores.A3} | ${a3Note} |
| A4 | Link Expert ≥100 | ${scores.A4} | ${a4Note} |
| A5 | Themes ≥5 + pool ≥25 | ${scores.A5} | ${a5Note} |
| A6 | owner_id + url | ${scores.A6} | |
| B1 | Ultimo articolo ≤48h | ${scores.B1} | ${b1Note} |
| B2 | Cron 7gg | ${scores.B2} | ${b2Note} |
| B3 | Cost ≤$0.15/art | ${scores.B3} | ${b3Note} |
| B4 | Titoli ≤65 | ${scores.B4} | ${b4Note} |
| B5 | Link Expert usato | ⚠️ | manual check |
| B6 | Immagini ≥80% | ${scores.B6} | ${b6Note} |
| C1 | Sitemap | ⚠️ | manual check |
| C2 | IndexNow | ⚠️ | manual check |
| C3 | force-dynamic | ${c3Status} | cache-control header |
| C4 | Image coherence | ⚠️ | manual check |
| C5 | Internal Linking | ${scores.C5} | ${c5Note} |
| D1 | Altri brand OK | ⚠️ | covered da audit |
| D2 | Routing Lovable | ⚠️ | manual check |
| D3 | Articolo live | ⚠️ | manual check |`)

  const autoChecks = [scores.A1,scores.A2,scores.A3,scores.A4,scores.A5,scores.A6,
                      scores.B1,scores.B2,scores.B3,scores.B4,scores.B6,c3Status,scores.C5]
  const autoOk = autoChecks.filter(s => s === '✅').length
  const verdict = autoOk >= 11 ? '🟢 HEALTHY' : autoOk >= 8 ? '🟡 MONITOR' : '🔴 CRITICAL'
  console.log(`\n**Auto-checks: ${autoOk}/${autoChecks.length} | ${verdict}**`)
}

// ── 5 brand attivi ─────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(62))
console.log('BRAND ATTIVI')
console.log('═'.repeat(62))
const { data: active } = await sb.from('brands').select('language_code,active,domain').eq('active', true).order('created_at')
active.forEach(b => console.log(`  ${b.language_code.toUpperCase()} | active=${b.active} | ${b.domain}`))
console.log(`\nTotale: ${active.length} brand attivi`)
