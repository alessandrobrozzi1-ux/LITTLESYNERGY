const BASE = 'https://shop.doterra.com/ES/es_ES/shop'
const OID = '/?OwnerID=15957920'

function url(slug: string) {
  return `${BASE}/${slug}${OID}`
}

// Map: markdown link text (lowercase) → verified URL
// Source: real web scraping of doTERRA Spain shop (June 2026)
export const ES_PRODUCT_URLS: Record<string, string> = {
  // ── SINGLE OILS ──────────────────────────────────────────
  'lavanda': url('lavender-oil'),
  'lavender': url('lavender-oil'),
  'aceite de lavanda': url('lavender-oil'),
  'menta': url('peppermint-oil'),
  'peppermint': url('peppermint-oil'),
  'aceite de menta': url('peppermint-oil'),
  'incienso': url('frankincense-oil'),
  'frankincense': url('frankincense-oil'),
  'limón': url('lemon-oil'),
  'limon': url('lemon-oil'),
  'lemon': url('lemon-oil'),
  'naranja salvaje': url('wild-orange-oil'),
  'wild orange': url('wild-orange-oil'),
  'naranja': url('wild-orange-oil'),
  'eucalipto': url('eucalyptus-oil'),
  'eucalyptus': url('eucalyptus-oil'),
  'romero': url('rosemary-oil'),
  'rosemary': url('rosemary-oil'),
  'orégano': url('oregano-oil'),
  'oregano': url('oregano-oil'),
  'copaiba': url('copaiba-oil'),
  'salvia sclarea': url('clary-sage-oil'),
  'clary sage': url('clary-sage-oil'),
  'ylang ylang': url('ylang-ylang-oil'),
  'cedro': url('cedarwood-oil'),
  'cedarwood': url('cedarwood-oil'),
  'bergamota': url('bergamot-oil'),
  'bergamot': url('bergamot-oil'),
  'vetiver': url('vetiver-oil'),
  'manzanilla romana': url('roman-chamomile-oil'),
  'roman chamomile': url('roman-chamomile-oil'),
  'jengibre': url('ginger-oil'),
  'ginger': url('ginger-oil'),
  'pomelo': url('grapefruit-oil'),
  'grapefruit': url('grapefruit-oil'),
  'mejorana': url('marjoram-oil'),
  'marjoram': url('marjoram-oil'),
  'geranio': url('geranium-oil'),
  'geranium': url('geranium-oil'),
  'ciprés': url('cypress-oil'),
  'cipres': url('cypress-oil'),
  'cypress': url('cypress-oil'),
  'mirra': url('myrrh-oil'),
  'myrrh': url('myrrh-oil'),
  'albahaca': url('basil-oil'),
  'basil': url('basil-oil'),
  'canela': url('cinnamon-bark-oil'),
  'cinnamon': url('cinnamon-bark-oil'),
  'clavo': url('clove-oil'),
  'clove': url('clove-oil'),
  'pimienta negra': url('black-pepper-oil'),
  'black pepper': url('black-pepper-oil'),
  'cardamomo': url('cardamom-oil'),
  'cardamom': url('cardamom-oil'),
  'pachuli': url('patchouli-oil'),
  'patchouli': url('patchouli-oil'),
  'sándalo': url('sandalwood-oil'),
  'sandalo': url('sandalwood-oil'),
  'sandalwood': url('sandalwood-oil'),
  'hierba buena': url('spearmint-oil'),
  'spearmint': url('spearmint-oil'),
  'mandarina': url('tangerine-oil'),
  'tangerine': url('tangerine-oil'),
  'tomillo': url('thyme-oil'),
  'thyme': url('thyme-oil'),
  'helichrysum': url('helichrysum-oil'),
  'lima': url('lime-oil'),
  'lime': url('lime-oil'),
  'hierba de limón': url('lemongrass-oil'),
  'lemongrass': url('lemongrass-oil'),

  // ── BLENDS WITH doterra- PREFIX ──────────────────────────
  'serenity': url('doterra-serenity-oil'),
  'doterra serenity': url('doterra-serenity-oil'),
  'balance': url('doterra-balance-oil'),
  'doterra balance': url('doterra-balance-oil'),
  'brave': url('doterra-brave-oil'),
  'doterra brave': url('doterra-brave-oil'),
  'calmer': url('doterra-calmer-oil'),
  'doterra calmer': url('doterra-calmer-oil'),
  'cheer': url('doterra-cheer-oil'),
  'doterra cheer': url('doterra-cheer-oil'),
  // Breathe US → dōTERRA Air ES
  'doterra air': url('doterra-air-oil'),
  'air': url('doterra-air-oil'),
  'breathe': url('doterra-air-oil'),
  'doterra breathe': url('doterra-air-oil'),

  // ── BLENDS WITHOUT PREFIX ─────────────────────────────────
  'aromatouch': url('aromatouch-oil'),
  'doterra aromatouch': url('aromatouch-oil'),
  'aroma touch': url('aromatouch-oil'),
  'citrus bliss': url('citrus-bliss-oil'),
  'ddr prime': url('ddr-prime-oil'),
  'deep blue': url('deep-blue-oil'),
  'doterra deep blue': url('deep-blue-oil'),
  'air-x': url('air-x-oil'),

  // ── BLENDS ONE WORD ───────────────────────────────────────
  'clarycalm': url('clarycalm-oil'),
  'clary calm': url('clarycalm-oil'),
  // DigestZen US → ZenGest ES
  'zengest': url('zengest-oil'),
  'zengüest': url('zengest-oil'),
  'digestzen': url('zengest-oil'),
  'doterra digestzen': url('zengest-oil'),

  // ── ON GUARD FAMILY (one word "onguard") ─────────────────
  'on guard': url('onguard-oil'),
  'doterra on guard': url('onguard-oil'),
  'onguard': url('onguard-oil'),

  // ── TOUCH PRODUCTS ────────────────────────────────────────
  'lavanda touch': url('lavender-touch-oil'),
  'lavender touch': url('lavender-touch-oil'),
  'menta touch': url('peppermint-touch-oil'),
  'peppermint touch': url('peppermint-touch-oil'),
  'incienso touch': url('frankincense-touch-oil'),
  'frankincense touch': url('frankincense-touch-oil'),
  'on guard touch': url('onguard-touch-oil'),
  'onguard touch': url('onguard-touch-oil'),
  'deep blue touch': url('deep-blue-touch-oil'),
  'serenity touch': url('doterra-serenity-oil'),
  'balance touch': url('doterra-balance-oil'),
}

// Replace all markdown links pointing to essential-oils with specific verified URLs
export function injectProductLinks(content: string): string {
  return content.replace(
    /\[([^\]]+)\]\(https:\/\/shop\.doterra\.com\/ES\/es_ES\/shop\/essential-oils\/\?OwnerID=15957920\)/g,
    (match, anchorText: string) => {
      const key = anchorText.toLowerCase().trim()
      const productUrl = ES_PRODUCT_URLS[key]
      return productUrl ? `[${anchorText}](${productUrl})` : match
    }
  )
}
