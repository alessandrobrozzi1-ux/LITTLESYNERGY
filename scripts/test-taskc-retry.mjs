/**
 * Task C — Retry ES/FR/PT (article generation + image)
 * 🚨 draft: true obbligatorio
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const BASE = 'https://soloseo-alpha.vercel.app'

const TARGETS = [
  { lang: 'es', brand_id: 'a20e4f07-e572-4605-acfc-5c53355f2ada', keyword: 'como usar aceites esenciales doTERRA' },
  { lang: 'fr', brand_id: '82dee695-83be-4e96-94ea-05078dea3681', keyword: 'comment utiliser huile essentielle lavande' },
  { lang: 'pt', brand_id: '8edf37b6-73c1-4742-862b-b4649bfa0f55', keyword: 'como usar oleos essenciais doTERRA' },
]

for (const { lang, brand_id, keyword } of TARGETS) {
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`[${lang.toUpperCase()}] keyword: "${keyword}"`)
  console.log(`  body: { brand_id, keyword, draft: true }  🚨 DRAFT`)

  let articleId = null

  // FASE 1: articolo
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
    console.log(`  ✅ article_id: ${articleId}`)
    console.log(`  → title: "${data.article?.title ?? data.title ?? '?'}"`)
  } catch (e) {
    console.log(`  ❌ generate-article FAILED: ${e.message}`)
    continue
  }

  // 🚨 SAFETY CHECK
  const { data: dbCheck } = await sb.from('articles')
    .select('id, status, slug').eq('id', articleId).single()

  console.log(`  → DB status: "${dbCheck?.status}" slug: ${dbCheck?.slug}`)
  if (dbCheck?.status !== 'draft') {
    console.log(`  🚨 NON DRAFT! Emergency update...`)
    await sb.from('articles').update({ status: 'draft', published_at: null }).eq('id', articleId)
    console.log(`  🚑 Fixed. STOP.`)
    process.exit(1)
  }
  console.log(`  ✅ STATUS=draft`)

  // FASE 2: immagine
  console.log(`  → Generando immagine...`)
  try {
    const res2 = await fetch(`${BASE}/api/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ article_id: articleId, keyword }),
      signal: AbortSignal.timeout(130000),
    })
    const d2 = await res2.json()
    if (!res2.ok) throw new Error(`${res2.status} — ${JSON.stringify(d2)}`)

    console.log(`  ✅ Image URL: ${d2.image_url ?? d2.url ?? '?'}`)
    console.log(`  → topic_context nel prompt: "${d2.prompt?.match(/Topic context: (.+)/)?.[1] ?? '(non esposto nel log)'}"`)

    const { data: art } = await sb.from('articles')
      .select('id, status, featured_image').eq('id', articleId).single()
    console.log(`  → DB featured_image: ${art?.featured_image ? '✅ saved' : '❌ NULL'}`)
    console.log(`  → DB status post-img: "${art?.status}"`)

    if (art?.status !== 'draft') {
      await sb.from('articles').update({ status: 'draft', published_at: null }).eq('id', articleId)
      console.log(`  🚑 Fixed → draft`)
    }
  } catch (e) {
    console.log(`  ❌ generate-image FAILED: ${e.message}`)
  }
}

console.log('\n✅ Retry completato.')
