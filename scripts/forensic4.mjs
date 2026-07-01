import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const EN_BRAND = 'eceba851-228a-45cf-8775-b0f7fc9ae7de'

const { data: en, error } = await sb.from('articles')
  .select('id, slug, title, keyword_source, featured_image, published_at, image_style, created_at, content_markdown')
  .eq('brand_id', EN_BRAND)
  .eq('status', 'published')
  .order('published_at', { ascending: false })

if (error) { console.log('ERROR:', error.message); process.exit(1) }
console.log(`EN published articles: ${en?.length ?? 0}`)
console.log('═'.repeat(80))

for (const a of en ?? []) {
  const isSupabase = a.featured_image?.includes('supabase') ?? false
  console.log(`\n[${a.published_at?.slice(0,10)}] ${isSupabase ? '🤖 AI' : '🌐 EXT'} | ${a.slug}`)
  console.log(`  keyword_source: "${a.keyword_source}"`)
  console.log(`  image_style   : ${a.image_style ?? 'null → DEFAULT_STYLE'}`)
  console.log(`  img           : ${a.featured_image?.slice(0,120) ?? 'NULL'}`)
}

// ── Deep dive: sleep article ──────────────────────────────────────────────────
console.log('\n\n' + '═'.repeat(80))
console.log('SLEEP ARTICLE DEEP DIVE')
console.log('═'.repeat(80))

const sleep = en?.find(a =>
  a.slug?.includes('sleep') || a.title?.toLowerCase().includes('sleep')
)

if (!sleep) {
  console.log('❌ Sleep article not found by slug/title. All slugs:')
  en?.forEach(a => console.log(`  ${a.slug} — "${a.title}"`))
  process.exit(0)
}

console.log(`id            : ${sleep.id}`)
console.log(`slug          : ${sleep.slug}`)
console.log(`title         : ${sleep.title}`)
console.log(`keyword_source: "${sleep.keyword_source}"`)
console.log(`created_at    : ${sleep.created_at}`)
console.log(`published_at  : ${sleep.published_at}`)
console.log(`image_style   : ${sleep.image_style ?? 'null → DEFAULT_STYLE'}`)
console.log(`\nFEATURED IMAGE URL:\n${sleep.featured_image}`)
console.log(`\nCONTENT_MARKDOWN (1500 char):\n${sleep.content_markdown?.slice(0, 1500) ?? 'NULL'}`)

// ── Estrai doTERRA links dal content_markdown ─────────────────────────────────
console.log('\n\n' + '═'.repeat(80))
console.log('LINKED DOTERRA PRODUCTS (da content_markdown)')
console.log('═'.repeat(80))

const md = sleep.content_markdown ?? ''
const doterraLinks = [...md.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]*doterra[^)]*)\)/gi)]
for (const m of doterraLinks) {
  console.log(`  anchor: "${m[1]}" → ${m[2].slice(0, 80)}`)
}
if (!doterraLinks.length) console.log('  ❌ Nessun link doTERRA trovato')
