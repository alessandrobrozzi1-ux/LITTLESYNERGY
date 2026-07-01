// World-link markets: monetized via the worldwide doTERRA enrollment gateway,
// NOT per-product affiliate links (fragile slugs that don't carry our OwnerID).
// Mirrors entries in scripts/lib/doterra-markets.js where productPattern === null.
// Keyed by brand language_code. Add future world-link markets here.
//
// LittleSynergy: EN and ES are PRODUCT-link markets (US + Spain shops carry OwnerID 15958005),
// so they are intentionally NOT here — body links stay as real product URLs.
// The footer enrollment gateway (Country=USA / ESP) is a separate concern: see lib/footer-gateways.ts.
export const WORLD_LINK_GATEWAYS: Record<string, string> = {}

/** Gateway URL for a world-link market, or undefined for normal product-link markets. */
export function getWorldLinkUrl(languageCode: string): string | undefined {
  return WORLD_LINK_GATEWAYS[languageCode]
}
