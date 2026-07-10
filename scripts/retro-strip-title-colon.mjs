// PATCH G retro — toglie il pattern "X: Y" da title + H1 dei published. Corpo intatto. Re-embed.
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
readFileSync(join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const stripTitleColon = (s) => s
  .replace(/：/g, '、').replace(/\s*:\s*/g, ', ').replace(/[,、]\s*$/g, '').replace(/、\s+/g, '、').trim()

const { data: arts } = await sb.from('articles').select('id, brand_id, slug, title, meta_description, content_markdown').eq('status', 'published')
let fixed = 0
for (const a of arts) {
  const newTitle = stripTitleColon(a.title)
  const nc = a.content_markdown.replace(/^(#\s+)(.+)$/m, (_m, h, rest) => h + stripTitleColon(rest))
  const h1Changed = nc !== a.content_markdown
  if (newTitle === a.title && !h1Changed) continue
  await sb.from('articles').update({ title: newTitle, content_markdown: nc }).eq('id', a.id)
  const res = await openai.embeddings.create({ model: 'text-embedding-3-small', input: [newTitle, a.meta_description, nc.slice(0, 2000)].join('\n') })
  await sb.from('article_embeddings').upsert({ article_id: a.id, brand_id: a.brand_id, embedding: '[' + res.data[0].embedding.join(',') + ']', generated_at: new Date().toISOString() }, { onConflict: 'article_id' })
  fixed++
  console.log(`  ✔ ${a.slug}\n      title: "${a.title}" → "${newTitle}"${h1Changed ? ' (+H1)' : ''}`)
}
console.log(`\n${fixed} articoli corretti + re-embedded`)

// verifica: 0 due-punti residui nei titoli/H1
const { data: check } = await sb.from('articles').select('title, content_markdown').eq('status', 'published')
let resid = 0
for (const a of check) {
  const h1 = (a.content_markdown.match(/^#\s+(.+)$/m) || [])[1] || ''
  if (/[:：]/.test(a.title) || /[:：]/.test(h1)) { resid++; console.log(`  ⚠️ residuo: ${a.title}`) }
}
console.log(`residui due-punti nei titoli/H1: ${resid} ${resid === 0 ? '✅' : '❌'}`)
