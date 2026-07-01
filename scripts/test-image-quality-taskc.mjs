/**
 * Task C — Genera 5 articoli DRAFT (1 per lingua) con keyword reale
 * 🚨 DRAFT: tutte le chiamate usano { draft: true }
 * 🚨 Dopo ogni INSERT verifica status='draft' nel DB prima di continuare
 * 🚨 Se ANY status='published' → STOP IMMEDIATO
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const BASE = 'https://soloseo-alpha.vercel.app'

// Brand IDs confermati dal dry run
const BRANDS = {
  en: 'eceba851-228a-45cf-8775-b0f7fc9ae7de',
  es: 'a20e4f07-e572-4605-acfc-5c53355f2ada',
  de: '1314a2d9-9ed6-475e-9235-8dffebb9384b',
  fr: '82dee695-83be-4e96-94ea-05078dea3681',
  pt: '8edf37b6-73c1-4742-862b-b4649bfa0f55',
}

const KEYWORDS = {
  en: 'best essential oils for evening relaxation',
  es: 'cómo usar aceites esenciales doTERRA',
  de: 'doTERRA Lavendelöl Wirkung',
  fr: 'comment utiliser huile essentielle lavande',
  pt: 'como usar óleos essenciais doTERRA',
}

const ARTICLE_IDS = []

console.log('═'.repeat(72))
console.log('TASK C — 5 DRAFT ARTICLES IMAGE QUALITY TEST')
console.log('🚨 ALL requests use { draft: true }')
console.log('🚨 DB status check after EACH insert')
console.log('═'.repeat(72))

// ── FASE 1: Genera 5 articoli draft ──────────────────────────────────────────
for (const lang of ['en', 'es', 'de', 'fr', 'pt']) {
  const brand_id = BRANDS[lang]
  const keyword = KEYWORDS[lang]

  console.log(`\n${'─'.repeat(72)}`)
  console.log(`[${lang.toUpperCase()}] Generando articolo draft...`)
  console.log(`  brand_id: ${brand_id}`)
  console.log(`  keyword : "${keyword}"`)
  console.log(`  body    : { brand_id, keyword, draft: true }  ← 🚨 DRAFT`)

  let articleId = null
  try {
    const res = await fetch(`${BASE}/api/generate-article`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand_id, keyword, draft: true }),
      signal: AbortSignal.timeout(130000),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(`${res.status} — ${JSON.stringify(data)}`)

    articleId = data.article?.id ?? data.id
    console.log(`  → article_id: ${articleId}`)
    console.log(`  → title: "${data.article?.title ?? data.title ?? '?'}"`)
  } catch (e) {
    console.log(`  ❌ generate-article FAILED: ${e.message}`)
    continue
  }

  // 🚨 SAFETY CHECK: verifica status='draft' nel DB
  const { data: dbCheck, error: dbErr } = await sb.from('articles')
    .select('id, status, slug')
    .eq('id', articleId)
    .single()

  if (dbErr) {
    console.log(`  ❌ DB check error: ${dbErr.message}`)
    continue
  }

  console.log(`  → DB status: "${dbCheck.status}" (slug: ${dbCheck.slug})`)

  if (dbCheck.status !== 'draft') {
    console.log(`  🚨🚨🚨 STATUS="${dbCheck.status}" — NON È DRAFT! STOP IMMEDIATO!`)
    // Emergency: unpublish immediately
    await sb.from('articles').update({ status: 'draft', published_at: null }).eq('id', articleId)
    console.log(`  🚑 Emergency UPDATE → draft eseguito. STOP.`)
    process.exit(1)
  }

  console.log(`  ✅ STATUS=draft — sicuro`)
  ARTICLE_IDS.push({ lang, id: articleId, slug: dbCheck.slug })
}

console.log(`\n${'═'.repeat(72)}`)
console.log(`FASE 1 COMPLETATA — ${ARTICLE_IDS.length}/5 articoli draft creati`)
console.log(`IDs: ${ARTICLE_IDS.map(a => a.id).join(', ')}`)

if (!ARTICLE_IDS.length) {
  console.log('❌ Nessun articolo creato. Impossibile continuare con immagini.')
  process.exit(1)
}

// ── FASE 2: Genera immagini per ogni articolo draft ───────────────────────────
console.log(`\n${'═'.repeat(72)}`)
console.log('FASE 2 — GENERAZIONE IMMAGINI (con keyword tradotta in EN)')
console.log('═'.repeat(72))

for (const { lang, id, slug } of ARTICLE_IDS) {
  const keyword = KEYWORDS[lang]
  console.log(`\n[${lang.toUpperCase()}] Generando immagine...`)
  console.log(`  article_id: ${id}`)
  console.log(`  keyword   : "${keyword}"`)
  console.log(`  → La traduzione avviene dentro buildImagePrompt nel server`)

  try {
    const res = await fetch(`${BASE}/api/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ article_id: id, keyword }),
      signal: AbortSignal.timeout(130000),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(`${res.status} — ${JSON.stringify(data)}`)

    const imgUrl = data.image_url ?? data.url ?? data.featured_image ?? '?'
    console.log(`  ✅ Image URL: ${imgUrl}`)
    console.log(`  → Prompt log (se disponibile nel response): ${JSON.stringify(data.prompt ?? data.debug ?? '(not exposed)')}`)

    // Read from DB to confirm image saved
    const { data: art } = await sb.from('articles')
      .select('id, status, featured_image, slug')
      .eq('id', id).single()

    console.log(`  → DB featured_image: ${art?.featured_image ?? 'NULL'}`)
    console.log(`  → DB status post-image: "${art?.status}"`)

    if (art?.status !== 'draft') {
      console.log(`  🚨 STATUS CHANGED TO "${art?.status}"! Emergency fix...`)
      await sb.from('articles').update({ status: 'draft', published_at: null }).eq('id', id)
      console.log(`  🚑 Fixed → draft`)
    }
  } catch (e) {
    console.log(`  ❌ generate-image FAILED: ${e.message}`)
  }
}

// ── FASE 3: Report finale + DB audit ─────────────────────────────────────────
console.log(`\n${'═'.repeat(72)}`)
console.log('FASE 3 — DB AUDIT FINALE')
console.log('═'.repeat(72))

const ids = ARTICLE_IDS.map(a => a.id)
const { data: finalCheck } = await sb.from('articles')
  .select('id, status, slug, featured_image, brands(language_code)')
  .in('id', ids)

let allDraft = true
for (const a of finalCheck ?? []) {
  const lang = a.brands?.language_code?.toUpperCase()
  const ok = a.status === 'draft'
  if (!ok) allDraft = false
  console.log(`  [${lang}] status=${a.status} ${ok ? '✅' : '🚨'} | image=${a.featured_image ? '✅' : '❌ NULL'} | ${a.slug?.slice(0,50)}`)
}

console.log(`\n${allDraft ? '✅ TUTTI DRAFT — sito live NON impattato' : '🚨 ERRORE STATUS — vedi sopra'}`)
console.log('\nTask C completato. Mostra immagini a utente per OK visivo.')
