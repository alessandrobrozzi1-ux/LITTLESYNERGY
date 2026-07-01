import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// ── 1. Articoli più vecchi con featured_image ──────────────────────────────
const { data: arts } = await sb.from('articles')
  .select('slug, featured_image, published_at')
  .not('featured_image','is',null).eq('status','published')
  .order('published_at',{ascending:true}).limit(8)

console.log('═'.repeat(70))
console.log('1) TEST IMMAGINI ARTICOLI PIÙ VECCHI')
console.log('═'.repeat(70))
const domains = {}
let liveCount = 0, maxAgeDays = 0
for (const a of arts ?? []) {
  const url = a.featured_image
  const dom = new URL(url).hostname
  domains[dom] = (domains[dom]||0)+1
  const ageDays = ((Date.now() - new Date(a.published_at).getTime())/86400000).toFixed(1)
  maxAgeDays = Math.max(maxAgeDays, parseFloat(ageDays))
  let status = '?'
  try { const r = await fetch(url, { method:'HEAD', signal: AbortSignal.timeout(15000) }); status = r.status } catch(e){ status = 'ERR:'+e.message.slice(0,20) }
  if (status === 200) liveCount++
  console.log(`  [${ageDays}gg] HTTP ${status} | ${dom} | ${a.slug?.slice(0,40)}`)
}
console.log(`\n  Live: ${liveCount}/${arts?.length} | Età max: ${maxAgeDays}gg`)
console.log(`  Domini: ${JSON.stringify(domains)}`)

// ── 2. Dimensione bucket article-images ────────────────────────────────────
console.log('\n' + '═'.repeat(70))
console.log('2) STORAGE BUCKET article-images')
console.log('═'.repeat(70))
let totalBytes = 0, totalObj = 0, offset = 0
while (true) {
  const { data: objs, error } = await sb.storage.from('article-images').list('', { limit: 100, offset, sortBy:{column:'created_at',order:'asc'} })
  if (error) { console.log('  ❌ list error:', error.message); break }
  if (!objs?.length) break
  for (const o of objs) { totalBytes += (o.metadata?.size ?? 0); totalObj++ }
  if (objs.length < 100) break
  offset += 100
}
const mb = (totalBytes/1048576)
console.log(`  Oggetti: ${totalObj}`)
console.log(`  Dimensione totale: ${mb.toFixed(1)} MB (${(mb/1024).toFixed(3)} GB)`)
console.log(`  Media per immagine: ${totalObj ? (totalBytes/totalObj/1048576).toFixed(2) : 0} MB`)

// ── 3. Conteggio articoli published (proiezione) ───────────────────────────
const { count: pubCount } = await sb.from('articles').select('*',{count:'exact',head:true}).eq('status','published')
console.log('\n' + '═'.repeat(70))
console.log('3) PROIEZIONE 12 MESI')
console.log('═'.repeat(70))
const avgMB = totalObj ? totalBytes/totalObj/1048576 : 1.0
console.log(`  Articoli published attuali: ${pubCount}`)
console.log(`  Cron: 6 articoli/giorno = ${6*365} immagini/anno (+ rigenerazioni)`)
const yearImages = 6*365
const yearGB = (yearImages * avgMB)/1024
console.log(`  Proiezione 12 mesi: ~${yearImages} nuove img × ${avgMB.toFixed(2)}MB = ~${yearGB.toFixed(2)} GB/anno`)
console.log(`  Supabase Free Storage: 1 GB | quota usata ora: ${(mb/1024*100).toFixed(1)}% di 1GB`)
console.log(`  ⚠️ Free 1GB → saturazione stimata in ~${yearGB>0 ? Math.round(1/(yearGB/12)) : '∞'} mesi al ritmo cron`)
