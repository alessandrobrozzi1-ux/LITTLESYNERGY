/**
 * Task 3 — Test image_style override su draft esistenti (Task C)
 * Riuso articoli draft già in DB, ri-genero SOLO l'immagine con nuovo style.
 * 🚨 NO nuovi articoli | NO publish | 🚨 verifica DB status='draft' prima e dopo
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const BASE = 'https://soloseo-alpha.vercel.app'

const NEW_STYLE = 'Bright, clean lifestyle photography. Natural light, botanical elements, essential oil bottles and diffusers in cozy home settings. Warm earth tones with pops of lavender, green, and soft amber.'

// Draft articles from Task C
const TARGETS = [
  { lang: 'es', id: '6cc591ee-ec10-45ee-8a09-217877467d4a', keyword: 'como usar aceites esenciales doTERRA' },
  { lang: 'de', id: 'b2453a6d-f38f-4515-af26-49ca50c50def', keyword: 'doTERRA Lavendelöl Wirkung' },
  { lang: 'fr', id: '588effbc-0981-42c4-a389-e0f39ac2d001', keyword: 'comment utiliser huile essentielle lavande' },
  { lang: 'pt', id: 'e5ccdb12-8ec9-4609-b195-8af799988f58', keyword: 'como usar oleos essenciais doTERRA' },
]

console.log('═'.repeat(72))
console.log('TASK 3 — IMAGE STYLE OVERRIDE TEST')
console.log(`NEW_STYLE: "${NEW_STYLE}"`)
console.log('🚨 Riuso draft Task C | NO publish | NO DB brand update')
console.log('═'.repeat(72))

// ── PRE-CHECK: tutti i target sono ancora draft? ──────────────────────────────
console.log('\n[PRE-CHECK] Verifica status draft articoli Task C...')
const { data: preCheck } = await sb.from('articles')
  .select('id, status, slug, brands(language_code)')
  .in('id', TARGETS.map(t => t.id))

let allPreDraft = true
for (const a of preCheck ?? []) {
  const lang = a.brands?.language_code?.toUpperCase()
  const ok = a.status === 'draft'
  if (!ok) allPreDraft = false
  console.log(`  [${lang}] status="${a.status}" ${ok ? '✅' : '🚨'} — ${a.slug}`)
}
if (!allPreDraft) {
  console.log('🚨 STOP: articoli non tutti draft! Abbortisco.')
  process.exit(1)
}
console.log('✅ Tutti draft — sicuro procedere.')

// ── GENERA IMMAGINI con override style ───────────────────────────────────────
const results = []

for (const { lang, id, keyword } of TARGETS) {
  console.log(`\n${'─'.repeat(72)}`)
  console.log(`[${lang.toUpperCase()}] Generando immagine con NEW_STYLE override...`)
  console.log(`  article_id: ${id}`)
  console.log(`  keyword   : "${keyword}"`)
  console.log(`  image_style: OVERRIDE (non da DB brand)`)

  try {
    const res = await fetch(`${BASE}/api/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        article_id: id,
        keyword,
        image_style: NEW_STYLE,   // ← OVERRIDE: bypassa brand_dna_image_style dal DB
      }),
      signal: AbortSignal.timeout(130000),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(`${res.status} — ${JSON.stringify(data)}`)

    const imgUrl = data.image_url ?? data.url ?? '?'
    const prompt = data.prompt ?? '(non esposto)'

    console.log(`  ✅ Image URL: ${imgUrl}`)
    // Estrai topic_context dal prompt per confermare traduzione keyword
    const topicMatch = prompt.match?.(/Topic context: (.+)/)?.[1] ?? '(non trovato)'
    console.log(`  → topic_context: "${topicMatch}"`)
    console.log(`  → Prompt preview (prime 200 char): ${prompt.slice?.(0, 200) ?? prompt}`)

    // 🚨 SAFETY CHECK post-image
    const { data: art } = await sb.from('articles')
      .select('id, status, featured_image').eq('id', id).single()

    const statusOk = art?.status === 'draft'
    console.log(`  → DB status post-img: "${art?.status}" ${statusOk ? '✅' : '🚨'}`)
    console.log(`  → DB featured_image : ${art?.featured_image ? '✅ saved' : '❌ NULL'}`)

    if (!statusOk) {
      console.log('  🚨 STATUS NON DRAFT! Emergency fix...')
      await sb.from('articles').update({ status: 'draft', published_at: null }).eq('id', id)
      console.log('  🚑 Fixed → draft. STOP.')
      process.exit(1)
    }

    results.push({ lang, id, imgUrl, topicContext: topicMatch })
  } catch (e) {
    console.log(`  ❌ FAILED: ${e.message}`)
    results.push({ lang, id, imgUrl: null, error: e.message })
  }
}

// ── REPORT FINALE ─────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(72))
console.log('TASK 3 REPORT FINALE')
console.log('═'.repeat(72))
for (const r of results) {
  const ok = !!r.imgUrl && !r.error
  console.log(`[${r.lang.toUpperCase()}] ${ok ? '✅' : '❌'} | topic="${r.topicContext ?? r.error}" | ${r.imgUrl ?? 'FAILED'}`)
}
console.log('\nTutti articoli rimangono DRAFT — sito live non impattato.')
console.log('Image URLs per screenshot:')
for (const r of results) {
  if (r.imgUrl) console.log(`  [${r.lang.toUpperCase()}] ${r.imgUrl}`)
}
