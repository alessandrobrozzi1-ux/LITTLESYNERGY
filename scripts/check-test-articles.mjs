import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const { data, error } = await sb.from('articles')
  .select('id, brand_id, slug, title, status, published_at, created_at')
  .gt('created_at', new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString())
  .order('created_at', { ascending: false })

if (error) { console.log('ERROR:', error.message); process.exit(1) }

// Cron window = published between 07:00-09:30 UTC (09:00-11:30 IT)
const CRON_START = new Date('2026-06-26T07:00:00Z')
const CRON_END   = new Date('2026-06-26T09:30:00Z')

const cronArticles = []
const testArticles = []

for (const a of data) {
  const pub = a.published_at ? new Date(a.published_at) : null
  const isCron = pub && pub >= CRON_START && pub <= CRON_END
  if (isCron) cronArticles.push(a)
  else testArticles.push(a)
}

console.log('\n══ ARTICOLI CRON 9AM (NON TOCCARE) ══')
for (const a of cronArticles) {
  console.log(`  ✅ [${a.status}] ${a.published_at?.slice(0,19)} | ${a.slug?.slice(0,50)}`)
  console.log(`     id: ${a.id}`)
}
console.log(`  Totale cron: ${cronArticles.length}`)

console.log('\n══ ARTICOLI TEST (CANDIDATI UNPUBLISH) ══')
for (const a of testArticles) {
  console.log(`  🚨 [${a.status}] created: ${a.created_at?.slice(0,19)} | pub: ${a.published_at?.slice(0,19) ?? 'null'}`)
  console.log(`     slug:  ${a.slug?.slice(0,60)}`)
  console.log(`     title: ${a.title?.slice(0,60)}`)
  console.log(`     brand: ${a.brand_id}`)
  console.log(`     id:    ${a.id}`)
}
console.log(`\n  Totale TEST: ${testArticles.length}`)
console.log('\n  IDs da unpublish:', testArticles.map(a => `'${a.id}'`).join(', '))
