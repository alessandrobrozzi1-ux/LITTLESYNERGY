import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local')
const env = fs.readFileSync(envPath, 'utf-8')
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && v.length) process.env[k.trim()] = v.join('=').trim()
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const KEYWORD = 'aceite esencial de incienso frankincense beneficios'

const prompt = `Editorial photograph for wellness blog. Subject: ${KEYWORD}. Style: clean, minimal, natural light, soft pastel palette (cream, sage green, warm wood tones). Composition: top-down or 45-degree angle, shallow depth of field. Include: doTERRA-style essential oil bottle (amber glass, no labels visible), fresh botanicals (frankincense resin chunks and dried botanicals), natural surface (linen, wood, or marble). Avoid: text, logos, people, faces, hands, fingers, arms, artificial lighting, cluttered composition. Mood: serene, premium, lifestyle. Photorealistic quality.`

console.log('🎨 Generando immagine con gpt-image-2 medium...')
console.log('Prompt:', prompt)
console.log()

const t0 = Date.now()
const res = await openai.images.generate({
  model: 'gpt-image-2',
  prompt,
  n: 1,
  size: '1024x1024',
  quality: 'medium',
})

const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
console.log(`✅ Generata in ${elapsed}s`)

const b64 = res.data?.[0]?.b64_json
if (!b64) { console.error('❌ Nessuna immagine ricevuta'); process.exit(1) }

const outPath = path.join(__dirname, 'test-image-output.png')
fs.writeFileSync(outPath, Buffer.from(b64, 'base64'))
console.log(`📁 Salvata in: ${outPath}`)
console.log(`💰 Costo stimato: ~$0.053`)
