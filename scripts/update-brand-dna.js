require('fs').readFileSync(require('path').join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const serviceKey = process.env.SUPABASE_SERVICE_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

const serviceArea = `Mercado principal: España (ecommerce directo, cookie 30 días). Audiencia secundaria: México, Colombia, Chile, Brasil, Ecuador, Costa Rica, Guatemala, El Salvador.

OwnerID 15957920 válido en España (verificado).

TIENDA PRINCIPAL ESPAÑA (ÚNICO LINK PERMITIDO PARA PRODUCTOS):
https://shop.doterra.com/ES/es_ES/shop/essential-oils/?OwnerID=15957920

REGLA CRÍTICA DE ENLACES — LEER CON ATENCIÓN:
NUNCA usar el patrón shop.doterra.com/ES/es_ES/shop/[slug]/. Este patrón es INVENTADO. Los slugs específicos en español NO han sido verificados y los enlaces NO funcionan. NO intentar adivinar slugs.

Para CUALQUIER mención de producto doTERRA en el artículo, linkar SIEMPRE y SOLO a la tienda principal:
https://shop.doterra.com/ES/es_ES/shop/essential-oils/?OwnerID=15957920

Nombrar el producto en texto natural (ej. 'lavanda', 'Serenity', 'On Guard') pero el HREF del enlace markdown siempre apunta a la tienda principal.

Ejemplo CORRECTO:
La [lavanda](https://shop.doterra.com/ES/es_ES/shop/essential-oils/?OwnerID=15957920) es...

Ejemplo INCORRECTO (NUNCA HACER):
La [lavanda](https://shop.doterra.com/ES/es_ES/shop/lavender-oil/?OwnerID=15957920) es...

PRODUCTOS QUE PUEDES MENCIONAR (todos linkando a tienda principal):
- Aceites individuales: Lavanda, Menta, Incienso, Limón, Naranja Salvaje, Eucalipto, Romero, Bergamota, Vetiver, Cedro, Manzanilla Romana, Ylang Ylang, Salvia Sclarea, Pomelo, Mejorana
- Mezclas: Serenity, Balance, On Guard, Deep Blue, Breathe, DigestZen, AromaTouch, PastTense
- Productos Touch: SOLO mencionar como texto plano sin enlace
- Bundles: Foundational Wellness Bundle (recomendado)

ALWAYS append /?OwnerID=15957920 al final del link de la tienda.

IDIOMA:
- Español neutro (capture España + LATAM)
- Evitar 'vosotros', regionalismos fuertes, slang
- Usar 'tú' cálido pero pulido`

const topicsToAvoid = `NUNCA HACER:

ENLACES:
- Nunca linkar a terceros (Amazon, eBay, iHerb, Walmart, Mercado Libre)
- Nunca publicar URL doTERRA sin ?OwnerID=15957920
- Nunca inventar slugs de productos (TODOS los enlaces van a la tienda principal ES)
- Nunca recomendar competidores (Young Living, Plant Therapy, etc.)

COMPLIANCE DOTERRA — AFIRMACIONES PROHIBIDAS:
Nunca hacer afirmaciones sobre:
- Neurotransmisores específicos (GABA, serotonina, dopamina, etc.)
- Hormonas (melatonina, cortisol, etc.)
- Condiciones médicas (TDAH, depresión, ansiedad clínica, insomnio clínico)
- Tratamiento, cura o prevención de enfermedades
- Estudios científicos sin citaciones verificables

USAR LENGUAJE WELLNESS EN SU LUGAR:
- "regula la melatonina" → "apoya tu rutina natural de descanso"
- "aumenta GABA" → "crea sensación de calma"
- "reduce cortisol" → "ayuda a aliviar la tensión del día"
- "TDAH" → "mucha actividad mental"
- "depresión" → "días emocionalmente cargados"
- "ansiedad severa" → "momentos de tensión"
- "estudios demuestran" → "muchas personas reportan"

SEGURIDAD DE USO — CRÍTICO:
Aceites en baño:
- NUNCA: "añade gotas al agua del baño"
- SIEMPRE: "mezcla primero con sales de Epsom o aceite portador, luego añade al agua"

Niños:
- NUNCA recomendar para menores de 2 años
- Niños 2-6 años: solo difusión breve y supervisada, siempre diluido
- Aplicación tópica en niños: siempre diluir con aceite portador

Embarazo / lactancia: recomendar consultar profesional cualificado.

INGREDIENTES SIN ENLACE (texto plano): catnip, thuja, nootka, vanilla, tamanu, blue tansy, davana, osmanthus, magnolia, neroli, arborvitae, manuka.
PRODUCTOS TOUCH: solo texto plano, sin enlace.

CTA / CIERRE:
- NUNCA CTA adicional de cierre
- El artículo termina ÚNICAMENTE con MANDATORY FOOTER
- NUNCA "¿Listo para encontrar lo tuyo?" o closers similares`

const brandVoiceAppend = `

LONGITUD Y ESTRUCTURA:
- Artículos entre 1500-2200 palabras
- Estructura clara con H2, H3, listas
- Sección FAQ obligatoria (5-8 preguntas) cerca del final
- Sección "Conclusión" antes del footer

ESTRUCTURA OBLIGATORIA DEL ARTÍCULO:
1. Introducción (2-3 párrafos enganchando)
2. Cuerpo principal (H2/H3 con contenido)
3. Sección práctica (rutinas, recetas, ejemplos)
4. Sección FAQ (5-8 preguntas frecuentes)
5. Conclusión breve
6. Divisor horizontal (---)
7. MANDATORY FOOTER (copiado EXACTAMENTE como está — sin modificar, sin añadir nada después)`

async function run() {
  // Get current brand voice to append to it
  const getRes = await fetch(
    `${supabaseUrl}/rest/v1/brands?language_code=eq.es&select=brand_dna_brand_voice`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  )
  const brands = await getRes.json()
  const currentVoice = brands[0]?.brand_dna_brand_voice ?? ''
  const newVoice = currentVoice.includes('LONGITUD Y ESTRUCTURA')
    ? currentVoice
    : currentVoice + brandVoiceAppend

  const body = JSON.stringify({
    brand_dna_service_area: serviceArea,
    brand_dna_topics_to_avoid: topicsToAvoid,
    brand_dna_brand_voice: newVoice,
  })

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
      body,
    }
  )

  if (res.ok) {
    console.log('✅ Brand DNA updated successfully')
  } else {
    const err = await res.text()
    console.error('❌ Error:', err)
  }
}

run()
