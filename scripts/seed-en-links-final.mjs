/**
 * Seed EN link_expert con slug REALI estratti dal DOM di doterra.com/US
 * Dati verificati via browser (Chrome MCP) — nessun guess.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = readFileSync(join(__dirname, '../.env.local'), 'utf8')
env.split('\n').forEach(l => { const [k,...v]=l.split('='); if(k&&v.length) process.env[k.trim()]=v.join('=').trim() })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const BRAND = 'eceba851-228a-45cf-8775-b0f7fc9ae7de'
const OID   = '15957920'
const B     = 'https://www.doterra.com/US/en/p'

const p = (anchor, slug, pri = 7, cat = 'product') => ({
  brand_id: BRAND,
  anchor_text: anchor,
  full_url: `${B}/${slug}/?OwnerID=${OID}`,
  category: cat,
  priority: pri,
  active: true,
  notes: 'scraped-dom',
})

const links = [
  // ── Single Oils ────────────────────────────────────────────────────────────
  p('Lavender',             'lavender-oil',                  10),
  p('Peppermint',           'peppermint-oil',                10),
  p('Frankincense',         'frankincense-oil',              10),
  p('Lemon',                'lemon-oil',                     10),
  p('Wild Orange',          'wild-orange-oil',                9),
  p('Tea Tree',             'doterra-tea-tree',               9),
  p('Oregano',              'oregano-oil',                    9),
  p('Copaiba',              'copaiba-oil',                    9),
  p('Bergamot',             'bergamot-oil',                   8),
  p('Rosemary',             'rosemary-oil',                   8),
  p('Eucalyptus',           'eucalyptus-oil',                 8),
  p('Geranium',             'geranium-oil',                   8),
  p('Ylang Ylang',          'ylang-ylang-oil',                8),
  p('Clary Sage',           'clary-sage-oil',                 8),
  p('Vetiver',              'vetiver-oil',                    7),
  p('Clove',                'clove-oil',                      7),
  p('Ginger',               'ginger-oil',                     7),
  p('Cardamom',             'cardamom-oil',                   7),
  p('Cinnamon Bark',        'cinnamon-bark-oil',              7),
  p('Helichrysum',          'helichrysum-oil',                7),
  p('Juniper Berry',        'juniper-berry-oil',              7),
  p('Marjoram',             'marjoram-oil',                   7),
  p('Melissa',              'melissa-oil',                    7),
  p('Cypress',              'cypress-oil',                    6),
  p('Spearmint',            'spearmint-oil',                  6),
  p('Patchouli',            'patchouli-oil',                  6),
  p('Wintergreen',          'wintergreen-oil',                6),
  p('Lemongrass',           'lemongrass-oil',                 6),
  p('Lime',                 'lime-oil',                       6),
  p('Grapefruit',           'grapefruit-oil',                 6),
  p('Tangerine',            'tangerine-oil',                  6),
  p('Black Pepper',         'black-pepper-oil',               6),
  p('Basil',                'basil-oil',                      6),
  p('Roman Chamomile',      'roman-chamomile-oil',            6),
  p('Myrrh',                'myrrh-oil',                      6),
  p('Cedarwood',            'cedarwood-oil',                  6),
  p('Sandalwood',           'sandalwood-oil',                 6),
  p('Thyme',                'thyme-oil',                      5),
  p('Arborvitae',           'arborvitae-oil',                 5),
  p('Douglas Fir',          'douglas-fir-oil',                5),
  p('Siberian Fir',         'siberian-fir-oil',               5),
  p('Cilantro',             'cilantro-oil',                   5),
  p('Cassia',               'cassia-oil',                     5),
  p('Coriander',            'coriander-oil',                  5),
  p('Sweet Fennel',         'sweet-fennel-oil',               5),
  p('Rose',                 'rose-oil',                       5),
  p('Jasmine',              'jasmine-oil',                    5),
  p('Petitgrain',           'petitgrain-oil',                 4),
  p('Spikenard',            'spikenard-oil',                  4),
  p('Black Spruce',         'black-spruce-oil',               4),
  p('Birch',                'birch-oil',                      4),
  p('Hawaiian Sandalwood',  'hawaiian-sandalwood-oil',        4),
  p('Green Mandarin',       'doterra-green-mandarin',         4),
  p('Turmeric',             'doterra-turmeric-essential-oil', 4),
  p('Yarrow Pom',           'doterra-yarrow-pom',             4),
  p('Copaiba Touch',        'copaiba-touch-oil',              4),
  p('Oregano Touch',        'oregano-touch-blend-oil',        4),
  p('Lavender Touch',       'lavender-touch-blend-oil',       4),
  p('Peppermint Touch',     'doterra-peppermint-touch-blend-oil', 4),
  p('Frankincense Touch',   'doterra-frankincense-touch-blend-oil', 4),
  p('Vetiver Touch',        'vetiver-touch-oil',              3),
  p('Tea Tree Touch',       'tea-tree-touch-oil',             3),
  p('Helichrysum Touch',    'doterra-helichrysum-touch',      3),
  p('Peppermint Beadlets',  'peppermint-beadlets',            4),

  // ── Blends ────────────────────────────────────────────────────────────────
  p('Balance',              'balance-grounding-blend-oil',    9),
  p('Serenity',             'doterra-serenity-oil',           9),
  p('Breathe',              'breathe-respiratory-blend-oil',  9),
  p('On Guard',             'on-guard-oil',                   9),
  p('DigestZen',            'digestzen-oil',                  9),
  p('Deep Blue',            'deep-blue-oil',                  9),
  p('Elevation',            'cheer-uplifting-blend-oil',      8),
  p('Citrus Bliss',         'citrus-bliss-oil',               8),
  p('Adaptiv',              'adaptiv-oil',                    8),
  p('Purify',               'purify-oil',                     7),
  p('AromaTouch',           'aromatouch-massage-blend-oil',   7),
  p('Cheer',                'cheer-uplifting-blend-oil',      7),
  p('Console',              'console-comforting-blend-oil',   7),
  p('Forgive',              'forgive-renewing-blend-oil',     7),
  p('Motivate',             'motivate-encouraging-blend-oil', 7),
  p('Passion',              'passion-inspiring-blend-oil',    7),
  p('Peace',                'peace-reassuring-blend-oil',     7),
  p('Whisper',              'whisper-touch-oil',              6),
  p('TerraShield',          'terrashield-blend',              6),
  p('PastTense',            'pasttense',                      6),
  p('DDR Prime',            'ddr-prime-oil',                  6),
  p('ClaryCalm',            'clarycalm-blend-oil',            6),
  p('HD Clear',             'hd-clear-oil',                   6),
  p('In Tune',              'in-tune-oil',                    5),
  p('TriEase',              'triease-seasonal-blend',         5),
  p('Immortelle',           'immortelle-anti-aging-blend',    5),
  p('Adaptiv Touch',        'adaptiv-touch-oil',              5),
  p('Breathe Touch',        'doterra-breathe-touch-essential-oil-blend', 5),
  p('On Guard Touch',       'on-guard-touch-blend-oil',       5),
  p('DigestZen Touch',      'doterra-touch-digestzen-essential-oil-blend', 5),
  p('DigestZen Softgels',   'digestzen-blend-oil-softgels',   6),
  p('On Guard Softgels',    'onguard-protective-blend-softgel', 6),
  p('Breathe Respiratory Drops', 'doterra-breathe-respiratory-drops', 7),
  p('Supermint',            'supermint-oil',                  4),
  p('Abode',                'abode-oil',                      4),
  p('Air X',                'air-x',                          4),
  p('MetaPWR',              'metapwr-oil',                    4),
  p('Shinrin-Yoku',         'shinrin-yoku-oil',               3),
  p('Tamer',                'tamer-oil',                      3),
  p('Brave',                'doterra-brave-blend',            3),
  p('Calmer',               'doterra-calmer-blend',           3),
  p('Stronger',             'doterra-stronger-blend',         3),

  // ── Supplements ───────────────────────────────────────────────────────────
  p('Lifelong Vitality Pack', 'doterra-lifelong-vitality-pack', 10),
  p('Alpha CRS+',           'alpha-crs-plus',                  7),
  p('xEO Mega',             'eo-mega-essential-oil-omega-complex', 7),
  p('Microplex VMz',        'supplements-daily-vitality-microplex-vmz-food-nutrient-complex', 7),
  p('PB Restore',           'pb-restore',                      6),

  // ── Kits ──────────────────────────────────────────────────────────────────
  p('Foundational Wellness Bundle', 'foundational-wellness-bundle', 10, 'cta'),
]

const { error } = await supabase.from('link_expert').insert(links)
if (error) { console.error('ERROR:', error.message); process.exit(1) }
console.log(`✅ Inserted ${links.length} verified EN product links (slugs from live DOM)`)
