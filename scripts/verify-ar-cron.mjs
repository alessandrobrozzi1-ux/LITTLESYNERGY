/**
 * READ-ONLY — Verifica il primo articolo AR auto-generato dal cron daily-publish.
 * Nessuna scrittura. Uso: node scripts/verify-ar-cron.mjs [YYYY-MM-DD]  (default oggi UTC)
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const AR = 'afc6299a-fe74-4162-b0fd-6ccceb55b8e7'
const PILLAR = 'c61e2b7c-842d-41b9-8dfa-3ec92a94abda'
const TEST = '7f1bdbf2-e6f4-4275-9671-f005d05b2545'
const day = process.argv[2] || new Date().toISOString().slice(0, 10)
// Gulf compliance: medical/therapeutic claims + miracle/guarantee language (GCC/GSO, UAE Advertising Council)
const MEDICAL = ['معجزة', 'يشفي', 'شفاء', 'يعالج', 'يداوي', 'مرض', 'الأرق', 'الاكتئاب', 'بلا آثار جانبية', 'آمن تمامًا', 'لا آثار جانبية']
const GUARANTEE = ['مضمون', 'ضمان', '100٪', '100%', 'نتائج مضمونة']
const AUTHOR = 'فريق Essential Synergy — مستشارو العافية ومحبو doTERRA'

const out = []; const log = (s) => out.push(s)

const { data: arts } = await sb.from('articles')
  .select('id,title,slug,status,published_at,content_markdown,featured_image')
  .eq('brand_id', AR).eq('status', 'published')
  .gte('published_at', day + 'T00:00:00Z').lte('published_at', day + 'T23:59:59Z')
  .order('published_at', { ascending: false })

const cronArts = (arts || []).filter(a => a.id !== PILLAR && a.id !== TEST)

log(`═══ VERIFICA AUTOPILOT AR — cron ${day} ═══`)
if (!cronArts.length) {
  log(`⏳ NESSUN articolo AR auto-pubblicato il ${day} (oltre a pillar/test). Cron non ancora partito o AR saltato — riprovare più tardi.`)
  log(`\nVERDETTO AR: ⏳ IN ATTESA`)
  console.log(out.join('\n')); process.exit(0)
}

let allClean = true
for (const a of cronArts) {
  const c = a.content_markdown || ''
  log(`\n── Articolo: ${a.title}\n   slug: ${a.slug} | id: ${a.id} | pub: ${a.published_at}`)

  // 1) Compliance Gulf — medical claims
  const medHits = MEDICAL.filter(t => c.includes(t))
  const medOk = medHits.length === 0
  // علاج escludendo aromaterapia / disclaimer "non sostituisce cure mediche"
  const ilaj = (c.match(/علاج/g) || []).length
  const ilajOk = (c.match(/العلاج العطري|علاج عطري|العلاج الطبي|بديلاً عن العلاج/g) || []).length
  const ilajSuspect = ilaj - ilajOk
  log(`   Gulf — claim medici : ${medOk && ilajSuspect <= 0 ? '✅ 0' : '❌ ' + medHits.join(' , ') + (ilajSuspect > 0 ? ` +علاج×${ilajSuspect}` : '')}`)

  // 2) Compliance Gulf — guarantee/miracle language
  const guarHits = GUARANTEE.filter(t => c.includes(t))
  const guarOk = guarHits.length === 0
  log(`   Gulf — garanzia     : ${guarOk ? '✅ 0 (مضمون/100٪/ضمان)' : '❌ ' + guarHits.join(' , ')}`)

  // 3) Link nel corpo → gateway ARE
  const links = [...c.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)]
  let gw = 0, shop = 0
  for (const m of links) { const u = m[2]; if (u.includes('office.doterra.com') && u.includes('Country=ARE')) gw++; else if (/shop\.doterra|www\.doterra/.test(u)) shop++ }
  const linkOk = shop === 0
  log(`   link corpo          : ${linkOk ? '✅' : '❌'} gateway=${gw} negozio=${shop}`)

  // 4) Immagine doTERRA-branded
  const img = a.featured_image || ''
  const imgOk = img.includes('supabase.co/storage') && img.includes('article-images')
  log(`   immagine            : ${imgOk ? '✅ doTERRA-branded' : (img ? '⚠️ placeholder/timeout' : '❌ assente')}`)

  // 5) GEO + author + RTL note
  const tableRows = (c.match(/^\|.*\|$/gm) || []).length
  const geoOk = c.includes(AUTHOR) && tableRows >= 2 && /الأسئلة الشائعة|أسئلة شائعة|الأسئلة المتكررة/.test(c)
  log(`   GEO                 : ${geoOk ? '✅' : '⚠️'} author=${c.includes(AUTHOR) ? '✓' : '✗'} tabella=${tableRows >= 2 ? '✓(' + tableRows + ')' : '✗'} FAQ=${/الأسئلة|أسئلة/.test(c) ? '✓' : '✗'}`)
  log(`   RTL                 : render verificato su componenti condivisi (live /ar già confermato). Draft non live.`)

  const clean = medOk && ilajSuspect <= 0 && guarOk && linkOk && geoOk
  if (!clean) allClean = false
  if (!medOk || ilajSuspect > 0) log(`   🚨 ALERT: CLAIM MEDICO Gulf — irrigidire blocco arCompliance PRIMA che il cron accumuli!`)
  if (!guarOk) log(`   🚨 ALERT: LINGUAGGIO GARANZIA (مضمون/100٪) — UAE Advertising Council lo contesta!`)
  if (!linkOk) log(`   🚨 ALERT: LINK NEGOZIO AE nel corpo — fallback-gateway non ha coperto un caso!`)
}

log(`\n═══════════════════════════════════════════`)
log(`VERDETTO AUTOPILOT AR: ${allClean ? '🟢 PULITO (SÌ)' : '🔴 PROBLEMA (NO) — vedi ALERT'}`)
console.log(out.join('\n'))
