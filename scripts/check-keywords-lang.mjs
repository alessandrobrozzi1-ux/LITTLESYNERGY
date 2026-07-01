/**
 * Check keywords table — sono in lingua locale o in inglese?
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const { data: brands } = await sb.from('brands')
  .select('id, language_code, brand_name')
  .eq('active', true)

for (const b of brands) {
  const { data: kws } = await sb.from('keywords')
    .select('keyword, status')
    .eq('brand_id', b.id)
    .limit(5)

  console.log(`\n[${b.language_code.toUpperCase()}] ${b.brand_name}`)
  for (const k of kws ?? []) {
    console.log(`  [${k.status}] "${k.keyword}"`)
  }
}
