/**
 * Seed IT Link Expert — shop.doterra.com/IT/it_IT/shop/ (Pattern 1, EU)
 * Brand ID: 9709597d-1c02-4b1a-8d16-08ac9a37616b
 * METODO: TRUST EU CATALOG — gli slug doTERRA sono condivisi tra i market EU
 *   (slug = identificativo prodotto in inglese; il market cambia solo il path locale).
 *   Candidati = set RO-validato (150). NO curl-validation: shop.doterra.com ha bot-protection
 *   sotto fetch ripetuti (pagine-sfida 2.8-19KB scambiate per 404 → falsi negativi).
 *   8 spot-check browser (oregano/lavender-touch/microplex-vmz/family-kit/lavender/peppermint/
 *   onguard/lemon) hanno confermato IT=RO. Vedi skill: BOT-PROTECTION lesson (29/6).
 * Idempotente: salta full_url già presenti per IT.
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY,
  { global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) } })

const BRAND_ID = '9709597d-1c02-4b1a-8d16-08ac9a37616b'
const RO = '97933a00-3604-464a-92d6-e6ea8175cbc1'
const OID = '15957920'
const B = 'https://shop.doterra.com/IT/it_IT/shop'

// candidati = slug del set EU validato (RO link_expert)
const { data: roRows } = await supabase.from('link_expert').select('full_url').eq('brand_id', RO)
const candidates = [...new Set((roRows ?? []).map(r => {
  const m = (r.full_url || '').replace(/\?.*/, '').replace(/\/$/, '').match(/\/shop\/([^\/]+)$/); return m ? m[1] : null
}).filter(Boolean))]

const isTouch = s => /touch/.test(s)
const isKit = s => /kit|enrol|collection|bundle/.test(s)
const isSupp = s => /softgel|complex|vmz|vmg|mega|crs|assist|microplex|ddr|metapwr|phytoestrogen|zendocrine|bone-nutrient|pb-assist|pb-restore|terrazyme|triease|gx-assist|iq-mega|a2z|advantage/.test(s)
const titel = s => s.replace(/-oil$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

const entries = candidates.map(slug => ({
  brand_id: BRAND_ID, anchor_text: titel(slug), full_url: `${B}/${slug}/?OwnerID=${OID}`,
  category: isKit(slug) ? 'cta' : 'product',
  priority: isKit(slug) ? 9 : isTouch(slug) ? 6 : isSupp(slug) ? 5 : 7, active: true,
}))

const { data: existing } = await supabase.from('link_expert').select('full_url').eq('brand_id', BRAND_ID)
const have = new Set((existing ?? []).map(e => e.full_url)); const seen = new Set()
const toInsert = entries.filter(e => { if (have.has(e.full_url) || seen.has(e.full_url)) return false; seen.add(e.full_url); return true })

console.log(`Candidati EU (da RO): ${candidates.length} | già presenti IT: ${have.size} | da inserire: ${toInsert.length}`)
if (toInsert.length) {
  const { error } = await supabase.from('link_expert').insert(toInsert)
  if (error) { console.error('❌ Insert error:', error.message); process.exit(1) }
}
const { count } = await supabase.from('link_expert').select('*', { count: 'exact', head: true }).eq('brand_id', BRAND_ID).eq('active', true)
// dedup sanity: full_url unici nel DB?
const { data: allIt } = await supabase.from('link_expert').select('full_url').eq('brand_id', BRAND_ID)
const uniq = new Set((allIt ?? []).map(e => e.full_url)).size
console.log(`\n✅ Link Expert IT: ${count} entries | full_url unici: ${uniq} ${uniq === count ? '✅ no doppioni' : '❌ DOPPIONI!'}`)
console.log(`Esempi: ${candidates.slice(0, 6).map(titel).join(', ')} …`)
console.log(`Categorie: kit=${candidates.filter(isKit).length} touch=${candidates.filter(isTouch).length} supp=${candidates.filter(isSupp).length} single/blend=${candidates.filter(s => !isKit(s) && !isTouch(s) && !isSupp(s)).length}`)
