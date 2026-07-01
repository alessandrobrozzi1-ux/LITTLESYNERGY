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
const p = (anchor, slug, pri=7, cat='product') => ({
  brand_id: BRAND, anchor_text: anchor,
  full_url: `${B}/${slug}/?OwnerID=${OID}`,
  category: cat, priority: pri, active: true,
})

const links = [
  // Single Oils
  p('Lavender 15mL',        'lavender-15ml',        10),
  p('Peppermint 15mL',      'peppermint-15ml',      10),
  p('Frankincense 15mL',    'frankincense-15ml',    10),
  p('Lemon 15mL',           'lemon-15ml',           9),
  p('Tea Tree 15mL',        'tea-tree-15ml',        9),
  p('Wild Orange 15mL',     'wild-orange-15ml',     9),
  p('Oregano 15mL',         'oregano-15ml',         9),
  p('Copaiba 15mL',         'copaiba-15ml',         9),
  p('Bergamot 15mL',        'bergamot-15ml',        8),
  p('Rosemary 15mL',        'rosemary-15ml',        8),
  p('Eucalyptus 15mL',      'eucalyptus-15ml',      8),
  p('Geranium 15mL',        'geranium-15ml',        8),
  p('Ylang Ylang 15mL',     'ylang-ylang-15ml',     8),
  p('Clary Sage 15mL',      'clary-sage-15ml',      8),
  p('Vetiver 15mL',         'vetiver-15ml',         7),
  p('Clove 15mL',           'clove-15ml',           7),
  p('Ginger 15mL',          'ginger-15ml',          7),
  p('Cardamom 15mL',        'cardamom-15ml',        7),
  p('Cinnamon Bark 15mL',   'cinnamon-bark-15ml',   7),
  p('Helichrysum 5mL',      'helichrysum-5ml',      7),
  p('Juniper Berry 5mL',    'juniper-berry-5ml',    7),
  p('Marjoram 15mL',        'marjoram-15ml',        7),
  p('Melissa 5mL',          'melissa-5ml',          7),
  p('Arborvitae 5mL',       'arborvitae-5ml',       6),
  p('Cypress 15mL',         'cypress-15ml',         6),
  p('Spearmint 15mL',       'spearmint-15ml',       6),
  p('Patchouli 15mL',       'patchouli-15ml',       6),
  p('Wintergreen 15mL',     'wintergreen-15ml',     6),
  p('Lemongrass 15mL',      'lemongrass-15ml',      6),
  p('Lime 15mL',            'lime-15ml',            6),
  p('Grapefruit 15mL',      'grapefruit-15ml',      6),
  p('Tangerine 15mL',       'tangerine-15ml',       6),
  p('Black Pepper 5mL',     'black-pepper-5ml',     6),
  p('Basil 15mL',           'basil-15ml',           6),
  p('Roman Chamomile 5mL',  'roman-chamomile-5ml',  6),
  p('Myrrh 15mL',           'myrrh-15ml',           6),
  p('Cedarwood 15mL',       'cedarwood-15ml',       6),
  p('Sandalwood 5mL',       'sandalwood-5ml',       6),
  p('Douglas Fir 15mL',     'douglas-fir-15ml',     5),
  p('Siberian Fir 15mL',    'siberian-fir-15ml',    5),
  p('Thyme 15mL',           'thyme-15ml',           5),
  p('Cilantro 15mL',        'cilantro-15ml',        5),
  // Blends
  p('Balance Blend 15mL',       'balance-15ml',         9),
  p('Serenity Blend 15mL',      'serenity-15ml',        9),
  p('Adaptiv Blend 15mL',       'adaptiv-15ml',         8),
  p('Elevation Blend 15mL',     'elevation-15ml',       8),
  p('Citrus Bliss 15mL',        'citrus-bliss-15ml',    8),
  p('PastTense Blend 10mL',     'past-tense-10ml',      8),
  p('Purify Blend 15mL',        'purify-15ml',          7),
  p('AromaTouch Blend 15mL',    'aromatouch-15ml',      7),
  p('Cheer Blend 15mL',         'cheer-15ml',           7),
  p('Console Blend 15mL',       'console-15ml',         7),
  p('Forgive Blend 15mL',       'forgive-15ml',         7),
  p('Motivate Blend 15mL',      'motivate-15ml',        7),
  p('Passion Blend 15mL',       'passion-15ml',         7),
  p('Peace Blend 15mL',         'peace-15ml',           7),
  p('Whisper Blend 5mL',        'whisper-5ml',          6),
  p('Zendocrine Blend 15mL',    'zendocrine-15ml',      6),
  p('TerraShield 30mL',         'terrashield-30ml',     6),
  p('DDR Prime Blend 15mL',     'ddr-prime-15ml',       6),
  p('HD Clear Blend 10mL',      'hd-clear-10ml',        7),
  p('ClaryCalm Blend 10mL',     'clarycalm-10ml',       7),
  // Deep Blue family
  p('Deep Blue Blend 5mL',      'deep-blue-5ml',        9),
  p('Deep Blue Rub',            'deep-blue-rub',        9),
  p('Deep Blue Touch 10mL',     'deep-blue-touch-10ml', 8),
  // On Guard family
  p('On Guard Blend 15mL',      'on-guard-15ml',        9),
  p('On Guard Beadlets',        'doterra-on-guard-beadlets', 8),
  p('On Guard Toothpaste',      'doterra-on-guard-toothpaste', 7),
  p('On Guard Hand Wash',       'on-guard-foaming-hand-wash', 6),
  // DigestZen family
  p('DigestZen Blend 15mL',     'digestzen-15ml',       9),
  p('DigestZen TerraZyme',      'digestzen-terrazyme',  8),
  p('DigestZen Softgels',       'digestzen-softgels',   7),
  // Breathe family
  p('Breathe Blend 15mL',       'breathe-15ml',         9),
  p('Breathe Respiratory Drops','doterra-breathe-respiratory-drops', 8),
  p('Breathe Touch 10mL',       'breathe-touch-10ml',   7),
  // Supplements
  p('Lifelong Vitality Pack',   'lifelong-vitality-pack', 10),
  p('Alpha CRS+',               'alpha-crs',            7),
  p('xEO Mega',                 'xeo-mega',             7),
  p('Microplex VMz',            'microplex-vmz',        7),
  p('PB Assist+',               'pb-assist',            7),
  p('GX Assist',                'gx-assist',            6),
  p('Mito2Max',                 'mito2max',             6),
  p('Serenity Softgels',        'serenity-softgels',    7),
  p('Adaptiv Capsules',         'adaptiv-capsules',     7),
  // Carrier
  p('Fractionated Coconut Oil', 'fractionated-coconut-oil', 8),
  // Kits
  p('Home Essentials Kit',      'home-essentials-kit',  10, 'cta'),
  p('Family Essentials Kit',    'family-essentials-kit', 9, 'cta'),
  p('Natural Solutions Kit',    'natural-solutions-kit', 8, 'cta'),
]

const { error } = await supabase.from('link_expert').insert(links)
if (error) { console.error('ERROR:', error.message); process.exit(1) }
console.log(`✓ Inserted ${links.length} EN product links`)
