import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const UNPUBLISH_IDS = [
  '5a02b0a9-34e1-4731-a923-fb7065827677',
  'af360c62-5b69-4e4b-8e49-0b7ba5af42a4',
  '68f5bfba-14bb-4325-bd13-46d8b36e245f',
  'ef01bbd8-5f4d-4c12-93db-7598007b8b15',
  'b7961ce1-211a-4ea8-b299-fec71b99cd9b',
  'e3015db0-2eb0-424e-b2a9-902847a6585a',
  '1108cdb4-7e28-4028-824a-ff58273312ae',
  'b9cdd353-ddf8-47ac-b604-6fdd35ad9a66',
  '34e11bb6-5543-4ae8-92e7-2084ab5c59d2',
  '2eed2b76-d628-484e-9cff-e1d08c49428a',
  'ac7eecb3-7d4a-47af-9ce7-223a78f621e9',
  '630e67bd-dbde-4e3e-849d-20c0545fd77c',
  '4575fadd-3078-4773-ad16-17ddf053e1b3',
]

// ── UPDATE ────────────────────────────────────────────────────────────────
console.log(`\nUPDATE ${UNPUBLISH_IDS.length} articoli → status='draft'...`)
const { data: updated, error: updateErr } = await sb
  .from('articles')
  .update({ status: 'draft', published_at: null })
  .in('id', UNPUBLISH_IDS)
  .select('id, slug, status')

if (updateErr) { console.log('❌ UPDATE ERROR:', updateErr.message); process.exit(1) }
console.log(`✅ Updated ${updated?.length ?? 0} articoli`)

// ── VERIFICA 1: Total published ────────────────────────────────────────────
const { count: totalPub } = await sb.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published')
console.log(`\nTotal published: ${totalPub} (atteso: 50) ${totalPub === 50 ? '✅' : '⚠️ MISMATCH'}`)

// ── VERIFICA 2: Zero duplicati slug ───────────────────────────────────────
const { data: allPub } = await sb.from('articles')
  .select('slug, brand_id, brands(language_code)')
  .eq('status', 'published')

const slugMap = {}
for (const a of allPub) {
  const key = `${a.brand_id}::${a.slug}`
  slugMap[key] = (slugMap[key] ?? 0) + 1
}
const dupes = Object.entries(slugMap).filter(([, n]) => n > 1)
console.log(`Duplicati slug: ${dupes.length} (atteso: 0) ${dupes.length === 0 ? '✅' : '❌'}`)
if (dupes.length > 0) {
  for (const [key, n] of dupes) console.log(`  ❌ ${key} → ${n} copie`)
}

// ── VERIFICA 3: Count per brand ────────────────────────────────────────────
const { data: byBrand } = await sb.from('articles')
  .select('brand_id, brands(language_code)')
  .eq('status', 'published')

const langCount = {}
for (const a of byBrand) {
  const lang = a.brands?.language_code ?? 'unknown'
  langCount[lang] = (langCount[lang] ?? 0) + 1
}

const expected = { en: 10, es: 24, de: 8, fr: 5, pt: 3 }
console.log('\nConteggio per lingua:')
for (const [lang, exp] of Object.entries(expected)) {
  const got = langCount[lang] ?? 0
  const ok = got === exp ? '✅' : '⚠️'
  console.log(`  ${lang.toUpperCase()}: ${got} (atteso: ${exp}) ${ok}`)
}

// ── VERIFICA 4: API public per lingua ─────────────────────────────────────
console.log('\nAPI public /api/public/articles/[lang]:')
for (const lang of ['en', 'es', 'de', 'fr', 'pt']) {
  try {
    const r = await fetch(`https://soloseo-alpha.vercel.app/api/public/articles/${lang}`, { signal: AbortSignal.timeout(8000) })
    const data = await r.json()
    const count = Array.isArray(data) ? data.length : (data?.articles?.length ?? '?')
    console.log(`  ${lang.toUpperCase()}: ${count} articoli via API ${r.ok ? '✅' : '⚠️'}`)
  } catch (e) {
    console.log(`  ${lang.toUpperCase()}: ❌ ${e.message}`)
  }
}
