// World-link markets: monetized via the worldwide doTERRA enrollment gateway,
// NOT per-product affiliate links (fragile slugs that don't carry our OwnerID).
// Mirrors entries in scripts/lib/doterra-markets.js where productPattern === null.
// Keyed by brand language_code. Add future world-link markets here.
//
// LittleSynergy: EN/ES/FR/IT/DE/NL/RO/PL AND PT are PRODUCT-link markets (shops carry
// OwnerID 15958005), so they are intentionally NOT here — body links stay as real product URLs.
// Only JA/AR are world-link (fragile slugs that don't carry our OwnerID).
export const WORLD_LINK_GATEWAYS: Record<string, string> = {
  // PT = Portogallo è un mercato SHOP vero (shop.doterra.com/PT/pt_PT, verificato 200):
  // NON è più world-link. Restano world-link solo ja/ar (slug fragili / no OwnerID).
  ja: 'https://office.doterra.com/Application/index.cfm?Country=JPN&EnrollerID=15958005',
  // AR keeps doTERRA's verbatim "?&" quirk in the gateway URL (mirrors doterra-markets.js).
  ar: 'https://office.doterra.com/Application/index.cfm?&Country=ARE&EnrollerID=15958005',
}

/** Gateway URL for a world-link market, or undefined for normal product-link markets. */
export function getWorldLinkUrl(languageCode: string): string | undefined {
  return WORLD_LINK_GATEWAYS[languageCode]
}
