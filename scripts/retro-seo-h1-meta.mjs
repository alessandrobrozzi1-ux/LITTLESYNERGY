// Retro SEO: (1) antepone "# Titolo" agli articoli senza H1; (2) taglia le meta >160 a confine di parola.
// Corpo (oltre l'H1) intatto. Re-embed solo se cambia. Report per issue.
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
readFileSync(join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const trimMeta = (m) => m.length > 160 ? m.slice(0, 160).replace(/\s+\S*$/, '').replace(/[\s,;:]+$/, '') : m

const { data: brands } = await sb.from('brands').select('id, language_code'); const bm = {}; brands.forEach(b => bm[b.id] = b.language_code)
const { data: arts } = await sb.from('articles').select('id, brand_id, slug, title, meta_description, content_markdown').eq('status', 'published')

let h1Fixed = 0, metaFixed = 0
for (const a of arts) {
  let nc = a.content_markdown
  let meta = a.meta_description || ''
  let changed = false
  // H1
  if (!/^#\s+/.test(nc.replace(/^﻿?\s*/, ''))) {
    nc = `# ${a.title}\n\n${nc.replace(/^\s+/, '')}`
    changed = true; h1Fixed++
    console.log(`  H1+ [${bm[a.brand_id]}] ${a.slug}`)
  }
  // meta
  if (meta.length > 160) { meta = trimMeta(meta); changed = true; metaFixed++ }
  if (!changed) continue
  await sb.from('articles').update({ content_markdown: nc, meta_description: meta }).eq('id', a.id)
  const res = await openai.embeddings.create({ model: 'text-embedding-3-small', input: [a.title, meta, nc.slice(0, 2000)].join('\n') })
  await sb.from('article_embeddings').upsert({ article_id: a.id, brand_id: a.brand_id, embedding: '[' + res.data[0].embedding.join(',') + ']', generated_at: new Date().toISOString() }, { onConflict: 'article_id' })
}
console.log(`\nH1 anteposti: ${h1Fixed} | meta tagliate: ${metaFixed}`)

// verifica
const { data: ck } = await sb.from('articles').select('title, meta_description, content_markdown').eq('status', 'published')
let noH1 = 0, longMeta = 0
for (const a of ck) { if (!/^#\s+/.test((a.content_markdown || '').replace(/^﻿?\s*/, ''))) noH1++; if ((a.meta_description || '').length > 160) longMeta++ }
console.log(`residui: no-H1 ${noH1} ${noH1 === 0 ? '✅' : '⚠️'} | meta>160 ${longMeta} ${longMeta === 0 ? '✅' : '⚠️'}`)
