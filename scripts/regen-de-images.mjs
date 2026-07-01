// Production-identical buildImagePrompt — copied 1:1 from lib/image-prompt.ts
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import OpenAI from 'openai'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const BOTANICAL_MAP = {
  lavand:'lavender sprigs and purple flowers',lavender:'lavender sprigs and purple flowers',
  menta:'fresh mint leaves and stems',peppermint:'fresh mint leaves and stems',
  incienso:'frankincense resin chunks and dried botanicals',frankincense:'frankincense resin chunks',
  bergamot:'bergamot citrus slices and zest',bergamota:'bergamot citrus slices and green leaves',
  limon:'lemon slices and citrus zest',lemon:'lemon slices and citrus zest',
  naranja:'orange blossom and citrus fruit',orange:'orange blossom and citrus slices',
  romero:'fresh rosemary sprigs',rosemary:'fresh rosemary sprigs',
  eucalipto:'eucalyptus leaves and branches',eucalyptus:'eucalyptus leaves and branches',
  manzanilla:'chamomile flowers and dried petals',chamomile:'chamomile flowers',
  canela:'cinnamon sticks and star anise',cinnamon:'cinnamon sticks',
  ylang:'ylang ylang flowers and tropical petals',
  geranio:'pink geranium petals',geranium:'pink geranium petals',
  cedro:'cedar wood chips and bark',cedar:'cedar wood chips and bark',
  vetiver:'dried vetiver roots',
  serenity:'lavender and roman chamomile flowers',
  onguard:'wild orange slices, clove buds, and cinnamon sticks','on guard':'wild orange slices, clove buds, and cinnamon sticks',
  balance:'spruce branch, rosewood shavings, and blue chamomile',
  deepblue:'wintergreen leaves and peppermint sprigs','deep blue':'wintergreen leaves and peppermint sprigs',
  'tea tree':'fresh green tea tree leaves and branches',teatree:'fresh green tea tree leaves and branches',
  melaleuca:'fresh green tea tree leaves and branches',arbol:'fresh green tea tree leaves and branches',
  acne:'fresh tea tree leaves and lavender sprigs',acnei:'fresh tea tree leaves and lavender sprigs',
  sleep:'lavender sprigs and soft linen',dormir:'lavender sprigs and soft linen',
  skincare:'rose petals and soft white towels on marble',piel:'rose petals and soft towels on marble',
  limpi:'lemon slices and eucalyptus leaves',clean:'lemon slices and eucalyptus leaves',
  energi:'sliced citrus fruits and fresh mint leaves',energy:'sliced citrus fruits and fresh mint leaves',
  focus:'rosemary sprigs and clean minimal desk elements',
  // DE
  schlaf:'soft linen pillow, warm candlelight, calming bedroom elements',
  haut:'rose petals and soft white towels on marble',hautpflege:'rose petals and soft white towels on marble',
  akne:'fresh tea tree leaves and lavender sprigs',
  reinigung:'lemon slices and eucalyptus leaves on a bright surface',
  energie:'sliced citrus fruits and fresh mint leaves',
  fokus:'rosemary sprigs and a small potted plant on a desk',
  wellness:'fresh botanicals and natural spa elements on marble',
  wohlbefinden:'fresh botanicals and natural spa elements on marble',
  entspannung:'lavender sprigs and soft folded linen',stress:'lavender sprigs and soft folded linen',
}

const PRODUCT_MAP = {
  lavand:'Lavender',lavender:'Lavender',menta:'Peppermint',peppermint:'Peppermint',
  incienso:'Frankincense',frankincense:'Frankincense',bergamot:'Bergamot',bergamota:'Bergamot',
  limon:'Lemon',lemon:'Lemon',naranja:'Wild Orange',orange:'Wild Orange',
  romero:'Rosemary',rosemary:'Rosemary',eucalipto:'Eucalyptus',eucalyptus:'Eucalyptus',
  manzanilla:'Roman Chamomile',chamomile:'Roman Chamomile',canela:'Cinnamon',cinnamon:'Cinnamon',
  ylang:'Ylang Ylang',geranio:'Geranium',geranium:'Geranium',cedro:'Cedarwood',cedar:'Cedarwood',
  vetiver:'Vetiver',serenity:'Serenity',onguard:'On Guard','on guard':'On Guard',
  balance:'Balance',deepblue:'Deep Blue','deep blue':'Deep Blue',
  'tea tree':'Tea Tree',teatree:'Tea Tree',melaleuca:'Tea Tree',arbol:'Tea Tree',acne:'Tea Tree',
  sleep:'Serenity',dormir:'Serenity',skincare:'Immortelle',piel:'Immortelle',belleza:'Immortelle',
  limpi:'On Guard',clean:'On Guard',hogar:'On Guard',
  energi:'Citrus Bliss',energy:'Citrus Bliss',focus:'InTune',concentr:'InTune',
}

const PRODUCT_NAME_MAP = {
  'árbol de té':'Tea Tree','arbol de te':'Tea Tree','melaleuca':'Tea Tree','tea tree':'Tea Tree',
  'menta piperita':'Peppermint','menta':'Peppermint','peppermint':'Peppermint',
  'naranja silvestre':'Wild Orange','naranja':'Wild Orange','wild orange':'Wild Orange',
  'lavanda':'Lavender','lavender':'Lavender','incienso':'Frankincense','frankincense':'Frankincense',
  'limón':'Lemon','limon':'Lemon','lemon':'Lemon','romero':'Rosemary','rosemary':'Rosemary',
  'eucalipto':'Eucalyptus','eucalyptus':'Eucalyptus','bergamota':'Bergamot','bergamot':'Bergamot',
  'canela':'Cinnamon','cinnamon':'Cinnamon','ylang ylang':'Ylang Ylang',
  'geranio':'Geranium','geranium':'Geranium','cedro':'Cedarwood','cedar':'Cedarwood',
  'vetiver':'Vetiver','on guard':'On Guard','serenity':'Serenity','balance':'Balance',
  'deep blue':'Deep Blue','digestzen':'DigestZen','breathe':'Breathe',
  'immortelle':'Immortelle','citrus bliss':'Citrus Bliss','intune':'InTune',
  // DE
  'lavendelöl':'Lavender','lavendel':'Lavender','pfefferminzöl':'Peppermint','pfefferminze':'Peppermint',
  'wilde orange':'Wild Orange','weihrauch':'Frankincense','weihrauchöl':'Frankincense',
  'zitronenöl':'Lemon','zitrone':'Lemon','teebaum':'Tea Tree','teebaumöl':'Tea Tree',
  'eukalyptus':'Eucalyptus','eukalyptusöl':'Eucalyptus','rosmarin':'Rosemary','rosmarinöl':'Rosemary',
  'bergamotte':'Bergamot','zimt':'Cinnamon','kamille':'Roman Chamomile',
  'tiefblau':'Deep Blue','gelassenheit':'Serenity','atemwege':'Breathe','verdauung':'DigestZen',
}

const DEFAULT_STYLE = `Editorial wellness photography. PRIMARY SUBJECT: one doTERRA {doterra_product} essential oil bottle with the doTERRA logo and "{doterra_product}" label clearly visible on the bottle, placed prominently in the foreground as the hero of the shot. Topic: {article_topic}. Style: premium lifestyle aesthetic, soft natural lighting, shallow depth of field, magazine-quality composition. Secondary elements softly arranged around the bottle: {relevant_plant}, natural materials such as linen, light wood, marble, or ceramic. Color palette: warm cream, sage green, soft beige, gentle amber tones. Composition: bottle sharp and centered foreground, secondary elements softly blurred background. Avoid: text other than on the bottle label, faces or full human figures, cluttered scenes, artificial lighting, competitor brand bottles, hiding or minimizing the doTERRA bottle. Mood: serene, premium, lifestyle aspirational. Aspect ratio: 16:9 landscape. Photorealistic quality.`

function extractLinkedProducts(contentMarkdown) {
  const pattern = /\[([^\]]+)\]\(https?:\/\/[^)]*doterra\.com[^)]+\)/g
  const found = [], seen = new Set()
  let match
  while ((match = pattern.exec(contentMarkdown)) !== null) {
    const anchor = match[1].trim()
    if (/^doTERRA$/i.test(anchor) || anchor.length > 50) continue
    const k = anchor.toLowerCase()
    let canonical = anchor
    for (const [key, val] of Object.entries(PRODUCT_NAME_MAP)) {
      if (k.includes(key)) { canonical = val; break }
    }
    if (!seen.has(canonical)) { seen.add(canonical); found.push(canonical) }
    if (found.length >= 3) break
  }
  return found
}

function extractBotanical(keyword) {
  const k = keyword.toLowerCase()
  for (const [key, plant] of Object.entries(BOTANICAL_MAP)) {
    if (k.includes(key)) return plant
  }
  return 'mixed dried botanicals and herbs'
}

function extractProduct(keyword) {
  const k = keyword.toLowerCase()
  for (const [key, product] of Object.entries(PRODUCT_MAP)) {
    if (k.includes(key)) return product
  }
  return 'Lavender'
}

function buildImagePrompt(keyword, imageStyle, contentMarkdown) {
  const linkedProducts = contentMarkdown ? extractLinkedProducts(contentMarkdown) : []
  const botanical = extractBotanical(keyword)
  const primaryProduct = linkedProducts[0] ?? extractProduct(keyword)
  const template = imageStyle || DEFAULT_STYLE
  let prompt = template
    .replace(/\{article_topic\}/g, keyword)
    .replace(/\{relevant_plant\}/g, botanical)
    .replace(/\{doterra_product\}/g, primaryProduct)
  if (linkedProducts.length >= 2) {
    const secondary = linkedProducts[1]
    prompt = prompt.replace(
      'Avoid: text other than',
      `Additional context: ${secondary} essential oil bottle softly placed in background composition. Avoid: text other than`
    )
  }
  return prompt
}

// --- MAIN ---
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const ARTICLES = [
  'f75d881f-211a-4ebd-8b4f-d11daefb9a8f', // lavendeloel
  'cfec6ce0-e970-4c35-84ea-82b7a884156e', // wie-doterra-kaufen
]

for (const id of ARTICLES) {
  const { data } = await supabase
    .from('articles')
    .select('title, keyword_source, content_markdown')
    .eq('id', id)
    .single()

  console.log(`\n📄 ${data.title}`)

  const linkedProducts = extractLinkedProducts(data.content_markdown)
  const primaryProduct = linkedProducts[0] ?? extractProduct(data.keyword_source)
  console.log(`  linked products: [${linkedProducts.join(', ')}]`)
  console.log(`  primary product: ${primaryProduct}`)

  const prompt = buildImagePrompt(data.keyword_source, null, data.content_markdown)
  console.log(`  prompt (100): ${prompt.slice(0, 100)}...`)

  const response = await openai.images.generate({
    model: 'gpt-image-2',
    prompt,
    size: '1792x1024',
    quality: 'medium',
    n: 1,
  })

  const buf = Buffer.from(response.data[0].b64_json, 'base64')
  const filename = id + '-' + Date.now() + '.png'
  await supabase.storage.from('article-images').upload(filename, buf, { contentType: 'image/png', upsert: true })
  const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(filename)
  await supabase.from('articles').update({ featured_image: publicUrl }).eq('id', id)
  console.log(`  ✅ ${publicUrl}`)
}

console.log('\nDONE')
