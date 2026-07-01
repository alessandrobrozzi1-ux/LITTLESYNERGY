require('fs').readFileSync(require('path').join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const serviceKey = process.env.SUPABASE_SERVICE_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' }

const id = '98c06231-c6b6-41a2-9c1d-020cdf9fe1f3'

const content = `# doTERRA On Guard: Tu Escudo Natural para el Bienestar Diario

En el mundo de los aceites esenciales, pocas mezclas han ganado tanta reputación como [doTERRA On Guard](https://shop.doterra.com/ES/es_ES/shop/onguard-oil/?OwnerID=15957920). Esta poderosa combinación de aceites puros ha conquistado a miles de familias que buscan un apoyo natural para fortalecer su bienestar, especialmente durante las épocas del año más desafiantes.

La mezcla On Guard combina Wild Orange, Clove, Cinnamon, Eucalyptus y Rosemary en una fórmula diseñada para crear un ambiente protector y energizante. Su aroma cálido y especiado no solo transforma cualquier espacio, sino que se ha convertido en un imprescindible en rutinas de cuidado personal y limpieza del hogar.

## ¿Qué Hace Especial a doTERRA On Guard?

La verdadera magia de [On Guard](https://shop.doterra.com/ES/es_ES/shop/onguard-oil/?OwnerID=15957920) está en su composición sinérgica. Cada aceite esencial aporta propiedades únicas que, combinadas, crean un efecto potenciado:

**Wild Orange**: Aporta un toque vibrante y alegre, además de ser conocido por sus propiedades purificadoras naturales.

**Clove (Clavo)**: Reconocido históricamente por su capacidad para crear ambientes limpios y acogedores.

**Cinnamon (Canela)**: Añade calidez aromática y es valorado en prácticas tradicionales de bienestar.

**Eucalyptus**: Conocido por su frescura y cualidades renovadoras del ambiente.

**Rosemary (Romero)**: Completa la mezcla con un toque herbáceo estimulante.

Esta combinación ha sido meticulosamente equilibrada para ofrecer versatilidad sin comprometer la pureza. Como todos los aceites doTERRA, On Guard cuenta con la garantía CPTG Certified Pure Tested Grade™, lo que significa que ha pasado rigurosas pruebas de terceros para verificar su calidad.

## Formas Prácticas de Usar On Guard en tu Rutina

La versatilidad de [doTERRA On Guard](https://shop.doterra.com/ES/es_ES/shop/onguard-oil/?OwnerID=15957920) lo convierte en un aliado perfecto para múltiples momentos del día:

**En difusión**: Añade 3-4 gotas a tu difusor para crear un ambiente acogedor y purificado, especialmente útil en épocas de cambios estacionales o cuando recibes visitas en casa.

**Limpieza del hogar**: Mezcla unas gotas con agua y vinagre blanco en un spray para limpiar superficies de forma natural. Tu cocina y baño olerán increíble sin químicos agresivos.

**Apoyo diario**: Diluye una gota en aceite de coco y aplica en las plantas de los pies antes de dormir. Muchas familias han convertido esto en un ritual nocturno especialmente durante otoño e invierno.

**Agua aromatizada**: Añade una gota a tu botella de agua de cristal (nunca plástico) para un toque especiado y refrescante. Asegúrate de que sea aceite de grado interno y consulta las indicaciones de uso.

La línea On Guard se ha expandido para incluir productos complementarios como el [On Guard Touch](https://shop.doterra.com/ES/es_ES/shop/onguard-touch-oil/?OwnerID=15957920), ya diluido y listo para aplicación tópica, perfecto para llevar en el bolso.

## Por Qué Las Familias Eligen On Guard

La popularidad de On Guard no es casualidad. Miles de usuarios reportan que se ha convertido en su "aceite de guardia" durante los meses más fríos, en viajes, y en la rutina de bienestar de toda la familia.

Su aroma acogedor lo hace agradable para todos los miembros del hogar, mientras que su versatilidad permite incorporarlo de forma natural sin complicaciones. Para niños mayores de 6 años, siempre diluido y bajo supervisión, puede ser parte de rutinas reconfortantes.

Además, elegir [doTERRA On Guard](https://shop.doterra.com/ES/es_ES/shop/onguard-oil/?OwnerID=15957920) significa apoyar prácticas de aprovisionamiento ético. doTERRA trabaja directamente con comunidades de agricultores a través de su programa Co-Impact Sourcing, asegurando que cada botella contribuya a un impacto positivo global.

## Preguntas Frecuentes

**¿On Guard es seguro para difundir con niños en casa?**
Sí, es seguro difundir On Guard en espacios con niños mayores de 2 años. Usa difusión intermitente (30 minutos encendido, 30 apagado) y asegura buena ventilación. Para bebés menores de 2 años, consulta con un profesional cualificado.

**¿Puedo aplicar On Guard directamente sobre la piel?**
Debido a su concentración de aceites cálidos como canela y clavo, On Guard debe diluirse siempre antes de aplicación tópica (1-2 gotas en 1 cucharada de aceite portador). La versión [On Guard Touch](https://shop.doterra.com/ES/es_ES/shop/onguard-touch-oil/?OwnerID=15957920) ya viene pre-diluida y lista para usar.

**¿Cuál es la diferencia entre On Guard y On Guard Touch?**
On Guard es la mezcla concentrada para difusión, limpieza o uso diluido. [On Guard Touch](https://shop.doterra.com/ES/es_ES/shop/onguard-touch-oil/?OwnerID=15957920) viene pre-diluido en aceite de coco fraccionado, listo para aplicación directa en puntos específicos como plantas de pies o muñecas.

**¿On Guard ayuda durante la temporada de resfriados?**
Muchas personas incorporan On Guard en sus rutinas de bienestar durante otoño e invierno para crear ambientes acogedores y como parte de sus prácticas de autocuidado preventivo. No sustituye tratamiento médico, pero complementa estilos de vida saludables.

**¿Puedo usar On Guard en mi rutina de limpieza natural?**
Absolutamente. On Guard es excelente para limpieza del hogar. Mezcla 10-15 gotas con agua, vinagre blanco y un emulsionante natural en un spray para superficies. También puedes añadir gotas a tu lavavajillas o lavadora.

## Conclusión

doTERRA On Guard representa la perfecta combinación de tradición aromática y bienestar moderno. Su mezcla de aceites esenciales puros certificados CPTG ofrece versatilidad para el hogar, apoyo para tu rutina de bienestar, y un aroma que transforma cualquier espacio en un refugio acogedor.

Ya sea que estés comenzando tu viaje con aceites esenciales o buscando expandir tu colección, [On Guard](https://shop.doterra.com/ES/es_ES/shop/onguard-oil/?OwnerID=15957920) es una inversión en bienestar que toda la familia disfrutará. Su popularidad a nivel global habla por sí misma: es simple, efectivo y auténtico.

---

¿Listo para empezar tu rutina de bienestar?

🇪🇸 [Comprar doTERRA España — 25% de descuento](https://shop.doterra.com/ES/es_ES/shop/essential-oils/?OwnerID=15957920)

📖 ¿Nuevo aquí? [Cómo comprar productos doTERRA + Guía 25% de descuento](https://essentialsynergybr.com/blog/how-to-buy-doterra-products)

🌎 **¿Quieres comprar doTERRA pero no estás en España?** Selecciona tu país y completa tu pedido directamente desde la tienda doTERRA local de tu región:

🇲🇽 [México](https://doterra.me/WhDhnN)
🇨🇴 [Colombia](https://doterra.me/FZHe7j)
🇨🇱 [Chile](https://doterra.me/mH1MeY)
🇧🇷 [Brasil](https://doterra.me/xOkoAM)
🇪🇨 [Ecuador](https://doterra.me/z_hG9P)
🇨🇷 [Costa Rica](https://doterra.me/1pC6bz)
🇬🇹 [Guatemala](https://doterra.me/gpylQW)
🇸🇻 [El Salvador](https://doterra.me/ZBytPD)

💬 ¿Necesitas ayuda personalizada? Escríbeme directamente en [WhatsApp](https://wa.me/393662156309) y te ayudo a elegir lo mejor para tu rutina.`

fetch(`${supabaseUrl}/rest/v1/articles?id=eq.${id}`, {
  method: 'PATCH', headers,
  body: JSON.stringify({ content_markdown: content })
}).then(r => console.log(r.ok ? '✅ Articolo aggiornato — onguard-oil e onguard-touch-oil corretti' : '❌ ' + r.status))
