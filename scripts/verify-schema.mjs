import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY

const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── QUERY 1: Schema reale via information_schema ───────────────────────────
console.log('\n══ QUERY 1: Schema reale tabella articles ══')
const schemaRes = await fetch(
  `${SUPABASE_URL}/rest/v1/`,
  { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
)

// Use Supabase select * to get column names from a real row
const { data: row, error: rowErr } = await sb.from('articles').select('*').limit(1).single()
if (rowErr) {
  console.log('ERROR reading row:', rowErr.message)
} else {
  console.log('Colonne reali (da SELECT *):', Object.keys(row).join('\n  - '))
}

// ── QUERY 2: Quale colonna ha content reale ────────────────────────────────
console.log('\n══ QUERY 2: Articoli pubblicati — quale colonna ha testo ══')

// Try content_markdown
const { data: cm, error: cmErr } = await sb
  .from('articles')
  .select('id, slug, content_markdown')
  .eq('status', 'published')
  .order('created_at', { ascending: false })
  .limit(5)

if (cmErr) {
  console.log('SELECT content_markdown → ERROR:', cmErr.message)
} else {
  console.log('SELECT content_markdown → OK, lunghezze:')
  cm.forEach(a => console.log(`  ${a.slug}: ${a.content_markdown?.length ?? 'NULL'} chars`))
}

// Try content
const { data: c, error: cErr } = await sb
  .from('articles')
  .select('id, slug, content')
  .eq('status', 'published')
  .order('created_at', { ascending: false })
  .limit(5)

if (cErr) {
  console.log('SELECT content → ERROR:', cErr.message)
} else {
  console.log('SELECT content → OK, lunghezze:')
  c.forEach(a => console.log(`  ${a.slug}: ${a.content?.length ?? 'NULL'} chars`))
}
