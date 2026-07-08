/**
 * Retro re-clean em-dash (spaziato + attaccato) sui published, byline PRESERVATA.
 * Stessa logica di stripEmDashes in generate-article. Nessuna rigenerazione, no re-embed (costo zero).
 * Uso: node scripts/reclean-emdash.mjs [--apply]   (senza --apply = dry-run)
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
readFileSync(join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const APPLY = process.argv.includes('--apply')

const stripEmDashes = (content) => content.split('\n').map((line) => {
  const t = line.trim()
  if (t.startsWith('*') && /LittleSynergy/i.test(line)) return line // byline: intatta
  return line.replace(/\s*[—–]\s*/g, ', ').replace(/ ,/g, ',').replace(/,\s*,/g, ',').replace(/,\s*([.!?;:])/g, '$1')
}).join('\n')
const dashes = (s) => (s.match(/[—–]/g) || []).length
const bylineOf = (c) => c.split('\n').find(l => l.trim().startsWith('*') && /LittleSynergy/i.test(l)) || ''

// ── UNIT TEST byline (author line reali EN+ES) ────────────────────────────────
console.log('=== UNIT TEST byline (devono restare INTATTE) ===')
const bylines = [
  '*By the LittleSynergy Team — moms, Wellness Advocates & doTERRA enthusiasts*',
  '*Por el Equipo LittleSynergy — mamás, Wellness Advocates y entusiastas doTERRA*',
]
const sampleBody = 'Lavender is gentle — many parents find it soothing. Vetiver, an earthy oil—deep and grounding, anchors the night.'
for (const b of bylines) { const out = stripEmDashes(b); console.log('  byline ' + (out === b ? 'INTATTA ✅' : 'MODIFICATA ❌') + ' → ' + out) }
console.log('  body sample → ' + stripEmDashes(sampleBody) + ' (em-dash rimasti: ' + dashes(stripEmDashes(sampleBody)) + ')')

// ── RETRO sui published ───────────────────────────────────────────────────────
;(async () => {
  console.log('\n=== RETRO ' + (APPLY ? '(APPLY)' : '(DRY-RUN)') + ' ===')
  const { data } = await sb.from('articles').select('id,slug,content_markdown').eq('status', 'published')
  let touched = 0
  for (const a of (data || [])) {
    const c = a.content_markdown || ''
    const bylineBefore = bylineOf(c)
    const cleaned = stripEmDashes(c)
    const before = dashes(c), after = dashes(cleaned)
    const bylineAfter = bylineOf(cleaned)
    const bylineOk = bylineBefore === bylineAfter && bylineAfter !== ''
    if (before === after) continue // nessun em-dash o nulla da fare
    touched++
    console.log('  ' + a.slug + ': em-dash ' + before + '→' + after + ' | byline ' + (bylineOk ? 'INTATTA ✅' : 'ATTENZIONE ⚠️'))
    if (APPLY) await sb.from('articles').update({ content_markdown: cleaned }).eq('id', a.id)
  }
  console.log('  articoli ' + (APPLY ? 'puliti' : 'da pulire') + ': ' + touched)
  if (!APPLY) console.log('  (dry-run — rilancia con --apply per scrivere)')
})()
