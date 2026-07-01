import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const GOLD_STANDARD = 'Bright, clean lifestyle photography. Natural light, botanical elements, essential oil bottles and diffusers in cozy home settings. Warm earth tones with pops of lavender, green, and soft amber.'

console.log('STEP 1 — UPDATE brand_dna_image_style ES/DE/FR/PT')
console.log(`Gold standard: "${GOLD_STANDARD}"`)
console.log('═'.repeat(72))

// UPDATE
const { data: updated, error } = await sb.from('brands')
  .update({ brand_dna_image_style: GOLD_STANDARD })
  .in('language_code', ['es', 'de', 'fr', 'pt'])
  .eq('active', true)
  .select('id, language_code, brand_name, brand_dna_image_style')

if (error) { console.log('❌ ERROR:', error.message); process.exit(1) }

console.log(`✅ Updated ${updated?.length ?? 0} brand(s):`)
for (const b of updated ?? []) {
  console.log(`  [${b.language_code.toUpperCase()}] ${b.brand_name} → style set (${b.brand_dna_image_style?.length} chars)`)
}

// VERIFICA POST-UPDATE: tutti e 5 i brand
console.log('\n── POST-UPDATE VERIFICATION ──')
const { data: all } = await sb.from('brands')
  .select('language_code, brand_name, brand_dna_image_style')
  .eq('active', true)
  .order('language_code')

let allOk = true
for (const b of all ?? []) {
  const len = b.brand_dna_image_style?.length ?? 0
  const ok = len > 0
  if (!ok) allOk = false
  console.log(`  [${b.language_code.toUpperCase()}] len=${len} ${ok ? '✅' : '❌ NULL'} — ${b.brand_name}`)
}
console.log(`\n${allOk ? '✅ ALL 5 BRANDS have image_style set' : '❌ SOME BRANDS MISSING image_style'}`)
