import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
readFileSync(join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim()
})

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const EN = 'eceba851-228a-45cf-8775-b0f7fc9ae7de'
const ES = 'a20e4f07-e572-4605-acfc-5c53355f2ada'
const d7 = new Date(Date.now() - 7 * 864e5).toISOString()
const d30 = new Date(Date.now() - 30 * 864e5).toISOString()
const DATE_FILTER = '2026-06-23'
const now = new Date()

const agedays = (createdAt) => Math.floor((now - new Date(createdAt)) / (1000 * 3600 * 24))

const [
  { data: brands },
  { count: leEN }, { count: leES },
  { data: thEN }, { data: thES },
  { data: laEN }, { data: laES },
  { data: cronRuns },
  { data: clEN }, { data: clES },
  { data: titlesEN }, { data: titlesES },
  { count: imgEN }, { count: totEN },
  { count: imgES }, { count: totES },
  { data: artEN }, { data: artES },
] = await Promise.all([
  sb.from('brands').select('id,active,language_code,domain,brand_dna_business_type,brand_dna_service_area,brand_dna_topics_to_avoid,brand_dna_key_themes,brand_dna_brand_voice,brand_dna_mandatory_footer,owner_id,affiliate_base_url,created_at').in('id', [EN, ES]),
  sb.from('link_expert').select('*', { count: 'exact', head: true }).eq('brand_id', EN).eq('active', true),
  sb.from('link_expert').select('*', { count: 'exact', head: true }).eq('brand_id', ES).eq('active', true),
  sb.from('editorial_themes').select('theme_name,keywords').eq('brand_id', EN).eq('active', true),
  sb.from('editorial_themes').select('theme_name,keywords').eq('brand_id', ES).eq('active', true),
  sb.from('articles').select('title,published_at,slug').eq('brand_id', EN).eq('status', 'published').order('published_at', { ascending: false }).limit(1),
  sb.from('articles').select('title,published_at,slug').eq('brand_id', ES).eq('status', 'published').order('published_at', { ascending: false }).limit(1),
  sb.from('cron_runs').select('cron_name,status,created_at').gte('created_at', d7).order('created_at', { ascending: false }),
  sb.from('cost_log').select('cost_usd').eq('brand_id', EN).gte('created_at', d30),
  sb.from('cost_log').select('cost_usd').eq('brand_id', ES).gte('created_at', d30),
  sb.from('articles').select('title').eq('brand_id', EN).eq('status', 'published').gte('published_at', DATE_FILTER).order('published_at', { ascending: false }).limit(20),
  sb.from('articles').select('title').eq('brand_id', ES).eq('status', 'published').gte('published_at', DATE_FILTER).order('published_at', { ascending: false }).limit(20),
  sb.from('articles').select('*', { count: 'exact', head: true }).eq('brand_id', EN).eq('status', 'published').not('featured_image', 'is', null),
  sb.from('articles').select('*', { count: 'exact', head: true }).eq('brand_id', EN).eq('status', 'published'),
  sb.from('articles').select('*', { count: 'exact', head: true }).eq('brand_id', ES).eq('status', 'published').not('featured_image', 'is', null),
  sb.from('articles').select('*', { count: 'exact', head: true }).eq('brand_id', ES).eq('status', 'published'),
  sb.from('articles').select('content_markdown,slug').eq('brand_id', EN).eq('status', 'published').order('published_at', { ascending: false }).limit(2),
  sb.from('articles').select('content_markdown,slug').eq('brand_id', ES).eq('status', 'published').order('published_at', { ascending: false }).limit(2),
])

const enB = brands.find(b => b.id === EN)
const esB = brands.find(b => b.id === ES)

function auditBrand(b, uuid, le, th, la, cl, titles, imgCount, totCount, arts, label) {
  const isRoot = !b.domain?.includes('/' + b.language_code) && !b.domain?.match(/\/[a-z]{2}$/)
  const ageDays = agedays(b.created_at)
  const kpool = th?.reduce((s, t) => s + (t.keywords?.length || 0), 0) || 0

  // A1
  const a1 = { ok: !!b, note: b ? 'exists' : 'not found' }
  // A2
  const a2 = { ok: b.active === true, note: b.active ? 'active=true' : 'active=FALSE' }
  // A3 — skip mandatory_footer if root domain (Lovable-side footer)
  const dnaFields = ['brand_dna_business_type','brand_dna_service_area','brand_dna_topics_to_avoid','brand_dna_key_themes','brand_dna_brand_voice']
  const dnaOk = dnaFields.every(f => b[f] && b[f].length > 10)
  const footerOk = isRoot ? true : (b.brand_dna_mandatory_footer && b.brand_dna_mandatory_footer.length > 10)
  const a3 = { ok: dnaOk && footerOk, note: isRoot ? 'root brand — footer is Lovable-side, skip mandatory_footer check' : (footerOk ? '6/6 present' : 'mandatory_footer missing/short') }
  // A4
  const a4 = { ok: le >= 100, note: `${le} active entries` }
  // A5
  const a5 = { ok: th?.length >= 5 && kpool >= 25, note: `${th?.length} themes, ${kpool} total keywords` }
  // A6
  const a6 = { ok: !!(b.owner_id && b.affiliate_base_url), note: b.owner_id ? 'both present' : 'missing' }
  // B1
  const lastPub = la?.[0] ? new Date(la[0].published_at) : null
  const hoursAgo = lastPub ? (now - lastPub) / 3600000 : 999
  const b1 = { ok: hoursAgo <= 48, warn: hoursAgo <= 72, note: lastPub ? `${Math.round(hoursAgo)}h ago: "${la[0].title.substring(0, 50)}"` : 'no article' }
  // B2
  const cronOk = cronRuns?.filter(r => r.status === 'success' || r.status === 'partial').length || 0
  const b2new = ageDays < 14
  const b2 = { ok: b2new || cronOk >= 7, warn: b2new || cronOk >= 3, note: b2new ? `brand attivo da ${ageDays}gg — 0 cron runs expected` : `${cronOk}/7+ successful runs last 7d` }
  // B3
  const totalCost = cl?.reduce((s, r) => s + (r.cost_usd || 0), 0) || 0
  const avgCost = cl?.length ? totalCost / cl.length : null
  const b3new = ageDays < 14
  const b3 = { ok: b3new || (avgCost !== null && avgCost <= 0.15), warn: b3new, note: b3new ? `brand attivo da ${ageDays}gg — cost_log expected empty` : (avgCost !== null ? `avg $${avgCost.toFixed(3)}/article (${cl.length} entries)` : 'no cost_log data') }
  // B4 post-date-filter
  const badTitles = titles?.filter(t => t.title.length > 65) || []
  const b4 = { ok: badTitles.length === 0, note: badTitles.length === 0 ? `all post-${DATE_FILTER} titles ≤65 chars (${titles?.length} checked)` : `${badTitles.length} titles >65: ${badTitles[0]?.title.substring(0, 50)}` }
  // B5 doterra links
  const b5checks = arts?.map(a => {
    const links = a.content_markdown?.match(/https?:\/\/[^\s)"'>]+doterra\.com[^\s)"'>]*/g) || []
    const specific = links.filter(u => !u.includes('/shop/?') && !u.includes('/shop?'))
    return { slug: a.slug, specific: specific.length, total: links.length }
  })
  const b5ok = b5checks?.every(c => c.specific > 0)
  const b5 = { ok: b5ok, note: b5checks?.map(c => `${c.slug}: ${c.specific}/${c.total} specific`).join(', ') }
  // B6
  const imgPct = totCount ? Math.round(imgCount / totCount * 100) : 0
  const b6 = { ok: imgPct >= 80, note: `${imgCount}/${totCount} articles with image (${imgPct}%)` }
  // C3 — can verify via header check (manual/external) — mark as manual
  const c3 = { ok: null, note: 'manual check — curl -I /api/public/articles/' + b.language_code }
  // D1 — other brands OK (manual check)
  const d1 = { ok: null, note: 'manual check — other brands not audited in this run' }
  // C1/C2/D2/D3 — Lovable-side, manual
  const blogPath = isRoot ? '/blog' : `/${b.language_code}/blog`
  const c1 = { ok: null, note: `manual — grep sitemap.xml for '${blogPath}/'` }
  const c2 = { ok: null, note: `manual — GET /api/public/notify-search-engines → check '${blogPath}' in urls[]` }
  const d2 = { ok: null, note: `manual — open essentialsynergybr.com${blogPath}` }
  const d3 = { ok: null, note: `manual — open essentialsynergybr.com${blogPath}/${la?.[0]?.slug || '[slug]'}` }

  const checks = [
    ['A1', 'Brand exists', a1],
    ['A2', 'active = true', a2],
    ['A3', 'DNA 5+1 campi', a3],
    ['A4', 'Link Expert ≥100', a4],
    ['A5', 'Themes ≥5 + pool ≥25', a5],
    ['A6', 'owner_id + url', a6],
    ['B1', 'Ultimo articolo ≤48h', b1],
    ['B2', 'Cron 7gg ok', b2],
    ['B3', 'Cost ≤$0.15/art', b3],
    ['B4', 'Titoli ≤65 (post-23/6)', b4],
    ['B5', 'Link Expert usato', b5],
    ['B6', 'Immagini ≥80%', b6],
    ['C1', 'Sitemap OK', c1],
    ['C2', 'IndexNow OK', c2],
    ['C3', 'force-dynamic', c3],
    ['D1', 'Altri brand OK', d1],
    ['D2', 'Routing Lovable', d2],
    ['D3', 'Articolo live', d3],
  ]

  const score = checks.filter(([, , c]) => c.ok === true).length
  const manual = checks.filter(([, , c]) => c.ok === null).length

  console.log(`\n${'='.repeat(62)}`)
  console.log(`AUDIT ${label} (${b.language_code.toUpperCase()}) — ${new Date().toISOString().slice(0,10)}`)
  console.log(`Brand: ${uuid}`)
  console.log(`Domain: ${b.domain} | Age: ${ageDays}d | Root: ${isRoot}`)
  console.log('='.repeat(62))

  for (const [id, name, c] of checks) {
    const icon = c.ok === null ? '⬜' : c.ok ? '✅' : (c.warn ? '⚠️ ' : '❌')
    console.log(`${icon} ${id.padEnd(3)} ${name.padEnd(25)} ${c.note}`)
  }

  const auto = 18 - manual
  const verdict = score >= 14 ? '🟢 HEALTHY' : score >= 10 ? '🟡 MONITOR' : '🔴 CRITICAL'
  console.log(`\nScore: ${score}/${auto} auto-checkable (${manual} manual/Lovable-side)`)
  console.log(`Verdict: ${verdict}`)
}

auditBrand(enB, EN, leEN, thEN, laEN, clEN, titlesEN, imgEN, totEN, artEN, 'EN')
auditBrand(esB, ES, leES, thES, laES, clES, titlesES, imgES, totES, artES, 'ES')
