import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const BRAND_ID = '1314a2d9-9ed6-475e-9235-8dffebb9384b'
const OID = '15957920'
const BASE = 'https://shop.doterra.com/DE/de_DE/shop'

// All candidate slugs — confirmed from scrape + known doTERRA catalog
const candidates = [
  // === SINGLE OILS (confirmed from scrape) ===
  { slug: 'lavender-oil',          anchor: 'Lavendel',          cat: 'product', pri: 8 },
  { slug: 'peppermint-oil',        anchor: 'Pfefferminze',      cat: 'product', pri: 8 },
  { slug: 'lemon-oil',             anchor: 'Zitrone',           cat: 'product', pri: 7 },
  { slug: 'frankincense-oil',      anchor: 'Weihrauch',         cat: 'product', pri: 8 },
  { slug: 'cinnamon-oil',          anchor: 'Zimt',              cat: 'product', pri: 6 },
  { slug: 'tea-tree-oil',          anchor: 'Teebaum',           cat: 'product', pri: 8 },
  { slug: 'wild-orange-oil',       anchor: 'Wilde Orange',      cat: 'product', pri: 7 },
  { slug: 'onguard-oil',           anchor: 'On Guard',          cat: 'product', pri: 8 },
  { slug: 'zengest-oil',           anchor: 'ZenGest',           cat: 'product', pri: 7 },
  { slug: 'neroli-touch-oil',      anchor: 'Neroli Touch',      cat: 'product', pri: 6 },
  { slug: 'intune-oil',            anchor: 'InTune',            cat: 'product', pri: 7 },
  { slug: 'pasttense-oil',         anchor: 'PastTense',         cat: 'product', pri: 6 },
  { slug: 'rose-touch-oil',        anchor: 'Rose Touch',        cat: 'product', pri: 6 },
  { slug: 'clary-calm',            anchor: 'Clary Calm',        cat: 'product', pri: 6 },
  { slug: 'air-drops',             anchor: 'Air Drops',         cat: 'product', pri: 5 },
  { slug: 'deep-blue-rub',         anchor: 'Deep Blue Rub',     cat: 'product', pri: 7 },
  { slug: 'onguard-oil-beadlet',   anchor: 'On Guard Beadlets', cat: 'product', pri: 5 },
  // Single oils not yet confirmed — test these
  { slug: 'bergamot-oil',          anchor: 'Bergamotte',        cat: 'product', pri: 6 },
  { slug: 'eucalyptus-oil',        anchor: 'Eukalyptus',        cat: 'product', pri: 6 },
  { slug: 'rosemary-oil',          anchor: 'Rosmarin',          cat: 'product', pri: 6 },
  { slug: 'oregano-oil',           anchor: 'Oregano',           cat: 'product', pri: 6 },
  { slug: 'geranium-oil',          anchor: 'Geranie',           cat: 'product', pri: 5 },
  { slug: 'ylang-ylang-oil',       anchor: 'Ylang Ylang',       cat: 'product', pri: 5 },
  { slug: 'cedarwood-oil',         anchor: 'Zedernholz',        cat: 'product', pri: 5 },
  { slug: 'vetiver-oil',           anchor: 'Vetiver',           cat: 'product', pri: 5 },
  { slug: 'clove-oil',             anchor: 'Nelke',             cat: 'product', pri: 5 },
  { slug: 'thyme-oil',             anchor: 'Thymian',           cat: 'product', pri: 5 },
  { slug: 'grapefruit-oil',        anchor: 'Grapefruit',        cat: 'product', pri: 5 },
  { slug: 'lime-oil',              anchor: 'Limette',           cat: 'product', pri: 5 },
  { slug: 'myrrh-oil',             anchor: 'Myrrhe',            cat: 'product', pri: 5 },
  { slug: 'arborvitae-oil',        anchor: 'Arborvitae',        cat: 'product', pri: 5 },
  { slug: 'black-pepper-oil',      anchor: 'Schwarzer Pfeffer', cat: 'product', pri: 5 },
  { slug: 'cardamom-oil',          anchor: 'Kardamom',          cat: 'product', pri: 5 },
  { slug: 'copaiba-oil',           anchor: 'Copaiba',           cat: 'product', pri: 5 },
  { slug: 'siberian-fir-oil',      anchor: 'Sibirische Tanne',  cat: 'product', pri: 5 },
  { slug: 'spearmint-oil',         anchor: 'Grüne Minze',       cat: 'product', pri: 5 },
  { slug: 'sandalwood-oil',        anchor: 'Sandelholz',        cat: 'product', pri: 6 },
  { slug: 'jasmine-oil',           anchor: 'Jasmin',            cat: 'product', pri: 5 },
  { slug: 'roman-chamomile-oil',   anchor: 'Römische Kamille',  cat: 'product', pri: 5 },
  { slug: 'ginger-oil',            anchor: 'Ingwer',            cat: 'product', pri: 6 },
  { slug: 'marjoram-oil',          anchor: 'Majoran',           cat: 'product', pri: 5 },

  // === BLENDS (confirmed from scrape) ===
  { slug: 'doterra-air-oil',       anchor: 'Breathe (Air)',     cat: 'product', pri: 7 },
  { slug: 'doterra-cheer-oil',     anchor: 'Cheer',             cat: 'product', pri: 6 },
  { slug: 'deep-blue-oil',         anchor: 'Deep Blue',         cat: 'product', pri: 8 },
  { slug: 'doterra-adaptiv-oil',   anchor: 'Adaptiv',           cat: 'product', pri: 7 },
  { slug: 'doterra-serenity-oil',  anchor: 'Serenity',          cat: 'product', pri: 8 },
  { slug: 'doterra-balance-oil',   anchor: 'Balance',           cat: 'product', pri: 7 },
  { slug: 'doterra-anchor-oil',    anchor: 'Anchor',            cat: 'product', pri: 6 },
  { slug: 'doterra-purify-oil',    anchor: 'Purify',            cat: 'product', pri: 6 },
  { slug: 'doterra-calmer-oil',    anchor: 'Calmer',            cat: 'product', pri: 6 },
  // Blends not yet confirmed
  { slug: 'citrus-bliss-oil',      anchor: 'Citrus Bliss',      cat: 'product', pri: 7 },
  { slug: 'elevation-oil',         anchor: 'Elevation',         cat: 'product', pri: 6 },
  { slug: 'immortelle-oil',        anchor: 'Immortelle',        cat: 'product', pri: 7 },
  { slug: 'motivate-oil',          anchor: 'Motivate',          cat: 'product', pri: 6 },
  { slug: 'console-oil',           anchor: 'Console',           cat: 'product', pri: 5 },
  { slug: 'forgive-oil',           anchor: 'Forgive',           cat: 'product', pri: 5 },
  { slug: 'passion-oil',           anchor: 'Passion',           cat: 'product', pri: 5 },
  { slug: 'peace-oil',             anchor: 'Peace',             cat: 'product', pri: 5 },
  { slug: 'whisper-oil',           anchor: 'Whisper',           cat: 'product', pri: 5 },
  { slug: 'zendocrine-oil',        anchor: 'Zendocrine',        cat: 'product', pri: 6 },
  { slug: 'slim-and-sassy-oil',    anchor: 'Slim & Sassy',      cat: 'product', pri: 6 },
  { slug: 'terrashield-oil',       anchor: 'TerraShield',       cat: 'product', pri: 6 },
  { slug: 'hd-clean-oil',          anchor: 'HD Clean',          cat: 'product', pri: 5 },
  { slug: 'solace-oil',            anchor: 'Solace',            cat: 'product', pri: 5 },
  { slug: 'thinkmint-oil',         anchor: 'ThinMint',          cat: 'product', pri: 5 },
  { slug: 'litsea-oil',            anchor: 'Litsea',            cat: 'product', pri: 5 },
  { slug: 'align-oil',             anchor: 'Align',             cat: 'product', pri: 5 },

  // === TOUCH (Roll-ons) ===
  { slug: 'onguard-touch-oil',     anchor: 'On Guard Touch',    cat: 'product', pri: 7 },
  { slug: 'tea-tree-touch-oil',    anchor: 'Teebaum Touch',     cat: 'product', pri: 6 },
  { slug: 'doterra-air-touch-oil', anchor: 'Air Touch',         cat: 'product', pri: 6 },
  { slug: 'deep-blue-touch-oil',   anchor: 'Deep Blue Touch',   cat: 'product', pri: 7 },
  { slug: 'zengest-touch-oil',     anchor: 'ZenGest Touch',     cat: 'product', pri: 6 },
  { slug: 'lavender-touch-oil',    anchor: 'Lavendel Touch',    cat: 'product', pri: 7 },
  { slug: 'frankincense-touch-oil',anchor: 'Weihrauch Touch',   cat: 'product', pri: 7 },
  { slug: 'peppermint-touch-oil',  anchor: 'Pfefferminze Touch',cat: 'product', pri: 6 },
  { slug: 'doterra-serenity-touch-oil', anchor: 'Serenity Touch', cat: 'product', pri: 6 },
  { slug: 'doterra-balance-touch-oil',  anchor: 'Balance Touch',  cat: 'product', pri: 6 },
  { slug: 'doterra-adaptiv-touch-oil',  anchor: 'Adaptiv Touch',  cat: 'product', pri: 6 },
  { slug: 'doterra-cheer-touch-oil',    anchor: 'Cheer Touch',    cat: 'product', pri: 5 },
  { slug: 'motivate-touch-oil',         anchor: 'Motivate Touch', cat: 'product', pri: 5 },
  { slug: 'console-touch-oil',          anchor: 'Console Touch',  cat: 'product', pri: 5 },
  { slug: 'forgive-touch-oil',          anchor: 'Forgive Touch',  cat: 'product', pri: 5 },
  { slug: 'passion-touch-oil',          anchor: 'Passion Touch',  cat: 'product', pri: 5 },
  { slug: 'peace-touch-oil',            anchor: 'Peace Touch',    cat: 'product', pri: 5 },

  // === SUPPLEMENTS (confirmed from scrape) ===
  { slug: 'vmg-plus',              anchor: 'vEO Mega',          cat: 'product', pri: 7 },
  { slug: 'eo-mega-plus',          anchor: 'EO Mega Plus',      cat: 'product', pri: 7 },
  { slug: 'eo-mega-plus-softgels', anchor: 'EO Mega Softgels',  cat: 'product', pri: 6 },
  { slug: 'alpha-crs-plus',        anchor: 'Alpha CRS+',        cat: 'product', pri: 6 },
  { slug: 'ddr-prime-softgels',    anchor: 'DDR Prime',         cat: 'product', pri: 6 },
  { slug: 'pb-assist-plus-strawberry-melon', anchor: 'PB Assist+', cat: 'product', pri: 6 },
  { slug: 'zendocrine-complex',    anchor: 'Zendocrine Komplex',cat: 'product', pri: 5 },
  { slug: 'phytoestrogen-essential-complex', anchor: 'Phytoestrogen', cat: 'product', pri: 5 },
  { slug: 'zengest-softgels',      anchor: 'ZenGest Softgels',  cat: 'product', pri: 6 },
  { slug: 'metapwr-assist',        anchor: 'MetaPWR Assist',    cat: 'product', pri: 6 },
  { slug: 'metapwr-advantage',     anchor: 'MetaPWR Advantage', cat: 'product', pri: 6 },
  { slug: 'metapwr-softgels',      anchor: 'MetaPWR Softgels',  cat: 'product', pri: 5 },
  // Supplements not yet confirmed
  { slug: 'lifelong-vitality-pack',anchor: 'Lifelong Vitality', cat: 'product', pri: 8 },
  { slug: 'microplex-vmz',         anchor: 'Microplex VMz',     cat: 'product', pri: 6 },
  { slug: 'xeo-mega',              anchor: 'xEO Mega',          cat: 'product', pri: 6 },
  { slug: 'mito2max',              anchor: 'Mito2Max',          cat: 'product', pri: 5 },
  { slug: 'terrazyme',             anchor: 'TerraZyme',         cat: 'product', pri: 6 },
  { slug: 'pb-assist-jr',          anchor: 'PB Assist Jr',      cat: 'product', pri: 5 },

  // === ENROLLMENT KITS (priority 7-9) ===
  { slug: 'home-essentials-enrollment-kit', anchor: 'Home Essentials Kit', cat: 'cta', pri: 9 },
  { slug: 'healthy-start-enrollment-kit',   anchor: 'Healthy Start Kit',   cat: 'cta', pri: 9 },
  { slug: 'natural-solutions-enrollment-kit',anchor: 'Natural Solutions Kit',cat: 'cta', pri: 8 },
  { slug: 'healthy-habits-enrollment-kit',  anchor: 'Healthy Habits Kit',  cat: 'cta', pri: 8 },
  { slug: 'essentials-enrollment-kit',      anchor: 'Essentials Kit',      cat: 'cta', pri: 8 },
  { slug: 'every-oil-enrollment-kit',       anchor: 'Every Oil Kit',       cat: 'cta', pri: 7 },
  { slug: 'aha-membership-kit',             anchor: 'AHA Membership Kit',  cat: 'cta', pri: 7 },
  { slug: 'foundational-wellness-bundle',   anchor: 'Foundational Wellness Bundle', cat: 'cta', pri: 9 },
  { slug: 'loyalty-reward-kit',             anchor: 'Loyalty Reward Kit',  cat: 'cta', pri: 7 },
  { slug: 'deep-blue-enrollment-kit',       anchor: 'Deep Blue Kit',       cat: 'cta', pri: 7 },
  { slug: 'active-wellness-enrollment-kit', anchor: 'Active Wellness Kit', cat: 'cta', pri: 7 },
  { slug: 'emotional-wellness-enrollment-kit',anchor:'Emotional Wellness Kit',cat:'cta',pri: 7 },
]

// HEAD test each URL
console.log(`Testing ${candidates.length} candidate URLs...`)
const valid = []
const CONCURRENCY = 10

for (let i = 0; i < candidates.length; i += CONCURRENCY) {
  const batch = candidates.slice(i, i + CONCURRENCY)
  const results = await Promise.all(batch.map(async (p) => {
    const url = `${BASE}/${p.slug}/?OwnerID=${OID}`
    try {
      const r = await fetch(url, { method: 'HEAD', redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0' } })
      return { ...p, url, ok: r.ok, status: r.status }
    } catch(e) {
      return { ...p, url, ok: false, status: 0 }
    }
  }))
  for (const r of results) {
    if (r.ok) {
      valid.push(r)
      console.log(`✅ ${r.slug} (${r.status})`)
    } else {
      console.log(`❌ ${r.slug} (${r.status})`)
    }
  }
}

console.log(`\nVALID: ${valid.length}/${candidates.length}`)

// Insert into link_expert
if (valid.length > 0) {
  const rows = valid.map(p => ({
    brand_id: BRAND_ID,
    anchor_text: p.anchor,
    full_url: `${BASE}/${p.slug}/?OwnerID=${OID}`,
    category: p.cat,
    priority: p.pri,
    active: true,
  }))

  // Delete existing DE entries first
  await supabase.from('link_expert').delete().eq('brand_id', BRAND_ID)

  const { error } = await supabase.from('link_expert').insert(rows)
  if (error) console.error('Insert error:', error)
  else console.log(`\n✅ Inserted ${rows.length} rows into link_expert`)
}
