import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import OpenAI from 'openai'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const PRODUCT_NAME_MAP = {
  'lavendeloel': 'Lavender', 'lavendelol': 'Lavender', 'lavendel': 'Lavender', 'lavendelöl': 'Lavender',
  'pfefferminzoel': 'Peppermint', 'pfefferminze': 'Peppermint', 'pfefferminzöl': 'Peppermint',
  'wilde orange': 'Wild Orange', 'weihrauch': 'Frankincense', 'weihrauchoel': 'Frankincense', 'weihrauchöl': 'Frankincense',
  'zitronenoel': 'Lemon', 'zitrone': 'Lemon', 'zitronenöl': 'Lemon',
  'teebaum': 'Tea Tree', 'teebaumoel': 'Tea Tree', 'teebaumöl': 'Tea Tree',
  'eukalyptus': 'Eucalyptus', 'eukalyptusoel': 'Eucalyptus', 'eukalyptusöl': 'Eucalyptus',
  'rosmarin': 'Rosemary', 'rosmarinoel': 'Rosemary', 'rosmarinöl': 'Rosemary',
  'bergamotte': 'Bergamot', 'zimt': 'Cinnamon', 'kamille': 'Roman Chamomile',
  'tiefblau': 'Deep Blue', 'gelassenheit': 'Serenity', 'atemwege': 'Breathe', 'verdauung': 'DigestZen',
  'lavanda': 'Lavender', 'lavender': 'Lavender', 'peppermint': 'Peppermint', 'frankincense': 'Frankincense',
  'lemon': 'Lemon', 'wild orange': 'Wild Orange', 'on guard': 'On Guard', 'serenity': 'Serenity',
  'breathe': 'Breathe', 'deep blue': 'Deep Blue', 'tea tree': 'Tea Tree', 'melaleuca': 'Tea Tree',
  'eucalyptus': 'Eucalyptus', 'rosemary': 'Rosemary', 'bergamot': 'Bergamot',
  'digestzen': 'DigestZen', 'immortelle': 'Immortelle', 'citrus bliss': 'Citrus Bliss', 'intune': 'InTune',
  'enrolment': null, 'enrollment': null, 'kit': null, 'bundle': null, 'collection': null,
}

const BOTANICAL_MAP = {
  lavand: 'lavender sprigs and purple flowers', lavender: 'lavender sprigs and purple flowers',
  peppermint: 'fresh mint leaves and stems', frankincense: 'frankincense resin chunks',
  lemon: 'lemon slices and citrus zest', orange: 'orange blossom and citrus slices',
  rosemary: 'fresh rosemary sprigs', eucalyptus: 'eucalyptus leaves and branches',
  chamomile: 'chamomile flowers', cinnamon: 'cinnamon sticks',
  'tea tree': 'fresh green tea tree leaves and branches', melaleuca: 'fresh green tea tree leaves and branches',
  schlaf: 'soft linen pillow, warm candlelight, calming bedroom elements',
  haut: 'rose petals and soft white towels on marble',
  wellness: 'fresh botanicals and natural spa elements on marble',
  entspannung: 'lavender sprigs and soft folded linen',
  energie: 'sliced citrus fruits and fresh mint leaves',
}

const PRODUCT_MAP = {
  lavand: 'Lavender', lavender: 'Lavender', peppermint: 'Peppermint', frankincense: 'Frankincense',
  lemon: 'Lemon', orange: 'Wild Orange', rosemary: 'Rosemary', eucalyptus: 'Eucalyptus',
  'tea tree': 'Tea Tree', sleep: 'Serenity', clean: 'On Guard', energy: 'Citrus Bliss', focus: 'InTune',
}

const DEFAULT_STYLE = `Editorial wellness photography. PRIMARY SUBJECT: one doTERRA {doterra_product} essential oil bottle with the doTERRA logo and "{doterra_product}" label clearly visible on the bottle, placed prominently in the foreground as the hero of the shot. Topic: {article_topic}. Style: premium lifestyle aesthetic, soft natural lighting, shallow depth of field, magazine-quality composition. Secondary elements softly arranged around the bottle: {relevant_plant}, natural materials such as linen, light wood, marble, or ceramic. Color palette: warm cream, sage green, soft beige, gentle amber tones. Composition: bottle sharp and centered foreground, secondary elements softly blurred background. Avoid: text other than on the bottle label, faces or full human figures, cluttered scenes, artificial lighting, competitor brand bottles, hiding or minimizing the doTERRA bottle. Mood: serene, premium, lifestyle aspirational. Aspect ratio: 16:9 landscape. Photorealistic quality.`

function extractLinkedProducts(md) {
  const pattern = /\[([^\]]+)\]\(https?:\/\/[^)]*doterra\.com[^)]+\)/g
  const found = [], seen = new Set()
  let match
  while ((match = pattern.exec(md)) !== null) {
    const anchor = match[1].trim()
    if (/^doTERRA$/i.test(anchor) || anchor.length > 50) continue
    const k = anchor.toLowerCase()
    let canonical = null
    for (const [key, val] of Object.entries(PRODUCT_NAME_MAP)) {
      if (k.includes(key)) { canonical = val; break }
    }
    if (canonical && !seen.has(canonical)) { seen.add(canonical); found.push(canonical) }
    if (found.length >= 3) break
  }
  return found
}

function extractBotanical(kw) {
  const k = kw.toLowerCase()
  for (const [key, plant] of Object.entries(BOTANICAL_MAP)) {
    if (k.includes(key)) return plant
  }
  return 'mixed dried botanicals and herbs'
}

function extractProduct(kw) {
  const k = kw.toLowerCase()
  for (const [key, prod] of Object.entries(PRODUCT_MAP)) {
    if (k.includes(key)) return prod
  }
  return 'Lavender'
}

function buildImagePrompt(keyword, contentMarkdown) {
  const linkedProducts = contentMarkdown ? extractLinkedProducts(contentMarkdown) : []
  const botanical = extractBotanical(keyword)
  const primaryProduct = linkedProducts[0] ?? extractProduct(keyword)
  let prompt = DEFAULT_STYLE
    .replace(/\{article_topic\}/g, keyword)
    .replace(/\{relevant_plant\}/g, botanical)
    .replace(/\{doterra_product\}/g, primaryProduct)
  if (linkedProducts.length >= 2) {
    prompt = prompt.replace('Avoid: text other than', `Additional context: ${linkedProducts[1]} essential oil bottle softly placed in background composition. Avoid: text other than`)
  }
  return { prompt, primaryProduct, linkedProducts }
}

const ARTICLES = [
  { id: 'f75d881f-211a-4ebd-8b4f-d11daefb9a8f', label: 'lavendeloel' },
]

for (const { id, label } of ARTICLES) {
  const { data: art } = await supabase.from('articles').select('keyword_source, content_markdown').eq('id', id).single()

  const { prompt, primaryProduct, linkedProducts } = buildImagePrompt(art.keyword_source, art.content_markdown)
  console.log(`\n[${label}]`)
  console.log(`  keyword: ${art.keyword_source}`)
  console.log(`  linked: [${linkedProducts.join(', ')}]`)
  console.log(`  primary: ${primaryProduct}`)
  console.log(`  prompt[:120]: ${prompt.slice(0, 120)}`)

  const response = await openai.images.generate({ model: 'gpt-image-2', prompt, size: '1792x1024', quality: 'medium', n: 1 })
  const buf = Buffer.from(response.data[0].b64_json, 'base64')
  const filename = `${id}-${Date.now()}.png`
  await supabase.storage.from('article-images').upload(filename, buf, { contentType: 'image/png', upsert: true })
  const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(filename)
  await supabase.from('articles').update({ featured_image: publicUrl }).eq('id', id)
  console.log(`  image: ${publicUrl}`)
}

console.log('\nDONE')
