// LittleSynergy — worldwide doTERRA enrollment gateways used as the FOOTER fallback CTA
// (Country USA for EN, Country ESP for ES), with Davidino's EnrollerID = 15958005.
//
// IMPORTANT — this is NOT the body product-link mechanism:
//   * Body/article product links stay as real per-product shop URLs (EN = doterra.com/US/en,
//     ES = shop.doterra.com/ES/es_ES), carrying OwnerID 15958005, via link_expert + sanitizeProductUrls.
//   * This gateway is the "start here / enroll worldwide" fallback shown in the footer, alongside the
//     local shop CTA (see FOOTER STANDARD PACKAGE). It is consumed by the Lovable frontend footer.
//
// Country codes follow doTERRA's 3-letter gateway convention (USA, ESP), mirroring SoloSEO (JPN/ARE).
export const FOOTER_GATEWAYS: Record<string, string> = {
  en: 'https://office.doterra.com/Application/index.cfm?Country=USA&EnrollerID=15958005',
  es: 'https://office.doterra.com/Application/index.cfm?Country=ESP&EnrollerID=15958005',
}

/** Footer enrollment-gateway URL for a language, or undefined if none configured. */
export function getFooterGateway(languageCode: string): string | undefined {
  return FOOTER_GATEWAYS[languageCode]
}
