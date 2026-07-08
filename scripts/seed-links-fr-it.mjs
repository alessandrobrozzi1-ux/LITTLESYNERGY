// Seed link_expert FR + IT (nativo). Shop shop.doterra.com Pattern 1, OwnerID 15958005.
// Matching per-lingua: FR→brand FR (fr_FR), IT→brand IT (it_IT). Replace (delete+insert).
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
readFileSync(join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const OID = '15958005'
const frUrl = (s) => `https://shop.doterra.com/FR/fr_FR/shop/${s}/?OwnerID=${OID}`
const itUrl = (s) => `https://shop.doterra.com/IT/it_IT/shop/${s}/?OwnerID=${OID}`

// { slug, it, fr } — nomi nativi
const P = [
  { slug: 'lavender-oil', it: 'Lavanda', fr: 'Lavande' },
  { slug: 'peppermint-oil', it: 'Menta Piperita', fr: 'Menthe poivrée' },
  { slug: 'frankincense-oil', it: 'Incenso', fr: 'Encens' },
  { slug: 'lemon-oil', it: 'Limone', fr: 'Citron' },
  { slug: 'wild-orange-oil', it: 'Arancio Selvatico', fr: 'Orange sauvage' },
  { slug: 'roman-chamomile-oil', it: 'Camomilla Romana', fr: 'Camomille romaine' },
  { slug: 'cedarwood-oil', it: 'Cedro', fr: 'Cèdre' },
  { slug: 'vetiver-oil', it: 'Vetiver', fr: 'Vétiver' },
  { slug: 'bergamot-oil', it: 'Bergamotto', fr: 'Bergamote' },
  { slug: 'eucalyptus-oil', it: 'Eucalipto', fr: 'Eucalyptus' },
  { slug: 'copaiba-oil', it: 'Copaiba', fr: 'Copaïba' },
  { slug: 'ylang-ylang-oil', it: 'Ylang Ylang', fr: 'Ylang Ylang' },
  { slug: 'geranium-oil', it: 'Geranio', fr: 'Géranium' },
  { slug: 'grapefruit-oil', it: 'Pompelmo', fr: 'Pamplemousse' },
  { slug: 'ginger-oil', it: 'Zenzero', fr: 'Gingembre' },
  { slug: 'spearmint-oil', it: 'Menta Verde', fr: 'Menthe verte' },
  { slug: 'clary-sage-oil', it: 'Salvia Sclarea', fr: 'Sauge sclarée' },
  { slug: 'lime-oil', it: 'Lime', fr: 'Citron vert' },
  { slug: 'lemongrass-oil', it: 'Lemongrass', fr: 'Citronnelle' },
  { slug: 'doterra-serenity-oil', it: 'Serenity', fr: 'Serenity' },
  { slug: 'doterra-balance-oil', it: 'Balance', fr: 'Balance' },
  { slug: 'citrus-bliss-oil', it: 'Citrus Bliss', fr: 'Citrus Bliss' },
  { slug: 'onguard-oil', it: 'On Guard', fr: 'On Guard' },
  { slug: 'doterra-air-oil', it: 'Air (Respiratorio)', fr: 'Air (Respiratoire)' },
  { slug: 'zengest-oil', it: 'ZenGest', fr: 'ZenGest' },
  { slug: 'aromatouch-oil', it: 'AromaTouch', fr: 'AromaTouch' },
  { slug: 'deep-blue-oil', it: 'Deep Blue', fr: 'Deep Blue' },
  { slug: 'lavender-touch-oil', it: 'Lavanda Touch', fr: 'Lavande Touch' },
  { slug: 'frankincense-touch-oil', it: 'Incenso Touch', fr: 'Encens Touch' },
]

async function run() {
  const idOf = async (lc) => (await sb.from('brands').select('id').eq('language_code', lc).single()).data?.id
  const FR = await idOf('fr'), IT = await idOf('it')
  if (!FR || !IT) { console.error('❌ brand FR/IT non trovati'); process.exit(1) }
  const rows = []
  for (const p of P) {
    rows.push({ brand_id: IT, anchor_text: p.it, full_url: itUrl(p.slug), category: 'product', priority: 5, active: true })
    rows.push({ brand_id: FR, anchor_text: p.fr, full_url: frUrl(p.slug), category: 'product', priority: 5, active: true })
  }
  await sb.from('link_expert').delete().in('brand_id', [FR, IT])
  const { error } = await sb.from('link_expert').insert(rows)
  if (error) { console.error('❌', error.message); process.exit(1) }
  const cnt = async (id) => (await sb.from('link_expert').select('id', { count: 'exact', head: true }).eq('brand_id', id)).count
  const { data: all } = await sb.from('link_expert').select('brand_id, full_url').in('brand_id', [FR, IT])
  const frMix = all.filter(r => r.brand_id === FR && !/\/FR\/fr_FR\//.test(r.full_url)).length
  const itMix = all.filter(r => r.brand_id === IT && !/\/IT\/it_IT\//.test(r.full_url)).length
  const resid = all.filter(r => /15957920/.test(r.full_url)).length
  console.log(`✅ IT ${await cnt(IT)} · FR ${await cnt(FR)} link | residui 15957920: ${resid} ${resid === 0 ? '✅' : '❌'} | mix: FR-non-fr ${frMix}, IT-non-it ${itMix} ${frMix + itMix === 0 ? '✅ ZERO MIX' : '❌'}`)
  console.log(`   es. IT: ${all.find(r => r.brand_id === IT).full_url}`)
  console.log(`   es. FR: ${all.find(r => r.brand_id === FR).full_url}`)
}
run()
