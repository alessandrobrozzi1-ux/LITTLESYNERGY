/**
 * doTERRA market URL patterns — verified in production.
 *
 * IMPORTANT: before launching a new market, open the shop URL in a browser,
 * navigate to a known product (e.g. Lavender), and confirm the URL pattern
 * matches what is documented here. Update this file if a new pattern is found.
 *
 * sanitizeProductUrls in generate-article/route.ts handles two patterns:
 *   Pattern 1 — shop.doterra.com  (ES-style, most non-US markets)
 *   Pattern 2 — www.doterra.com   (EN/US-style)
 *
 * The `affiliate_base_url` stored in DB must match one of these patterns
 * for link sanitization to work correctly.
 */

const DOTERRA_MARKETS = {
  US: {
    country: 'United States',
    language: 'English',
    // Pattern 2 — www.doterra.com
    shopBase: 'https://www.doterra.com/US/en/shop',
    productPattern: 'https://www.doterra.com/US/en/p/[slug]/',
    affiliateBase: 'https://www.doterra.com/US/en/shop/essential-oils',
    locale: 'en_US',
    verified: true,
  },
  ES: {
    country: 'Spain',
    language: 'Spanish',
    // Pattern 1 — shop.doterra.com
    shopBase: 'https://shop.doterra.com/ES/es_ES/shop',
    productPattern: 'https://shop.doterra.com/ES/es_ES/shop/[slug]/',
    affiliateBase: 'https://shop.doterra.com/ES/es_ES/shop/essential-oils',
    locale: 'es_ES',
    verified: true,
  },
  DE: {
    country: 'Germany',
    language: 'German',
    // Pattern 1 — shop.doterra.com (assumed — VERIFY BEFORE LAUNCH)
    shopBase: 'https://shop.doterra.com/DE/de_DE/shop',
    productPattern: 'https://shop.doterra.com/DE/de_DE/shop/[slug]/',
    affiliateBase: 'https://shop.doterra.com/DE/de_DE/shop/essential-oils',
    locale: 'de_DE',
    verified: false, // ⚠️ Open browser and confirm before DE launch
  },
  IT: {
    country: 'Italy',
    language: 'Italian',
    // Pattern 1 — shop.doterra.com (assumed — VERIFY BEFORE LAUNCH)
    shopBase: 'https://shop.doterra.com/IT/it_IT/shop',
    productPattern: 'https://shop.doterra.com/IT/it_IT/shop/[slug]/',
    affiliateBase: 'https://shop.doterra.com/IT/it_IT/shop/essential-oils',
    locale: 'it_IT',
    verified: true, // v3.12 — 150 EU-catalog slugs seeded + browser spot-check (29/6)
  },
  FR: {
    country: 'France',
    language: 'French',
    // Pattern 1 — shop.doterra.com (verified by user 2026-06-25)
    shopBase: 'https://shop.doterra.com/FR/fr_FR/shop',
    productPattern: 'https://shop.doterra.com/FR/fr_FR/shop/[slug]/',
    affiliateBase: 'https://shop.doterra.com/FR/fr_FR/shop/essential-oils',
    locale: 'fr_FR',
    verified: true,
  },
  PT: {
    country: 'Portugal',
    language: 'Portuguese',
    // Pattern 1 — shop.doterra.com (verified 2026-06-26, slug: lavender-oil)
    shopBase: 'https://shop.doterra.com/PT/pt_PT/shop',
    productPattern: 'https://shop.doterra.com/PT/pt_PT/shop/[slug]/',
    affiliateBase: 'https://shop.doterra.com/PT/pt_PT/shop/essential-oils',
    locale: 'pt_PT',
    verified: true,
  },
  RO: {
    country: 'Romania',
    language: 'Romanian',
    // Pattern 1 — shop.doterra.com (verified 2026-06-26, slug: lavender-oil → "Levănțică")
    shopBase: 'https://shop.doterra.com/RO/ro_RO/shop',
    productPattern: 'https://shop.doterra.com/RO/ro_RO/shop/[slug]/',
    affiliateBase: 'https://shop.doterra.com/RO/ro_RO/shop/essential-oils',
    locale: 'ro_RO',
    verified: true,
  },
  NL: {
    country: 'Netherlands',
    language: 'Dutch',
    shopBase: 'https://shop.doterra.com/NL/nl_NL/shop',
    productPattern: 'https://shop.doterra.com/NL/nl_NL/shop/[slug]/',
    affiliateBase: 'https://shop.doterra.com/NL/nl_NL/shop/essential-oils',
    locale: 'nl_NL',
    verified: true, // v3.12 — 150 EU-catalog slugs seeded (29/6)
  },
  JP: {
    country: 'Japan',
    language: 'Japanese',
    locale: 'ja_JP',
    // v3.9 — WORLD-LINK ONLY. JP product slugs are fragile (-jp suffixes, frequent 404).
    // Monetization runs through the worldwide enrollment gateway, NOT direct product affiliate links.
    // No productPattern / no Link Expert scraping. CTAs point only to worldLink.
    worldLink: 'https://office.doterra.com/Application/index.cfm?Country=JPN&EnrollerID=15958005',
    productPattern: null, // world-link only — no per-product affiliate URLs
    verified: true,
  },
  AR: {
    country: 'United Arab Emirates',
    language: 'Arabic',
    locale: 'ar_AE',
    // v3.11 — WORLD-LINK ONLY (Gulf/RTL). Product slugs don't carry our OwnerID.
    // Monetization via worldwide enrollment gateway. No productPattern / no Link Expert.
    // Gateway URL is VERBATIM (note the "?&" — do not normalize).
    worldLink: 'https://office.doterra.com/Application/index.cfm?&Country=ARE&EnrollerID=15958005',
    productPattern: null, // world-link only
    verified: true,
  },
  PL: {
    country: 'Poland',
    language: 'Polish',
    // v3.12 — Pattern 1 shop.doterra.com (EU standard, like ES/RO/IT/NL). Slug verification in FASE B.
    shopBase: 'https://shop.doterra.com/PL/pl_PL/shop',
    productPattern: 'https://shop.doterra.com/PL/pl_PL/shop/[slug]/',
    affiliateBase: 'https://shop.doterra.com/PL/pl_PL/shop/essential-oils',
    locale: 'pl_PL',
    verified: true, // v3.12 — 150 EU-catalog slugs seeded (29/6)
  },
}

/**
 * Language code → market country code mapping.
 * Used to look up DOTERRA_MARKETS from a language_code like 'de', 'es', 'en'.
 */
const LANG_TO_MARKET = {
  en: 'US',
  es: 'ES',
  de: 'DE',
  it: 'IT',
  fr: 'FR',
  pt: 'PT',
  ro: 'RO',
  nl: 'NL',
  ja: 'JP', // v3.9 — Japan, world-link only
  ar: 'AR', // v3.11 — UAE/Gulf, world-link only (RTL)
  pl: 'PL', // v3.12 — Poland, product pattern (EU)
}

/**
 * Returns market config for a given language code.
 * Warns if market is not yet verified.
 */
function getMarket(languageCode) {
  const countryCode = LANG_TO_MARKET[languageCode.toLowerCase()]
  if (!countryCode) {
    console.warn(`⚠️  No market found for language '${languageCode}'. Add it to DOTERRA_MARKETS.`)
    return null
  }
  const market = DOTERRA_MARKETS[countryCode]
  if (!market.verified) {
    console.warn(`⚠️  Market ${countryCode} URL pattern NOT verified. Open ${market.shopBase} in a browser and confirm before launch.`)
  }
  return market
}

module.exports = { DOTERRA_MARKETS, LANG_TO_MARKET, getMarket }
