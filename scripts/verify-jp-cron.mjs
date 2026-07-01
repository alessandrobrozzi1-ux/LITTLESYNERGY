/**
 * READ-ONLY — Verifica il primo articolo JP auto-generato dal cron daily-publish.
 * Nessuna scrittura. Uso: node scripts/verify-jp-cron.mjs [YYYY-MM-DD]
 * Se la data non è passata, usa oggi (UTC).
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const JA = '398fafd9-4a2b-4642-82c9-73add6fbc134'
const PILLAR = 'e1016e1d-ea5d-42d9-bf7f-91abc6fcae04'
const TEST = '7c53398f-c7bf-41ab-839a-03d9a90866fc'
const GATEWAY_MATCH = (u) => u.includes('office.doterra.com') && u.includes('Country=JPN') && u.includes('EnrollerID=15957920')
const day = process.argv[2] || new Date().toISOString().slice(0, 10)
const FORBIDDEN = ['神経', '副交感', '交感神経', '自律神経', 'ホルモン', 'セロトニン', 'メラトニン', 'コルチゾール', 'GABA', '血圧', '血流', '免疫', '消化器', '内臓', '脳', '科学的研究', '臨床']

const out = []
const log = (s) => out.push(s)

const { data: arts } = await sb.from('articles')
  .select('id,title,slug,status,published_at,content_markdown,featured_image')
  .eq('brand_id', JA).eq('status', 'published')
  .gte('published_at', day + 'T00:00:00Z').lte('published_at', day + 'T23:59:59Z')
  .order('published_at', { ascending: false })

const cronArts = (arts || []).filter(a => a.id !== PILLAR && a.id !== TEST)

log(`═══ VERIFICA AUTOPILOT JP — cron ${day} ═══`)
if (!cronArts.length) {
  log(`⚠️  NESSUN articolo JP auto-pubblicato il ${day} (oltre al pillar).`)
  log(`   → Il cron potrebbe non essere ancora partito, o JP è stato saltato. Riprovare più tardi.`)
  log(`\nVERDETTO: ⏳ IN ATTESA (nessun articolo cron da verificare)`)
  console.log(out.join('\n')); process.exit(0)
}

let allClean = true
for (const a of cronArts) {
  const c = a.content_markdown || ''
  log(`\n── Articolo: ${a.title}`)
  log(`   slug: ${a.slug} | id: ${a.id} | pub: ${a.published_at}`)

  // 1) 薬機法 claim check
  const hits = FORBIDDEN.filter(t => c.includes(t))
  const claimOk = hits.length === 0
  log(`   薬機法 claim check : ${claimOk ? '✅ 0 termini proibiti' : '❌ TROVATI: ' + hits.join(' , ')}`)

  // 2) Link nel corpo → gateway
  const links = [...c.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)]
  let gw = 0, shop = 0
  for (const m of links) { const u = m[2]; if (GATEWAY_MATCH(u)) gw++; else if (/shop\.doterra|www\.doterra/.test(u)) shop++ }
  const linkOk = shop === 0
  log(`   link corpo        : ${linkOk ? '✅' : '❌'} gateway=${gw} negozioJP=${shop}`)

  // 3) Immagine doTERRA-branded vs placeholder
  const img = a.featured_image || ''
  const imgOk = img.includes('supabase.co/storage') && img.includes('article-images')
  log(`   immagine          : ${imgOk ? '✅ doTERRA-branded (storage)' : (img ? '⚠️ placeholder/non-storage: ' + img.slice(0, 50) : '❌ assente (timeout?)')}`)

  // 4) GEO
  const author = 'Essential Synergy チーム — ウェルネスアドボケイト＆doTERRA愛好家'
  const tableRows = (c.match(/^\|.*\|$/gm) || []).length
  const geo = { author: c.includes(author), table: tableRows >= 2, faq: /よくある質問|Q&A|FAQ|質問/.test(c), direct: c.split('\n').filter(Boolean).slice(0, 4).join('').length > 100 }
  const geoOk = geo.author && geo.table && geo.faq
  log(`   GEO               : ${geoOk ? '✅' : '⚠️'} author=${geo.author ? '✓' : '✗'} tabella=${geo.table ? '✓(' + tableRows + ')' : '✗'} FAQ=${geo.faq ? '✓' : '✗'}`)

  const clean = claimOk && linkOk && (geoOk)
  if (!claimOk || !linkOk) allClean = false   // claim/link = bloccanti; immagine timeout = non bloccante
  if (!geoOk) allClean = false
  if (!claimOk) log(`   🚨 ALERT: CLAIM CLINICO sfuggito — irrigidire il prompt JP PRIMA che il cron accumuli!`)
  if (!linkOk) log(`   🚨 ALERT: LINK NEGOZIO JP nel corpo — il fallback-gateway non ha coperto un caso!`)
}

log(`\n═══════════════════════════════════════════`)
log(`VERDETTO AUTOPILOT JP: ${allClean ? '🟢 PULITO (SÌ)' : '🔴 PROBLEMA (NO) — vedi ALERT sopra'}`)
console.log(out.join('\n'))
