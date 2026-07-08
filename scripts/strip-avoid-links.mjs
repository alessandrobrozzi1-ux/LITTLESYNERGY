// Bonifica: rimuove i link markdown dagli oli in lista da-evitare/tossici (li lascia testo semplice) + re-embed.
// Regola cervello: link doTERRA SOLO su oli raccomandati/sicuri, mai su un olio in un'avvertenza.
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
readFileSync(join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SLUGS = 'peppermint|eucalyptus|rosemary|wintergreen|cinnamon|clove|oregano|thyme'
const LINK = new RegExp(String.raw`\[([^\]]+)\]\((https?://[^)]*(?:${SLUGS})[^)]*)\)`, 'gi')

const { data } = await sb.from('articles').select('id,brand_id,slug,title,meta_description,content_markdown')
let fixed = 0
for (const a of data) {
  const c = a.content_markdown || ''
  const hits = c.match(LINK) || []
  if (!hits.length) continue
  const nc = c.replace(LINK, '$1')
  await sb.from('articles').update({ content_markdown: nc }).eq('id', a.id)
  const res = await openai.embeddings.create({ model: 'text-embedding-3-small', input: [a.title, a.meta_description, nc.slice(0, 2000)].join('\n') })
  await sb.from('article_embeddings').upsert({ article_id: a.id, brand_id: a.brand_id, embedding: '[' + res.data[0].embedding.join(',') + ']', generated_at: new Date().toISOString() }, { onConflict: 'article_id' })
  fixed++
  console.log('  ✔ ' + a.slug + ' (' + hits.length + '): ' + hits.map(h => h.match(/\[([^\]]+)\]/)[1]).join(', '))
}
console.log(fixed ? ('\n' + fixed + ' articoli bonificati + re-embedded') : '✅ nessun link-in-avvertenza residuo')
