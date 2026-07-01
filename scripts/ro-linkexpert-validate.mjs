/**
 * RO Link Expert — validazione content-based (Miva server-rendered).
 * Candidati = slug RO scrapati (DOM) ∪ slug PT esistenti.
 * Valido se la pagina RO renderizza un prodotto reale (bytes>5000 + "adaug").
 * SOLO REPORT — nessun INSERT.
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const PT = '8edf37b6-73c1-4742-862b-b4649bfa0f55'
const RO_BASE = 'https://shop.doterra.com/RO/ro_RO/shop'

// RO slugs già DOM-verificati (dai 4 scrape Chrome)
const RO_SCRAPED = [
  'lavender-oil','peppermint-oil','lemon-oil','frankincense-oil','tea-tree-oil','wild-orange-oil','cinnamon-oil',
  'arborvitae-oil','basil-oil','bergamot-oil','black-pepper-oil','black-spruce-oil','blue-tansy-oil','cadewood-oil','cardamom-oil','cassia-oil','cedarwood-oil','celery-seed-oil',
  'onguard-oil','doterra-balance-oil','doterra-serenity-oil','doterra-adaptiv-oil','doterra-air-oil','doterra-anchor-oil','doterra-calmer-oil','doterra-cheer-oil','doterra-purify-oil','intune-oil','pasttense-oil','zengest-oil','clary-calm','air-drops','deep-blue-oil','deep-blue-rub',
  'deep-blue-touch-oil','doterra-air-touch-oil','neroli-touch-oil','onguard-touch-oil','rose-touch-oil','tea-tree-touch-oil','zengest-touch-oil','blue-lotus-touch-oil',
  'alpha-crs-plus','bone-nutrient-lifetime-complex','ddr-prime-softgels','eo-mega-plus','eo-mega-plus-softgels','metapwr-advantage','metapwr-assist','metapwr-softgels','microplex-vmz','pb-assist-plus-strawberry-melon','phytoestrogen-essential-complex','vmg-plus','zendocrine-complex','zengest-softgels',
  'aromatouch-diffused-enrolment-kit','aromatouch-technique-kit','changing-seasons-kit','family-essentials-kit','family-essentials-kit-7pk','introductory-kit-10pk','kids-collection-kit','natural-solutions-enrolment','yoga-collection-kit','womens-health-kit',
]

// PT slugs da link_expert
const { data: ptRows } = await sb.from('link_expert').select('full_url').eq('brand_id', PT)
const ptSlugs = [...new Set((ptRows ?? []).map(r => {
  const m = (r.full_url || '').replace(/\?.*/,'').replace(/\/$/,'').match(/\/shop\/([^\/]+)$/)
  return m ? m[1] : null
}).filter(Boolean))]
console.log(`PT link_expert slug estratti: ${ptSlugs.length}`)

const candidates = [...new Set([...RO_SCRAPED, ...ptSlugs])]
console.log(`Candidati totali (RO-scraped ∪ PT): ${candidates.length}`)
console.log(`  di cui RO-scraped: ${RO_SCRAPED.length} | PT-only: ${candidates.length - RO_SCRAPED.length}`)
console.log('Validazione content-based in corso...\n')

async function validate(slug) {
  const url = `${RO_BASE}/${slug}/`
  for (let a = 0; a < 2; a++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) })
      const txt = await res.text()
      const ok = txt.length > 5000 && /adaug/i.test(txt)
      return { slug, ok, bytes: txt.length }
    } catch (e) { if (a === 1) return { slug, ok: null, err: e.message } ; await new Promise(r=>setTimeout(r,1500)) }
  }
}

// concorrenza limitata
const results = []
const CONC = 6
for (let i = 0; i < candidates.length; i += CONC) {
  const batch = candidates.slice(i, i + CONC)
  const r = await Promise.all(batch.map(validate))
  results.push(...r)
  process.stdout.write(`  ${Math.min(i+CONC,candidates.length)}/${candidates.length}\r`)
}
console.log('\n')

const valid = results.filter(r => r.ok === true).map(r => r.slug).sort()
const invalid = results.filter(r => r.ok === false).map(r => r.slug).sort()
const errored = results.filter(r => r.ok === null)

// categorizzazione euristica
const isTouch = s => /touch/.test(s)
const isKit = s => /kit|enrol|collection|bundle|pack/.test(s)
const isSupp = s => /softgel|complex|vmz|vmg|mega|crs|assist|microplex|ddr|metapwr|phytoestrogen|zendocrine|bone-nutrient|pb-assist|advantage/.test(s)
const isBlend = s => /onguard|balance|serenity|adaptiv|doterra-air|anchor|calmer|cheer|purify|intune|pasttense|zengest|clary-calm|air-drops|deep-blue|citrus-bliss|motivate|console|forgive|peace|passion|whisper|brave|rescuer|steady|thinker|breathe|aromatouch|elevation|easy-air|past-tense|hd-clear|immortelle/.test(s)
const cat = s => isTouch(s)?'touch': isKit(s)?'kit': isSupp(s)?'supplement': isBlend(s)?'blend':'single-oil'

const byCat = {}
for (const s of valid) { const c = cat(s); (byCat[c] ??= []).push(s) }

console.log('═'.repeat(64))
console.log('REPORT VALIDAZIONE RO LINK EXPERT (content-based, NO INSERT)')
console.log('═'.repeat(64))
console.log(`Candidati testati: ${results.length}`)
console.log(`  ✅ VALIDI (prodotto reale su RO): ${valid.length}`)
console.log(`  ❌ NON validi (404 su RO): ${invalid.length}`)
console.log(`  ⚠️ errori rete: ${errored.length}`)
console.log('\nCount per categoria (validi):')
const targets = { 'single-oil':30, blend:20, touch:16, kit:10, supplement:10 }
for (const c of ['single-oil','blend','touch','kit','supplement']) {
  const n = (byCat[c]||[]).length
  const t = targets[c]
  console.log(`  ${c.padEnd(12)}: ${String(n).padStart(3)}  (target ≥${t}) ${n>=t?'✅':'❌'}`)
}
console.log(`  ${'TOTALE'.padEnd(12)}: ${String(valid.length).padStart(3)}  (target ≥100) ${valid.length>=100?'✅':'❌'}`)

console.log('\nPT-only slug NON disponibili su RO (404):')
console.log('  ' + (invalid.length ? invalid.join(', ') : 'nessuno'))
if (errored.length) console.log('\n⚠️ slug con errore rete (da ri-testare):\n  ' + errored.map(e=>e.slug).join(', '))

console.log('\nVALIDI per categoria:')
for (const c of ['single-oil','blend','touch','kit','supplement']) {
  console.log(`\n[${c}] (${(byCat[c]||[]).length}):`)
  console.log('  ' + (byCat[c]||[]).join(', '))
}
