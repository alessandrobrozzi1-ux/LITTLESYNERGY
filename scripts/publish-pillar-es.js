require('fs').readFileSync(require('path').join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const sk = process.env.SUPABASE_SERVICE_KEY
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const h = { apikey: sk, Authorization: `Bearer ${sk}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' }
const hR = { apikey: sk, Authorization: `Bearer ${sk}`, 'Content-Type': 'application/json' }
const BRAND_ID = 'a20e4f07-e572-4605-acfc-5c53355f2ada'
const ONGUARD_ID = '98c06231-c6b6-41a2-9c1d-020cdf9fe1f3'

const PILLAR_CONTENT = `# Cómo Comprar Productos doTERRA: Guía Paso a Paso + 25% de Descuento Gratis

Si has descubierto un aceite esencial doTERRA en uno de nuestros artículos y quieres saber cómo comprarlo realmente, esta es la guía completa. Al final sabrás:

- ✅ Las **3 formas distintas** de comprar productos doTERRA
- ✅ Cómo **ahorrar un 25%** en cada pedido — gratis
- ✅ La forma más rápida de empezar, ya sea que estés en **España, México, Colombia, Chile, Brasil o cualquier otro país de habla hispana**
- ✅ El mejor punto de partida para alguien nuevo en doTERRA

Soy Alessandro Brozzi, Wellness Advocate certificado de doTERRA. Vamos al grano.

## Las 3 Formas de Comprar doTERRA

doTERRA no se vende en tiendas físicas. Se compra directamente desde la web oficial de doTERRA. Hay tres maneras de hacerlo:

### 1️⃣ Cliente Minorista (Precio Completo)

Compras productos como invitado al precio retail. Sin membresía, sin compromiso. **Es la opción más fácil, pero pagas un 25-35% más de lo necesario.**

### 2️⃣ Cliente Mayorista / Membresía Wellness (RECOMENDADO) ⭐

Creas una cuenta gratuita en doTERRA y desbloqueas inmediatamente:

- **25% de descuento en cada producto** durante todo un año
- **Puntos de recompensa** en cada pedido (canjeables por productos gratis)
- **Envío gratis** en pedidos sobre cierto importe
- Sin obligación de vender, reclutar ni hacer pedidos mensuales

Esta es la opción que la mayoría elige — y la que yo recomiendo.

### 3️⃣ Wellness Advocate (Camino de Negocio)

Si en algún momento quieres compartir doTERRA con otras personas y ganar comisiones, puedes actualizar tu cuenta a Wellness Advocate en cualquier momento. Mismo descuento del 25%, más herramientas de negocio y potencial de ingresos. No tienes que empezar aquí — puedes pasar a esto más adelante si tiene sentido para ti.

## Cómo Obtener el 25% de Descuento (Gratis)

Esta es la parte que la mayoría no conoce: **puedes obtener el 25% de descuento sin pagar ninguna cuota de membresía** si empiezas con el kit correcto.

Normalmente, la membresía doTERRA tiene un coste único anual. Pero si empiezas tu cuenta con un **kit de inscripción** (como el **Foundational Wellness Bundle**), la cuota se **renuncia automáticamente**.

Obtienes:

- ✅ Tus productos de inicio
- ✅ El 25% de descuento bloqueado durante todo un año
- ✅ Cero cuota de membresía

Es el punto de entrada más inteligente posible. Pagarías más comprando una sola botella al precio retail que empezando con un bundle que incluye varios productos + te ahorra dinero a largo plazo.

## Paso a Paso: Cómo Comprar doTERRA en 5 Minutos

Aquí está el proceso exacto, sin importar en qué país estés.

**Paso 1 — Haz clic en el enlace de tu país** (a continuación). Esto vincula automáticamente tu cuenta a mí como tu Wellness Advocate.

**Paso 2 — Elige tu producto o kit inicial.** Si eres nuevo, el **Foundational Wellness Bundle** es el punto de partida más popular y rentable. Incluye los esenciales diarios + renuncia a la cuota de membresía + desbloquea tu 25% de descuento.

**Paso 3 — Crea tu cuenta.** Rellena tus datos (nombre, email, dirección de envío, datos de pago). Tarda unos 3 minutos.

**Paso 4 — Realiza tu pedido.** Los productos se envían directamente a tu casa desde el almacén doTERRA de tu región.

**Paso 5 — Ahorra un 25% en cada pedido futuro** durante los próximos 12 meses.

## Enlaces Directos por País

### 🇪🇸 España (Ecommerce Directo)

La forma más rápida — clic, registra cuenta, compra:

**[→ Comprar doTERRA España (25% de descuento)](https://shop.doterra.com/ES/es_ES/shop/essential-oils/?OwnerID=15957920)**

### 🌎 Latinoamérica (Registro Personalizado)

Para los países hispanohablantes de Latinoamérica, doTERRA usa un modelo de inscripción personalizada. Haz clic en tu país y crea tu cuenta vinculada a mí:

🇲🇽 **[México](https://doterra.me/WhDhnN)**
🇨🇴 **[Colombia](https://doterra.me/FZHe7j)**
🇨🇱 **[Chile](https://doterra.me/mH1MeY)**
🇧🇷 **[Brasil](https://doterra.me/xOkoAM)**
🇪🇨 **[Ecuador](https://doterra.me/z_hG9P)**
🇨🇷 **[Costa Rica](https://doterra.me/1pC6bz)**
🇬🇹 **[Guatemala](https://doterra.me/gpylQW)**
🇸🇻 **[El Salvador](https://doterra.me/ZBytPD)**

Tu cuenta se vinculará automáticamente conmigo como tu Wellness Advocate sponsor — lo que significa que estoy aquí para ayudarte con preguntas sobre productos, consejos de rutinas, o cualquier otra cosa que necesites después de tu pedido.

## El Atajo Inteligente: Foundational Wellness Bundle

Si no quieres pensar demasiado en qué productos elegir para empezar, esta es la jugada:

El **Foundational Wellness Bundle** es el punto de entrada más popular de doTERRA porque resuelve tres problemas a la vez:

✅ **Precio mayorista** — significativamente por debajo del retail
✅ **Cuota de membresía renunciada** (ahorras esa cuota)
✅ **Bloquea el 25% de descuento** durante todo el año
✅ Incluye la base nutricional diaria + apoya tu rutina con aceites esenciales

Es el punto de partida más inteligente para crear una rutina diaria real con doTERRA.

## Preguntas Frecuentes

**¿Es realmente gratis el 25% de descuento?**
Sí — si empiezas con un kit de inscripción (Foundational Wellness Bundle, AromaTouch Training Kit, etc.), la cuota de membresía se renuncia. Obtienes el 25% de descuento sin pagar la membresía.

**¿Tengo que vender doTERRA a alguien?**
**Absolutamente no.** La mayoría de los clientes doTERRA son clientes mayoristas — compran para uso personal, nunca venden nada, y simplemente disfrutan del descuento. Puedes ser un cliente privado para siempre.

**¿Tengo que hacer un pedido mensual?**
No. No hay pedido mensual obligatorio. El Programa de Recompensas por Lealtad (LRP) es **opcional** y te da puntos de recompensa si decides suscribirte — pero puedes comprar cuando quieras.

**¿Y si no estoy en España?**
Usa los enlaces de tu país arriba. doTERRA opera en México, Colombia, Chile, Brasil, Ecuador, Costa Rica, Guatemala, El Salvador, y muchos más mercados. Crearás tu cuenta directamente en tu país con precios en tu moneda local.

**¿Puedo cancelar mi membresía?**
Sí, en cualquier momento. No hay contrato ni compromiso. Después de 12 meses, la membresía se renueva con una cuota reducida — pero puedes dejarla expirar si lo prefieres.

**¿Cuánto tarda el envío?**
Varía por país. Normalmente entre 3-10 días laborables. Recibes tracking en cada pedido.

**¿Cuál es la diferencia entre Cliente Mayorista y Wellness Advocate?**
Cliente Mayorista = uso personal, 25% de descuento, sin negocio. Wellness Advocate = mismo 25% de descuento + acceso a comisiones, formación, y la oportunidad de negocio doTERRA. Puedes cambiar de uno a otro en cualquier momento.

**¿Puedo obtener un reembolso si no me gusta un producto?**
Sí. doTERRA ofrece garantía de satisfacción en la mayoría de los productos. Contacta con atención al cliente o escríbeme directamente.

## ¿Por Qué Comprar a Través de Mí?

Cuando creas tu cuenta doTERRA a través de cualquiera de los enlaces arriba, mi **Wellness Advocate ID (15957920)** se vincula automáticamente a tu cuenta. Esto significa:

- ✅ Recibes **apoyo personal** de un Wellness Advocate certificado
- ✅ Recibes **recomendaciones de productos** adaptadas a tus necesidades
- ✅ Acceso a **todo el contenido educativo** de este blog sin paywalls
- ✅ Cero coste extra para ti — doTERRA compensa a los Wellness Advocates directamente desde sus márgenes

Nunca estás solo. Si tienes preguntas antes, durante, o después de tu compra, escríbeme:

**[→ WhatsApp Directo](https://wa.me/393662156309)**

## ¿Listo para Empezar?

Elige tu país, haz clic en el enlace, y estarás en camino:

🇪🇸 **[Comprar doTERRA España — 25% off](https://shop.doterra.com/ES/es_ES/shop/essential-oils/?OwnerID=15957920)**

🇲🇽 **[México](https://doterra.me/WhDhnN)** | 🇨🇴 **[Colombia](https://doterra.me/FZHe7j)** | 🇨🇱 **[Chile](https://doterra.me/mH1MeY)** | 🇧🇷 **[Brasil](https://doterra.me/xOkoAM)**

🇪🇨 **[Ecuador](https://doterra.me/z_hG9P)** | 🇨🇷 **[Costa Rica](https://doterra.me/1pC6bz)** | 🇬🇹 **[Guatemala](https://doterra.me/gpylQW)** | 🇸🇻 **[El Salvador](https://doterra.me/ZBytPD)**

💬 ¿Necesitas ayuda? Escríbeme en [WhatsApp](https://wa.me/393662156309)

Bienvenido a doTERRA. Tu rutina está a punto de mejorar significativamente.`

async function run() {
  // ── TASK 1: Delete 9 test articles (keep OnGuard) ─────────────────
  const listRes = await fetch(`${url}/rest/v1/articles?brand_id=eq.${BRAND_ID}&select=id,title`, { headers: hR })
  const all = await listRes.json()
  const toDelete = all.filter(a => a.id !== ONGUARD_ID)
  console.log(`\nTask 1 — Deleting ${toDelete.length} test articles (keeping On Guard):`)
  toDelete.forEach((a, i) => console.log(`  ${i+1}. ${a.title.substring(0,60)}`))

  for (const a of toDelete) {
    await fetch(`${url}/rest/v1/articles?id=eq.${a.id}`, { method: 'DELETE', headers: h })
  }
  console.log(`✅ Deleted ${toDelete.length} articles`)

  // ── TASK 2: Publish pillar ─────────────────────────────────────────
  const pillar = {
    brand_id: BRAND_ID,
    title: 'Cómo Comprar Productos doTERRA: Guía Paso a Paso + 25% de Descuento Gratis',
    slug: 'como-comprar-doterra',
    meta_description: 'Aprende cómo comprar productos doTERRA con 25% de descuento. Guía paso a paso para España, México, Colombia, Chile y todos los países de habla hispana. Por Alessandro Brozzi, Wellness Advocate certificado.',
    keyword_source: 'como comprar doterra',
    content_markdown: PILLAR_CONTENT,
    status: 'published',
    published_at: new Date().toISOString(),
  }

  const createRes = await fetch(`${url}/rest/v1/articles`, {
    method: 'POST',
    headers: { ...hR, Prefer: 'return=representation' },
    body: JSON.stringify(pillar)
  })
  const created = await createRes.json()
  console.log(`\nTask 2 — Pillar created:`)
  console.log(`  ID:   ${created[0]?.id}`)
  console.log(`  Slug: ${created[0]?.slug}`)
  console.log(`  Title: ${created[0]?.title}`)

  // ── TASK 3: Update mandatory footer URL ───────────────────────────
  const brandRes = await fetch(`${url}/rest/v1/brands?id=eq.${BRAND_ID}&select=brand_dna_mandatory_footer`, { headers: hR })
  const [brand] = await brandRes.json()
  const oldFooter = brand.brand_dna_mandatory_footer
  const newFooter = oldFooter.replace(
    'https://essentialsynergybr.com/blog/how-to-buy-doterra-products',
    'https://essentialsynergybr.com/es/blog/como-comprar-doterra'
  )
  await fetch(`${url}/rest/v1/brands?id=eq.${BRAND_ID}`, {
    method: 'PATCH', headers: h,
    body: JSON.stringify({ brand_dna_mandatory_footer: newFooter })
  })
  const changed = oldFooter !== newFooter
  console.log(`\nTask 3 — Mandatory footer: ${changed ? '✅ Updated to ES URL' : '⚠️  URL already correct or not found'}`)

  // ── TASK 4: Pause Spanish cron (active=false) ─────────────────────
  await fetch(`${url}/rest/v1/brands?id=eq.${BRAND_ID}`, {
    method: 'PATCH', headers: h,
    body: JSON.stringify({ active: false })
  })
  console.log(`\nTask 4 — Spanish brand set active=false (cron paused)`)

  // ── VERIFY: Count remaining ES articles ───────────────────────────
  const verifyRes = await fetch(`${url}/rest/v1/articles?brand_id=eq.${BRAND_ID}&select=id,title,slug`, { headers: hR })
  const remaining = await verifyRes.json()
  console.log(`\nVerify — Spanish articles in DB (${remaining.length}):`)
  remaining.forEach((a, i) => console.log(`  ${i+1}. [${a.slug}] ${a.title.substring(0,60)}`))

  console.log('\n✅ ALL DONE')
}

run().catch(console.error)
