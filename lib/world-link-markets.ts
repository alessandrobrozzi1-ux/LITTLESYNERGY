// World-link markets: monetized via the worldwide doTERRA enrollment gateway,
// NOT per-product affiliate links (fragile slugs that don't carry our OwnerID).
// Mirrors entries in scripts/lib/doterra-markets.js where productPattern === null.
// Keyed by brand language_code. Add future world-link markets here.
//
// LittleSynergy: EN/ES/FR/IT are PRODUCT-link markets (shops carry OwnerID 15958005),
// so they are intentionally NOT here — body links stay as real product URLs.
// PT (Portugal) is WORLD-LINK: no dedicated shop, monetized via the worldwide enrollment gateway.
export const WORLD_LINK_GATEWAYS: Record<string, string> = {
  pt: 'https://office.doterra.com/Application/index.cfm?Country=PRT&EnrollerID=15958005',
}

/** Gateway URL for a world-link market, or undefined for normal product-link markets. */
export function getWorldLinkUrl(languageCode: string): string | undefined {
  return WORLD_LINK_GATEWAYS[languageCode]
}
