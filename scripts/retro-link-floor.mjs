// Retro-applica il LINK FLOOR (>=2 link doTERRA) agli articoli published che ne hanno meno.
// Stessa logica di ensureDoterraBridge: linkifica menzioni testuali di prodotti SICURI già
// presenti nel corpo. Mai oli avoid-list, mai testo già dentro un link. + re-embed.
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
readFileSync(join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const AVOID = /(peppermint|eucalyptus|rosemary|wintergreen|cinnamon|clove|oregano|thyme)/i
const countLinks = (md) => (md.match(/\[[^\]]+\]\(https?:\/\/[^)]*doterra[^)]*\)/gi) ?? []).length
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function bridge(content, linkExpert) {
  let out = content
  if (countLinks(out) >= 2) return out
  const cands = linkExpert.filter(e => e.anchor_text && e.anchor_text.length >= 3 && !AVOID.test(e.full_url))
  for (const e of cands) {
    if (countLinks(out) >= 2) break
    const a = e.anchor_text
    if (new RegExp(`\\[[^\\]]*${escapeRe(a)}[^\\]]*\\]\\(`, 'i').test(out)) continue
    const spans = []
    for (const m of out.matchAll(/\[[^\]]*\]\([^)]*\)/g)) spans.push([m.index, m.index + m[0].length])
    const re = new RegExp(`\\b${escapeRe(a)}\\b`, 'i')
    let idx = -1, from = 0
    for (;;) {
      const m = re.exec(out.slice(from)); if (!m) break
      const abs = from + m.index
      if (!spans.some(([s, t]) => abs >= s && abs < t)) { idx = abs; break }
      from = abs + m[0].length
    }
    if (idx < 0) continue
    const matched = out.slice(idx, idx + a.length)
    out = `${out.slice(0, idx)}[${matched}](${e.full_url})${out.slice(idx + a.length)}`
  }
  return out
}

const { data: brands } = await sb.from('brands').select('id, language_code, affiliate_base_url')
const bm = {}; brands.forEach(b => bm[b.id] = b)

const { data: arts } = await sb.from('articles').select('id, brand_id, slug, title, meta_description, content_markdown').eq('status', 'published')

let fixed = 0, skipped = 0
for (const a of arts) {
  const before = countLinks(a.content_markdown)
  if (before >= 2) continue
  const b = bm[a.brand_id]
  if (b.affiliate_base_url.includes('office.doterra')) { console.log(`  [${b.language_code}] ${a.slug}: world-link, salto`); skipped++; continue }
  const { data: le } = await sb.from('link_expert').select('anchor_text, full_url').eq('brand_id', a.brand_id).eq('active', true).order('priority', { ascending: false })
  const nc = bridge(a.content_markdown, le ?? [])
  const after = countLinks(nc)
  if (after === before) { console.log(`  [${b.language_code}] ${a.slug}: ${before} → ${after} ⚠️ nessuna ancora sicura trovata nel testo`); skipped++; continue }
  await sb.from('articles').update({ content_markdown: nc }).eq('id', a.id)
  const res = await openai.embeddings.create({ model: 'text-embedding-3-small', input: [a.title, a.meta_description, nc.slice(0, 2000)].join('\n') })
  await sb.from('article_embeddings').upsert({ article_id: a.id, brand_id: a.brand_id, embedding: '[' + res.data[0].embedding.join(',') + ']', generated_at: new Date().toISOString() }, { onConflict: 'article_id' })
  console.log(`  [${b.language_code}] ${a.slug}: ${before} → ${after} link ✅`)
  fixed++
}
console.log(`\n${fixed} articoli portati a floor, ${skipped} saltati`)

// verifica globale
console.log('\n── verifica globale published ──')
const { data: all } = await sb.from('articles').select('brand_id, slug, content_markdown').eq('status', 'published')
let sub = 0, badLink = 0
for (const a of all) {
  const n = countLinks(a.content_markdown)
  const bad = (a.content_markdown.match(/\[[^\]]+\]\(https?:\/\/[^)]*doterra[^)]*\)/gi) ?? []).filter(l => AVOID.test(l)).length
  if (n < 2) { sub++; console.log(`  ⚠️ sotto floor: [${bm[a.brand_id].language_code}] ${a.slug} (${n})`) }
  if (bad) { badLink += bad; console.log(`  ❌ link su avoid-oil: [${bm[a.brand_id].language_code}] ${a.slug} (${bad})`) }
}
console.log(`\narticoli sotto floor: ${sub} ${sub === 0 ? '✅' : '⚠️'} | link su oli avoid: ${badLink} ${badLink === 0 ? '✅ presidio integro' : '❌'}`)
