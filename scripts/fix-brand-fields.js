require('fs').readFileSync(require('path').join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const serviceKey = process.env.SUPABASE_SERVICE_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const BID = 'a20e4f07-e572-4605-acfc-5c53355f2ada'
const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' }

const brand_dna_brand_voice = `La voz de la marca es cálida, segura, inspiradora y centrada en el cuidado. Transmite la autoridad de un experto en bienestar sin sonar clínico, acercando al lector al mundo de la familia, el autocuidado y la vida equilibrada.

La voz se siente como un amigo de confianza que casualmente tiene un profundo conocimiento de los aceites esenciales — nunca insistente, nunca moralizante, siempre práctico y humano.

Al mismo tiempo, mantiene un posicionamiento premium destacando consistentemente las pruebas de terceros (CPTG Certified Pure Tested Grade™), el Co-Impact Sourcing responsable, y la amplia validación social de la comunidad global de bienestar doTERRA.

TONO:
- Seguro pero no arrogante
- Inspirador pero sin hype
- Educativo pero no académico
- Comercial pero nunca insistente

DIRIGIRSE AL LECTOR:
- Hablar directamente: "tú", "tu familia", "tu rutina"
- Español neutro (sin "vosotros", sin regionalismos fuertes)
- Cálido pero pulido
- Evitar afirmaciones médicas

ESTRUCTURA OBLIGATORIA DEL ARTÍCULO:
1. Introducción (2-3 párrafos enganchando)
2. Cuerpo principal (H2/H3 con contenido rico)
3. Sección práctica (rutinas, recetas, ejemplos)
4. Sección FAQ (5-8 preguntas frecuentes)
5. Conclusión breve (2-3 frases, SIN CTA)
6. Divisor horizontal (---)
7. MANDATORY FOOTER (copiado EXACTAMENTE — sin modificar, sin añadir nada después)

LONGITUD: Artículos entre 1400-1600 palabras para formato largo, 900-1100 para estándar.

NO generar ningún CTA adicional de cierre. El cuerpo puede usar enlaces inline a productos (formato markdown con ?OwnerID=15957920), pero la sección de cierre es ÚNICAMENTE el footer obligatorio.`

const brand_dna_topics_to_avoid = `NUNCA HACER:

ENLACES:
- Nunca linkar a terceros (Amazon, eBay, iHerb, Walmart, Mercado Libre)
- Nunca publicar URL doTERRA sin ?OwnerID=15957920
- Nunca inventar slugs (usar Link Expert DB; si no está → tienda principal ES)
- Nunca recomendar competidores (Young Living, Plant Therapy, etc.)

COMPLIANCE DOTERRA — AFIRMACIONES PROHIBIDAS:
Nunca afirmar sobre:
- Neurotransmisores (GABA, serotonina, dopamina)
- Hormonas (melatonina, cortisol)
- Condiciones médicas (TDAH, depresión, ansiedad clínica, insomnio clínico)
- Tratamiento, cura o prevención de enfermedades
- Propiedades terapéuticas o medicinales
- Diagnósticos o recomendaciones médicas

LENGUAJE WELLNESS CORRECTO:
- "regula la melatonina" → "apoya tu rutina natural de descanso"
- "aumenta GABA" → "crea sensación de calma"
- "reduce cortisol" → "ayuda a aliviar la tensión del día"
- "TDAH" → "mucha actividad mental"
- "depresión" → "días emocionalmente cargados"
- "estudios demuestran" → "muchas personas reportan"
- "cura/trata/previene" → "apoya/favorece/ayuda a mantener"

SEGURIDAD:
Aceites en baño: NUNCA "añade gotas al agua" — SIEMPRE "mezcla con sales Epsom o aceite portador primero".
Niños <2 años: prohibido. 2-6 años: solo difusión breve (15-30 min) supervisada, siempre diluido. 6+ años: siempre diluir en aplicación tópica.
Embarazo/lactancia: recomendar consultar profesional.
Ingesta oral: añadir disclaimer "no es para consumo interno".

INGREDIENTES SIN ENLACE (texto plano, no linkar): catnip, thuja, nootka, vanilla, tamanu, blue tansy, davana, osmanthus, magnolia, neroli, arborvitae, manuka.
PRODUCTOS TOUCH: solo texto plano, sin enlace.

CTA / CIERRE:
- NUNCA añadir CTA de cierre ("¿Listo para encontrar lo tuyo?", "¿Quieres empezar?", etc.)
- El artículo termina ÚNICAMENTE con MANDATORY FOOTER — nada después
- NUNCA duplicar el enlace a la tienda antes del footer`

async function run() {
  const res = await fetch(`${supabaseUrl}/rest/v1/brands?id=eq.${BID}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ brand_dna_brand_voice, brand_dna_topics_to_avoid }),
  })
  console.log(res.ok ? '✅ Brand Voice + Topics to Avoid fixed' : `❌ ${await res.text()}`)
}

run()
