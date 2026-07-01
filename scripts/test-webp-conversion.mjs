/** STEP 4 test — converte un PNG esistente in WebP q85, upload test_image.webp. NO modifiche articoli. */
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const sb = createClient(URL, process.env.SUPABASE_SERVICE_KEY)

// prendi un articolo published con featured_image (es. pillar RO)
const { data: a } = await sb.from('articles')
  .select('slug, featured_image').eq('status','published').not('featured_image','is',null)
  .order('published_at',{ascending:false}).limit(1).single()
console.log(`Sorgente PNG: ${a.slug}`)
console.log(`  ${a.featured_image}`)

// download PNG
const png = Buffer.from(await (await fetch(a.featured_image)).arrayBuffer())
console.log(`\nPNG originale : ${(png.length/1048576).toFixed(2)} MB`)

// convert → WebP q85
const webp = await sharp(png).webp({ quality: 85 }).toBuffer()
console.log(`WebP q85      : ${(webp.length/1048576).toFixed(2)} MB (${(webp.length/1024).toFixed(0)} KB)`)
const ratio = (png.length/webp.length).toFixed(1)
const saved = (100*(1-webp.length/png.length)).toFixed(0)
console.log(`Riduzione     : ${ratio}× (-${saved}%)`)

// upload test_image.webp (upsert)
const { error } = await sb.storage.from('article-images').upload('test_image.webp', webp, { contentType:'image/webp', upsert:true })
if (error) { console.log('❌ upload:', error.message); process.exit(1) }
const testUrl = `${URL}/storage/v1/object/public/article-images/test_image.webp`
console.log(`\n✅ Test WebP caricato (NON sostituisce nessun articolo):`)
console.log(`   ${testUrl}`)
console.log(`\n   Dimensioni: ${(png.length/1048576).toFixed(2)}MB PNG → ${(webp.length/1024).toFixed(0)}KB WebP`)
