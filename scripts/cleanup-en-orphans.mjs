import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// 3 orphan EN da mandare in draft (KEEP f81feb5b)
const ORPHANS = [
  '887cd111-21d8-429e-bca4-86aa9c6c852d',
  '3f69192f-a152-456e-9fa6-bba52965f0ec',
  '7ec2ebe6-5255-490d-84ba-11c0e4e48ad3',
]
const KEEP = 'f81feb5b-f8bf-4251-8361-0f014dfd53cc'

const { data: updated, error } = await sb.from('articles')
  .update({ status: 'draft', published_at: null })
  .in('id', ORPHANS)
  .select('id, slug, status')
if (error) { console.log('❌', error.message); process.exit(1) }
console.log(`✅ Unpublished ${updated?.length}/3 orphan EN → draft`)
for (const a of updated ?? []) console.log(`   ${a.id} → ${a.status}`)

// Verifica: quanti EN work-from-home published restano?
const EN = 'eceba851-228a-45cf-8775-b0f7fc9ae7de'
const { data: remain } = await sb.from('articles')
  .select('id, slug, status, featured_image')
  .eq('brand_id', EN)
  .ilike('slug', '%work-from-home%')
  .eq('status', 'published')
console.log(`\nEN work-from-home PUBLISHED rimasti: ${remain?.length}`)
for (const a of remain ?? []) {
  const ok = a.id === KEEP
  console.log(`   ${ok ? '✅ KEEP' : '🚨 UNEXPECTED'} ${a.id} | ${a.slug}`)
}
console.log(remain?.length === 1 && remain[0].id === KEEP ? '\n🟢 EN pulito: 1 solo published' : '\n⚠️ controllare')
