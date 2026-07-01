/**
 * Crea le tabelle pinterest_pins + pinterest_boards.
 * Tenta via RPC exec; se non disponibile, stampa istruzioni per SQL editor.
 * NON tocca il token Pinterest — usa solo la service key Supabase (.env.local).
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY
const sb = createClient(url, key)
const sql = readFileSync(resolve(__dirname, 'pinterest-schema.sql'), 'utf8')

// Try RPC exec (same pattern as create-keywords-table.js)
const res = await fetch(`${url}/rest/v1/rpc/exec`, {
  method: 'POST',
  headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ sql }),
})
console.log('RPC exec status:', res.status)
if (!res.ok) {
  console.log('⚠️ RPC exec non disponibile. Esegui manualmente il contenuto di')
  console.log('   scripts/pinterest-schema.sql nello Supabase SQL editor.')
}

// Verify both tables exist
for (const t of ['pinterest_boards', 'pinterest_pins']) {
  const { error } = await sb.from(t).select('*', { head: true, count: 'exact' }).limit(1)
  console.log(`  ${t}: ${error ? '❌ ' + error.message : '✅ esiste'}`)
}
