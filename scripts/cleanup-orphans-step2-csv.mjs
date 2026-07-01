/** STEP 2 — scrive il CSV di backup degli orfani. NESSUN delete. */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const sb = createClient(URL, process.env.SUPABASE_SERVICE_KEY)

const { data: arts } = await sb.from('articles').select('featured_image, pinterest_image')
const referenced = new Set()
for (const a of arts ?? []) for (const u of [a.featured_image, a.pinterest_image]) {
  if (u) { const m = u.split('/article-images/')[1]; if (m) referenced.add(m.replace(/\?.*/,'')) }
}

let objs = [], offset = 0
while (true) {
  const { data } = await sb.storage.from('article-images').list('', { limit:100, offset, sortBy:{column:'created_at',order:'asc'} })
  if (!data?.length) break
  objs.push(...data); if (data.length<100) break; offset+=100
}
const orphans = objs.filter(o => !referenced.has(o.name))

const rows = [['filename','url','size_bytes','created_at','status']]
for (const o of orphans) rows.push([
  o.name,
  `${URL}/storage/v1/object/public/article-images/${o.name}`,
  o.metadata?.size ?? 0,
  o.created_at,
  'orphan',
])
const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
const out = resolve(__dirname, 'cleanup-log-2026-06-26.csv')
writeFileSync(out, csv, 'utf8')
console.log(`✅ CSV scritto: ${out}`)
console.log(`   Righe orfani: ${orphans.length} | Size totale: ${(orphans.reduce((s,o)=>s+(o.metadata?.size??0),0)/1048576).toFixed(1)} MB`)
console.log(`   Referenziati (da NON cancellare): ${referenced.size}`)
