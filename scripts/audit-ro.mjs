import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const RO = '97933a00-3604-464a-92d6-e6ea8175cbc1'
const { data: b } = await sb.from('brands').select('*').eq('id', RO).single()
const { count: pub } = await sb.from('articles').select('*', {count:'exact',head:true}).eq('brand_id',RO).eq('status','published')
const { count: draft } = await sb.from('articles').select('*', {count:'exact',head:true}).eq('brand_id',RO).eq('status','draft')
const { count: le } = await sb.from('link_expert').select('*', {count:'exact',head:true}).eq('brand_id',RO).eq('active',true)
const { count: themes } = await sb.from('editorial_themes').select('*', {count:'exact',head:true}).eq('brand_id',RO)
const { count: emb } = await sb.from('article_embeddings').select('*', {count:'exact',head:true}).eq('brand_id',RO)
const { data: pillar } = await sb.from('articles').select('slug,title').eq('brand_id',RO).eq('slug','cum-cumperi-doterra').eq('status','published').maybeSingle()

const aff = b?.affiliate_base_url || ''
const img = b?.brand_dna_image_style || ''
const chk = (id,label,ok,extra='') => { console.log(`  ${ok?'✅':'❌'} ${id} ${label}${extra?' — '+extra:''}`); return ok }
let pass=0, tot=0
const C = (id,label,ok,extra)=>{ tot++; if(chk(id,label,ok,extra)) pass++ }

console.log('AUDIT RO (pre-activation)')
console.log('─'.repeat(60))
console.log('A. BACKEND')
C('A1','brand esiste', !!b?.id)
C('A2','language_code=ro', b?.language_code==='ro')
C('A3','brand_name', !!b?.brand_name)
C('A4','domain=/ro', b?.domain==='essentialsynergybr.com/ro')
C('A5','affiliate sanitized', aff.includes('/shop/essential-oils/?OwnerID=') && !aff.includes('//essential'))
C('A6','owner_id', String(b?.owner_id)==='15957920')
console.log('B. PUBLISHING')
C('B1','published ≥1', (pub??0)>=1, `${pub} pub / ${draft} draft`)
C('B2','pillar cum-cumperi-doterra published', !!pillar, pillar?.title)
console.log('C. SEO / CONTENT')
C('C1','link_expert ≥100', (le??0)>=100, `${le}`)
C('C2','editorial themes =5', (themes??0)===5, `${themes}`)
console.log('D. SAFETY / IMAGE')
C('D1','embeddings ≥1', (emb??0)>=1, `${emb}`)
C('D5','image_style v3.2 doTERRA-branded', img.includes('doTERRA-branded') && img.length>=280, `${img.length}c`)
console.log('GATE')
C('G1','active=false (pre-activation, atteso)', b?.active===false, `active=${b?.active}`)

console.log('─'.repeat(60))
console.log(`SCORE: ${pass}/${tot} ${pass===tot?'🟢 READY (in attesa OK visivo per active=true)':'🔴'}`)
