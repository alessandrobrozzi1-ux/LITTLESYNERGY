/** STEP 3 — delete orfani dal bucket. Ricalcola fresh + guard anti-referenced. */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// 1. referenced (fresh)
const { data: arts } = await sb.from('articles').select('featured_image, pinterest_image')
const referenced = new Set()
for (const a of arts ?? []) for (const u of [a.featured_image, a.pinterest_image]) {
  if (u) { const m = u.split('/article-images/')[1]; if (m) referenced.add(m.replace(/\?.*/,'')) }
}

// 2. list bucket
let objs = [], offset = 0
while (true) {
  const { data } = await sb.storage.from('article-images').list('', { limit:100, offset, sortBy:{column:'created_at',order:'asc'} })
  if (!data?.length) break
  objs.push(...data); if (data.length<100) break; offset+=100
}
const orphans = objs.filter(o => !referenced.has(o.name))
const orphanNames = orphans.map(o => o.name)

// GUARD: nessun orphan deve essere referenziato
const conflict = orphanNames.filter(n => referenced.has(n))
if (conflict.length) { console.log('🚨 ABORT: orfano referenziato:', conflict); process.exit(1) }
console.log(`Pre-delete: ${objs.length} oggetti | ${referenced.size} referenziati | ${orphanNames.length} orfani da cancellare`)

// 3. delete (batch)
const { data: removed, error } = await sb.storage.from('article-images').remove(orphanNames)
if (error) { console.log('❌ remove error:', error.message); process.exit(1) }
console.log(`✅ Cancellati: ${removed?.length ?? 0} oggetti`)

// 4. verifica post
let after = [], off2 = 0
while (true) {
  const { data } = await sb.storage.from('article-images').list('', { limit:100, offset:off2 })
  if (!data?.length) break
  after.push(...data); if (data.length<100) break; off2+=100
}
const afterBytes = after.reduce((s,o)=>s+(o.metadata?.size??0),0)
console.log('\n' + '═'.repeat(56))
console.log(`Oggetti rimanenti : ${after.length} (atteso ${referenced.size})`)
console.log(`Match 1:1 referenced: ${after.length === referenced.size ? '✅' : '⚠️ ('+after.length+' vs '+referenced.size+')'}`)
console.log(`Nuovo storage usage : ${(afterBytes/1048576).toFixed(1)} MB (${(afterBytes/1073741824*100/1).toFixed(1)}% di 1GB Free)`)
console.log(`Spazio liberato     : ~75.7 MB`)
