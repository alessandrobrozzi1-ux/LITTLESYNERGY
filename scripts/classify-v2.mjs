import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const { data: articles } = await sb.from('articles')
  .select('id, slug, title, published_at, brand_id, brands(language_code)')
  .eq('status', 'published')
  .order('brand_id').order('published_at', { ascending: true })

const IT_OFFSET = 2 * 60 * 60 * 1000 // CEST = UTC+2

function toIT(utcStr) {
  return new Date(new Date(utcStr).getTime() + IT_OFFSET)
}

function classify(published_at) {
  const it = toIT(published_at)
  const h  = it.getUTCHours()   // hour in IT
  const m  = it.getUTCMinutes()
  const d  = it.getUTCDate()
  const mo = it.getUTCMonth() + 1  // June = 6

  // Test scripts today (June 26) ran after 10:19 IT
  if (mo === 6 && d === 26 && (h > 10 || (h === 10 && m > 19))) return 'TEST_OGGI'

  // PT pillar manuale June 26 10:19 IT — legit
  if (mo === 6 && d === 26 && h === 10 && m <= 19) return 'PILLAR_MANUALE'

  // Cron runs 09:00-09:59 IT every day
  if (h === 9) return 'CRON'

  // Everything else = setup phase (initial seeding)
  return 'SETUP'
}

const LABEL = {
  'CRON':           '✅ CRON          ',
  'SETUP':          '📦 SETUP         ',
  'PILLAR_MANUALE': '✅ PILLAR MANUALE',
  'TEST_OGGI':      '🚨 TEST OGGI     ',
}

const byLang = {}
for (const a of articles) {
  const lang = a.brands?.language_code?.toUpperCase() ?? '??'
  if (!byLang[lang]) byLang[lang] = []
  byLang[lang].push(a)
}

const summary = {}

for (const lang of ['EN','ES','DE','FR','PT']) {
  const arts = byLang[lang] ?? []
  const counts = { CRON: 0, SETUP: 0, PILLAR_MANUALE: 0, TEST_OGGI: 0 }

  console.log(`\n${'═'.repeat(82)}`)
  console.log(`${lang} — ${arts.length} articoli published`)
  console.log('═'.repeat(82))
  console.log(`${'Data IT'.padEnd(19)} ${'h:m IT'.padEnd(8)} ${'Origine'.padEnd(17)} ${'Slug'.padEnd(50)} ID`)
  console.log('-'.repeat(82))

  for (const a of arts) {
    const it = toIT(a.published_at)
    const origin = classify(a.published_at)
    counts[origin]++
    const dateStr = `${String(it.getUTCDate()).padStart(2,'0')}/${String(it.getUTCMonth()+1).padStart(2,'0')}/${it.getUTCFullYear()}`
    const timeStr = `${String(it.getUTCHours()).padStart(2,'0')}:${String(it.getUTCMinutes()).padStart(2,'0')}`
    const slug55  = (a.slug ?? '').slice(0, 49).padEnd(49)
    console.log(`${dateStr.padEnd(19)} ${timeStr.padEnd(8)} ${LABEL[origin]} ${slug55} ${a.id.slice(0,8)}`)
  }

  console.log(`\n  CRON: ${counts.CRON} | SETUP: ${counts.SETUP} | PILLAR_MANUALE: ${counts.PILLAR_MANUALE} | TEST_OGGI: ${counts.TEST_OGGI}`)
  summary[lang] = counts
}

console.log(`\n${'═'.repeat(82)}`)
console.log('SOMMARIO')
console.log('═'.repeat(82))
console.log('| Lang | CRON | SETUP | PILLAR | TEST_OGGI | Total | After cleanup |')
console.log('|------|------|-------|--------|-----------|-------|---------------|')
let totalAfter = 0
for (const lang of ['EN','ES','DE','FR','PT']) {
  const c = summary[lang]
  const keep = (c.CRON ?? 0) + (c.SETUP ?? 0) + (c.PILLAR_MANUALE ?? 0)
  const test = c.TEST_OGGI ?? 0
  const tot = keep + test
  totalAfter += keep
  console.log(`| ${lang.padEnd(4)} | ${String(c.CRON).padEnd(4)} | ${String(c.SETUP).padEnd(5)} | ${String(c.PILLAR_MANUALE).padEnd(6)} | ${String(test).padEnd(9)} | ${String(tot).padEnd(5)} | ${String(keep).padEnd(13)} |`)
}

console.log('\n🚨 TEST_OGGI da unpublish (aspetto OK):')
for (const a of articles) {
  if (classify(a.published_at) === 'TEST_OGGI') {
    const lang = a.brands?.language_code?.toUpperCase()
    console.log(`  '${a.id}' -- [${lang}] ${a.slug?.slice(0,55)}`)
  }
}
