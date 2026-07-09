// Seed link_expert DE + NL + RO + PL (nativo). Shop shop.doterra.com Pattern 1, OwnerID 15958005.
// Matching per-lingua: DE→DE/de_DE, NL→NL/nl_NL, RO→RO/ro_RO, PL→PL/pl_PL. Replace (delete+insert).
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
readFileSync(join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const OID = '15958005'
const url = (mkt, s) => `https://shop.doterra.com/${mkt}/shop/${s}/?OwnerID=${OID}`

// { slug, de, nl, ro, pl } — nomi nativi standard
const P = [
  { slug: 'lavender-oil', de: 'Lavendel', nl: 'Lavendel', ro: 'Lavandă', pl: 'Lawenda' },
  { slug: 'peppermint-oil', de: 'Pfefferminze', nl: 'Pepermunt', ro: 'Mentă', pl: 'Mięta Pieprzowa' },
  { slug: 'frankincense-oil', de: 'Weihrauch', nl: 'Wierook', ro: 'Tămâie', pl: 'Kadzidłowiec' },
  { slug: 'lemon-oil', de: 'Zitrone', nl: 'Citroen', ro: 'Lămâie', pl: 'Cytryna' },
  { slug: 'wild-orange-oil', de: 'Wilde Orange', nl: 'Wilde Sinaasappel', ro: 'Portocală Sălbatică', pl: 'Dzika Pomarańcza' },
  { slug: 'roman-chamomile-oil', de: 'Römische Kamille', nl: 'Romeinse Kamille', ro: 'Mușețel Roman', pl: 'Rumianek Rzymski' },
  { slug: 'cedarwood-oil', de: 'Zeder', nl: 'Ceder', ro: 'Cedru', pl: 'Drzewo Cedrowe' },
  { slug: 'vetiver-oil', de: 'Vetiver', nl: 'Vetiver', ro: 'Vetiver', pl: 'Wetiwer' },
  { slug: 'bergamot-oil', de: 'Bergamotte', nl: 'Bergamot', ro: 'Bergamotă', pl: 'Bergamotka' },
  { slug: 'eucalyptus-oil', de: 'Eukalyptus', nl: 'Eucalyptus', ro: 'Eucalipt', pl: 'Eukaliptus' },
  { slug: 'copaiba-oil', de: 'Copaiba', nl: 'Copaiba', ro: 'Copaiba', pl: 'Kopaiba' },
  { slug: 'ylang-ylang-oil', de: 'Ylang Ylang', nl: 'Ylang Ylang', ro: 'Ylang Ylang', pl: 'Ylang Ylang' },
  { slug: 'geranium-oil', de: 'Geranie', nl: 'Geranium', ro: 'Mușcată', pl: 'Geranium' },
  { slug: 'grapefruit-oil', de: 'Grapefruit', nl: 'Grapefruit', ro: 'Grepfrut', pl: 'Grejpfrut' },
  { slug: 'ginger-oil', de: 'Ingwer', nl: 'Gember', ro: 'Ghimbir', pl: 'Imbir' },
  { slug: 'spearmint-oil', de: 'Grüne Minze', nl: 'Groene Munt', ro: 'Mentă Verde', pl: 'Mięta Zielona' },
  { slug: 'clary-sage-oil', de: 'Muskatellersalbei', nl: 'Scharlei', ro: 'Salvie Sclarea', pl: 'Szałwia Muszkatołowa' },
  { slug: 'lime-oil', de: 'Limette', nl: 'Limoen', ro: 'Lime', pl: 'Limonka' },
  { slug: 'lemongrass-oil', de: 'Zitronengras', nl: 'Lemongras', ro: 'Lemongrass', pl: 'Trawa Cytrynowa' },
  { slug: 'doterra-serenity-oil', de: 'Serenity', nl: 'Serenity', ro: 'Serenity', pl: 'Serenity' },
  { slug: 'doterra-balance-oil', de: 'Balance', nl: 'Balance', ro: 'Balance', pl: 'Balance' },
  { slug: 'citrus-bliss-oil', de: 'Citrus Bliss', nl: 'Citrus Bliss', ro: 'Citrus Bliss', pl: 'Citrus Bliss' },
  { slug: 'onguard-oil', de: 'On Guard', nl: 'On Guard', ro: 'On Guard', pl: 'On Guard' },
  { slug: 'doterra-air-oil', de: 'Air (Atem)', nl: 'Air (Ademhaling)', ro: 'Air (Respirație)', pl: 'Air (Oddech)' },
  { slug: 'zengest-oil', de: 'ZenGest', nl: 'ZenGest', ro: 'ZenGest', pl: 'ZenGest' },
  { slug: 'aromatouch-oil', de: 'AromaTouch', nl: 'AromaTouch', ro: 'AromaTouch', pl: 'AromaTouch' },
  { slug: 'deep-blue-oil', de: 'Deep Blue', nl: 'Deep Blue', ro: 'Deep Blue', pl: 'Deep Blue' },
  { slug: 'lavender-touch-oil', de: 'Lavendel Touch', nl: 'Lavendel Touch', ro: 'Lavandă Touch', pl: 'Lawenda Touch' },
  { slug: 'frankincense-touch-oil', de: 'Weihrauch Touch', nl: 'Wierook Touch', ro: 'Tămâie Touch', pl: 'Kadzidłowiec Touch' },
]

const MKT = { de: 'DE/de_DE', nl: 'NL/nl_NL', ro: 'RO/ro_RO', pl: 'PL/pl_PL' }

async function run() {
  const idOf = async (lc) => (await sb.from('brands').select('id').eq('language_code', lc).single()).data?.id
  const ids = {}
  for (const lc of Object.keys(MKT)) { ids[lc] = await idOf(lc); if (!ids[lc]) { console.error(`❌ brand ${lc} non trovato`); process.exit(1) } }
  const rows = []
  for (const p of P) for (const lc of Object.keys(MKT)) {
    rows.push({ brand_id: ids[lc], anchor_text: p[lc], full_url: url(MKT[lc], p.slug), category: 'product', priority: 5, active: true })
  }
  await sb.from('link_expert').delete().in('brand_id', Object.values(ids))
  const { error } = await sb.from('link_expert').insert(rows)
  if (error) { console.error('❌', error.message); process.exit(1) }
  const { data: all } = await sb.from('link_expert').select('brand_id, full_url').in('brand_id', Object.values(ids))
  let resid = all.filter(r => /15957920/.test(r.full_url)).length, mix = 0
  for (const lc of Object.keys(MKT)) {
    const cnt = all.filter(r => r.brand_id === ids[lc]).length
    const bad = all.filter(r => r.brand_id === ids[lc] && !r.full_url.includes(`/${MKT[lc]}/`)).length
    mix += bad
    console.log(`  ${lc.toUpperCase()} ${cnt} link, mix ${bad} ${bad === 0 ? '✅' : '❌'} — es. ${all.find(r => r.brand_id === ids[lc]).full_url}`)
  }
  console.log(`residui 15957920: ${resid} ${resid === 0 ? '✅' : '❌'} | mix totale: ${mix} ${mix === 0 ? '✅ ZERO MIX' : '❌'}`)
}
run()
