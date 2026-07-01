require('fs').readFileSync(require('path').join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const serviceKey = process.env.SUPABASE_SERVICE_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const BID = 'a20e4f07-e572-4605-acfc-5c53355f2ada'
const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' }

// Run this SQL first in Supabase SQL Editor:
// ALTER TABLE brands ADD COLUMN IF NOT EXISTS brand_dna_image_style text;

const brand_dna_image_style = `Editorial photograph for wellness blog. Subject: {article_topic}. Style: clean, minimal, natural light, soft pastel palette (cream, sage green, warm wood tones). Composition: top-down or 45-degree angle, shallow depth of field. Include: doTERRA-style essential oil bottle (amber glass, no labels visible), fresh botanicals ({relevant_plant}), natural surface (linen, wood, or marble). Avoid: text, logos, people, faces, hands, fingers, arms, artificial lighting, cluttered composition. Mood: serene, premium, lifestyle. Photorealistic quality.`

async function run() {
  const res = await fetch(`${supabaseUrl}/rest/v1/brands?id=eq.${BID}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ brand_dna_image_style }),
  })
  if (res.ok) {
    console.log('✅ brand_dna_image_style set for ES brand')
    console.log('\nSQL to run first in Supabase SQL Editor:')
    console.log('ALTER TABLE brands ADD COLUMN IF NOT EXISTS brand_dna_image_style text;')
  } else {
    console.log('❌', await res.text())
    console.log('\n⚠️  Run this SQL in Supabase SQL Editor first:')
    console.log('ALTER TABLE brands ADD COLUMN IF NOT EXISTS brand_dna_image_style text;')
    console.log('\nThen re-run this script.')
  }
}

run()
