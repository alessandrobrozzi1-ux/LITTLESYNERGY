import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const ENHANCED = 'Bright, clean lifestyle photography. Natural light, botanical elements, and doTERRA-branded essential oil bottles (amber glass, black cap, minimal white label clearly reading "doTERRA" above the oil name) arranged with diffusers in cozy home settings. Warm earth tones with pops of lavender, green, and soft amber.'

console.log(`STEP 1 — UPDATE brand_dna_image_style enhanced v3.2 (${ENHANCED.length} chars)`)
console.log('═'.repeat(72))

const { data: updated, error } = await sb.from('brands')
  .update({ brand_dna_image_style: ENHANCED })
  .eq('active', true)
  .select('language_code, brand_name, brand_dna_image_style')
if (error) { console.log('❌', error.message); process.exit(1) }
console.log(`✅ Updated ${updated?.length} brand(s)\n`)

// VERIFICA
const { data: all } = await sb.from('brands')
  .select('language_code, brand_dna_image_style')
  .eq('active', true).order('language_code')

let allOk = true
for (const b of all ?? []) {
  const len = b.brand_dna_image_style?.length ?? 0
  const hasBrand = (b.brand_dna_image_style || '').includes('doTERRA-branded')
  const ok = len === ENHANCED.length && hasBrand
  if (!ok) allOk = false
  console.log(`  [${b.language_code.toUpperCase()}] len=${len} | doTERRA-branded: ${hasBrand ? '✅' : '❌'} ${ok ? '' : '⚠️'}`)
}
console.log(`\n${allOk ? '🟢 5/5 brand: image_style enhanced v3.2 identico + clausola doTERRA-branded' : '❌ mismatch'}`)
