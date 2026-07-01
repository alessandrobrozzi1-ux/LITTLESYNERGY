import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const ART_ID = '760941a0-12ff-4eab-b3bf-0e9d6d5a232c'
const { data: art } = await supabase.from('articles').select('content_markdown').eq('id', ART_ID).single()

let md = art.content_markdown

const replacements = [
  ['shop/home-essentials-enrolment-kit/', 'shop/home-essentials-enrolment/'],
  ['shop/natural-solutions-enrolment-kit/', 'shop/natural-solutions-enrolment/'],
  ['shop/foundational-wellness-bundle/', 'shop/foundational-wellness/'],
]

let changes = 0
for (const [oldPart, newPart] of replacements) {
  const count = (md.split(oldPart).length - 1)
  if (count > 0) {
    md = md.split(oldPart).join(newPart)
    console.log(`Fixed ${count}x: ${oldPart} → ${newPart}`)
    changes += count
  } else {
    console.log(`Not found: ${oldPart}`)
  }
}

if (changes > 0) {
  await supabase.from('articles').update({ content_markdown: md }).eq('id', ART_ID)
  console.log(`\nArticle updated (${changes} fixes)`)
}

// Verify
const links = [...md.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+doterra[^)]+)\)/g)]
console.log('\nLinks after fix:')
links.forEach(m => console.log(`  [${m[1]}] → ${m[2].replace('https://shop.doterra.com/DE/de_DE/shop/', '').replace('/?OwnerID=15957920', '')}`))
