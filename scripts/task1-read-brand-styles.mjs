import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const { data: brands, error } = await sb.from('brands')
  .select('id, language_code, brand_name, brand_dna_image_style')
  .eq('active', true)
  .order('language_code')

if (error) { console.log('ERROR:', error.message); process.exit(1) }

for (const b of brands ?? []) {
  console.log('═'.repeat(72))
  console.log(`[${b.language_code.toUpperCase()}] ${b.brand_name}`)
  console.log(`ID: ${b.id}`)
  console.log(`brand_dna_image_style:`)
  if (b.brand_dna_image_style) {
    console.log(`  "${b.brand_dna_image_style}"`)
  } else {
    console.log(`  ❌ NULL`)
  }
}
console.log('═'.repeat(72))
