// Retro PT: converte i link gateway (office.doterra) → shop (shop.doterra.com/PT/pt_PT, OwnerID 15958005).
//  - anchor = nome prodotto nativo → URL prodotto shop
//  - anchor = CTA/descrittivo → shop affiliate base (essential-oils)
//  - oli FORTI in frase-avvertenza → testo semplice (presidio bambini: linkare = avallare)
// Floor ≥2, poi re-embed. Nessun oli forte linkato in avvertenza.
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
readFileSync(join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const OID = '15958005'
const AFFILIATE = `https://shop.doterra.com/PT/pt_PT/shop/essential-oils/?OwnerID=${OID}`
const STRONG = /(peppermint|eucalyptus|rosemary|wintergreen|cinnamon|clove|oregano|thyme|deep-blue|doterra-air|zengest|onguard|hortelã-pimenta|eucalipto|alecrim|canela|cravo|orégão|tomilho)/i
const WARN = /\b(evita|evitar|evite|nunca|n[ãa]o adequad\w*|n[ãa]o segur\w*|mantenha afastad\w*|n[ãa]o use|n[ãa]o difunda|aten[çc][ãa]o|cuidado)\b/i
const DOTERRA = /\[([^\]]+)\]\((https?:\/\/[^)\s]*doterra[^)\s]*)\)/gi
const countLinks = (c) => (c.match(/\[[^\]]+\]\(https?:\/\/[^)\s]*doterra[^)\s]*\)/gi) ?? []).length

const run = async () => {
  const { data: b } = await sb.from('brands').select('id').eq('language_code', 'pt').single()
  const { data: le } = await sb.from('link_expert').select('anchor_text, full_url').eq('brand_id', b.id).eq('active', true)
  const map = new Map(le.map(r => [r.anchor_text.toLowerCase(), r.full_url]))

  const { data: arts } = await sb.from('articles').select('id, brand_id, slug, title, meta_description, content_markdown').eq('brand_id', b.id).eq('status', 'published')
  let fixed = 0
  for (const a of arts) {
    const lines = a.content_markdown.split('\n')
    const nc = lines.map(line => {
      const warned = WARN.test(line)
      return line.replace(DOTERRA, (full, anchor, u) => {
        const shopUrl = map.get(anchor.trim().toLowerCase())
        // oli forte in frase-avvertenza → testo semplice (mai linkare ciò che sconsigli)
        if (warned && (STRONG.test(anchor) || (shopUrl && STRONG.test(shopUrl)))) return anchor
        if (/shop\.doterra/.test(u)) return full        // già shop, lascia
        if (shopUrl) return `[${anchor}](${shopUrl})`    // prodotto → URL prodotto
        return `[${anchor}](${AFFILIATE})`               // CTA/descrittivo → shop affiliate base
      })
    }).join('\n')

    if (nc === a.content_markdown) { console.log(`  = ${a.slug} (già ok)`); continue }
    await sb.from('articles').update({ content_markdown: nc }).eq('id', a.id)
    const res = await openai.embeddings.create({ model: 'text-embedding-3-small', input: [a.title, a.meta_description, nc.slice(0, 2000)].join('\n') })
    await sb.from('article_embeddings').upsert({ article_id: a.id, brand_id: a.brand_id, embedding: '[' + res.data[0].embedding.join(',') + ']', generated_at: new Date().toISOString() }, { onConflict: 'article_id' })
    const links = countLinks(nc)
    const gw = (nc.match(/office\.doterra/g) ?? []).length
    const strongLinked = [...nc.matchAll(DOTERRA)].filter(m => STRONG.test(m[2])).length
    console.log(`  ✔ ${a.slug}: link=${links} gateway-residui=${gw} oli-forti-linkati=${strongLinked}`)
    fixed++
  }
  console.log(`\n${fixed} articoli PT convertiti a shop`)

  // verifica globale PT
  const { data: check } = await sb.from('articles').select('slug, content_markdown').eq('brand_id', b.id).eq('status', 'published')
  let sub = 0, gwTot = 0, noId = 0, strongW = 0
  for (const a of check) {
    if (countLinks(a.content_markdown) < 2) sub++
    gwTot += (a.content_markdown.match(/office\.doterra/g) ?? []).length
    for (const m of a.content_markdown.matchAll(DOTERRA)) if (!/OwnerID=15958005/.test(m[2]) && /shop\.doterra/.test(m[2])) noId++
  }
  console.log(`\n── verifica PT published ──`)
  console.log(`  sotto floor 2: ${sub} ${sub === 0 ? '✅' : '⚠️'} | gateway residui: ${gwTot} ${gwTot === 0 ? '✅' : '⚠️'} | shop senza OwnerID: ${noId} ${noId === 0 ? '✅' : '❌'}`)
}
run()
