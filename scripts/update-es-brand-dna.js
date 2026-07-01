require('fs').readFileSync(require('path').join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const serviceKey = process.env.SUPABASE_SERVICE_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' }

const serviceArea = `Mercado principal: España (ecommerce directo, cookie 30 días).
Audiencia secundaria: México, Colombia, Chile, Brasil, Ecuador, Costa Rica, Guatemala, El Salvador.

OwnerID 15957920 válido en España (verificado).

URL BASE ESPAÑA:
https://shop.doterra.com/ES/es_ES/shop/[slug]/?OwnerID=15957920

TIENDA PRINCIPAL (fallback si producto no verificado):
https://shop.doterra.com/ES/es_ES/shop/essential-oils/?OwnerID=15957920

═══════════════════════════════════════════════════════
SLUGS VERIFICADOS (web scraping junio 2026) — USAR EXACTAMENTE
═══════════════════════════════════════════════════════

ACEITES INDIVIDUALES (pattern [name]-oil):
arborvitae-oil, basil-oil (Albahaca), bergamot-oil (Bergamota),
black-pepper-oil (Pimienta Negra), cedarwood-oil (Madera de Cedro),
cinnamon-bark-oil (Canela), clary-sage-oil (Salvia Sclarea),
clove-oil (Clavo), copaiba-oil, cypress-oil (Ciprés),
eucalyptus-oil (Eucalipto), frankincense-oil (Incienso) ✅,
geranium-oil (Geranio), ginger-oil (Jengibre), grapefruit-oil (Pomelo),
helichrysum-oil, lavender-oil (Lavanda) ✅, lemon-oil (Limón),
lemongrass-oil, lime-oil (Lima), marjoram-oil (Mejorana),
myrrh-oil (Mirra), oregano-oil (Orégano), patchouli-oil (Pachuli),
peppermint-oil (Menta) ✅, roman-chamomile-oil (Manzanilla Romana),
rosemary-oil (Romero), sandalwood-oil (Sándalo), spearmint-oil,
tangerine-oil (Mandarina), thyme-oil (Tomillo), vetiver-oil,
wild-orange-oil (Naranja Salvaje), ylang-ylang-oil

MEZCLAS CON prefijo doterra-:
doterra-air-oil (= Breathe US) ✅, doterra-balance-oil ✅,
doterra-brave-oil ✅, doterra-calmer-oil ✅, doterra-cheer-oil ✅,
doterra-serenity-oil ✅

MEZCLAS SIN prefijo:
air-x-oil, aromatouch-oil ✅, citrus-bliss-oil ✅,
ddr-prime-oil ✅, deep-blue-oil ✅

MEZCLAS UNA PALABRA:
clarycalm-oil ✅, zengest-oil (= DigestZen US) ✅

FAMILIA ON GUARD (una palabra "onguard"):
onguard-oil ✅, onguard-touch-oil ✅, onguard-softgels ✅,
onguard-toothpaste ✅, on-guard-drops ✅ (con guión, excepción)

TOUCH PRODUCTS:
lavender-touch-oil ✅, peppermint-touch-oil ✅,
frankincense-touch-oil ✅, deep-blue-touch-oil ✅,
blue-lotus-touch-oil ✅

FORMAS ESPECIALES:
deep-blue-oil-roll-on ✅, peppermint-oil-beadlet ✅,
ddr-prime-softgels ✅, beginners-trio ✅

═══════════════════════════════════════════════════════
REGLA DE ORO
═══════════════════════════════════════════════════════

1. Producto en lista → usar slug exacto
2. Producto NO en lista → tienda principal (essential-oils)
3. NUNCA inventar slugs — doTERRA España no tiene patrón universal
4. SIEMPRE añadir /?OwnerID=15957920

EJEMPLOS CORRECTOS:
✅ [Lavanda](https://shop.doterra.com/ES/es_ES/shop/lavender-oil/?OwnerID=15957920)
✅ [On Guard](https://shop.doterra.com/ES/es_ES/shop/onguard-oil/?OwnerID=15957920)
✅ [Deep Blue](https://shop.doterra.com/ES/es_ES/shop/deep-blue-oil/?OwnerID=15957920)
✅ [ZenGest](https://shop.doterra.com/ES/es_ES/shop/zengest-oil/?OwnerID=15957920)
✅ [dōTERRA Air](https://shop.doterra.com/ES/es_ES/shop/doterra-air-oil/?OwnerID=15957920)
✅ [AromaTouch](https://shop.doterra.com/ES/es_ES/shop/aromatouch-oil/?OwnerID=15957920)

EJEMPLOS INCORRECTOS:
❌ doterra-on-guard-oil → usar: onguard-oil
❌ doterra-deep-blue-oil → usar: deep-blue-oil
❌ doterra-breathe-oil → usar: doterra-air-oil
❌ doterra-digestzen-oil → usar: zengest-oil
❌ doterra-aromatouch-oil → usar: aromatouch-oil
❌ on-guard-touch-oil → usar: onguard-touch-oil

IDIOMA: Español neutro (España + LATAM). Usar "tú" cálido pero pulido. Evitar vosotros.`

const topicsAddition = `

═══════════════════════════════════════════════════════
NOMBRES DIFERENTES EN ESPAÑA — CRÍTICO
═══════════════════════════════════════════════════════

Algunos productos tienen nombres distintos en España vs EE.UU.
USA LOS NOMBRES ESPAÑOLES:

⚠️ DigestZen (US) → llamar "ZenGest" en España — slug: zengest-oil
⚠️ Breathe (US) → llamar "dōTERRA Air" en España — slug: doterra-air-oil
⚠️ Tea Tree → en España se conoce más como "Melaleuca" (sin slug verificado)

ERRORES COMUNES — NO REPETIR:
- doterra-on-guard-oil ❌ → onguard-oil ✅
- doterra-deep-blue-oil ❌ → deep-blue-oil ✅
- doterra-breathe-oil ❌ → doterra-air-oil ✅
- doterra-digestzen-oil ❌ → zengest-oil ✅
- doterra-aromatouch-oil ❌ → aromatouch-oil ✅
- on-guard-touch-oil ❌ → onguard-touch-oil ✅
- lavender-touch-blend-oil ❌ (patrón US) → lavender-touch-oil ✅`

async function run() {
  // Get current topics_to_avoid
  const res = await fetch(`${supabaseUrl}/rest/v1/brands?language_code=eq.es&select=id,brand_dna_topics_to_avoid`, { headers })
  const brands = await res.json()
  if (!brands.length) { console.log('❌ No ES brand found'); return }

  const brand = brands[0]
  const currentTopics = brand.brand_dna_topics_to_avoid ?? ''

  // Only append if not already updated
  const newTopics = currentTopics.includes('NOMBRES DIFERENTES EN ESPAÑA')
    ? currentTopics
    : currentTopics + topicsAddition

  const patch = await fetch(`${supabaseUrl}/rest/v1/brands?language_code=eq.es`, {
    method: 'PATCH', headers,
    body: JSON.stringify({ brand_dna_service_area: serviceArea, brand_dna_topics_to_avoid: newTopics })
  })

  console.log(patch.ok ? '✅ Service Area + Topics updated' : `❌ Error: ${await patch.text()}`)
}

run()
