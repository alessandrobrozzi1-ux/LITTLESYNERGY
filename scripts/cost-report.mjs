import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// struttura cost_log
const { data: sample, error } = await sb.from('cost_log').select('*').order('created_at',{ascending:false}).limit(3)
if (error) { console.log('cost_log non disponibile:', error.message); process.exit(0) }
console.log('Colonne cost_log:', sample.length ? Object.keys(sample[0]).join(', ') : '(vuota)')
console.log('Ultime righe:')
for (const r of sample) console.log('  ', JSON.stringify(r).slice(0,160))

// somma per giorno (ultimi 7 giorni)
const { data: all } = await sb.from('cost_log').select('*').order('created_at',{ascending:false}).limit(500)
const costField = sample[0] ? (['cost_usd','cost','amount','usd','total_cost'].find(k=>k in sample[0])) : null
console.log(`\nCampo costo rilevato: ${costField ?? 'NESSUNO'}`)
if (!costField) process.exit(0)

const byDay = {}
for (const r of all ?? []) {
  const d = (r.created_at||'').slice(0,10)
  byDay[d] = (byDay[d]??0) + (Number(r[costField])||0)
}
console.log('\nCosto reale per giorno (cost_log):')
for (const d of Object.keys(byDay).sort().reverse().slice(0,7)) {
  console.log(`  ${d}: $${byDay[d].toFixed(4)}`)
}
// breakdown per tipo oggi (se c'è un campo type/operation/model)
const today = new Date().toISOString().slice(0,10)
const typeField = sample[0] ? (['type','operation','kind','model','category'].find(k=>k in sample[0])) : null
if (typeField) {
  const todayRows = (all ?? []).filter(r => (r.created_at||'').slice(0,10)===today)
  const byType = {}
  for (const r of todayRows) byType[r[typeField]] = (byType[r[typeField]]??0) + (Number(r[costField])||0)
  console.log(`\nBreakdown oggi (${today}) per ${typeField}:`)
  for (const [t,v] of Object.entries(byType)) console.log(`  ${t}: $${v.toFixed(4)}`)
}
