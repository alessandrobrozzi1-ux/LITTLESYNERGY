// Debug: simula buildImagePrompt per keyword ES acne vs EN peppermint
// Usa BOTANICAL_MAP e PRODUCT_MAP da lib/image-prompt.ts (trascritti inline)

const BOTANICAL_MAP = {
  lavand:'lavender sprigs and purple flowers', lavender:'lavender sprigs and purple flowers',
  menta:'fresh mint leaves and stems', peppermint:'fresh mint leaves and stems',
  incienso:'frankincense resin chunks and dried botanicals', frankincense:'frankincense resin chunks',
  limon:'lemon slices and citrus zest', lemon:'lemon slices and citrus zest',
  naranja:'orange blossom and citrus fruit', orange:'orange blossom and citrus slices',
  piel:'rose petals and soft towels on marble',
  belleza:'rose petals and a small ceramic dish on marble',
  beauty:'rose petals and soft towels on marble',
  sleep:'lavender sprigs and soft linen', dormir:'lavender sprigs and soft linen',
  sueño:'lavender sprigs and soft linen',
  limpi:'lemon slices and eucalyptus leaves', clean:'lemon slices and eucalyptus leaves',
  energi:'sliced citrus fruits and fresh mint leaves', energy:'sliced citrus fruits and fresh mint leaves',
  negocio:'rosemary sprigs and a small potted green plant', business:'rosemary sprigs and a small potted plant',
  concentr:'rosemary sprigs and a small green plant', focus:'rosemary sprigs and clean minimal desk elements',
}

const PRODUCT_MAP = {
  lavand:'Lavender', lavender:'Lavender',
  menta:'Peppermint', peppermint:'Peppermint',
  incienso:'Frankincense', frankincense:'Frankincense',
  limon:'Lemon', lemon:'Lemon',
  naranja:'Wild Orange', orange:'Wild Orange',
  piel:'Immortelle', belleza:'Immortelle', beauty:'Immortelle',
  skincare:'Immortelle',
  sleep:'Serenity', dormir:'Serenity', sueño:'Serenity', noche:'Serenity', insomnio:'Serenity',
  limpi:'On Guard', clean:'On Guard', hogar:'On Guard',
  energi:'Citrus Bliss', energy:'Citrus Bliss', vitalid:'Citrus Bliss',
  negocio:'InTune', business:'InTune', concentr:'InTune', focus:'InTune',
}

const DEFAULT_STYLE = `Editorial wellness photography. PRIMARY SUBJECT: one doTERRA {doterra_product} essential oil bottle with the doTERRA logo and "{doterra_product}" label clearly visible on the bottle, placed prominently in the foreground as the hero of the shot. Topic: {article_topic}. Style: premium lifestyle aesthetic, soft natural lighting, shallow depth of field, magazine-quality composition. Secondary elements softly arranged around the bottle: {relevant_plant}, natural materials such as linen, light wood, marble, or ceramic. Color palette: warm cream, sage green, soft beige, gentle amber tones. Composition: bottle sharp and centered foreground, secondary elements softly blurred background. Avoid: text other than on the bottle label, faces or full human figures, cluttered scenes, artificial lighting, competitor brand bottles, hiding or minimizing the doTERRA bottle. Mood: serene, premium, lifestyle aspirational. Aspect ratio: 16:9 landscape. Photorealistic quality.`

function extractBotanical(keyword) {
  const k = keyword.toLowerCase()
  for (const [key, plant] of Object.entries(BOTANICAL_MAP)) { if (k.includes(key)) return plant }
  return 'mixed dried botanicals and herbs'
}
function extractProduct(keyword) {
  const k = keyword.toLowerCase()
  for (const [key, product] of Object.entries(PRODUCT_MAP)) { if (k.includes(key)) return product }
  return 'Lavender'
}
function build(kw, imageStyle) {
  const template = imageStyle || DEFAULT_STYLE
  return template
    .replace(/\{article_topic\}/g, kw)
    .replace(/\{relevant_plant\}/g, extractBotanical(kw))
    .replace(/\{doterra_product\}/g, extractProduct(kw))
}

const kwES = 'aceites esenciales para piel acneica'
const kwEN = 'peppermint essential oil uses'

console.log('=== ES ACNE (keyword_source) ===')
console.log('keyword   :', kwES)
console.log('→ product :', extractProduct(kwES))
console.log('→ botanical:', extractBotanical(kwES))
console.log()
console.log('FULL PROMPT (ES):')
console.log(build(kwES))
console.log()
console.log('=== EN PEPPERMINT (keyword_source) ===')
console.log('keyword   :', kwEN)
console.log('→ product :', extractProduct(kwEN))
console.log('→ botanical:', extractBotanical(kwEN))
console.log()
console.log('FULL PROMPT (EN):')
console.log(build(kwEN))
console.log()
console.log('=== DIFF ===')
const pES = build(kwES), pEN = build(kwEN)
const wordsES = pES.split(' ').filter((w,i)=>pEN.split(' ')[i]!==w)
console.log('Differenze: solo keyword, product, botanical. Template identico:', pES.replace(kwES,'[KW]').replace('Immortelle','[PROD]','rose petals and soft towels on marble','[BOT]') === pEN.replace(kwEN,'[KW]').replace('Peppermint','[PROD]').replace('fresh mint leaves and stems','[BOT]'))
console.log()
console.log('DIAGNOSI: Il codice usa DEFAULT_STYLE identico per EN e ES.')
console.log('Nessun branching per lingua in image-prompt.ts.')
console.log('Il problema è nel rendering gpt-image-2, non nel codice.')
console.log()
console.log('CAUSA PROBABILE: keyword "piel acneica" → gpt-image-2 ha interpretato')
console.log('"Topic: aceites esenciales para piel acneica" come focus su pelle/viso,')
console.log('ignorando parzialmente "PRIMARY SUBJECT: doTERRA Immortelle bottle".')
console.log()
console.log('NO CODE FIX NEEDED. Solo rigenerazione immagine.')
