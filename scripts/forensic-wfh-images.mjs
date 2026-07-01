import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const KEEPERS = {
  en: 'f81feb5b-f8bf-4251-8361-0f014dfd53cc',
  es: 'cdb47f08-73ca-4066-a36e-550f1a047f2d',
  de: '5c900353-3780-4593-bf6c-2e02b5263c9d',
  fr: 'ed3440e4-f1ef-41b4-8961-5e5b4fd68e64',
  pt: '34626728-593d-418b-b6a2-db1688152d3d',
}

console.log('═'.repeat(80))
console.log('FORENSIC — link doTERRA + immagine corrente per i 5 keeper')
console.log('═'.repeat(80))

for (const [lang, id] of Object.entries(KEEPERS)) {
  const { data: a } = await sb.from('articles')
    .select('slug, featured_image, content_markdown').eq('id', id).single()
  const md = a.content_markdown ?? ''
  const links = [...md.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]*doterra\.com[^)]*)\)/gi)]
  const anchors = [...new Set(links.map(m => m[1]))]
  console.log(`\n[${lang.toUpperCase()}] ${a.slug}`)
  console.log(`  doTERRA links: ${links.length} | anchor unici: ${anchors.length}`)
  console.log(`  anchors: ${anchors.join(', ')}`)
  console.log(`  IMG: ${a.featured_image}`)
}
console.log('\n' + '═'.repeat(80))
console.log('Nota: con image_style = gold standard (no placeholder), questi link')
console.log('NON entrano nel prompt immagine. Output = solo varianza gpt-image-2.')
