/**
 * Verifica GEO checks su un articolo (solo GET Supabase — nessuna scrittura).
 * Usage: node scripts/verify-article.mjs <articleId> <lang>
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const URL_PATH = {
  en: (s) => `https://essentialsynergybr.com/blog/${s}`,
  es: (s) => `https://essentialsynergybr.com/es/blog/${s}`,
  de: (s) => `https://essentialsynergybr.com/de/${s}`,
  fr: (s) => `https://essentialsynergybr.com/fr/blog/${s}`,
  pt: (s) => `https://essentialsynergybr.com/pt/blog/${s}`,
  ro: (s) => `https://essentialsynergybr.com/ro/blog/${s}`,
}

const articleId = process.argv[2]
const lang = (process.argv[3] || 'en').toLowerCase()
if (!articleId) { console.log('❌ missing articleId'); process.exit(1) }

const { data: a, error } = await sb.from('articles')
  .select('id, slug, title, status, featured_image, content_markdown, published_at')
  .eq('id', articleId).single()
if (error || !a) { console.log('❌ article not found:', error?.message); process.exit(1) }

const md = a.content_markdown ?? ''
const wordCount = md.trim().split(/\s+/).length
const authorOk = md.toLowerCase().includes('wellness advocates')
const faqHeadingOk = /##\s*(FAQ|Preguntas|Häufige|Questions|Perguntas|Domande|Frequent)/i.test(md)
const faqQuestions = (md.match(/\*\*[^*\n]+\?\*\*/g) || []).length
const tableOk = /\n\|.+\|.*\n\|[\s:|-]+\|/.test(md)
const numberedListOk = /\n\s*1\.\s+/.test(md)
const imgIsBrand = (a.featured_image || '').includes('supabase')
const internalLinks = (md.match(/\]\(https?:\/\/(?:www\.)?essentialsynergybr\.com[^)]*\)/g) || []).length
const doterraLinks = (md.match(/\]\(https?:\/\/(?:www\.|shop\.)?doterra\.com[^)]*\)/g) || []).length

const chk = (label, ok, extra='') => console.log(`  ${ok ? '✅' : '❌'} ${label}${extra ? ' — ' + extra : ''}`)

console.log(`\n[${lang.toUpperCase()}] VERIFY — ${a.slug}`)
console.log(`  title: "${a.title}" (${a.title?.length} chars)`)
chk('status = published', a.status === 'published', a.status)
chk('featured_image = gpt-image-2 (supabase)', imgIsBrand, (a.featured_image||'NULL').slice(0,72))
chk('author line present', authorOk)
chk('FAQ heading present', faqHeadingOk)
chk('FAQ questions >=4', faqQuestions >= 4, `${faqQuestions} found`)
chk('comparison table present', tableOk)
chk('numbered list present', numberedListOk)
chk('word count >=1000', wordCount >= 1000, `${wordCount} words`)
chk('internal links >=1', internalLinks >= 1, `${internalLinks} internal / ${doterraLinks} doterra`)

const pass = a.status === 'published' && imgIsBrand && authorOk && faqHeadingOk && faqQuestions >= 4 && tableOk
console.log(`  ${pass ? '🟢 GEO CHECKS PASS' : '🔴 ISSUES'}`)
console.log(`  LIVE: ${URL_PATH[lang](a.slug)}`)
console.log(`  --- intro (first 350 chars) ---`)
console.log('  ' + md.slice(0, 350).replace(/\n/g, '\n  '))
process.exit(pass ? 0 : 2)
