/**
 * Trova immagini orfane nel bucket article-images (READ-ONLY, nessun delete).
 * Orfano = oggetto storage NON referenziato da articles.featured_image / pinterest_image.
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// 1. URL referenziati
const { data: arts } = await sb.from('articles')
  .select('featured_image, pinterest_image')
const referenced = new Set()
for (const a of arts ?? []) {
  for (const u of [a.featured_image, a.pinterest_image]) {
    if (!u) continue
    const m = u.split('/article-images/')[1]
    if (m) referenced.add(m.replace(/\?.*/,''))
  }
}
console.log(`Filename referenziati (featured + pinterest): ${referenced.size}`)

// 2. Lista bucket (paginata)
let objs = [], offset = 0
while (true) {
  const { data, error } = await sb.storage.from('article-images').list('', { limit: 100, offset, sortBy:{column:'created_at',order:'asc'} })
  if (error) { console.log('❌ list:', error.message); break }
  if (!data?.length) break
  objs.push(...data)
  if (data.length < 100) break
  offset += 100
}
console.log(`Oggetti nel bucket: ${objs.length}`)

// 3. Diff
const now = Date.now()
const orphans = objs.filter(o => !referenced.has(o.name))
const referencedObjs = objs.filter(o => referenced.has(o.name))
const orphanBytes = orphans.reduce((s,o)=>s+(o.metadata?.size??0),0)
const recent = orphans.filter(o => (now - new Date(o.created_at).getTime()) < 24*3600*1000)

console.log('\n' + '═'.repeat(64))
console.log('RISULTATO')
console.log('═'.repeat(64))
console.log(`  Oggetti totali     : ${objs.length}`)
console.log(`  Referenziati (live): ${referencedObjs.length}`)
console.log(`  🗑️  ORFANI         : ${orphans.length}`)
console.log(`  Size orfani        : ${(orphanBytes/1048576).toFixed(1)} MB`)
console.log(`  ⏱️  Orfani < 24h    : ${recent.length} ${recent.length ? '⚠️ DA PROTEGGERE' : '✅ nessuno (cron recente safe)'}`)

console.log('\n  5 sample ORFANI (filename | età | size):')
for (const o of orphans.slice(0,5)) {
  const ageH = ((now - new Date(o.created_at).getTime())/3600000).toFixed(1)
  console.log(`    ${o.name} | ${ageH}h | ${((o.metadata?.size??0)/1048576).toFixed(2)}MB`)
}
console.log('\n  5 sample REFERENZIATI (live, NON toccare):')
for (const o of referencedObjs.slice(0,5)) {
  console.log(`    ${o.name}`)
}
if (recent.length) {
  console.log('\n  ⚠️ Orfani < 24h (NON cancellare, possibili regen recenti):')
  for (const o of recent) console.log(`    ${o.name} | ${o.created_at}`)
}

// salva lista orfani per lo step backup/delete (solo in memoria ora — file allo Step 2 dopo OK)
console.log(`\n  (lista completa orfani pronta per backup CSV allo Step 2, dopo tuo OK)`)
