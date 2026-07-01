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
const since = new Date(Date.now() - 15 * 60 * 1000).toISOString()

for (const [lang, bid] of Object.entries(BRANDS)) {
  const { data } = await sb.from('articles')
    .select('id, slug, status, featured_image, created_at')
    .eq('brand_id', bid)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
  console.log(`[${lang.toUpperCase()}] articoli creati negli ultimi 15min: ${data?.length ?? 0}`)
  for (const a of data ?? []) {
    const img = (a.featured_image||'').includes('supabase') ? 'gpt-image-2' : (a.featured_image ? 'UNSPLASH/other' : 'NULL')
    console.log(`   ${a.created_at?.slice(11,19)} | ${a.status} | img=${img} | ${a.slug} | ${a.id}`)
  }
}
