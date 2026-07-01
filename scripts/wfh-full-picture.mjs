import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const BRANDS = {
  en: 'eceba851-228a-45cf-8775-b0f7fc9ae7de',
  es: 'a20e4f07-e572-4605-acfc-5c53355f2ada',
  de: '1314a2d9-9ed6-475e-9235-8dffebb9384b',
  fr: '82dee695-83be-4e96-94ea-05078dea3681',
  pt: '8edf37b6-73c1-4742-862b-b4649bfa0f55',
}
// slug fragments per lingua per topic work-from-home
const FRAG = {
  en: 'work-from-home', es: 'trabajar-desde-casa', de: 'heimarbeit',
  fr: 'travail-domicile', pt: 'trabalhar-de-casa',
}

console.log('═'.repeat(80))
console.log('QUADRO COMPLETO — articoli "work from home" per lingua')
console.log('═'.repeat(80))

for (const [lang, bid] of Object.entries(BRANDS)) {
  const { data } = await sb.from('articles')
    .select('id, slug, title, status, featured_image, content_markdown, created_at')
    .eq('brand_id', bid)
    .ilike('slug', `%${FRAG[lang]}%`)
    .order('created_at', { ascending: true })

  console.log(`\n[${lang.toUpperCase()}] — ${data?.length ?? 0} articoli work-from-home`)
  for (const a of data ?? []) {
    const md = a.content_markdown ?? ''
    const wc = md.trim().split(/\s+/).length
    const img = (a.featured_image||'').includes('supabase') ? '🖼️ gpt-image-2'
              : (a.featured_image ? '⚠️ other' : '❌ NULL')
    const geo = md.toLowerCase().includes('wellness advocates') ? '✅author' : '✗author'
    const faq = (md.match(/\*\*[^*\n]+\?\*\*/g) || []).length
    const tbl = /\n\|.+\|.*\n\|[\s:|-]+\|/.test(md) ? 'tbl✅' : 'tbl✗'
    console.log(`  ${a.created_at?.slice(11,19)} | ${a.status.padEnd(9)} | ${img.padEnd(14)} | ${wc}w ${geo} faq:${faq} ${tbl}`)
    console.log(`     slug: ${a.slug}`)
    console.log(`     id  : ${a.id}`)
  }
}
console.log('\n' + '═'.repeat(80))
