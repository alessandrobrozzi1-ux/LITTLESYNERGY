/** Health check read-only post token-fix. Nessuna scrittura. */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// 5. brands active
const { data: brands } = await sb.from('brands').select('id, language_code, active').order('language_code')
const actives = (brands ?? []).filter(b => b.active)
console.log('═══ 5. BRAND ATTIVI ═══')
console.log(`  active=true: ${actives.length} → ${actives.map(b=>b.language_code).sort().join(', ')}`)

// 3. published count per brand
console.log('\n═══ 3. PUBLISHED PER LINGUA ═══')
const idToLang = {}; for (const b of brands ?? []) idToLang[b.id] = b.language_code
const { data: pub } = await sb.from('articles').select('brand_id, published_at').eq('status','published')
const cnt = {}; for (const a of pub ?? []) { const l = idToLang[a.brand_id] ?? '??'; cnt[l]=(cnt[l]??0)+1 }
let tot=0
for (const l of ['en','es','de','fr','pt','ro']) { console.log(`  ${l.toUpperCase()}: ${cnt[l]??0}`); tot+=(cnt[l]??0) }
console.log(`  TOTALE: ${tot}`)

// 4. published today (per data più recente con publish)
const IT = 2*3600*1000
const today = new Date().toISOString().slice(0,10)
console.log(`\n═══ 4. PUBBLICATI OGGI (${today} UTC) ═══`)
const todayArts = (pub ?? []).filter(a => a.published_at && a.published_at.slice(0,10) === today)
if (!todayArts.length) {
  console.log('  Nessun articolo con published_at = oggi. Mostro gli ULTIMI per brand:')
  for (const l of ['en','es','de','fr','pt','ro']) {
    const b = brands.find(x=>x.language_code===l)
    const { data: last } = await sb.from('articles').select('title, published_at').eq('brand_id',b.id).eq('status','published').order('published_at',{ascending:false}).limit(1)
    const a = last?.[0]
    console.log(`  ${l.toUpperCase()}: ${a?.published_at?.slice(0,16) ?? '-'} | ${a?.title?.slice(0,45) ?? 'NESSUNO'}`)
  }
} else {
  // dettaglio oggi con titoli
  const ids = todayArts.map(a=>a.brand_id)
  const { data: det } = await sb.from('articles').select('brand_id, title, published_at').eq('status','published').gte('published_at', today+'T00:00:00Z').order('published_at',{ascending:true})
  for (const a of det ?? []) console.log(`  ${(idToLang[a.brand_id]||'??').toUpperCase()}: ${a.published_at.slice(11,16)} UTC | ${a.title.slice(0,50)}`)
  const byLang = {}; for (const a of det ?? []) byLang[idToLang[a.brand_id]]=(byLang[idToLang[a.brand_id]]??0)+1
  console.log(`  → oggi: ${Object.entries(byLang).map(([k,v])=>k.toUpperCase()+':'+v).join(' ')}`)
}
