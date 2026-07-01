require('fs').readFileSync(require('path').join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const serviceKey = process.env.SUPABASE_SERVICE_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

const serviceArea = `Mercado principal: España (ecommerce directo, cookie 30 días).
Audiencia secundaria: México, Colombia, Chile, Brasil, Ecuador, Costa Rica, Guatemala, El Salvador.

OwnerID 15957920 válido en España (verificado).

URL BASE ESPAÑA (todos los productos):
https://shop.doterra.com/ES/es_ES/shop/[slug]/?OwnerID=15957920

TIENDA PRINCIPAL ESPAÑA:
https://shop.doterra.com/ES/es_ES/shop/essential-oils/?OwnerID=15957920

PATRONES DE SLUG VERIFICADOS — USAR EXACTAMENTE

ACEITES INDIVIDUALES (patrón [name]-oil):
- lavender-oil (Lavanda) ✅ verificado
- frankincense-oil (Incienso) ✅ verificado
- peppermint-oil (Menta)
- lemon-oil (Limón)
- wild-orange-oil (Naranja Salvaje)
- eucalyptus-oil (Eucalipto)
- rosemary-oil (Romero)
- oregano-oil (Orégano)
- copaiba-oil (Copaiba)
- clary-sage-oil (Salvia Sclarea)
- ylang-ylang-oil (Ylang Ylang)
- cedarwood-oil (Cedro)
- bergamot-oil (Bergamota)
- basil-oil (Albahaca)
- ginger-oil (Jengibre)
- grapefruit-oil (Pomelo)
- helichrysum-oil (Helichrysum)
- lime-oil (Lima)
- marjoram-oil (Mejorana)
- myrrh-oil (Mirra)
- patchouli-oil (Pachuli)
- sandalwood-oil (Sándalo)
- spearmint-oil (Hierba Buena)
- thyme-oil (Tomillo)
- vetiver-oil (Vetiver)
- roman-chamomile-oil (Manzanilla Romana)
- cinnamon-bark-oil (Canela)
- clove-oil (Clavo)
- cypress-oil (Ciprés)
- geranium-oil (Geranio)
- lemongrass-oil (Hierba de Limón)
- tangerine-oil (Mandarina)

MEZCLAS CON PREFIJO doterra- (patrón doterra-[name]-oil):
- doterra-serenity-oil (Serenity) ✅ verificado
- doterra-balance-oil (Balance) ✅ verificado
- doterra-on-guard-oil (On Guard)
- doterra-deep-blue-oil (Deep Blue)
- doterra-breathe-oil (Breathe)
- doterra-digestzen-oil (DigestZen)
- doterra-aromatouch-oil (AromaTouch)
- doterra-peace-oil (Peace)

PRODUCTOS TOUCH (patrón [name]-touch-oil — España usa "-touch-oil" NO "-touch-blend-oil"):
- lavender-touch-oil (Lavanda Touch) ✅ verificado
- peppermint-touch-oil (Menta Touch) ✅ verificado
- frankincense-touch-oil (Incienso Touch) ✅ verificado
- on-guard-touch-oil (On Guard Touch)
- deep-blue-touch-oil (Deep Blue Touch)
- balance-touch-oil (Balance Touch)
- breathe-touch-oil (Breathe Touch)
- serenity-touch-oil (Serenity Touch)

EXCEPCIONES — USAR TIENDA PRINCIPAL (slug no verificado):
- Tea Tree / Árbol de Té
- PastTense
- TerraShield
- Foundational Wellness Bundle
- MetaPWR

REGLA DE ORO:
1. Producto en lista verificada → usar slug específico
2. Producto NO en lista → tienda principal: https://shop.doterra.com/ES/es_ES/shop/essential-oils/?OwnerID=15957920
3. NUNCA inventar slugs
4. SIEMPRE añadir /?OwnerID=15957920

EJEMPLOS CORRECTOS:
✅ [Lavanda](https://shop.doterra.com/ES/es_ES/shop/lavender-oil/?OwnerID=15957920)
✅ [Serenity](https://shop.doterra.com/ES/es_ES/shop/doterra-serenity-oil/?OwnerID=15957920)
✅ [Lavender Touch](https://shop.doterra.com/ES/es_ES/shop/lavender-touch-oil/?OwnerID=15957920)
✅ [Balance](https://shop.doterra.com/ES/es_ES/shop/doterra-balance-oil/?OwnerID=15957920)

EJEMPLOS INCORRECTOS (NUNCA):
❌ slug en español inventado (lavanda-aceite)
❌ Serenity sin prefijo doterra- (serenity-blend)
❌ Touch con patrón US (lavender-touch-blend-oil)

IDIOMA:
- Español neutro (España + LATAM)
- Evitar "vosotros", regionalismos fuertes
- Usar "tú" cálido pero pulido`

async function run() {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/brands?language_code=eq.es`,
    {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ brand_dna_service_area: serviceArea }),
    }
  )
  console.log(res.ok ? '✅ Service Area updated' : `❌ Error: ${await res.text()}`)
}

run()
