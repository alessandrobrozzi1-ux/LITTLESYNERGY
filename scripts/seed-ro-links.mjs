/**
 * Seed RO Link Expert — shop.doterra.com/RO/ro_RO/shop/
 * URL pattern verified 2026-06-26 (slug: lavender-oil → "Levănțică", Pattern 1)
 * Brand ID: 97933a00-3604-464a-92d6-e6ea8175cbc1
 * Slugs = RO DOM-scraped ∪ PT link_expert, TUTTI content-validati su RO (150/150).
 * Idempotente: salta full_url già presenti per RO.
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY,
  { global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) } })

const BRAND_ID = '97933a00-3604-464a-92d6-e6ea8175cbc1'
const PT = '8edf37b6-73c1-4742-862b-b4649bfa0f55'
const OID = '15957920'
const B = 'https://shop.doterra.com/RO/ro_RO/shop'

const RO_SCRAPED = [
  'lavender-oil','peppermint-oil','lemon-oil','frankincense-oil','tea-tree-oil','wild-orange-oil','cinnamon-oil',
  'arborvitae-oil','basil-oil','bergamot-oil','black-pepper-oil','black-spruce-oil','blue-tansy-oil','cadewood-oil','cardamom-oil','cassia-oil','cedarwood-oil','celery-seed-oil',
  'onguard-oil','doterra-balance-oil','doterra-serenity-oil','doterra-adaptiv-oil','doterra-air-oil','doterra-anchor-oil','doterra-calmer-oil','doterra-cheer-oil','doterra-purify-oil','intune-oil','pasttense-oil','zengest-oil','clary-calm','air-drops','deep-blue-oil','deep-blue-rub',
  'deep-blue-touch-oil','doterra-air-touch-oil','neroli-touch-oil','onguard-touch-oil','rose-touch-oil','tea-tree-touch-oil','zengest-touch-oil','blue-lotus-touch-oil',
  'alpha-crs-plus','bone-nutrient-lifetime-complex','ddr-prime-softgels','eo-mega-plus','eo-mega-plus-softgels','metapwr-advantage','metapwr-assist','metapwr-softgels','microplex-vmz','pb-assist-plus-strawberry-melon','phytoestrogen-essential-complex','vmg-plus','zendocrine-complex','zengest-softgels',
  'aromatouch-diffused-enrolment-kit','aromatouch-technique-kit','changing-seasons-kit','family-essentials-kit','family-essentials-kit-7pk','introductory-kit-10pk','kids-collection-kit','natural-solutions-enrolment','yoga-collection-kit','womens-health-kit',
]

// PT slugs
const { data: ptRows } = await supabase.from('link_expert').select('full_url').eq('brand_id', PT)
const ptSlugs = [...new Set((ptRows ?? []).map(r => {
  const m = (r.full_url || '').replace(/\?.*/,'').replace(/\/$/,'').match(/\/shop\/([^\/]+)$/); return m ? m[1] : null
}).filter(Boolean))]

const allSlugs = [...new Set([...RO_SCRAPED, ...ptSlugs])]

const isTouch = s => /touch/.test(s)
const isKit = s => /kit|enrol|collection|bundle/.test(s)
const isSupp = s => /softgel|complex|vmz|vmg|mega|crs|assist|microplex|ddr|metapwr|phytoestrogen|zendocrine|bone-nutrient|pb-assist|pb-restore|terrazyme|triease|gx-assist|iq-mega|a2z|advantage/.test(s)
const titel = s => s.replace(/-oil$/,'').replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase())

const entries = allSlugs.map(slug => ({
  brand_id: BRAND_ID,
  anchor_text: titel(slug),
  full_url: `${B}/${slug}/?OwnerID=${OID}`,
  category: isKit(slug) ? 'cta' : 'product',
  priority: isKit(slug) ? 9 : isTouch(slug) ? 6 : isSupp(slug) ? 5 : 7,
  active: true,
}))

// dedupe by full_url + skip già presenti su RO (idempotenza)
const { data: existing } = await supabase.from('link_expert').select('full_url').eq('brand_id', BRAND_ID)
const have = new Set((existing ?? []).map(e => e.full_url))
const seen = new Set()
const toInsert = entries.filter(e => {
  if (have.has(e.full_url) || seen.has(e.full_url)) return false
  seen.add(e.full_url); return true
})

console.log(`Slug totali: ${allSlugs.length} | già presenti RO: ${have.size} | da inserire: ${toInsert.length}`)

if (toInsert.length) {
  const { error } = await supabase.from('link_expert').insert(toInsert)
  if (error) { console.error('❌ Insert error:', error.message); process.exit(1) }
}

// Verifica finale
const { count } = await supabase.from('link_expert').select('*', { count: 'exact', head: true }).eq('brand_id', BRAND_ID).eq('active', true)
const { data: all } = await supabase.from('link_expert').select('category, priority, full_url').eq('brand_id', BRAND_ID)
const byCat = { 'single-oil':0, blend:0, touch:0, supplement:0, kit:0 }
for (const e of all ?? []) {
  const s = e.full_url.match(/\/shop\/([^\/]+)\//)[1]
  byCat[ isKit(s)?'kit' : isTouch(s)?'touch' : isSupp(s)?'supplement' : /onguard|balance|serenity|adaptiv|doterra-air|anchor|calmer|cheer|purify|intune|pasttense|zengest-oil|clary-calm|air-drops|deep-blue-oil|deep-blue-rub|citrus-bliss|motivate|console|forgive|peace|passion|aromatouch-oil|salubelle|terrashield/.test(s)?'blend':'single-oil' ]++
}
console.log(`\n✅ Link Expert RO: ${count} entries totali`)
console.log(`  single-oil: ${byCat['single-oil']} | blend: ${byCat.blend} | touch: ${byCat.touch} | supplement: ${byCat.supplement} | kit: ${byCat.kit}`)
