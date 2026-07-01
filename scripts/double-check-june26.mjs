import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const { data: allPub } = await sb.from('articles')
  .select('id, slug, title, published_at, created_at, brand_id, brands(language_code)')
  .eq('status', 'published')
  .order('published_at', { ascending: false })

// Cron reale: 07:47 UTC ±2min (= 09:47 IT) + PT pillar manuale 08:19 UTC
// Test articles = qualsiasi cosa published il 26/6 DOPO 07:50 UTC
const JUNE26_CRON_CUTOFF = new Date('2026-06-26T07:50:00Z')
const JUNE26_START       = new Date('2026-06-26T00:00:00Z')

// Articoli legittimi June 26 (cron + pillar PT manuale)
const LEGIT_IDS = new Set([
  'c198b9e6-90d0-448d-b227-71039215ffbe', // EN doterra-essential-oils-for-sleep 07:47
  '6d2863c9-c415-4ca2-9fb9-2909eb90476b', // ES mejores-aceites-esenciales-aromaterapia-casa 07:47
  'd6b0f5e8-e2e4-47b3-95f2-c41bd9ed1703', // DE aetherische-oele-gegen-stress 07:47
  '62c26c0f-fe59-48c8-89ef-36aad077ee3e', // FR lavande-huile-essentielle-sommeil 07:47
  '652f0884-ad8e-4a0d-8047-7828272cbf88', // PT como-comprar-doterra-desconto 08:19 (pillar manuale)
])

const june26 = allPub.filter(a => {
  const pub = new Date(a.published_at)
  return pub >= JUNE26_START
})

const legitJune26 = june26.filter(a => LEGIT_IDS.has(a.id))
const testJune26  = june26.filter(a => !LEGIT_IDS.has(a.id))

const lang = a => a.brands?.language_code?.toUpperCase()

console.log('\n══ ARTICOLI JUNE 26 LEGITTIMI (CRON + PILLAR) — NON TOCCARE ══')
for (const a of legitJune26) {
  console.log(`  ✅ [${lang(a)}] ${a.published_at?.slice(0,19)} | ${a.slug}`)
  console.log(`     ${a.id}`)
}

console.log(`\n══ ARTICOLI JUNE 26 TEST — DA UNPUBLISH (${testJune26.length} totali) ══`)
for (const a of testJune26) {
  console.log(`  🚨 [${lang(a)}] ${a.published_at?.slice(0,19)} | ${a.slug?.slice(0,55)}`)
  console.log(`     ${a.title?.slice(0,60)}`)
  console.log(`     ${a.id}`)
}

console.log('\n══ TUTTI PUBLISHED PER LINGUA — STATO POST CLEANUP ATTESO ══')
const preCount = {}
const postCount = {}
const testIds = new Set(testJune26.map(a => a.id))
for (const a of allPub) {
  const l = lang(a)
  preCount[l] = (preCount[l] ?? 0) + 1
  if (!testIds.has(a.id)) postCount[l] = (postCount[l] ?? 0) + 1
}
for (const l of ['EN','ES','DE','FR','PT']) {
  const pre = preCount[l] ?? 0
  const post = postCount[l] ?? 0
  console.log(`  ${l}: ${pre} ora → ${post} dopo (rimuovo ${pre-post} test)`)
}
console.log(`  TOTAL: ${allPub.length} ora → ${allPub.length - testJune26.length} dopo`)

console.log('\n  IDs da UPDATE status=draft:')
testJune26.forEach(a => console.log(`  '${a.id}', // [${lang(a)}] ${a.slug?.slice(0,50)}`))
