// LittleSynergy — link_expert: (1) RIMUOVE gli oli avoid-list da tutte le lingue shop
// (difesa strutturale: "linkare = avallare", un olio in avvertenza non deve avere URL),
// (2) AGGIUNGE slug curati kids/mamma (Kids Collection + blend emotivi + oli gentili),
// anchor NATIVI, OwnerID 15958005. Availability presa dal doterra-knowledge-master (read-only).
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
readFileSync(join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const MASTER = JSON.parse(readFileSync('C:/Users/aless/Desktop/CLAUDE CODE/soloseo/doterra-knowledge-master.json', 'utf8'))
const CAT = MASTER.product_catalog

const OID = '15958005'
const MKT = { de: 'DE/de_DE', fr: 'FR/fr_FR', it: 'IT/it_IT', nl: 'NL/nl_NL', ro: 'RO/ro_RO', pl: 'PL/pl_PL' }
const SHOP_LANGS = ['en', 'es', 'fr', 'it', 'de', 'nl', 'ro', 'pl']
const AVOID = /(peppermint|eucalyptus|rosemary|wintergreen|cinnamon|clove|oregano|thyme)/i
const url = (lc, slug) => `https://shop.doterra.com/${MKT[lc]}/shop/${slug}/?OwnerID=${OID}`

// anchor NATIVI per slug (blend doTERRA = nome commerciale invariato)
const A = {
  'doterra-calmer-oil':        { de: 'Calmer', fr: 'Calmer', it: 'Calmer', nl: 'Calmer', ro: 'Calmer', pl: 'Calmer' },
  'kids-collection-kit':       { de: 'Kids Collection Set', it: 'Kit Kids Collection', nl: 'Kids Collection Set', ro: 'Set Kids Collection', pl: 'Zestaw Kids Collection' },
  'kids-collection-enrolment': { fr: 'Kids Collection', it: 'Kids Collection', nl: 'Kids Collection', ro: 'Kids Collection', pl: 'Kids Collection' },
  'doterra-adaptiv-oil':       { de: 'Adaptiv', fr: 'Adaptiv', it: 'Adaptiv', nl: 'Adaptiv', ro: 'Adaptiv', pl: 'Adaptiv' },
  'doterra-adaptiv-touch-oil': { de: 'Adaptiv Touch', fr: 'Adaptiv Touch', it: 'Adaptiv Touch', nl: 'Adaptiv Touch', ro: 'Adaptiv Touch', pl: 'Adaptiv Touch' },
  'doterra-cheer-oil':         { de: 'Cheer', fr: 'Cheer', it: 'Cheer', nl: 'Cheer', ro: 'Cheer', pl: 'Cheer' },
  'doterra-cheer-touch-oil':   { de: 'Cheer Touch', fr: 'Cheer Touch', it: 'Cheer Touch', nl: 'Cheer Touch', ro: 'Cheer Touch', pl: 'Cheer Touch' },
  'doterra-console-oil':       { fr: 'Console', it: 'Console', nl: 'Console', ro: 'Console', pl: 'Console' },
  'doterra-console-touch-oil': { fr: 'Console Touch', it: 'Console Touch', nl: 'Console Touch', ro: 'Console Touch', pl: 'Console Touch' },
  'doterra-forgive-oil':       { fr: 'Forgive', it: 'Forgive', nl: 'Forgive', ro: 'Forgive', pl: 'Forgive' },
  'doterra-peace-oil':         { fr: 'Peace', it: 'Peace', nl: 'Peace', ro: 'Peace', pl: 'Peace' },
  'arborvitae-oil':            { de: 'Lebensbaum', fr: 'Thuya', it: 'Tuia', nl: 'Levensboom', ro: 'Arborele Vieții', pl: 'Żywotnik' },
  'magnolia-touch-oil':        { fr: 'Magnolia Touch' },
  'petitgrain-oil':            { fr: 'Petitgrain', it: 'Petitgrain', nl: 'Petitgrain', ro: 'Petitgrain', pl: 'Petitgrain' },
  'juniper-berry-oil':         { fr: 'Baies de genévrier', it: 'Bacche di Ginepro', nl: 'Jeneverbes', ro: 'Fructe de Ienupăr', pl: 'Jałowiec' },
  'siberian-fir-oil':          { de: 'Sibirische Tanne', fr: 'Sapin de Sibérie', it: 'Abete Siberiano', nl: 'Siberische Zilverspar', ro: 'Brad Siberian', pl: 'Jodła Syberyjska' },
  'douglas-fir-oil':           { fr: 'Sapin de Douglas', it: 'Abete di Douglas', nl: 'Douglasspar', ro: 'Brad de Douglas', pl: 'Jodła Douglasa' },
  'sandalwood-oil':            { de: 'Sandelholz', fr: 'Bois de santal', it: 'Legno di Sandalo', nl: 'Sandelhout', ro: 'Lemn de Santal', pl: 'Drzewo Sandałowe' },
  'helichrysum-oil':           { fr: 'Hélichryse', it: 'Elicriso', nl: 'Strobloem', ro: 'Siminoc', pl: 'Kocanka' },
  'neroli-touch-oil':          { de: 'Neroli Touch', fr: 'Neroli Touch', it: 'Neroli Touch', nl: 'Neroli Touch', ro: 'Neroli Touch', pl: 'Neroli Touch' },
  'jasmine-touch-oil':         { fr: 'Jasmin Touch' },
  'rose-touch-oil':            { de: 'Rose Touch', fr: 'Rose Touch', it: 'Rosa Touch', nl: 'Roos Touch', ro: 'Trandafir Touch', pl: 'Róża Touch' },
}

const brandId = async (lc) => (await sb.from('brands').select('id').eq('language_code', lc).single()).data?.id

// ---------- 1. rimuovi avoid-list da tutte le lingue shop ----------
console.log('── 1. rimozione oli avoid-list dal link_expert ──')
for (const lc of SHOP_LANGS) {
  const id = await brandId(lc)
  const { data: rows } = await sb.from('link_expert').select('id, anchor_text, full_url').eq('brand_id', id)
  const bad = (rows ?? []).filter(r => AVOID.test(r.full_url))
  if (bad.length) {
    await sb.from('link_expert').delete().in('id', bad.map(r => r.id))
  }
  console.log(`  ${lc.padEnd(3)} rimossi ${String(bad.length).padStart(2)}  ${bad.map(b => b.anchor_text).join(', ') || '—'}`)
}

// ---------- 2. espansione kids-curata (solo le 6 nuove) ----------
console.log('\n── 2. espansione kids-curata (anchor nativi) ──')
for (const lc of Object.keys(MKT)) {
  const id = await brandId(lc)
  const { data: existing } = await sb.from('link_expert').select('full_url').eq('brand_id', id)
  const have = new Set((existing ?? []).map(r => r.full_url))
  const rows = []
  for (const [slug, names] of Object.entries(A)) {
    const entry = CAT[slug]
    if (!entry || !(entry.available_in ?? []).includes(lc)) continue // non esiste in quel mercato
    const anchor = names[lc]
    if (!anchor) continue
    if (AVOID.test(slug)) continue // guard: mai un avoid-oil
    const u = url(lc, slug)
    if (have.has(u)) continue
    rows.push({ brand_id: id, anchor_text: anchor, full_url: u, category: 'product', priority: 6, active: true })
  }
  if (rows.length) {
    const { error } = await sb.from('link_expert').insert(rows)
    if (error) { console.error(`  ❌ ${lc}: ${error.message}`); continue }
  }
  const { count } = await sb.from('link_expert').select('id', { count: 'exact', head: true }).eq('brand_id', id).eq('active', true)
  console.log(`  ${lc.padEnd(3)} +${String(rows.length).padStart(2)} nuovi → ${count} slug totali`)
}

// ---------- 3. verifica finale ----------
console.log('\n── 3. verifica finale ──')
let residui = 0, mix = 0
for (const lc of SHOP_LANGS) {
  const id = await brandId(lc)
  const { data: rows } = await sb.from('link_expert').select('full_url').eq('brand_id', id).eq('active', true)
  const bad = (rows ?? []).filter(r => AVOID.test(r.full_url)).length
  const noId = (rows ?? []).filter(r => !/OwnerID=15958005/.test(r.full_url)).length
  residui += bad; mix += noId
  console.log(`  ${lc.padEnd(3)} ${String(rows.length).padStart(3)} slug | avoid-oil ${bad} | senza OwnerID ${noId}`)
}
console.log(`\navoid-oil residui: ${residui} ${residui === 0 ? '✅' : '❌'} | senza OwnerID: ${mix} ${mix === 0 ? '✅' : '❌'}`)
