import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const { data: allPub } = await sb.from('articles')
  .select('id, slug, title, published_at, created_at, brand_id, brands(language_code)')
  .eq('status', 'published')
  .order('published_at', { ascending: false })

// Group by brand_id + slug
const groups = {}
for (const a of allPub) {
  const key = `${a.brand_id}::${a.slug}`
  if (!groups[key]) groups[key] = []
  groups[key].push(a)
}

const dupeGroups = Object.entries(groups).filter(([, arts]) => arts.length > 1)

const keepers = []
const unpublish = []

for (const [, arts] of dupeGroups) {
  // Sort by published_at DESC — most recent first = KEEPER
  const sorted = [...arts].sort((a, b) => b.published_at.localeCompare(a.published_at))
  keepers.push(sorted[0])
  unpublish.push(...sorted.slice(1))
}

const lang = a => a.brands?.language_code?.toUpperCase()

console.log('\n══ KEEPERS (most recent per slug) ══')
for (const a of keepers) {
  console.log(`  [${lang(a)}] ${a.published_at?.slice(0,19)} | ${a.slug?.slice(0,55)} | ${a.id}`)
}

console.log(`\n  Totale keepers: ${keepers.length}`)

console.log('\n══ UNPUBLISH TARGETS (vecchi duplicati → draft) ══')
for (const a of unpublish) {
  console.log(`  [${lang(a)}] ${a.published_at?.slice(0,19)} | ${a.slug?.slice(0,55)} | ${a.id}`)
}

console.log(`\n  Totale unpublish: ${unpublish.length}`)
console.log('\n  IDs UPDATE SET status=draft:')
console.log("  '" + unpublish.map(a => a.id).join("',\n  '") + "'")

console.log('\n══ VERIFICA POST-PULIZIA ATTESA ══')
const totalPub = allPub.length
const afterPub = totalPub - unpublish.length
console.log(`  Total published ora:   ${totalPub}`)
console.log(`  Total published dopo:  ${afterPub}`)
console.log(`  Unique slugs (stima):  50 (zero duplicati)`)
