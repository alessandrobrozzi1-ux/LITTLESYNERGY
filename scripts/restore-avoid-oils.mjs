// RIPRISTINO catalogo COMPLETO: rimette gli oli "forti" (peppermint/eucalyptus/…) nel
// link_expert delle 6 lingue nuove. EN/ES si ripristinano ri-lanciando l'importer del Main.
// Il presidio NON è mutilare il catalogo: è la regola prompt + il giudizio del modello.
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
readFileSync(join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const OID = '15958005'
const MKT = { de: 'DE/de_DE', fr: 'FR/fr_FR', it: 'IT/it_IT', nl: 'NL/nl_NL', ro: 'RO/ro_RO', pl: 'PL/pl_PL' }
const url = (lc, slug) => `https://shop.doterra.com/${MKT[lc]}/shop/${slug}/?OwnerID=${OID}`

// anchor nativi degli oli rimossi per errore (stessi del seed originale)
const RESTORE = {
  'peppermint-oil': { de: 'Pfefferminze', fr: 'Menthe poivrée', it: 'Menta Piperita', nl: 'Pepermunt', ro: 'Mentă', pl: 'Mięta Pieprzowa' },
  'eucalyptus-oil': { de: 'Eukalyptus', fr: 'Eucalyptus', it: 'Eucalipto', nl: 'Eucalyptus', ro: 'Eucalipt', pl: 'Eukaliptus' },
}

const brandId = async (lc) => (await sb.from('brands').select('id').eq('language_code', lc).single()).data?.id

console.log('── ripristino oli forti nelle 6 lingue nuove ──')
for (const lc of Object.keys(MKT)) {
  const id = await brandId(lc)
  const { data: existing } = await sb.from('link_expert').select('full_url').eq('brand_id', id)
  const have = new Set((existing ?? []).map(r => r.full_url))
  const rows = []
  for (const [slug, names] of Object.entries(RESTORE)) {
    const u = url(lc, slug)
    if (have.has(u)) continue
    rows.push({ brand_id: id, anchor_text: names[lc], full_url: u, category: 'product', priority: 5, active: true })
  }
  if (rows.length) {
    const { error } = await sb.from('link_expert').insert(rows)
    if (error) { console.error(`  ❌ ${lc}: ${error.message}`); continue }
  }
  const { count } = await sb.from('link_expert').select('id', { count: 'exact', head: true }).eq('brand_id', id).eq('active', true)
  console.log(`  ${lc.padEnd(3)} +${rows.length} ripristinati → ${count} slug`)
}
console.log('\n(EN/ES: ri-lancia scripts/import-link-expert-from-main.mjs per il catalogo completo del Main)')
