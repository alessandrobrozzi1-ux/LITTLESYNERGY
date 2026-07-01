/** Health check globale READ-ONLY — Sezioni A, C, D. Nessuna scrittura. */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const ORDER = ['en','es','de','fr','pt','ro','ja','ar']
const WORLD_LINK = new Set(['ja','ar']) // world-link markets: monetize via gateway, linkExpert=0 by design
const { data: brands } = await sb.from('brands').select('id, language_code, active, brand_dna_image_style')
const byLang = {}; for (const b of brands ?? []) byLang[b.language_code] = b

console.log('═'.repeat(72))
console.log('SECTION A + C — AUDIT 8 BRAND (world-link aware)')
console.log('═'.repeat(72))
console.log('Lang | active | img_style | published | monetize     | embeddings | score')
console.log('-'.repeat(72))
const rows = []
for (const lang of ORDER) {
  const b = byLang[lang]; if (!b) { console.log(`${lang}: MANCANTE`); continue }
  const id = b.id
  const { count: pub } = await sb.from('articles').select('*',{count:'exact',head:true}).eq('brand_id',id).eq('status','published')
  const { count: le } = await sb.from('link_expert').select('*',{count:'exact',head:true}).eq('brand_id',id).eq('active',true)
  const { count: emb } = await sb.from('article_embeddings').select('*',{count:'exact',head:true}).eq('brand_id',id)
  const img = b.brand_dna_image_style || ''
  const imgOk = img.includes('doTERRA-branded') && img.length>=280
  // check4 — monetization: world-link → linkExpert=0 + a published article links to the gateway; normal → linkExpert≥30
  const isWL = WORLD_LINK.has(lang)
  let monet, monetCol
  if (isWL) {
    const { data: pa } = await sb.from('articles').select('content_markdown').eq('brand_id',id).eq('status','published').limit(5)
    const gwOk = (pa??[]).some(a => /office\.doterra\.com\/Application\/index\.cfm/.test(a.content_markdown||''))
    monet = (le??0)===0 && gwOk
    monetCol = monet ? 'WL→gateway✅' : `WL le=${le} gw=${gwOk}`
  } else {
    monet = (le??0)>=30
    monetCol = monet ? `${le} LE✅` : `${le} LE⚠️`
  }
  // score: active, img_style v3.2, published≥1, monetization, embeddings≥1
  const checks=[b.active===true, imgOk, (pub??0)>=1, monet, (emb??0)>=1]
  const s = checks.filter(Boolean).length
  rows.push({lang, active:b.active, imgOk, pub, le, emb, isWL, score:s})
  console.log(`${lang.toUpperCase().padEnd(4)} | ${String(b.active).padEnd(6)} | ${imgOk?img.length+'c✅':'❌'} | ${String(pub).padEnd(9)} | ${String(monetCol).padEnd(12)} | ${String(emb).padEnd(10)} | ${s}/5`)
}

console.log('\n' + '═'.repeat(72))
console.log('SECTION D — STORAGE STATE')
console.log('═'.repeat(72))
// bucket
let objs=[], off=0
while(true){const {data}=await sb.storage.from('article-images').list('',{limit:100,offset:off});if(!data?.length)break;objs.push(...data);if(data.length<100)break;off+=100}
const bytes = objs.reduce((s,o)=>s+(o.metadata?.size??0),0)
const webp = objs.filter(o=>o.name.endsWith('.webp')).length
const png = objs.filter(o=>o.name.endsWith('.png')).length
console.log(`Bucket article-images: ${objs.length} oggetti (${webp} webp / ${png} png)`)
console.log(`  Size: ${(bytes/1048576).toFixed(1)} MB (${(bytes/1073741824*100).toFixed(1)}% di 1GB Free)`)
// published total + per brand
const { count: totalPub } = await sb.from('articles').select('*',{count:'exact',head:true}).eq('status','published')
const { count: totalEmb } = await sb.from('article_embeddings').select('*',{count:'exact',head:true})
const { count: totalLE } = await sb.from('link_expert').select('*',{count:'exact',head:true}).eq('active',true)
console.log(`  Articles published totali: ${totalPub} | Embeddings: ${totalEmb} | Link Expert: ${totalLE}`)
// pinterest pins
const { data: pins } = await sb.from('pinterest_pins').select('status')
const pinByStatus = {}; for(const p of pins??[]) pinByStatus[p.status]=(pinByStatus[p.status]??0)+1
console.log(`  Pinterest pins: ${JSON.stringify(pinByStatus)} (totale ${pins?.length??0})`)

const all5 = rows.every(r=>r.score===5)
console.log('\n' + '═'.repeat(72))
console.log(`SCORE BRAND: ${rows.map(r=>r.lang.toUpperCase()+' '+r.score+'/5').join(' | ')}`)
console.log(all5 ? `🟢 TUTTI I ${rows.length} BRAND 5/5 HEALTHY` : (rows.every(r=>r.score>=4) ? `🟡 tutti ≥4/5 (qualcuno a 4/5)` : '🔴 qualche brand <4/5'))
