import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const TEST_IDS = [
  'cdb29605-f371-4814-8500-05d427132075', // [DE] aetherische-oele-schlaf
  'db433220-e48e-426a-acdc-1b50b292deaa', // [DE] beste-aetherische-oele-fuer-schlaf
  '581a5a42-7fd0-44d2-b65e-907dc7d042ad', // [DE] aetherische-oele-fuer-besseren-schlaf
  '2c6768d2-13f4-42e3-a43b-b32108bd782e', // [DE] aetherische-oele-fuer-bessere-schlafqualitaet
  'bee703b2-874e-4723-a872-33d8e276eb38', // [FR] huiles-essentielles-sommeil-profond-reparateur
  '74dca4ce-30da-4ee8-8f31-29a32eac99f0', // [FR] huiles-essentielles-sommeil-profond
  '00e7e1b4-458c-49a0-8295-0a8da507e052', // [PT] oleos-essenciais-para-dormir-e-relaxar
  '0bba82f0-d45b-4973-96bd-b6023add2422', // [PT] oleos-essenciais-para-melhorar-qualidade-do-sono
  'ac81c7ea-aa91-44cf-8ccd-eace77271bbc', // [ES] aceites-esenciales-para-dormir-profundo
  'a95bc464-c2d4-4042-b7e5-7719e529eb86', // [ES] aceites-esenciales-sueno-profundo-beneficios
  '336fe2d7-0b7d-4e78-b33d-b831bfcbe799', // [EN] essential-oils-for-headache
  '07e04e0e-771a-47fa-a0b9-dc4d785b6ac1', // [EN] best-essential-oils-for-evening-relaxation
]

// ── UPDATE ─────────────────────────────────────────────────────────────────
const { data: updated, error } = await sb
  .from('articles')
  .update({ status: 'draft', published_at: null })
  .in('id', TEST_IDS)
  .select('id, slug')

if (error) { console.log('❌ ERROR:', error.message); process.exit(1) }
console.log(`✅ Updated ${updated?.length ?? 0}/${TEST_IDS.length} articoli → draft`)

// ── VERIFICA 1: count per lingua ──────────────────────────────────────────
const { data: byBrand } = await sb.from('articles')
  .select('brand_id, brands(language_code)')
  .eq('status', 'published')

const langCount = {}
for (const a of byBrand) {
  const l = a.brands?.language_code?.toUpperCase()
  langCount[l] = (langCount[l] ?? 0) + 1
}

const expected = { EN: 8, ES: 22, DE: 4, FR: 3, PT: 1 }
console.log('\nConteggio per lingua:')
let allOk = true
for (const [lang, exp] of Object.entries(expected)) {
  const got = langCount[lang] ?? 0
  const ok = got === exp
  if (!ok) allOk = false
  console.log(`  ${lang}: ${got} (atteso: ${exp}) ${ok ? '✅' : '❌'}`)
}
console.log(`  TOTAL: ${byBrand.length} ${allOk ? '✅' : '❌'}`)

// ── VERIFICA 2: zero TEST_OGGI ancora published ───────────────────────────
const IT_OFFSET = 2 * 60 * 60 * 1000
const { data: allPub } = await sb.from('articles')
  .select('id, slug, published_at, brands(language_code)')
  .eq('status', 'published')

const lateJune26 = allPub.filter(a => {
  if (!a.published_at) return false
  const it = new Date(new Date(a.published_at).getTime() + IT_OFFSET)
  const d = it.getUTCDate(), mo = it.getUTCMonth()+1, h = it.getUTCHours(), m = it.getUTCMinutes()
  return mo === 6 && d === 26 && (h > 10 || (h === 10 && m > 19))
})
console.log(`\nArticoli published dopo 10:19 IT del 26/06: ${lateJune26.length} (atteso: 0) ${lateJune26.length === 0 ? '✅' : '❌'}`)
if (lateJune26.length > 0) lateJune26.forEach(a => console.log(`  ❌ ${a.slug}`))

// ── VERIFICA 3: API public ────────────────────────────────────────────────
console.log('\nAPI public:')
for (const lang of ['en','es','de','fr','pt']) {
  try {
    const r = await fetch(`https://soloseo-alpha.vercel.app/api/public/articles/${lang}`, { signal: AbortSignal.timeout(8000) })
    const d = await r.json()
    const count = Array.isArray(d) ? d.length : (d?.articles?.length ?? '?')
    const expMap = { en: 8, es: 22, de: 4, fr: 3, pt: 1 }
    const ok = count === expMap[lang]
    console.log(`  ${lang.toUpperCase()}: ${count} articoli ${ok ? '✅' : '⚠️ (atteso '+expMap[lang]+')'}`)
  } catch (e) { console.log(`  ${lang.toUpperCase()}: ❌ ${e.message}`) }
}
