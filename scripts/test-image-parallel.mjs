/**
 * TEST SISTEMICO IMAGE GENERATION v2 — parallelo, 5 lingue
 * 1. Legge content_markdown da articoli pubblicati (analisi link locale)
 * 2. Crea 5 draft in parallelo (keyword ASCII safe)
 * 3. Genera immagini in parallelo
 * NON modifica featured_image degli articoli pubblicati.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const API = 'https://soloseo-alpha.vercel.app'

const BRANDS = [
  { lang: 'EN', id: 'eceba851-228a-45cf-8775-b0f7fc9ae7de', keyword: 'best essential oils for evening relaxation' },
  { lang: 'ES', id: 'a20e4f07-e572-4605-acfc-5c53355f2ada', keyword: 'essential oils for deep sleep benefits' },
  { lang: 'DE', id: '1314a2d9-9ed6-475e-9235-8dffebb9384b', keyword: 'essential oils for better sleep quality' },
  { lang: 'FR', id: '82dee695-83be-4e96-94ea-05078dea3681', keyword: 'essential oils for deep restful sleep' },
  { lang: 'PT', id: '8edf37b6-73c1-4742-862b-b4649bfa0f55', keyword: 'essential oils for sleep and relaxation' },
]

// ── STEP 1: Leggi content da articoli pubblicati per analisi link ──────────
console.log('\n[1/3] Leggo content_markdown da articoli pubblicati...')
const pubData = {}
await Promise.all(BRANDS.map(async b => {
  const { data } = await sb.from('articles')
    .select('id, slug, keyword_source, content_markdown')
    .eq('brand_id', b.id).eq('status', 'published')
    .order('published_at', { ascending: false }).limit(1)
  pubData[b.lang] = data?.[0] ?? null
}))

// Simula extractLinkedProducts: trova anchor text di link doTERRA
function simulateExtract(markdown) {
  if (!markdown) return []
  const pattern = /\[([^\]]+)\]\(https?:\/\/[^)]*doterra[^)]+\)/g
  const anchors = []
  let m
  while ((m = pattern.exec(markdown)) !== null) {
    const a = m[1].trim()
    if (!/^doTERRA$/i.test(a) && a.length <= 60 && a.length > 2) anchors.push(a)
  }
  return [...new Set(anchors)].slice(0, 6)
}

for (const b of BRANDS) {
  const art = pubData[b.lang]
  const links = simulateExtract(art?.content_markdown)
  console.log(`  ${b.lang}: article="${art?.slug}" → links: [${links.join(', ') || 'NONE'}]`)
}

// ── STEP 2: Crea 5 draft in parallelo ─────────────────────────────────────
console.log('\n[2/3] Creo 5 draft in parallelo...')

const draftResults = await Promise.allSettled(
  BRANDS.map(async b => {
    const res = await fetch(`${API}/api/generate-article`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand_id: b.id, keyword: b.keyword, status: 'draft' }),
      signal: AbortSignal.timeout(130000),
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    return { lang: b.lang, keyword: b.keyword, articleId: data.article?.id, title: data.article?.title, content: data.article?.content_markdown ?? '' }
  })
)

const drafts = []
for (let i = 0; i < BRANDS.length; i++) {
  const r = draftResults[i]
  if (r.status === 'fulfilled') {
    console.log(`  ✅ ${r.value.lang}: "${r.value.title?.slice(0, 55)}"`)
    drafts.push(r.value)
  } else {
    console.log(`  ❌ ${BRANDS[i].lang}: ${r.reason?.message}`)
    drafts.push({ lang: BRANDS[i].lang, error: r.reason?.message })
  }
}

// ── STEP 3: Genera immagini in parallelo ──────────────────────────────────
console.log('\n[3/3] Genero immagini in parallelo...')

const imgResults = await Promise.allSettled(
  drafts.filter(d => !d.error).map(async d => {
    const res = await fetch(`${API}/api/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ article_id: d.articleId, keyword: d.keyword, title: d.title }),
      signal: AbortSignal.timeout(130000),
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    return { ...d, prompt: data.prompt, imageUrl: data.image_url }
  })
)

const imageData = []
const goodDrafts = drafts.filter(d => !d.error)
for (let i = 0; i < goodDrafts.length; i++) {
  const r = imgResults[i]
  if (r.status === 'fulfilled') {
    console.log(`  ✅ ${r.value.lang}: ${r.value.imageUrl?.slice(0, 80)}`)
    imageData.push(r.value)
  } else {
    console.log(`  ❌ ${goodDrafts[i].lang}: ${r.reason?.message}`)
    imageData.push({ lang: goodDrafts[i].lang, error: r.reason?.message, ...goodDrafts[i] })
  }
}

// ── OUTPUT FINALE ─────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(72))
console.log('ANALISI COMPLETA — LINK DA ARTICOLI PUBBLICATI + IMAGE DA DRAFT')
console.log('═'.repeat(72))

for (const b of BRANDS) {
  const pub = pubData[b.lang]
  const pubLinks = simulateExtract(pub?.content_markdown)
  const imgD = imageData.find(d => d.lang === b.lang)
  const draftLinks = simulateExtract(imgD?.content ?? '')
  const prompt = imgD?.prompt ?? ''
  const isCollage = prompt.includes('FEATURED: three doTERRA')
  const primaryMatch = prompt.match(/PRIMARY SUBJECT[:\s]+([\w][\w\s-]+?)\s+doTERRA/)
  const blackCap = prompt.includes('BLACK matte cap')
  const brandVis = prompt.includes('"doTERRA" brand name')

  console.log(`\n── ${b.lang} ────────────────────────────────────────────────`)
  console.log(`  Published art:    ${pub?.slug ?? 'N/A'}`)
  console.log(`  Pub links:        ${pubLinks.length > 0 ? pubLinks.join(' | ') : 'NONE'}`)
  console.log(`  Draft keyword:    ${b.keyword}`)
  console.log(`  Draft links:      ${draftLinks.length > 0 ? draftLinks.join(' | ') : 'NONE'}`)
  if (imgD?.error) {
    console.log(`  IMAGE ERROR:      ${imgD.error}`)
  } else {
    console.log(`  Mode:             ${isCollage ? 'COLLAGE (MULTI_PRODUCT_SCENES match)' : `SINGLE — primary: ${primaryMatch?.[1]?.trim() ?? 'N/A'}`}`)
    console.log(`  BLACK cap lock:   ${blackCap ? '✅' : '❌'}`)
    console.log(`  doTERRA brand:    ${brandVis ? '✅' : '❌'}`)
    console.log(`  Image URL:        ${imgD?.imageUrl ?? 'N/A'}`)
    console.log(`  Prompt (120ch):   ${prompt.slice(0, 120)}`)
  }
}

console.log('\n' + '═'.repeat(72))
console.log('TABELLA RIASSUNTIVA')
console.log('═'.repeat(72))
console.log('| Lang | Pub links found | Draft mode   | BLACK | Brand | Status |')
console.log('|------|----------------|--------------|-------|-------|--------|')
for (const b of BRANDS) {
  const pub = pubData[b.lang]
  const pubLinks = simulateExtract(pub?.content_markdown)
  const imgD = imageData.find(d => d.lang === b.lang)
  const prompt = imgD?.prompt ?? ''
  const isCollage = prompt.includes('FEATURED: three doTERRA')
  const mode = imgD?.error ? 'ERROR' : (isCollage ? 'COLLAGE' : 'SINGLE')
  const bk = prompt.includes('BLACK matte cap') ? '✅' : (imgD?.error ? '—' : '❌')
  const br = prompt.includes('"doTERRA" brand name') ? '✅' : (imgD?.error ? '—' : '❌')
  const status = imgD?.error ? `❌ ${imgD.error.slice(0,20)}` : '✅ ok'
  console.log(`| ${b.lang.padEnd(4)} | ${String(pubLinks.length).padEnd(14)}  | ${mode.padEnd(12)} | ${bk.padEnd(5)} | ${br.padEnd(5)} | ${status} |`)
}

console.log('\nDraft IDs (delete or leave as draft):')
drafts.forEach(d => console.log(`  ${d.lang}: ${d.articleId ?? 'N/A (failed)'}`))
