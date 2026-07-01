/**
 * Seed PT Link Expert — shop.doterra.com/PT/pt_PT/shop/
 * URL pattern verified 2026-06-26 (slug: lavender-oil, Pattern 1)
 * Brand ID: 8edf37b6-73c1-4742-862b-b4649bfa0f55
 * Slugs mirrored from FR (EU market, English slugs confirmed)
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) } }
)

const BRAND_ID = '8edf37b6-73c1-4742-862b-b4649bfa0f55'
const OID = '15957920'
const B = 'https://shop.doterra.com/PT/pt_PT/shop'

// ── SINGLE OILS (priority 7) ──────────────────────────────────────────────
const SINGLE_OILS = [
  'arborvitae-oil','basil-oil','bergamot-oil','black-pepper-oil','black-spruce-oil',
  'blue-tansy-oil','cardamom-oil','cassia-oil','cedarwood-oil',
  'celery-seed-oil','cilantro-oil','cinnamon-oil','clary-sage-oil',
  'clove-oil','copaiba-oil','coriander-oil','cypress-oil','douglas-fir-oil',
  'eucalyptus-oil','fennel-oil','frankincense-oil','geranium-oil','ginger-oil',
  'grapefruit-oil','green-mandarin-oil','hawaiian-sandalwood-oil',
  'helichrysum-oil','juniper-berry-oil','lavender-oil','lemon-oil','lemon-eucalyptus-oil',
  'lemongrass-oil','lime-oil','marjoram-oil','melissa-oil',
  'myrrh-oil','oregano-oil','patchouli-oil','peppermint-oil',
  'petitgrain-oil','roman-chamomile-oil','rose-oil','rosemary-oil',
  'sandalwood-oil','siberian-fir-oil','spearmint-oil','spikenard-oil',
  'tangerine-oil','tea-tree-oil','thyme-oil','turmeric-oil','vetiver-oil',
  'wild-orange-oil','ylang-ylang-oil',
]

// ── TOUCH / ROLL-ON (priority 6) ─────────────────────────────────────────
const TOUCH_OILS = [
  'copaiba-touch-oil','frankincense-touch-oil','helichrysum-touch-oil',
  'lavender-touch-oil','myrrh-touch-oil',
  'onguard-touch-oil','oregano-touch-oil','peppermint-touch-oil',
  'rose-touch-oil','tea-tree-touch-oil','vetiver-touch-oil',
  'deep-blue-touch-oil','doterra-adaptiv-touch-oil','doterra-air-touch-oil',
  'doterra-balance-touch-oil','doterra-cheer-touch-oil','doterra-console-touch-oil',
  'doterra-forgive-touch-oil','doterra-motivate-touch-oil','doterra-passion-touch-oil',
  'doterra-peace-touch-oil','whisper-touch-oil',
]

// ── BLENDS (priority 7) ───────────────────────────────────────────────────
const BLENDS = [
  'aromatouch-oil','citrus-bliss-oil','clarycalm-oil','ddr-prime-oil',
  'deep-blue-oil','doterra-adaptiv-oil','doterra-air-oil',
  'doterra-balance-oil','doterra-cheer-oil','doterra-console-oil','doterra-forgive-oil',
  'doterra-motivate-oil','doterra-passion-oil','doterra-peace-oil','doterra-purify-oil',
  'doterra-salubelle-oil','doterra-serenity-oil',
  'intune-oil','onguard-oil','zengest-oil','zendocrine-oil',
  'terrashield-oil','terrashield-spray',
]

// ── SUPPLEMENTS (priority 5) ──────────────────────────────────────────────
const SUPPLEMENTS = [
  'alpha-crs-plus','microplex-vmz','veo-mega',
  'ddr-prime-softgels','deep-blue-polyphenol-complex',
  'gx-assist','iq-mega','onguard-softgels','pb-assist-plus-strawberry-melon',
  'pb-restore','terrazyme','triease-softgels','zengest-softgels',
  'zendocrine-complex','zendocrine-softgels','a2z-chewable',
  'doterra-serenity-softgels',
]

// ── KITS / CTA (priority 9, category 'cta') — EU single-L spelling ────────
const KITS = [
  'cleanse-restore-enrolment','family-essentials-enrolment',
  'home-essentials-enrolment','kids-collection-enrolment',
  'natural-solutions-enrolment','natural-solutions-enrolment-vegan',
  'wellness-made-simple-bundle',
]

// Build entries
function makeEntries(slugs, category, priority) {
  return [...new Set(slugs)].map(slug => ({
    brand_id: BRAND_ID,
    anchor_text: slug.replace(/-oil$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    full_url: `${B}/${slug}/?OwnerID=${OID}`,
    category,
    priority,
    active: true,
  }))
}

const allEntries = [
  ...makeEntries(SINGLE_OILS, 'product', 7),
  ...makeEntries(TOUCH_OILS, 'product', 6),
  ...makeEntries(BLENDS, 'product', 7),
  ...makeEntries(SUPPLEMENTS, 'product', 5),
  ...makeEntries(KITS, 'cta', 9),
]

// Deduplicate by full_url
const seen = new Set()
const unique = allEntries.filter(e => {
  if (seen.has(e.full_url)) return false
  seen.add(e.full_url)
  return true
})

console.log(`\n📦 Total unique entries to insert: ${unique.length}`)
console.log(`   Single oils: ${SINGLE_OILS.length}`)
console.log(`   Touch/roll-on: ${TOUCH_OILS.length}`)
console.log(`   Blends: ${BLENDS.length}`)
console.log(`   Supplements: ${SUPPLEMENTS.length}`)
console.log(`   Kits (CTA): ${KITS.length}`)

// HEAD test 3 sample URLs to verify PT pattern works
const sample = [unique[0], unique[Math.floor(unique.length/2)], unique[unique.length-1]]
console.log('\n🔍 HEAD testing 3 sample URLs...')
for (const e of sample) {
  try {
    const r = await fetch(e.full_url, { method: 'HEAD', signal: AbortSignal.timeout(8000) })
    console.log(`  ${r.status} ${r.status === 200 ? '✅' : '⚠️ '} ${e.full_url}`)
  } catch (err) {
    console.log(`  ❌ FAIL ${e.full_url} — ${err.message}`)
  }
}

// Insert into DB
console.log('\n💾 Inserting into link_expert...')
const { error } = await supabase.from('link_expert').insert(unique)

if (error) {
  console.error('❌ Insert error:', error.message)
  process.exit(1)
}

const { count } = await supabase
  .from('link_expert')
  .select('*', { count: 'exact', head: true })
  .eq('brand_id', BRAND_ID)
  .eq('active', true)

console.log(`\n✅ DONE — Link Expert PT: ${count} entries total`)
