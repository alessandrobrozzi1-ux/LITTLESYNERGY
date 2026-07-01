/**
 * Seed EN link_expert — verifica ogni slug contro doterra.com/US prima di inserire
 * Testa varianti candidate e inserisce solo quelle che rispondono 200 OK
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = readFileSync(join(__dirname, '../.env.local'), 'utf8')
env.split('\n').forEach(l => { const [k,...v]=l.split('='); if(k&&v.length) process.env[k.trim()]=v.join('=').trim() })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const BRAND  = 'eceba851-228a-45cf-8775-b0f7fc9ae7de'
const OID    = '15957920'
const BASE   = 'https://www.doterra.com/US/en/p'
const MARKET = 'https://www.doterra.com/US/en/shop/essential-oils'

// Per ogni prodotto: anchor_text + lista di slug candidati in ordine di probabilità
const CANDIDATES = [
  // Single oils — pattern probabile: [name]-oil oppure doterra-[name]-oil
  { anchor: 'Lavender',       slugs: ['lavender-oil','lavender-essential-oil','lavender-15ml'] },
  { anchor: 'Peppermint',     slugs: ['peppermint-oil','peppermint-essential-oil','peppermint-15ml'] },
  { anchor: 'Frankincense',   slugs: ['frankincense-oil','frankincense-essential-oil','frankincense-15ml'] },
  { anchor: 'Lemon',          slugs: ['lemon-oil','lemon-essential-oil','lemon-15ml'] },
  { anchor: 'Tea Tree',       slugs: ['tea-tree-oil','melaleuca-oil','tea-tree-essential-oil'] },
  { anchor: 'Wild Orange',    slugs: ['wild-orange-oil','wild-orange-essential-oil','wild-orange-15ml'] },
  { anchor: 'Oregano',        slugs: ['oregano-oil','oregano-essential-oil','oregano-15ml'] },
  { anchor: 'Copaiba',        slugs: ['copaiba-oil','copaiba-essential-oil','copaiba-15ml'] },
  { anchor: 'Bergamot',       slugs: ['bergamot-oil','bergamot-essential-oil','bergamot-15ml'] },
  { anchor: 'Rosemary',       slugs: ['rosemary-oil','rosemary-essential-oil','rosemary-15ml'] },
  { anchor: 'Eucalyptus',     slugs: ['eucalyptus-oil','eucalyptus-essential-oil','eucalyptus-15ml'] },
  { anchor: 'Geranium',       slugs: ['geranium-oil','geranium-essential-oil','geranium-15ml'] },
  { anchor: 'Ylang Ylang',    slugs: ['ylang-ylang-oil','ylang-ylang-essential-oil','ylang-ylang-15ml'] },
  { anchor: 'Clary Sage',     slugs: ['clary-sage-oil','clary-sage-essential-oil','clary-sage-15ml'] },
  { anchor: 'Vetiver',        slugs: ['vetiver-oil','vetiver-essential-oil','vetiver-15ml'] },
  { anchor: 'Clove',          slugs: ['clove-oil','clove-essential-oil','clove-15ml'] },
  { anchor: 'Ginger',         slugs: ['ginger-oil','ginger-essential-oil','ginger-15ml'] },
  { anchor: 'Cardamom',       slugs: ['cardamom-oil','cardamom-essential-oil','cardamom-15ml'] },
  { anchor: 'Cinnamon Bark',  slugs: ['cinnamon-bark-oil','cinnamon-bark-essential-oil','cinnamon-bark-15ml'] },
  { anchor: 'Helichrysum',    slugs: ['helichrysum-oil','helichrysum-essential-oil','helichrysum-5ml'] },
  { anchor: 'Juniper Berry',  slugs: ['juniper-berry-oil','juniper-berry-essential-oil','juniper-berry-5ml'] },
  { anchor: 'Marjoram',       slugs: ['marjoram-oil','marjoram-essential-oil','marjoram-15ml'] },
  { anchor: 'Melissa',        slugs: ['melissa-oil','melissa-essential-oil','melissa-5ml'] },
  { anchor: 'Cypress',        slugs: ['cypress-oil','cypress-essential-oil','cypress-15ml'] },
  { anchor: 'Spearmint',      slugs: ['spearmint-oil','spearmint-essential-oil','spearmint-15ml'] },
  { anchor: 'Patchouli',      slugs: ['patchouli-oil','patchouli-essential-oil','patchouli-15ml'] },
  { anchor: 'Wintergreen',    slugs: ['wintergreen-oil','wintergreen-essential-oil','wintergreen-15ml'] },
  { anchor: 'Lemongrass',     slugs: ['lemongrass-oil','lemongrass-essential-oil','lemongrass-15ml'] },
  { anchor: 'Lime',           slugs: ['lime-oil','lime-essential-oil','lime-15ml'] },
  { anchor: 'Grapefruit',     slugs: ['grapefruit-oil','grapefruit-essential-oil','grapefruit-15ml'] },
  { anchor: 'Tangerine',      slugs: ['tangerine-oil','tangerine-essential-oil','tangerine-15ml'] },
  { anchor: 'Black Pepper',   slugs: ['black-pepper-oil','black-pepper-essential-oil','black-pepper-5ml'] },
  { anchor: 'Basil',          slugs: ['basil-oil','basil-essential-oil','basil-15ml'] },
  { anchor: 'Roman Chamomile',slugs: ['roman-chamomile-oil','roman-chamomile-essential-oil','roman-chamomile-5ml'] },
  { anchor: 'Myrrh',          slugs: ['myrrh-oil','myrrh-essential-oil','myrrh-15ml'] },
  { anchor: 'Cedarwood',      slugs: ['cedarwood-oil','cedarwood-essential-oil','cedarwood-15ml'] },
  { anchor: 'Sandalwood',     slugs: ['sandalwood-oil','sandalwood-essential-oil','sandalwood-5ml'] },
  { anchor: 'Thyme',          slugs: ['thyme-oil','thyme-essential-oil','thyme-15ml'] },
  { anchor: 'Arborvitae',     slugs: ['arborvitae-oil','arborvitae-essential-oil','arborvitae-5ml'] },
  { anchor: 'Douglas Fir',    slugs: ['douglas-fir-oil','douglas-fir-essential-oil','douglas-fir-15ml'] },
  { anchor: 'Siberian Fir',   slugs: ['siberian-fir-oil','siberian-fir-essential-oil','siberian-fir-15ml'] },
  { anchor: 'Cilantro',       slugs: ['cilantro-oil','cilantro-essential-oil','cilantro-15ml'] },
  // Blends
  { anchor: 'Balance',        slugs: ['doterra-balance-oil','balance-oil','balance-blend'] },
  { anchor: 'Serenity',       slugs: ['doterra-serenity-oil','serenity-oil','serenity-blend'] },
  { anchor: 'Breathe',        slugs: ['doterra-breathe-oil','breathe-oil','breathe-blend','breathe-15ml'] },
  { anchor: 'On Guard',       slugs: ['doterra-on-guard-oil','on-guard-oil','onguard-oil'] },
  { anchor: 'DigestZen',      slugs: ['doterra-digestzen-oil','digestzen-oil','digestzen-blend'] },
  { anchor: 'Deep Blue',      slugs: ['deep-blue-oil','doterra-deep-blue-oil','deep-blue-blend'] },
  { anchor: 'Elevation',      slugs: ['doterra-elevation-oil','elevation-oil','elevation-blend'] },
  { anchor: 'Citrus Bliss',   slugs: ['citrus-bliss-oil','citrus-bliss-blend','citrus-bliss-15ml'] },
  { anchor: 'Adaptiv',        slugs: ['doterra-adaptiv-oil','adaptiv-oil','adaptiv-blend'] },
  { anchor: 'Purify',         slugs: ['purify-oil','purify-blend','purify-15ml'] },
  { anchor: 'AromaTouch',     slugs: ['aromatouch-oil','aroma-touch-oil','aromatouch-blend'] },
  { anchor: 'Cheer',          slugs: ['doterra-cheer-oil','cheer-oil','cheer-blend'] },
  { anchor: 'Console',        slugs: ['doterra-console-oil','console-oil','console-blend'] },
  { anchor: 'Forgive',        slugs: ['doterra-forgive-oil','forgive-oil','forgive-blend'] },
  { anchor: 'Motivate',       slugs: ['doterra-motivate-oil','motivate-oil','motivate-blend'] },
  { anchor: 'Passion',        slugs: ['doterra-passion-oil','passion-oil','passion-blend'] },
  { anchor: 'Peace',          slugs: ['doterra-peace-oil','peace-oil','peace-blend'] },
  { anchor: 'Whisper',        slugs: ['doterra-whisper-oil','whisper-oil','whisper-blend'] },
  { anchor: 'Zendocrine',     slugs: ['zendocrine-oil','doterra-zendocrine-oil','zendocrine-blend'] },
  { anchor: 'TerraShield',    slugs: ['terrashield-oil','terra-shield-oil','terrashield-blend'] },
  { anchor: 'PastTense',      slugs: ['past-tense-oil','past-tense-blend','pastense-oil'] },
  { anchor: 'DDR Prime',      slugs: ['ddr-prime-oil','doterra-ddr-prime-oil','ddr-prime-blend'] },
  { anchor: 'ClaryCalm',      slugs: ['clarycalm-oil','clary-calm-oil','clarycalm-blend'] },
  { anchor: 'HD Clear',       slugs: ['hd-clear-oil','doterra-hd-clear-oil','hd-clear-blend'] },
  // Touch
  { anchor: 'Lavender Touch', slugs: ['lavender-touch-oil','lavender-touch','doterra-lavender-touch'] },
  { anchor: 'Peppermint Touch',slugs: ['peppermint-touch-oil','peppermint-touch'] },
  { anchor: 'Frankincense Touch',slugs: ['frankincense-touch-oil','frankincense-touch'] },
  { anchor: 'Deep Blue Touch', slugs: ['deep-blue-touch-oil','deep-blue-touch'] },
  { anchor: 'On Guard Touch',  slugs: ['on-guard-touch-oil','doterra-on-guard-touch','on-guard-touch'] },
  // Specific products (known from user)
  { anchor: 'Breathe Respiratory Drops', slugs: ['doterra-breathe-respiratory-drops'] },
  // On Guard family
  { anchor: 'On Guard Beadlets',   slugs: ['doterra-on-guard-beadlets','on-guard-beadlets'] },
  { anchor: 'On Guard Toothpaste', slugs: ['doterra-on-guard-toothpaste','on-guard-toothpaste'] },
  { anchor: 'On Guard Hand Wash',  slugs: ['on-guard-foaming-hand-wash','doterra-on-guard-hand-wash'] },
  // DigestZen family
  { anchor: 'DigestZen TerraZyme', slugs: ['digestzen-terrazyme','doterra-digestzen-terrazyme'] },
  { anchor: 'DigestZen Softgels',  slugs: ['digestzen-softgels','doterra-digestzen-softgels'] },
  // Supplements
  { anchor: 'Lifelong Vitality Pack', slugs: ['lifelong-vitality-pack','lifelong-vitality','lvp'] },
  { anchor: 'Alpha CRS+',    slugs: ['alpha-crs','doterra-alpha-crs','alpha-crs-plus'] },
  { anchor: 'xEO Mega',      slugs: ['xeo-mega','doterra-xeo-mega'] },
  { anchor: 'Microplex VMz', slugs: ['microplex-vmz','doterra-microplex-vmz'] },
  { anchor: 'PB Assist+',    slugs: ['pb-assist','doterra-pb-assist','pb-assist-plus'] },
  { anchor: 'GX Assist',     slugs: ['gx-assist','doterra-gx-assist'] },
  { anchor: 'Mito2Max',      slugs: ['mito2max','doterra-mito2max'] },
  { anchor: 'DDR Prime Softgels', slugs: ['ddr-prime-softgels','doterra-ddr-prime-softgels'] },
  { anchor: 'Serenity Softgels',  slugs: ['serenity-softgels','doterra-serenity-softgels'] },
  { anchor: 'Adaptiv Capsules',   slugs: ['adaptiv-capsules','doterra-adaptiv-capsules'] },
  // Carrier
  { anchor: 'Fractionated Coconut Oil', slugs: ['fractionated-coconut-oil','doterra-fractionated-coconut-oil'] },
  // Kits
  { anchor: 'Home Essentials Kit',   slugs: ['home-essentials-kit','doterra-home-essentials-kit'] },
  { anchor: 'Family Essentials Kit', slugs: ['family-essentials-kit','doterra-family-essentials-kit'] },
  { anchor: 'Natural Solutions Kit', slugs: ['natural-solutions-kit','doterra-natural-solutions-kit'] },
]

async function verify(slug) {
  try {
    const url = `${BASE}/${slug}/?OwnerID=${OID}`
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SoloSEO/1.0)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    })
    // 200 = valid, 301/302 following = count as valid if final is 200
    return res.ok ? url : null
  } catch { return null }
}

async function run() {
  console.log(`Testing ${CANDIDATES.length} products against ${BASE}...\n`)
  const verified = []
  const failed = []

  for (const { anchor, slugs } of CANDIDATES) {
    let found = null
    for (const slug of slugs) {
      const url = await verify(slug)
      if (url) { found = { anchor, url }; break }
    }
    if (found) {
      console.log(`✓ ${found.anchor.padEnd(30)} ${found.url.replace(BASE+'/', '').replace('/?OwnerID='+OID,'')}`)
      verified.push(found)
    } else {
      console.log(`✗ ${anchor.padEnd(30)} (none of: ${slugs.slice(0,2).join(', ')})`)
      failed.push(anchor)
    }
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`\n${verified.length} verified, ${failed.length} failed`)
  if (failed.length) console.log('Failed:', failed.join(', '))

  if (!verified.length) { console.log('Nothing to insert'); return }

  const rows = verified.map(({ anchor, url }, i) => ({
    brand_id: BRAND,
    anchor_text: anchor,
    full_url: url,
    category: anchor.toLowerCase().includes('kit') ? 'cta' : 'product',
    priority: 10 - Math.floor(i / 10),
    active: true,
    notes: 'auto-verified',
  }))

  const { error } = await supabase.from('link_expert').insert(rows)
  if (error) { console.error('DB error:', error.message); return }
  console.log(`\n✅ Inserted ${rows.length} verified links into link_expert`)
  console.log(`Fallback URL: ${MARKET}/?OwnerID=${OID}`)
}

run()
