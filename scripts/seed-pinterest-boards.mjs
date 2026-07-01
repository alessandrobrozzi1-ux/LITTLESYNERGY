/**
 * Fetch dei board Pinterest reali + auto-mapping + upsert in pinterest_boards.
 * ESEGUITO DALL'UTENTE (richiede PINTEREST_ACCESS_TOKEN in .env.local).
 *
 * Auto-classifica per nome:
 *  - lingua: ES se nome contiene parole spagnole, altrimenti EN
 *  - topic: sleep | lifestyle | main (default)
 *  - is_main: true se nome contiene "guide"/"essential oils"/"aceites esenciales"
 *
 * Stampa la mappatura proposta e fa upsert. Correggi a mano nel DB se serve.
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const TOKEN = process.env.PINTEREST_ACCESS_TOKEN
if (!TOKEN) { console.log('❌ PINTEREST_ACCESS_TOKEN mancante in .env.local'); process.exit(1) }
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

async function fetchBoards() {
  const out = []
  let bookmark = ''
  do {
    const u = new URL('https://api.pinterest.com/v5/boards')
    u.searchParams.set('page_size', '100')
    if (bookmark) u.searchParams.set('bookmark', bookmark)
    const res = await fetch(u, { headers: { Authorization: `Bearer ${TOKEN}` } })
    if (!res.ok) { console.log(`❌ GET /boards ${res.status}: ${await res.text()}`); process.exit(1) }
    const d = await res.json()
    for (const b of d.items ?? []) out.push({ id: b.id, name: b.name })
    bookmark = d.bookmark ?? ''
  } while (bookmark)
  return out
}

function classify(name) {
  const n = name.toLowerCase()
  const isES = /(aceites|sueño|sueno|relajaci|bienestar|estilo de vida|natural\b.*\bes)/.test(n) ||
               /\b(esenciales|doterra)\b/.test(n) && /(aceites|sueño|bienestar|estilo)/.test(n)
  const lang = isES ? 'es' : 'en'
  let topic = 'main', main = false
  if (/(sleep|sueño|sueno|relax|relaj|dormir)/.test(n)) topic = 'sleep'
  else if (/(lifestyle|wellness|bienestar|estilo de vida)/.test(n)) topic = 'lifestyle'
  if (/(guide|essential oils|aceites esenciales)/.test(n) && topic === 'main') { main = true }
  return { language_code: lang, topic_category: topic, is_main_board: main }
}

const boards = await fetchBoards()
console.log(`\nBoard trovati: ${boards.length}`)
console.log('═'.repeat(72))

const rows = []
for (const b of boards) {
  const c = classify(b.name)
  rows.push({ id: b.id, board_name: b.name, ...c })
  console.log(`[${c.language_code.toUpperCase()}] ${c.is_main_board ? '★ MAIN ' : '       '} topic=${c.topic_category.padEnd(9)} | ${b.name}`)
  console.log(`        id: ${b.id}`)
}

if (rows.length) {
  const { error } = await sb.from('pinterest_boards').upsert(rows, { onConflict: 'id' })
  console.log(error ? `\n❌ upsert: ${error.message}` : `\n✅ upsert ${rows.length} board in pinterest_boards`)
}
console.log('\n⚠️ Verifica la mappatura sopra. Se un board è classificato male,')
console.log('   correggi con: UPDATE pinterest_boards SET is_main_board=..., topic_category=... WHERE id=...')
