import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const EN_BRAND = 'eceba851-228a-45cf-8775-b0f7fc9ae7de'

const { data: en, error } = await sb.from('articles')
  .select('id, slug, title, keyword, featured_image, published_at, image_style, created_at, content_markdown')
  .eq('brand_id', EN_BRAND)
  .eq('status', 'published')
  .order('published_at', { ascending: false })

if (error) { console.log('ERROR:', error.message); process.exit(1) }
console.log(`EN articles: ${en?.length ?? 0}`)

// Mostra tutti
for (const a of en ?? []) {
  const isSupabase = a.featured_image?.includes('supabase') ?? false
  console.log(`\n[${a.published_at?.slice(0,10)}] ${isSupabase ? '🤖' : '🌐'} ${a.slug}`)
  console.log(`  keyword: "${a.keyword}"`)
  console.log(`  img    : ${a.featured_image?.slice(0,120)}`)
}

// Deep dive sleep
console.log('\n' + '═'.repeat(80))
const sleep = en?.find(a => a.slug?.includes('sleep') || a.title?.toLowerCase().includes('sleep'))
if (sleep) {
  console.log('SLEEP ARTICLE FOUND:')
  console.log(`  id       : ${sleep.id}`)
  console.log(`  slug     : ${sleep.slug}`)
  console.log(`  title    : ${sleep.title}`)
  console.log(`  keyword  : "${sleep.keyword}"`)
  console.log(`  created  : ${sleep.created_at}`)
  console.log(`  published: ${sleep.published_at}`)
  console.log(`  style    : ${sleep.image_style ?? 'null → DEFAULT_STYLE'}`)
  console.log(`\n  IMAGE URL:\n  ${sleep.featured_image}`)
  console.log(`\n  CONTENT_MARKDOWN (1000 char):\n${sleep.content_markdown?.slice(0,1000)}`)
} else {
  console.log('❌ No sleep article found. All slugs:')
  en?.forEach(a => console.log(`  ${a.slug} | ${a.title}`))
}
