import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// Tutti gli articoli EN published — nessun filtro brand, cerco per slug/title
const { data: all } = await sb.from('articles')
  .select('id, slug, title, keyword, featured_image, published_at, image_style, created_at, status, content_markdown, brands(language_code, id)')
  .eq('status', 'published')
  .order('published_at', { ascending: false })

const en = all?.filter(a => a.brands?.language_code === 'en') ?? []

console.log(`EN articles published: ${en.length}`)
console.log('═'.repeat(80))

for (const a of en) {
  console.log(`\n[${a.published_at?.slice(0,10)}] ${a.slug}`)
  console.log(`  title  : "${a.title}"`)
  console.log(`  keyword: "${a.keyword}"`)
  console.log(`  img    : ${a.featured_image}`)
  console.log(`  style  : ${a.image_style ?? 'DEFAULT_STYLE'}`)
}

// Cerca sleep article specifico
console.log('\n\n' + '═'.repeat(80))
console.log('SLEEP ARTICLE DEEP DIVE')
console.log('═'.repeat(80))

const sleepArt = en.find(a => a.slug?.includes('sleep') || a.title?.toLowerCase().includes('sleep'))
if (sleepArt) {
  console.log(`ID        : ${sleepArt.id}`)
  console.log(`Slug      : ${sleepArt.slug}`)
  console.log(`Title     : ${sleepArt.title}`)
  console.log(`Keyword   : "${sleepArt.keyword}"`)
  console.log(`Created   : ${sleepArt.created_at}`)
  console.log(`Published : ${sleepArt.published_at}`)
  console.log(`Img style : ${sleepArt.image_style ?? 'null → DEFAULT_STYLE'}`)
  console.log(`\nFeatured image URL:`)
  console.log(sleepArt.featured_image)
  console.log(`\nContent_markdown (prime 1000 char):`)
  console.log(sleepArt.content_markdown?.slice(0, 1000) ?? 'NULL')
} else {
  console.log('❌ Nessun articolo con "sleep" nel slug/title trovato')
  console.log('Slugs disponibili:')
  en.forEach(a => console.log(`  ${a.slug}`))
}
