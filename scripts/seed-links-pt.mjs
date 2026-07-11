// Seed link_expert PT (Portogallo SHOP). shop.doterra.com/PT/pt_PT Pattern 1, OwnerID 15958005.
// ⚠️ Verifica OGNI URL con fetch (lezione Spagna: slug EU inconsistenti): inserisce solo i 200,
// riporta i 404 da correggere/escludere. Anchor NATIVI portoghesi (mai riferimenti inglesi).
// + aggiorna affiliate_base_url del brand PT (gateway → shop).
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
readFileSync(join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const OID = '15958005'
const url = (slug) => `https://shop.doterra.com/PT/pt_PT/shop/${slug}/?OwnerID=${OID}`

// { slug, pt } — anchor NATIVO portoghese (blend = nome commerciale invariato)
const P = [
  { slug: 'lavender-oil', pt: 'Lavanda' },
  { slug: 'peppermint-oil', pt: 'Hortelã-Pimenta' },
  { slug: 'frankincense-oil', pt: 'Incenso' },
  { slug: 'lemon-oil', pt: 'Limão' },
  { slug: 'wild-orange-oil', pt: 'Laranja Silvestre' },
  { slug: 'roman-chamomile-oil', pt: 'Camomila Romana' },
  { slug: 'cedarwood-oil', pt: 'Cedro' },
  { slug: 'vetiver-oil', pt: 'Vetiver' },
  { slug: 'bergamot-oil', pt: 'Bergamota' },
  { slug: 'eucalyptus-oil', pt: 'Eucalipto' },
  { slug: 'copaiba-oil', pt: 'Copaíba' },
  { slug: 'ylang-ylang-oil', pt: 'Ylang Ylang' },
  { slug: 'geranium-oil', pt: 'Gerânio' },
  { slug: 'grapefruit-oil', pt: 'Toranja' },
  { slug: 'ginger-oil', pt: 'Gengibre' },
  { slug: 'spearmint-oil', pt: 'Hortelã-Verde' },
  { slug: 'clary-sage-oil', pt: 'Salva Esclareia' },
  { slug: 'lime-oil', pt: 'Lima' },
  { slug: 'lemongrass-oil', pt: 'Erva-Príncipe' },
  { slug: 'doterra-serenity-oil', pt: 'Serenity' },
  { slug: 'doterra-balance-oil', pt: 'Balance' },
  { slug: 'citrus-bliss-oil', pt: 'Citrus Bliss' },
  { slug: 'onguard-oil', pt: 'On Guard' },
  { slug: 'doterra-air-oil', pt: 'Air (Respiração)' },
  { slug: 'zengest-oil', pt: 'ZenGest' },
  { slug: 'aromatouch-oil', pt: 'AromaTouch' },
  { slug: 'deep-blue-oil', pt: 'Deep Blue' },
  { slug: 'lavender-touch-oil', pt: 'Lavanda Touch' },
  { slug: 'frankincense-touch-oil', pt: 'Incenso Touch' },
  // Kids / blend emotivi / oli gentili (available_in include pt nel knowledge-master)
  { slug: 'kids-collection-enrolment', pt: 'Kids Collection' },
  { slug: 'doterra-adaptiv-oil', pt: 'Adaptiv' },
  { slug: 'doterra-cheer-oil', pt: 'Cheer' },
  { slug: 'doterra-console-oil', pt: 'Console' },
  { slug: 'doterra-forgive-oil', pt: 'Forgive' },
  { slug: 'doterra-peace-oil', pt: 'Peace' },
  { slug: 'arborvitae-oil', pt: 'Tuia' },
  { slug: 'sandalwood-oil', pt: 'Sândalo' },
]

async function verify(u) {
  try {
    const r = await fetch(u, { method: 'GET', redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) })
    return r.status
  } catch { return 0 }
}

async function run() {
  const { data: brand } = await sb.from('brands').select('id').eq('language_code', 'pt').single()
  if (!brand) { console.error('❌ brand PT non trovato'); process.exit(1) }

  console.log('── verifica URL (fetch, solo i 200 vengono seminati) ──')
  const good = [], bad = []
  for (const p of P) {
    const u = url(p.slug)
    const code = await verify(u)
    if (code === 200) good.push(p)
    else { bad.push({ ...p, code }); console.log(`  ⚠️ ${code}  ${p.slug} (${p.pt}) — ESCLUSO`) }
  }
  console.log(`  → ${good.length}/${P.length} verificati 200${bad.length ? `, ${bad.length} esclusi` : ' ✅'}`)

  // replace: cancella e reinserisci solo i verificati
  await sb.from('link_expert').delete().eq('brand_id', brand.id)
  const rows = good.map(p => ({ brand_id: brand.id, anchor_text: p.pt, full_url: url(p.slug), category: 'product', priority: 5, active: true }))
  const { error } = await sb.from('link_expert').insert(rows)
  if (error) { console.error('❌', error.message); process.exit(1) }

  // affiliate_base_url: gateway → shop
  const shopAffiliate = `https://shop.doterra.com/PT/pt_PT/shop/essential-oils/?OwnerID=${OID}`
  await sb.from('brands').update({ affiliate_base_url: shopAffiliate }).eq('language_code', 'pt')

  const { data: all } = await sb.from('link_expert').select('full_url').eq('brand_id', brand.id).eq('active', true)
  const noId = all.filter(r => !/OwnerID=15958005/.test(r.full_url)).length
  const gw = all.filter(r => /office\.doterra/.test(r.full_url)).length
  console.log(`\nlink_expert PT: ${all.length} slug | senza OwnerID: ${noId} | gateway residui: ${gw}`)
  console.log(`affiliate_base_url PT → ${shopAffiliate}`)
  console.log(bad.length ? `\n⚠️ slug da rivedere: ${bad.map(b => b.slug).join(', ')}` : '\n✅ tutti gli slug 200')
}
run()
