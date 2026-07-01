/**
 * Forensic analysis — EN "doTERRA Essential Oils for Sleep & Restful Nights"
 * NO modifiche, SOLO lettura dati.
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// ── 1. Trova articolo target ──────────────────────────────────────────────────
console.log('═'.repeat(72))
console.log('STEP 1 — Articolo EN Sleep')
console.log('═'.repeat(72))

const { data: target } = await sb.from('articles')
  .select('id, slug, title, featured_image, keyword, content_markdown, created_at, published_at, brand_id, status, image_style')
  .or("slug.eq.doterra-essential-oils-for-sleep,title.ilike.%doTERRA Essential Oils for Sleep%")

for (const a of target ?? []) {
  console.log(`\nID          : ${a.id}`)
  console.log(`Slug        : ${a.slug}`)
  console.log(`Title       : ${a.title}`)
  console.log(`Status      : ${a.status}`)
  console.log(`Keyword     : "${a.keyword}"`)
  console.log(`Image style : ${a.image_style ?? 'null (DEFAULT_STYLE)'}`)
  console.log(`Created at  : ${a.created_at}`)
  console.log(`Published at: ${a.published_at}`)
  console.log(`Featured img: ${a.featured_image}`)
  console.log(`\nContent_markdown (prime 800 char):`)
  console.log(a.content_markdown?.slice(0, 800) ?? 'NULL')
}

// ── 2. Tutti gli articoli EN published — featured_image status ────────────────
console.log('\n\n' + '═'.repeat(72))
console.log('STEP 2 — Tutti articoli EN published: keyword + image URL')
console.log('═'.repeat(72))

const EN_BRAND = 'eceba851-228a-45cf-8775-b0f7fc9ae7de'

const { data: enArts } = await sb.from('articles')
  .select('id, slug, title, keyword, featured_image, published_at, image_style, created_at')
  .eq('brand_id', EN_BRAND)
  .eq('status', 'published')
  .order('published_at', { ascending: false })

for (const a of enArts ?? []) {
  const hasImg = !!a.featured_image
  const isSupabase = a.featured_image?.includes('supabase') ?? false
  const isExternal = hasImg && !isSupabase
  const imgType = !hasImg ? '❌ NULL' : isExternal ? '🌐 EXTERNAL' : '🤖 SUPABASE/AI'
  console.log(`\n[${a.published_at?.slice(0,10)}] ${imgType}`)
  console.log(`  slug   : ${a.slug}`)
  console.log(`  keyword: "${a.keyword}"`)
  console.log(`  style  : ${a.image_style ?? 'null'}`)
  console.log(`  img    : ${a.featured_image?.slice(0, 100) ?? 'NULL'}`)
}

// ── 3. Stesso check per ES/DE/FR/PT ──────────────────────────────────────────
console.log('\n\n' + '═'.repeat(72))
console.log('STEP 3 — Immagini per lingua: AI supabase vs external vs null')
console.log('═'.repeat(72))

const BRAND_IDS = {
  en: 'eceba851-228a-45cf-8775-b0f7fc9ae7de',
  es: 'a20e4f07-e572-4605-acfc-5c53355f2ada',
  de: '1314a2d9-9ed6-475e-9235-8dffebb9384b',
  fr: '82dee695-83be-4e96-94ea-05078dea3681',
  pt: '8edf37b6-73c1-4742-862b-b4649bfa0f55',
}

for (const [lang, brandId] of Object.entries(BRAND_IDS)) {
  const { data: arts } = await sb.from('articles')
    .select('featured_image')
    .eq('brand_id', brandId)
    .eq('status', 'published')

  const total = arts?.length ?? 0
  const withImg = arts?.filter(a => !!a.featured_image).length ?? 0
  const supabase = arts?.filter(a => a.featured_image?.includes('supabase')).length ?? 0
  const external = arts?.filter(a => a.featured_image && !a.featured_image.includes('supabase')).length ?? 0

  console.log(`[${lang.toUpperCase()}] total=${total} | with_img=${withImg} | supabase/AI=${supabase} | external=${external} | null=${total-withImg}`)
}
