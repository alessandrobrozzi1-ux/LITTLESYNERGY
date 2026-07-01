import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// Tutti i brand_dna_image_style per tutti i brand attivi
const { data: brands } = await sb.from('brands')
  .select('id, language_code, brand_name, brand_dna_image_style')
  .eq('active', true)
  .order('language_code')

console.log('═'.repeat(80))
console.log('BRAND IMAGE STYLES (brand_dna_image_style)')
console.log('═'.repeat(80))
for (const b of brands ?? []) {
  console.log(`\n[${b.language_code.toUpperCase()}] ${b.brand_name}`)
  console.log(`  id   : ${b.id}`)
  console.log(`  style: ${b.brand_dna_image_style ?? '❌ NULL (usa DEFAULT_STYLE hardcoded)'}`)
}
