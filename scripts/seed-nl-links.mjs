/**
 * Seed NL Link Expert — shop.doterra.com/NL/nl_NL/shop/ (Pattern 1, EU)
 * Brand ID: 15e4e632-bfb1-4160-8c02-8ce9956e3087
 * METODO: TRUST EU CATALOG (vedi seed-it-links.mjs + skill BOT-PROTECTION lesson 29/6).
 *   Candidati = set RO-validato (150). Catalogo doTERRA condiviso tra market EU.
 * Idempotente: salta full_url già presenti per NL.
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY,
  { global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) } })

const BRAND_ID = '15e4e632-bfb1-4160-8c02-8ce9956e3087'
const RO = '97933a00-3604-464a-92d6-e6ea8175cbc1'
const OID = '15957920'
const B = 'https://shop.doterra.com/NL/nl_NL/shop'

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

console.log(`NL — candidati EU: ${candidates.length} | già presenti: ${have.size} | da inserire: ${toInsert.length}`)
if (toInsert.length) {
  const { error } = await supabase.from('link_expert').insert(toInsert)
  if (error) { console.error('❌ Insert error:', error.message); process.exit(1) }
}
const { count } = await supabase.from('link_expert').select('*', { count: 'exact', head: true }).eq('brand_id', BRAND_ID).eq('active', true)
const { data: allNl } = await supabase.from('link_expert').select('full_url').eq('brand_id', BRAND_ID)
const uniq = new Set((allNl ?? []).map(e => e.full_url)).size
console.log(`✅ Link Expert NL: ${count} | unici: ${uniq} ${uniq === count ? '✅ no doppioni' : '❌ DOPPIONI'} | es: ${candidates.slice(0, 5).map(titel).join(', ')}`)
