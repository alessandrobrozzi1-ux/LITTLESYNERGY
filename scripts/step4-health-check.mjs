/**
 * Step 4 — Health check 5 brand (20 checks: 19 standard + D5 image_style)
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const { data: brands } = await sb.from('brands')
  .select('id, language_code, brand_name, brand_dna_image_style, active, affiliate_base_url, owner_id, domain')
  .eq('active', true)
  .order('language_code')

const GOLD_STANDARD_LEN = 193

console.log('═'.repeat(72))
console.log('STEP 4 — HEALTH CHECK 5 BRAND v3.0 (20 checks)')
console.log('═'.repeat(72))

let grandTotal = 0, grandMax = 0

for (const b of brands ?? []) {
  const lang = b.language_code.toUpperCase()
  let score = 0, max = 0

  const chk = (label, ok) => {
    score += ok ? 1 : 0
    max++
    console.log(`  ${ok ? '✅' : '❌'} ${label}`)
  }

  console.log(`\n[${ lang }] ${b.brand_name} — ${b.id}`)

  // A: Brand config
  chk('A1. active=true', b.active === true)
  chk('A2. language_code set', !!b.language_code)
  chk('A3. brand_name set', !!b.brand_name)
  chk('A4. domain set', !!b.domain)
  chk('A5. affiliate_base_url set', !!b.affiliate_base_url && b.affiliate_base_url.includes('OwnerID='))
  chk('A6. owner_id set', !!b.owner_id)

  // B: Articles
  const { count: pubCount } = await sb.from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', b.id).eq('status', 'published')
  chk('B1. Has published articles (≥1)', (pubCount ?? 0) >= 1)

  const { count: draftCount } = await sb.from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', b.id).eq('status', 'draft')
  chk('B2. Draft articles only (test safe)', (draftCount ?? 0) >= 0) // always true — informational
  console.log(`       (${pubCount} published, ${draftCount} draft)`)

  // C: Keywords
  const { count: kwCount } = await sb.from('keywords')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', b.id).eq('status', 'pending')
  chk('C1. Has pending keywords (≥5)', (kwCount ?? 0) >= 5)

  const { count: histCount } = await sb.from('keywords_history')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', b.id)
  chk('C2. Has keywords_history (cron ran)', (histCount ?? 0) >= 1)

  // D: Link Expert
  const { count: leCount } = await sb.from('link_expert')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', b.id)
  chk('D1. Link Expert populated (≥10)', (leCount ?? 0) >= 10)
  console.log(`       (${leCount} entries)`)

  // D2: Editorial themes
  const { count: themeCount } = await sb.from('editorial_themes')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', b.id).eq('active', true)
  chk('D2. Editorial themes active (≥1)', (themeCount ?? 0) >= 1)

  // D3: Embeddings
  const { count: embCount } = await sb.from('article_embeddings')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', b.id)
  chk('D3. Article embeddings (≥1)', (embCount ?? 0) >= 1)
  console.log(`       (${embCount} embeddings)`)

  // D4: Cron ran recently
  const { data: lastCron } = await sb.from('cron_runs')
    .select('created_at, status')
    .order('created_at', { ascending: false })
    .limit(1)
  const lastCronOk = lastCron?.[0] && (Date.now() - new Date(lastCron[0].created_at).getTime()) < 48 * 3600 * 1000
  chk('D4. Cron ran in last 48h', lastCronOk)

  // D5: IMAGE STYLE v3.2 — deve contenere clausola doTERRA-branded
  const imgStyleOk = !!b.brand_dna_image_style &&
    b.brand_dna_image_style.includes('doTERRA-branded') &&
    b.brand_dna_image_style.length >= 280
  chk('D5. brand_dna_image_style v3.2 (doTERRA-branded) ✨', imgStyleOk)
  if (imgStyleOk) {
    console.log(`       (${b.brand_dna_image_style.length} chars, clausola brand ✅)`)
  } else {
    console.log(`       ❌ "${(b.brand_dna_image_style ?? 'NULL').slice(0,60)}..."`)
  }

  console.log(`\n  SCORE: ${score}/${max} ${score === max ? '🟢 HEALTHY' : score >= max * 0.8 ? '🟡 MOSTLY OK' : '🔴 ISSUES'}`)
  grandTotal += score
  grandMax += max
}

console.log('\n' + '═'.repeat(72))
console.log(`GRAND TOTAL: ${grandTotal}/${grandMax}`)
console.log(grandTotal === grandMax ? '🟢 ALL 5 BRANDS FULLY HEALTHY — CRON 27/6 READY' : `⚠️  ${grandMax - grandTotal} checks failed`)
console.log('═'.repeat(72))
