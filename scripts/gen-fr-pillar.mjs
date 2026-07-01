import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const { data: brand } = await sb.from('brands').select('*').eq('id', '82dee695-83be-4e96-94ea-05078dea3681').single()
console.log('Brand:', brand.name, '| lang:', brand.language_code)

const keyword = 'comment acheter doterra reduction'
const slug = 'comment-acheter-doterra'

const prompt = `Tu es un rédacteur expert en bien-être naturel et huiles essentielles pour un blog affilié doTERRA en français.

Voix de marque: ${brand.brand_dna_brand_voice}
Thèmes clés: ${brand.brand_dna_key_themes}
À éviter: ${brand.brand_dna_topics_to_avoid}
Footer obligatoire: ${brand.brand_dna_mandatory_footer}

INSTRUCTION PRINCIPALE:
Écris un article SEO complet en FRANÇAIS sur: "${keyword}"

RÈGLES:
- Titre: naturel, 42-58 caractères, contient le mot-clé principal
- Longueur: 1100-1400 mots
- Structure: H2/H3, paragraphes courts, liste à puces si utile
- Section FAQ obligatoire: 3-4 questions en gras format **Question?** suivie de la réponse
- Liens affiliés markdown: shop.doterra.com/FR/fr_FR/shop/[produit]/?OwnerID=15957920
- Focus article: expliquer comment devenir membre Bien-être doTERRA pour obtenir 25% de réduction, types de kits d'inscription (Home Essentials, Family Essentials, etc.), avantages du programme
- Footer: inclure exactement le footer de marque à la fin

Réponds UNIQUEMENT avec un objet JSON valide (sans markdown wrapper):
{"title": "...", "content": "...(contenu markdown complet)..."}`

console.log('Generating pillar article...')
const msg = await ai.messages.create({
  model: 'claude-opus-4-8',
  max_tokens: 4096,
  messages: [{ role: 'user', content: prompt }]
})

let raw = msg.content[0].text.trim()
// Strip markdown code block if present
if (raw.startsWith('```')) {
  raw = raw.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '')
}

const article = JSON.parse(raw)
console.log('Title:', article.title)
console.log('Content length:', article.content.length, 'chars')
console.log('Word count:', article.content.split(/\s+/).length, 'words')

const { data: inserted, error } = await sb.from('articles').insert({
  brand_id: brand.id,
  title: article.title,
  slug,
  content: article.content,
  keyword,
  status: 'draft',
  is_pillar: true,
  language_code: 'fr'
}).select('id,title,slug,status').single()

if (error) { console.error('DB error:', error.message); process.exit(1) }
console.log('\nInserted pillar article:')
console.log('  ID:', inserted.id)
console.log('  Title:', inserted.title)
console.log('  Slug:', inserted.slug)
console.log('  Status:', inserted.status)
