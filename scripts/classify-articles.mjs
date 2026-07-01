import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const { data: articles } = await sb.from('articles')
  .select('id, slug, title, published_at, created_at, brand_id, brands(language_code)')
  .eq('status', 'published')
  .order('brand_id')
  .order('published_at', { ascending: true })

// Convert to IT timezone and classify
// IT = UTC+2 (CEST in June)
const IT_OFFSET = 2 * 60 * 60 * 1000

function toIT(utcStr) {
  const d = new Date(new Date(utcStr).getTime() + IT_OFFSET)
  return d
}

function classify(published_at) {
  const it = toIT(published_at)
  const h = it.getUTCHours()
  const m = it.getUTCMinutes()
  // Cron runs at 09:00 IT — window 09:00-09:20 (generous)
  if (h === 9 && m <= 20) return 'CRON_LEGIT'
  // PT pillar was manually published at 10:19 IT — also legit
  return 'TEST'
}

function formatIT(utcStr) {
  const it = toIT(utcStr)
  return `${String(it.getUTCFullYear())}-${String(it.getUTCMonth()+1).padStart(2,'0')}-${String(it.getUTCDate()).padStart(2,'0')} ${String(it.getUTCHours()).padStart(2,'0')}:${String(it.getUTCMinutes()).padStart(2,'0')}:${String(it.getUTCSeconds()).padStart(2,'0')} IT`
}

const byLang = {}
for (const a of articles) {
  const lang = a.brands?.language_code?.toUpperCase() ?? '??'
  if (!byLang[lang]) byLang[lang] = []
  byLang[lang].push(a)
}

let totalCron = 0, totalTest = 0

for (const lang of ['EN','ES','DE','FR','PT']) {
  const arts = byLang[lang] ?? []
  let cronCount = 0, testCount = 0

  console.log(`\n${'═'.repeat(72)}`)
  console.log(`${lang} — ${arts.length} articoli published`)
  console.log('═'.repeat(72))
  console.log(`${'Slug'.padEnd(50)} | IT Timestamp          | Origin      | ID`)
  console.log(`${'-'.repeat(50)}-+----------------------+-------------+----------`)

  for (const a of arts) {
    const origin = classify(a.published_at)
    if (origin === 'CRON_LEGIT') cronCount++; else testCount++
    const slug = (a.slug ?? '').slice(0, 49).padEnd(49)
    const ts = formatIT(a.published_at)
    const id8 = a.id.slice(0, 8)
    const marker = origin === 'CRON_LEGIT' ? '✅ CRON    ' : '🚨 TEST    '
    console.log(`${slug} | ${ts} | ${marker} | ${id8}`)
  }

  console.log(`\n  → CRON_LEGIT: ${cronCount} | TEST: ${testCount}`)
  totalCron += cronCount; totalTest += testCount
}

console.log(`\n${'═'.repeat(72)}`)
console.log('SOMMARIO')
console.log('═'.repeat(72))
console.log(`| Lang | CRON_LEGIT | TEST | Total |`)
console.log(`|------|-----------|------|-------|`)
for (const lang of ['EN','ES','DE','FR','PT']) {
  const arts = byLang[lang] ?? []
  const cron = arts.filter(a => classify(a.published_at) === 'CRON_LEGIT').length
  const test = arts.length - cron
  console.log(`| ${lang.padEnd(4)} | ${String(cron).padEnd(9)} | ${String(test).padEnd(4)} | ${arts.length.toString().padEnd(5)} |`)
}
console.log(`| ALL  | ${String(totalCron).padEnd(9)} | ${String(totalTest).padEnd(4)} | ${String(totalCron+totalTest).padEnd(5)} |`)

console.log('\nTest IDs (aspetto OK per UPDATE):')
for (const a of articles) {
  if (classify(a.published_at) === 'TEST') {
    const lang = a.brands?.language_code?.toUpperCase()
    console.log(`  '${a.id}' -- [${lang}] ${a.slug?.slice(0,55)}`)
  }
}
