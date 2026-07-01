require('fs').readFileSync(require('path').join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const serviceKey = process.env.SUPABASE_SERVICE_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' }

const BASE = 'https://shop.doterra.com/ES/es_ES/shop'
const OID = '/?OwnerID=15957920'
const u = (slug) => `${BASE}/${slug}${OID}`

const LINKS = [
  // Single oils
  { anchor_text: 'Lavanda', full_url: u('lavender-oil'), category: 'product', priority: 10 },
  { anchor_text: 'Lavender', full_url: u('lavender-oil'), category: 'product', priority: 9 },
  { anchor_text: 'Menta', full_url: u('peppermint-oil'), category: 'product', priority: 10 },
  { anchor_text: 'Peppermint', full_url: u('peppermint-oil'), category: 'product', priority: 9 },
  { anchor_text: 'Incienso', full_url: u('frankincense-oil'), category: 'product', priority: 10 },
  { anchor_text: 'Frankincense', full_url: u('frankincense-oil'), category: 'product', priority: 9 },
  { anchor_text: 'Limón', full_url: u('lemon-oil'), category: 'product', priority: 8 },
  { anchor_text: 'Lemon', full_url: u('lemon-oil'), category: 'product', priority: 7 },
  { anchor_text: 'Naranja Salvaje', full_url: u('wild-orange-oil'), category: 'product', priority: 8 },
  { anchor_text: 'Wild Orange', full_url: u('wild-orange-oil'), category: 'product', priority: 7 },
  { anchor_text: 'Eucalipto', full_url: u('eucalyptus-oil'), category: 'product', priority: 8 },
  { anchor_text: 'Eucalyptus', full_url: u('eucalyptus-oil'), category: 'product', priority: 7 },
  { anchor_text: 'Romero', full_url: u('rosemary-oil'), category: 'product', priority: 7 },
  { anchor_text: 'Rosemary', full_url: u('rosemary-oil'), category: 'product', priority: 6 },
  { anchor_text: 'Orégano', full_url: u('oregano-oil'), category: 'product', priority: 7 },
  { anchor_text: 'Oregano', full_url: u('oregano-oil'), category: 'product', priority: 6 },
  { anchor_text: 'Copaiba', full_url: u('copaiba-oil'), category: 'product', priority: 7 },
  { anchor_text: 'Salvia Sclarea', full_url: u('clary-sage-oil'), category: 'product', priority: 6 },
  { anchor_text: 'Clary Sage', full_url: u('clary-sage-oil'), category: 'product', priority: 5 },
  { anchor_text: 'Ylang Ylang', full_url: u('ylang-ylang-oil'), category: 'product', priority: 6 },
  { anchor_text: 'Cedro', full_url: u('cedarwood-oil'), category: 'product', priority: 6 },
  { anchor_text: 'Cedarwood', full_url: u('cedarwood-oil'), category: 'product', priority: 5 },
  { anchor_text: 'Bergamota', full_url: u('bergamot-oil'), category: 'product', priority: 7 },
  { anchor_text: 'Bergamot', full_url: u('bergamot-oil'), category: 'product', priority: 6 },
  { anchor_text: 'Vetiver', full_url: u('vetiver-oil'), category: 'product', priority: 5 },
  { anchor_text: 'Manzanilla Romana', full_url: u('roman-chamomile-oil'), category: 'product', priority: 6 },
  { anchor_text: 'Roman Chamomile', full_url: u('roman-chamomile-oil'), category: 'product', priority: 5 },
  { anchor_text: 'Jengibre', full_url: u('ginger-oil'), category: 'product', priority: 6 },
  { anchor_text: 'Ginger', full_url: u('ginger-oil'), category: 'product', priority: 5 },
  { anchor_text: 'Pomelo', full_url: u('grapefruit-oil'), category: 'product', priority: 6 },
  { anchor_text: 'Grapefruit', full_url: u('grapefruit-oil'), category: 'product', priority: 5 },
  { anchor_text: 'Mejorana', full_url: u('marjoram-oil'), category: 'product', priority: 5 },
  { anchor_text: 'Marjoram', full_url: u('marjoram-oil'), category: 'product', priority: 4 },
  { anchor_text: 'Geranio', full_url: u('geranium-oil'), category: 'product', priority: 5 },
  { anchor_text: 'Geranium', full_url: u('geranium-oil'), category: 'product', priority: 4 },
  { anchor_text: 'Ciprés', full_url: u('cypress-oil'), category: 'product', priority: 5 },
  { anchor_text: 'Cypress', full_url: u('cypress-oil'), category: 'product', priority: 4 },
  { anchor_text: 'Mirra', full_url: u('myrrh-oil'), category: 'product', priority: 5 },
  { anchor_text: 'Myrrh', full_url: u('myrrh-oil'), category: 'product', priority: 4 },
  { anchor_text: 'Albahaca', full_url: u('basil-oil'), category: 'product', priority: 5 },
  { anchor_text: 'Basil', full_url: u('basil-oil'), category: 'product', priority: 4 },
  { anchor_text: 'Canela', full_url: u('cinnamon-bark-oil'), category: 'product', priority: 5 },
  { anchor_text: 'Cinnamon', full_url: u('cinnamon-bark-oil'), category: 'product', priority: 4 },
  { anchor_text: 'Clavo', full_url: u('clove-oil'), category: 'product', priority: 5 },
  { anchor_text: 'Clove', full_url: u('clove-oil'), category: 'product', priority: 4 },
  { anchor_text: 'Pimienta Negra', full_url: u('black-pepper-oil'), category: 'product', priority: 5 },
  { anchor_text: 'Black Pepper', full_url: u('black-pepper-oil'), category: 'product', priority: 4 },
  { anchor_text: 'Cardamomo', full_url: u('cardamom-oil'), category: 'product', priority: 4 },
  { anchor_text: 'Cardamom', full_url: u('cardamom-oil'), category: 'product', priority: 3 },
  { anchor_text: 'Pachulí', full_url: u('patchouli-oil'), category: 'product', priority: 4 },
  { anchor_text: 'Patchouli', full_url: u('patchouli-oil'), category: 'product', priority: 3 },
  { anchor_text: 'Sándalo', full_url: u('sandalwood-oil'), category: 'product', priority: 5 },
  { anchor_text: 'Sandalwood', full_url: u('sandalwood-oil'), category: 'product', priority: 4 },
  { anchor_text: 'Hierba Buena', full_url: u('spearmint-oil'), category: 'product', priority: 4 },
  { anchor_text: 'Spearmint', full_url: u('spearmint-oil'), category: 'product', priority: 3 },
  { anchor_text: 'Mandarina', full_url: u('tangerine-oil'), category: 'product', priority: 5 },
  { anchor_text: 'Tangerine', full_url: u('tangerine-oil'), category: 'product', priority: 4 },
  { anchor_text: 'Tomillo', full_url: u('thyme-oil'), category: 'product', priority: 4 },
  { anchor_text: 'Thyme', full_url: u('thyme-oil'), category: 'product', priority: 3 },
  { anchor_text: 'Helichrysum', full_url: u('helichrysum-oil'), category: 'product', priority: 4 },
  { anchor_text: 'Lima', full_url: u('lime-oil'), category: 'product', priority: 4 },
  { anchor_text: 'Lime', full_url: u('lime-oil'), category: 'product', priority: 3 },
  { anchor_text: 'Hierba de Limón', full_url: u('lemongrass-oil'), category: 'product', priority: 5 },
  { anchor_text: 'Lemongrass', full_url: u('lemongrass-oil'), category: 'product', priority: 4 },
  // Blends
  { anchor_text: 'Serenity', full_url: u('doterra-serenity-oil'), category: 'product', priority: 8 },
  { anchor_text: 'Balance', full_url: u('doterra-balance-oil'), category: 'product', priority: 8 },
  { anchor_text: 'dōTERRA Air', full_url: u('doterra-air-oil'), category: 'product', priority: 8, notes: 'Breathe in US' },
  { anchor_text: 'Breathe', full_url: u('doterra-air-oil'), category: 'product', priority: 7, notes: 'US name → Air in Spain' },
  { anchor_text: 'Brave', full_url: u('doterra-brave-oil'), category: 'product', priority: 6 },
  { anchor_text: 'Calmer', full_url: u('doterra-calmer-oil'), category: 'product', priority: 6 },
  { anchor_text: 'Cheer', full_url: u('doterra-cheer-oil'), category: 'product', priority: 6 },
  { anchor_text: 'AromaTouch', full_url: u('aromatouch-oil'), category: 'product', priority: 7 },
  { anchor_text: 'Citrus Bliss', full_url: u('citrus-bliss-oil'), category: 'product', priority: 7 },
  { anchor_text: 'DDR Prime', full_url: u('ddr-prime-oil'), category: 'product', priority: 7 },
  { anchor_text: 'Deep Blue', full_url: u('deep-blue-oil'), category: 'product', priority: 9 },
  { anchor_text: 'ClaryCalm', full_url: u('clarycalm-oil'), category: 'product', priority: 6 },
  { anchor_text: 'ZenGest', full_url: u('zengest-oil'), category: 'product', priority: 8, notes: 'DigestZen in US' },
  { anchor_text: 'DigestZen', full_url: u('zengest-oil'), category: 'product', priority: 7, notes: 'US name → ZenGest in Spain' },
  // On Guard family
  { anchor_text: 'On Guard', full_url: u('onguard-oil'), category: 'product', priority: 10 },
  { anchor_text: 'On Guard Touch', full_url: u('onguard-touch-oil'), category: 'product', priority: 8 },
  { anchor_text: 'On Guard Softgels', full_url: u('onguard-softgels'), category: 'product', priority: 6 },
  { anchor_text: 'On Guard Toothpaste', full_url: u('onguard-toothpaste'), category: 'product', priority: 5 },
  // Touch products
  { anchor_text: 'Lavanda Touch', full_url: u('lavender-touch-oil'), category: 'product', priority: 7 },
  { anchor_text: 'Menta Touch', full_url: u('peppermint-touch-oil'), category: 'product', priority: 7 },
  { anchor_text: 'Incienso Touch', full_url: u('frankincense-touch-oil'), category: 'product', priority: 7 },
  { anchor_text: 'Deep Blue Touch', full_url: u('deep-blue-touch-oil'), category: 'product', priority: 7 },
  // Categories
  { anchor_text: 'Tienda doTERRA España', full_url: u('essential-oils'), category: 'category', priority: 10 },
  { anchor_text: 'Aceites individuales', full_url: u('single-oils'), category: 'category', priority: 5 },
  { anchor_text: 'Mezclas doTERRA', full_url: u('proprietary-blends'), category: 'category', priority: 5 },
  { anchor_text: 'Kit de inicio doTERRA', full_url: u('beginners-trio'), category: 'category', priority: 9 },
  // CTA
  { anchor_text: 'Comprar doTERRA España — 25% de descuento', full_url: u('essential-oils'), category: 'cta', priority: 10 },
]

async function run() {
  // Get ES brand id
  const res = await fetch(`${supabaseUrl}/rest/v1/brands?language_code=eq.es&select=id`, { headers })
  const brands = await res.json()
  if (!brands.length) { console.log('❌ No ES brand found'); return }
  const brand_id = brands[0].id

  // Clear existing to avoid duplicates
  await fetch(`${supabaseUrl}/rest/v1/link_expert?brand_id=eq.${brand_id}`, { method: 'DELETE', headers })

  // Insert all
  const rows = LINKS.map(l => ({ brand_id, anchor_text: l.anchor_text, full_url: l.full_url, category: l.category, priority: l.priority, notes: l.notes || '' }))
  const insertRes = await fetch(`${supabaseUrl}/rest/v1/link_expert`, {
    method: 'POST', headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify(rows)
  })

  console.log(insertRes.ok ? `✅ Imported ${rows.length} links for brand ${brand_id}` : `❌ ${await insertRes.text()}`)
}

run()
