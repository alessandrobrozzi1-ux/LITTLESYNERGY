/**
 * Task 2 — Genera + pubblica 1 articolo GEO (per lingua passata come argv).
 * Replica il flusso production cron: generate-article (published) → generate-image (gpt-image-2).
 * Usage: node scripts/task2-geo-publish.mjs <lang>
 *
 * 🚨 draft: false — PUBLISH diretto (validazione end-to-end production, autorizzato dall'utente)
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const BASE = 'https://soloseo-alpha.vercel.app'

const BRANDS = {
  en: 'eceba851-228a-45cf-8775-b0f7fc9ae7de',
  es: 'a20e4f07-e572-4605-acfc-5c53355f2ada',
  de: '1314a2d9-9ed6-475e-9235-8dffebb9384b',
  fr: '82dee695-83be-4e96-94ea-05078dea3681',
  pt: '8edf37b6-73c1-4742-862b-b4649bfa0f55',
}
const KEYWORDS = {
  en: 'doterra work from home opportunity guide',
  es: 'doterra trabajar desde casa oportunidad guía',
  de: 'doterra heimarbeit chance leitfaden',
  fr: 'doterra travail à domicile opportunité guide',
  pt: 'doterra trabalhar de casa oportunidade guia',
}
// URL pattern per lingua (per output live link)
const URL_PATH = {
  en: (slug) => `https://essentialsynergybr.com/blog/${slug}`,
  es: (slug) => `https://essentialsynergybr.com/es/blog/${slug}`,
  de: (slug) => `https://essentialsynergybr.com/de/${slug}`,
  fr: (slug) => `https://essentialsynergybr.com/fr/blog/${slug}`,
  pt: (slug) => `https://essentialsynergybr.com/pt/blog/${slug}`,
}

const lang = (process.argv[2] || 'en').toLowerCase()
const brand_id = BRANDS[lang]
const keyword = KEYWORDS[lang]
if (!brand_id) { console.log(`❌ Unknown lang: ${lang}`); process.exit(1) }

async function postJSON(path, body, label) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(150000),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(`${res.status} — ${JSON.stringify(data).slice(0,200)}`)
      return data
    } catch (e) {
      console.log(`  ⚠️ ${label} attempt ${attempt} failed: ${e.message}`)
      if (attempt === 2) throw e
      await new Promise(r => setTimeout(r, 3000))
    }
  }
}

console.log('═'.repeat(72))
console.log(`TASK 2 [${lang.toUpperCase()}] — GEO article PUBLISH`)
console.log(`  keyword: "${keyword}"`)
console.log(`  body: { brand_id, keyword, draft: false, length: 'long' }  🚨 PUBLISH`)
console.log('═'.repeat(72))

// ── 1. generate-article (published) ──────────────────────────────────────────
console.log('\n[1/3] generate-article...')
const art = await postJSON('/api/generate-article', { brand_id, keyword, draft: false, length: 'long' }, 'generate-article')
const articleId = art.article?.id ?? art.id
console.log(`  ✅ article_id: ${articleId}`)
console.log(`  → title: "${art.article?.title}"`)
console.log(`  → word_count (API): ${art.word_count}`)
console.log(`  → seo_score: ${JSON.stringify(art.seo_score?.score ?? art.seo_score)}`)

// ── 2. generate-image (gpt-image-2, overwrite Unsplash) ──────────────────────
console.log('\n[2/3] generate-image (gpt-image-2 brand)...')
const img = await postJSON('/api/generate-image', { article_id: articleId, keyword }, 'generate-image')
console.log(`  ✅ image: ${img.image_url ?? img.url ?? '?'}`)

// ── 3. DB verification ───────────────────────────────────────────────────────
console.log('\n[3/3] DB verification...')
const { data: a } = await sb.from('articles')
  .select('id, slug, title, status, featured_image, content_markdown, published_at')
  .eq('id', articleId).single()

const md = a.content_markdown ?? ''
const wordCount = md.trim().split(/\s+/).length
const authorOk = /\*[^*\n]*Wellness Advocates[^*\n]*\*/i.test(md) || md.toLowerCase().includes('wellness advocates')
const faqHeadingOk = /##\s*(FAQ|Preguntas|Häufige|Questions|Perguntas|Domande)/i.test(md)
const faqQuestions = (md.match(/\*\*[^*\n]+\?\*\*/g) || []).length
const tableOk = /\n\|.+\|.*\n\|[\s:|-]+\|/.test(md)
const numberedListOk = /\n\s*1\.\s+/.test(md)
const imgIsBrand = (a.featured_image || '').includes('supabase')
const internalLinks = (md.match(/\]\(https?:\/\/(?:www\.)?essentialsynergybr\.com[^)]*\)/g) || []).length
const doterraLinks = (md.match(/\]\(https?:\/\/(?:www\.|shop\.)?doterra\.com[^)]*\)/g) || []).length

const chk = (label, ok, extra='') => console.log(`  ${ok ? '✅' : '❌'} ${label}${extra ? ' — ' + extra : ''}`)

console.log(`  slug: ${a.slug}`)
chk('status = published', a.status === 'published', a.status)
chk('featured_image = gpt-image-2 (supabase)', imgIsBrand, a.featured_image?.slice(0,70))
chk('author line present', authorOk)
chk('FAQ heading present', faqHeadingOk)
chk(`FAQ questions ≥4`, faqQuestions >= 4, `${faqQuestions} found`)
chk('comparison table present', tableOk)
chk('numbered list present', numberedListOk)
chk('word count ≥1200', wordCount >= 1200, `${wordCount} words`)
chk('internal links ≥1', internalLinks >= 1, `${internalLinks} internal, ${doterraLinks} doterra`)

const allOk = a.status === 'published' && imgIsBrand && authorOk && faqHeadingOk &&
  faqQuestions >= 4 && tableOk && wordCount >= 1200

console.log(`\n  ${allOk ? '🟢 ALL CHECKS PASS' : '🔴 ISSUES DETECTED — STOP & DEBUG'}`)
console.log(`  LIVE URL: ${URL_PATH[lang](a.slug)}`)
console.log(`\n  --- AUTHOR LINE / INTRO (first 400 chars) ---`)
console.log('  ' + md.slice(0, 400).replace(/\n/g, '\n  '))

process.exit(allOk ? 0 : 2)
