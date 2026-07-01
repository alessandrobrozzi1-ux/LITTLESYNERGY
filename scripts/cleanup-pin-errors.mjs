import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// count before
const { count: before } = await sb.from('pinterest_pins')
  .select('*', { count: 'exact', head: true }).eq('status', 'error')
console.log(`Righe status='error' prima: ${before ?? 0}`)

const { data: deleted, error } = await sb.from('pinterest_pins')
  .delete().eq('status', 'error').select('id')
if (error) { console.log('❌', error.message); process.exit(1) }
console.log(`✅ Eliminate ${deleted?.length ?? 0} righe error`)

// remaining state
const { data: rows } = await sb.from('pinterest_pins').select('status')
const byStatus = {}
for (const r of rows ?? []) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1
console.log('pinterest_pins rimanenti per status:', JSON.stringify(byStatus))
