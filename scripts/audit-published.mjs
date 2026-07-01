import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// ── QUERY 1: tutti published con brand ───────────────────────────────────
const { data: allPub } = await sb.from('articles')
  .select('id, slug, title, status, published_at, created_at, brand_id, brands(language_code)')
  .eq('status', 'published')
  .order('brand_id')
  .order('published_at', { ascending: false })

// Group by language
const byLang = {}
for (const a of allPub) {
  const lang = a.brands?.language_code ?? 'unknown'
  if (!byLang[lang]) byLang[lang] = []
  byLang[lang].push(a)
}

console.log('\n' + '═'.repeat(72))
console.log('QUERY 1 — TUTTI ARTICOLI PUBLISHED PER LINGUA')
console.log('═'.repeat(72))

for (const lang of ['en','es','de','fr','pt']) {
  const arts = byLang[lang] ?? []
  console.log(`\n── ${lang.toUpperCase()} (${arts.length} articoli) ──`)
  for (const a of arts) {
    console.log(`  ${a.published_at?.slice(0,19) ?? 'null'} | ${a.slug?.slice(0,55).padEnd(55)} | ${a.id}`)
  }
}

// ── QUERY 2: duplicati slug per brand ────────────────────────────────────
console.log('\n' + '═'.repeat(72))
console.log('QUERY 2 — DUPLICATI SLUG (published)')
console.log('═'.repeat(72))

// Build slug+lang → articles map
const slugMap = {}
for (const a of allPub) {
  const lang = a.brands?.language_code ?? 'unknown'
  const key = `${lang}::${a.slug}`
  if (!slugMap[key]) slugMap[key] = []
  slugMap[key].push(a)
}

const dupes = Object.entries(slugMap)
  .filter(([, arts]) => arts.length > 1)
  .sort((a, b) => b[1].length - a[1].length)

if (dupes.length === 0) {
  console.log('  Nessun duplicato trovato.')
} else {
  for (const [key, arts] of dupes) {
    const [lang, slug] = key.split('::')
    console.log(`\n  [${lang.toUpperCase()}] "${slug}" — ${arts.length} copie`)
    for (const a of arts.sort((x,y) => x.created_at.localeCompare(y.created_at))) {
      console.log(`    created: ${a.created_at?.slice(0,19)} | pub: ${a.published_at?.slice(0,19)} | ${a.id}`)
    }
    // Oldest = keeper, rest = candidates for removal
    const keeper = arts.sort((x,y) => x.created_at.localeCompare(y.created_at))[0]
    const toRemove = arts.slice(1)
    console.log(`    → KEEPER (oldest): ${keeper.id}`)
    console.log(`    → REMOVE (${toRemove.length}): ${toRemove.map(a=>a.id).join(', ')}`)
  }
}

// ── QUERY 3: contatori unique vs total ───────────────────────────────────
console.log('\n' + '═'.repeat(72))
console.log('QUERY 3 — UNIQUE vs TOTAL PER LINGUA')
console.log('═'.repeat(72))
console.log('\n| Lang | Total published | Unique slugs | Duplicati extra |')
console.log('|------|----------------|--------------|-----------------|')

let totalAll = 0, totalUnique = 0
for (const lang of ['en','es','de','fr','pt']) {
  const arts = byLang[lang] ?? []
  const uniqueSlugs = new Set(arts.map(a => a.slug)).size
  const dupeCount = arts.length - uniqueSlugs
  totalAll += arts.length
  totalUnique += uniqueSlugs
  console.log(`| ${lang.toUpperCase().padEnd(4)} | ${String(arts.length).padEnd(14)}   | ${String(uniqueSlugs).padEnd(12)} | ${String(dupeCount).padEnd(15)}   |`)
}
console.log(`| ALL  | ${String(totalAll).padEnd(14)}   | ${String(totalUnique).padEnd(12)} | ${String(totalAll-totalUnique).padEnd(15)}   |`)

// Summary of all IDs to remove (duplicates only — newest copies)
const allToRemove = []
for (const [, arts] of dupes) {
  const sorted = [...arts].sort((x,y) => x.created_at.localeCompare(y.created_at))
  allToRemove.push(...sorted.slice(1))
}
console.log(`\n── Totale articoli duplicati da rimuovere (non oldest): ${allToRemove.length}`)
console.log('IDs candidati rimozione duplicati:')
for (const a of allToRemove) {
  const lang = a.brands?.language_code?.toUpperCase()
  console.log(`  [${lang}] ${a.created_at?.slice(0,19)} | ${a.slug?.slice(0,50)} | ${a.id}`)
}
