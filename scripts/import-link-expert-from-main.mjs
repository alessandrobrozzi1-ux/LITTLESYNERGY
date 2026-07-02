/**
 * Import link_expert dal main (essentialsynergybr) in LittleSynergy (DB Davidino).
 * Sorgente = export JSON { products:[{product_slug, en_names[], url_en, es_names[], url_es}], main_ownerid }.
 * Swap OwnerID: main_ownerid → TARGET_OID (Davidino 15958005). Replace (delete+insert) per brand EN/ES.
 * Matching per-lingua INTRINSECO: url_en → brand EN, url_es → brand ES (mai mischiati).
 *
 * Uso: node scripts/import-link-expert-from-main.mjs [exportPath] [targetOwnerID]
 * Default export: C:\Users\aless\Desktop\link-expert-export-main.json · target: 15958005 (Davidino)
 * Legge NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_KEY da .env.local. Nessun secret nel file.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
readFileSync(join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const EXPORT_PATH = process.argv[2] || 'C:/Users/aless/Desktop/link-expert-export-main.json'
const TARGET_OID = process.argv[3] || '15958005'

const raw = JSON.parse(readFileSync(EXPORT_PATH, 'utf8'))
const SRC_OID = String(raw.main_ownerid)
const swap = (u) => (u ? u.split(SRC_OID).join(TARGET_OID) : u)

const brandId = async (lang) => (await sb.from('brands').select('id').eq('language_code', lang).single()).data?.id
const EN_FMT = /^https:\/\/www\.doterra\.com\/US\/en\/p\//
const ES_FMT = /^https:\/\/shop\.doterra\.com\/ES\/es_ES\/shop\//

async function run() {
  const EN = await brandId('en'), ES = await brandId('es')
  if (!EN || !ES) { console.error('❌ brand EN/ES non trovati'); process.exit(1) }

  const rows = []
  for (const p of raw.products) {
    if (p.url_en && p.en_names?.length) for (const name of p.en_names)
      rows.push({ brand_id: EN, anchor_text: name, full_url: swap(p.url_en), category: 'product', priority: 5, active: true, notes: 'imported from main (verified)' })
    if (p.url_es && p.es_names?.length) for (const name of p.es_names)
      rows.push({ brand_id: ES, anchor_text: name, full_url: swap(p.url_es), category: 'product', priority: 5, active: true, notes: 'imported from main (verified)' })
  }
  const enRows = rows.filter(r => r.brand_id === EN), esRows = rows.filter(r => r.brand_id === ES)
  console.log(`Prodotti: ${raw.products.length} (SRC OwnerID ${SRC_OID} → ${TARGET_OID}) · righe: EN ${enRows.length} + ES ${esRows.length} = ${rows.length}`)

  await sb.from('link_expert').delete().in('brand_id', [EN, ES]) // replace
  for (let i = 0; i < rows.length; i += 100) {
    const { error } = await sb.from('link_expert').insert(rows.slice(i, i + 100))
    if (error) { console.error('❌ insert error:', error.message); process.exit(1) }
  }

  // Verifiche
  const { data: all } = await sb.from('link_expert').select('brand_id, anchor_text, full_url').in('brand_id', [EN, ES])
  const en = all.filter(r => r.brand_id === EN), es = all.filter(r => r.brand_id === ES)
  const resid = all.filter(r => r.full_url.includes(SRC_OID)).length
  const swapOk = all.filter(r => r.full_url.includes(TARGET_OID)).length
  // ANTI-MIX bidirezionale
  const enWrong = en.filter(r => !EN_FMT.test(r.full_url)).length       // EN brand con URL non-US (mix)
  const esWrong = es.filter(r => !ES_FMT.test(r.full_url)).length       // ES brand con URL non-España (mix)
  const enHasES = en.filter(r => ES_FMT.test(r.full_url)).length        // link ES finiti in brand EN
  const esHasEN = es.filter(r => EN_FMT.test(r.full_url)).length        // link EN finiti in brand ES

  console.log('\n=== VERIFICA IMPORT ===')
  console.log(`Righe: EN ${en.length} · ES ${es.length} · TOT ${all.length}`)
  console.log(`OwnerID swap: righe con ${TARGET_OID}: ${swapOk}/${all.length} · residui ${SRC_OID}: ${resid} ${resid === 0 ? '✅' : '❌'}`)
  console.log(`Formato URL errato: EN ${enWrong} · ES ${esWrong} ${enWrong + esWrong === 0 ? '✅' : '❌'}`)
  console.log(`MATCHING per-lingua (0 mix atteso): link ES dentro brand EN = ${enHasES} · link EN dentro brand ES = ${esHasEN} ${enHasES + esHasEN === 0 ? '✅ ZERO MIX' : '❌ MIX!'}`)
  console.log(`\nEsempi EN: ` + en.slice(0, 3).map(r => `${r.anchor_text} → ${r.full_url}`).join('\n           '))
  console.log(`Esempi ES: ` + es.slice(0, 3).map(r => `${r.anchor_text} → ${r.full_url}`).join('\n           '))
}
run()
