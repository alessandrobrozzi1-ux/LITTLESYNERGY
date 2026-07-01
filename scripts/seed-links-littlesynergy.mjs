// LittleSynergy — seed link_expert per EN (US, Pattern 2 www) + ES (Spagna, Pattern 1 shop).
// OwnerID 15958005 (Davidino). Legge .env.local (Supabase Davidino). Slug = catalogo doTERRA
// validato in SoloSEO (EU/US shared naming). ⚠️ Spot-check browser consigliato prima di active=true.
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
readFileSync(resolve(__dirname, '../.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const OID = '15958005'
// EN = US market (Pattern 2): https://www.doterra.com/US/en/p/[slug]/?OwnerID=
const enUrl = (slug) => `https://www.doterra.com/US/en/p/${slug}/?OwnerID=${OID}`
// ES = Spain market (Pattern 1): https://shop.doterra.com/ES/es_ES/shop/[slug]/?OwnerID=
const esUrl = (slug) => `https://shop.doterra.com/ES/es_ES/shop/${slug}/?OwnerID=${OID}`

// { slug, en, es, pri, cat }  — pri alta = rilevante nicchia bambini/mamme
const P = [
  // Kid/mom star singles
  { slug: 'lavender-oil', en: 'Lavender', es: 'Lavanda', pri: 10 },
  { slug: 'roman-chamomile-oil', en: 'Roman Chamomile', es: 'Manzanilla Romana', pri: 9 },
  { slug: 'frankincense-oil', en: 'Frankincense', es: 'Incienso', pri: 9 },
  { slug: 'cedarwood-oil', en: 'Cedarwood', es: 'Cedro', pri: 8 },
  { slug: 'wild-orange-oil', en: 'Wild Orange', es: 'Naranja Salvaje', pri: 8 },
  { slug: 'vetiver-oil', en: 'Vetiver', es: 'Vetiver', pri: 7 },
  { slug: 'bergamot-oil', en: 'Bergamot', es: 'Bergamota', pri: 7 },
  { slug: 'copaiba-oil', en: 'Copaiba', es: 'Copaiba', pri: 7 },
  { slug: 'lemon-oil', en: 'Lemon', es: 'Limón', pri: 7 },
  { slug: 'ylang-ylang-oil', en: 'Ylang Ylang', es: 'Ylang Ylang', pri: 6 },
  { slug: 'spearmint-oil', en: 'Spearmint', es: 'Hierba Buena', pri: 6 },
  { slug: 'grapefruit-oil', en: 'Grapefruit', es: 'Pomelo', pri: 5 },
  { slug: 'geranium-oil', en: 'Geranium', es: 'Geranio', pri: 5 },
  { slug: 'ginger-oil', en: 'Ginger', es: 'Jengibre', pri: 5 },
  { slug: 'clary-sage-oil', en: 'Clary Sage', es: 'Salvia Sclarea', pri: 5 },
  { slug: 'lime-oil', en: 'Lime', es: 'Lima', pri: 4 },
  { slug: 'lemongrass-oil', en: 'Lemongrass', es: 'Hierba de Limón', pri: 4 },
  // Higher-caution singles (kept, article handles caution via prompt)
  { slug: 'peppermint-oil', en: 'Peppermint', es: 'Menta', pri: 6 },
  { slug: 'eucalyptus-oil', en: 'Eucalyptus', es: 'Eucalipto', pri: 5 },
  // Blends (kid/family relevant)
  { slug: 'doterra-serenity-oil', en: 'Serenity (Restful Blend)', es: 'Serenity', pri: 9 },
  { slug: 'doterra-balance-oil', en: 'Balance (Grounding Blend)', es: 'Balance', pri: 8 },
  { slug: 'citrus-bliss-oil', en: 'Citrus Bliss', es: 'Citrus Bliss', pri: 7 },
  { slug: 'onguard-oil', en: 'On Guard', es: 'On Guard', pri: 8 },
  { slug: 'doterra-air-oil', en: 'Breathe (Respiratory Blend)', es: 'Air', pri: 7 },
  { slug: 'zengest-oil', en: 'ZenGest', es: 'ZenGest', pri: 6 },
  { slug: 'aromatouch-oil', en: 'AromaTouch', es: 'AromaTouch', pri: 5 },
  { slug: 'deep-blue-oil', en: 'Deep Blue', es: 'Deep Blue', pri: 5 },
  // Touch (pre-diluted roll-ons, gentle for family use)
  { slug: 'lavender-touch-oil', en: 'Lavender Touch', es: 'Lavanda Touch', pri: 8 },
  { slug: 'frankincense-touch-oil', en: 'Frankincense Touch', es: 'Incienso Touch', pri: 6 },
  { slug: 'peppermint-touch-oil', en: 'Peppermint Touch', es: 'Menta Touch', pri: 5 },
]
// Category CTA (not a /p/ page — direct shop link)
const CTA = {
  en: { anchor: 'Shop doTERRA (US)', url: `https://www.doterra.com/US/en/shop/essential-oils?OwnerID=${OID}`, cat: 'cta', pri: 10 },
  es: { anchor: 'Comprar doTERRA (España)', url: `https://shop.doterra.com/ES/es_ES/shop/essential-oils/?OwnerID=${OID}`, cat: 'cta', pri: 10 },
}

async function seed(langCode, urlFn, nameKey) {
  const { data: brands } = await sb.from('brands').select('id').eq('language_code', langCode)
  if (!brands?.length) { console.log(`❌ brand ${langCode} non trovato`); return }
  const brand_id = brands[0].id
  await sb.from('link_expert').delete().eq('brand_id', brand_id) // idempotente
  const rows = P.map(p => ({ brand_id, anchor_text: p[nameKey], full_url: urlFn(p.slug), category: 'product', priority: p.pri, active: true }))
  const c = CTA[langCode]
  rows.push({ brand_id, anchor_text: c.anchor, full_url: c.url, category: c.cat, priority: c.pri, active: true })
  const { error } = await sb.from('link_expert').insert(rows)
  console.log(error ? `❌ ${langCode}: ${error.message}` : `✅ ${langCode}: ${rows.length} link inseriti (brand ${brand_id})`)
}

;(async () => {
  await seed('en', enUrl, 'en')
  await seed('es', esUrl, 'es')
})()
