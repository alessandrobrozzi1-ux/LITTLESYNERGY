/**
 * Seed FR Link Expert — shop.doterra.com/FR/fr_FR/shop/
 * Scraped via Chrome MCP 2026-06-25
 * Brand ID: 82dee695-83be-4e96-94ea-05078dea3681
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

const BRAND_ID = '82dee695-83be-4e96-94ea-05078dea3681'
const OID = '15957920'
const B = 'https://shop.doterra.com/FR/fr_FR/shop'

// ── SINGLE OILS (priority 7) ──────────────────────────────────────────────
const SINGLE_OILS = [
  'arborvitae-oil','basil-oil','bergamot-oil','black-pepper-oil','black-spruce-oil',
  'blue-tansy-oil','cadewood-oil','cardamom-oil','cassia-oil','cedarwood-oil',
  'celery-seed-oil','cilantro-oil','cinnamon-oil','citronella-oil','clary-sage-oil',
  'clove-oil','copaiba-oil','coriander-oil','cypress-oil','douglas-fir-oil',
  'eucalyptus-oil','fennel-oil','frankincense-oil','geranium-oil','ginger-oil',
  'grapefruit-oil','green-mandarin-oil','guaiacwood-oil','hawaiian-sandalwood-oil',
  'helichrysum-oil','juniper-berry-oil','lavender-oil','lemon-oil','lemon-eucalyptus-oil',
  'lemongrass-oil','lime-oil','madagascar-vanilla-oil','marjoram-oil','melissa-oil',
  'myrrh-oil','oregano-oil','patchouli-oil','peppermint-oil','peppermint-oil-beadlet',
  'petitgrain-oil','pink-pepper-oil','roman-chamomile-oil','rose-oil','rosemary-oil',
  'sandalwood-oil','siberian-fir-oil','spanish-sage-oil','spearmint-oil','spikenard-oil',
  'tangerine-oil','tea-tree-oil','thyme-oil','tulsi-oil','turmeric-oil','vetiver-oil',
  'wild-orange-oil','yarrow-pom-oil','ylang-ylang-oil',
]

// ── TOUCH / ROLL-ON (priority 6) ─────────────────────────────────────────
const TOUCH_OILS = [
  'blue-lotus-touch-oil','copaiba-touch-oil','frankincense-touch-oil','helichrysum-touch-oil',
  'jasmine-touch-oil','lavender-touch-oil','magnolia-touch-oil','myrrh-touch-oil',
  'neroli-touch-oil','onguard-touch-oil','oregano-touch-oil','peppermint-touch-oil',
  'rose-touch-oil','tea-tree-touch-oil','vetiver-touch-oil',
  // Blends touch
  'deep-blue-touch-oil','doterra-adaptiv-touch-oil','doterra-air-touch-oil',
  'doterra-balance-touch-oil','doterra-cheer-touch-oil','doterra-console-touch-oil',
  'doterra-forgive-touch-oil','doterra-motivate-touch-oil','doterra-passion-touch-oil',
  'doterra-peace-touch-oil','doterra-supermint-touch-oil','whisper-touch-oil',
  'shinrin-yoku-touch-oil','hope-touch-oil','hd-clear-oil-roll-on','deep-blue-oil-roll-on',
]

// ── BLENDS (priority 7) ───────────────────────────────────────────────────
const BLENDS = [
  'air-x-oil','aromatouch-oil','citrus-bliss-oil','clarycalm-oil','ddr-prime-oil',
  'deep-blue-oil','doterra-adaptiv-oil','doterra-air-oil','doterra-align-oil',
  'doterra-anchor-oil','doterra-arise-oil','doterra-balance-oil','doterra-brave-oil',
  'doterra-calmer-oil','doterra-cheer-oil','doterra-console-oil','doterra-forgive-oil',
  'doterra-motivate-oil','doterra-passion-oil','doterra-peace-oil','doterra-purify-oil',
  'doterra-rescuer-oil','doterra-salubelle-oil','doterra-serenity-oil','doterra-steady-oil',
  'doterra-stronger-oil','doterra-tamer-oil','doterra-thinker-oil','doterra-abode-oil',
  'intune-oil','onguard-oil','onguard-oil-beadlet','pasttense-oil','shinrin-yoku-oil',
  'supermint-oil','terrashield-oil','terrashield-spray','zengest-oil','zendocrine-oil',
]

// ── SUPPLEMENTS (priority 5) ──────────────────────────────────────────────
const SUPPLEMENTS = [
  'alpha-crs-plus','microplex-vmz','doterra-chocolate-plant-protein',
  'doterra-vanilla-plant-protein','veo-mega',
  'cp-softgels','ddr-prime-softgels','deep-blue-polyphenol-complex',
  'zengest-digesttab','eo-mega-plus','eo-mega-plus-softgels','vmg-plus',
  'frankincense-microbeadlet-capsules','gx-assist','ginger-drops','iq-mega',
  'onguard-softgels','pb-assist-plus-strawberry-melon','pb-restore','terrazyme',
  'triease-softgels','turmeric-dual-chamber-capsules','zengest-softgels',
  'zendocrine-complex','zendocrine-softgels','a2z-chewable','a2z-chewable-iq-mega',
  'adaptiv-calming-blend-capsules','supermint-oil-beadlets','doterra-serenity-softgels',
  'wellness-made-simple-pill-free','wellness-made-simple-vegan',
]

// ── SOFTGELS grouped with supplements ────────────────────────────────────
const SOFTGELS = ['ddr-prime-softgels'] // already in SUPPLEMENTS

// ── KITS / CTA (priority 9, category 'cta') ───────────────────────────────
const KITS = [
  'aromatouch-diffused-enrolment-kit','cleanse-restore-enrolment',
  'cleanse-restore-enrolment-vegan','family-essentials-enrolment',
  'home-essentials-enrolment','kids-collection-enrolment',
  'natural-solutions-enrolment','natural-solutions-enrolment-vegan',
  'cleanse-renew-kit','wellness-made-simple-bundle',
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
console.log(`   After dedup: ${unique.length}\n`)

// HEAD test 3 random entries
const sample = [unique[0], unique[Math.floor(unique.length/2)], unique[unique.length-1]]
console.log('🔍 HEAD testing 3 sample URLs...')
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
const { data, error } = await supabase
  .from('link_expert')
  .insert(unique)

if (error) {
  console.error('❌ Insert error:', error.message)
  process.exit(1)
}

// Count final
const { count } = await supabase
  .from('link_expert')
  .select('*', { count: 'exact', head: true })
  .eq('brand_id', BRAND_ID)
  .eq('active', true)

console.log(`\n✅ DONE — Link Expert FR: ${count} entries total`)
