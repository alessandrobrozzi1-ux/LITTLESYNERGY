import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const EN_BRAND = 'eceba851-228a-45cf-8775-b0f7fc9ae7de'

// Brand info (image_style è in brands)
const { data: brand } = await sb.from('brands')
  .select('brand_dna_image_style, brand_name, language_code')
  .eq('id', EN_BRAND).single()

console.log('BRAND EN image_style:')
console.log(brand?.brand_dna_image_style ?? 'NULL (usa DEFAULT_STYLE)')

// Tutti gli articoli EN
const { data: en, error } = await sb.from('articles')
  .select('id, slug, title, keyword_source, featured_image, published_at, created_at, content_markdown')
  .eq('brand_id', EN_BRAND)
  .eq('status', 'published')
  .order('published_at', { ascending: false })

if (error) { console.log('ERROR:', error.message); process.exit(1) }

console.log(`\nEN published: ${en?.length ?? 0}`)
console.log('═'.repeat(80))

for (const a of en ?? []) {
  console.log(`\n[${a.published_at?.slice(0,10)}] ${a.slug}`)
  console.log(`  keyword_source: "${a.keyword_source}"`)
  console.log(`  img: ${a.featured_image?.slice(0,120) ?? 'NULL'}`)
}

// Deep dive sleep
const sleep = en?.find(a => a.slug?.includes('sleep') || a.title?.toLowerCase().includes('sleep'))

if (!sleep) {
  console.log('\n❌ No sleep article. All slugs+titles:')
  en?.forEach(a => console.log(`  "${a.slug}" | "${a.title}"`))
  process.exit(0)
}

console.log('\n' + '═'.repeat(80))
console.log('SLEEP ARTICLE:')
console.log(`  id            : ${sleep.id}`)
console.log(`  slug          : ${sleep.slug}`)
console.log(`  title         : ${sleep.title}`)
console.log(`  keyword_source: "${sleep.keyword_source}"`)
console.log(`  created_at    : ${sleep.created_at}`)
console.log(`  published_at  : ${sleep.published_at}`)
console.log(`\n  FEATURED IMAGE:\n  ${sleep.featured_image}`)
console.log(`\n  CONTENT_MARKDOWN (1500 char):\n${sleep.content_markdown?.slice(0, 1500)}`)

// doTERRA links
const md = sleep.content_markdown ?? ''
const links = [...md.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]*doterra[^)]*)\)/gi)]
console.log(`\n  DOTERRA LINKS (${links.length} trovati):`)
for (const m of links) console.log(`    anchor: "${m[1]}" → ${m[2].slice(0,80)}`)
if (!links.length) console.log('    ❌ Nessuno')
