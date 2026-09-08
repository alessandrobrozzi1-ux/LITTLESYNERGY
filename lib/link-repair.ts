/**
 * ═══ RIPARAZIONE LINK ROTTI (7 set 2026) ═══
 *
 * Google Search Console ha segnalato 404 su piu brand. L'indagine ha trovato DUE specie
 * di link rotti, prodotti entrambi dal modello, per 133 occorrenze su ~19.300 link interni:
 *
 *  A) AFFILIATI MALFORMATI — un link allo shop scritto senza host: `](/nl/nl_NL/shop/yarrow-pom/)`
 *     oppure `](/shop.doterra.com/IT/...)` o `](/fr/produit/huile-lavande-doterra)`.
 *     Il browser lo risolve sul NOSTRO dominio: chi voleva comprare trova una 404.
 *     Non e un problema SEO, sono vendite perse (82 casi misurati).
 *  B) SLUG INVENTATI — il modello cita "il nostro articolo precedente" con uno slug plausibile
 *     ma inesistente (51 casi). Questi sono i 404 che Google segnala.
 *
 * Le reti esistenti (absolutizeRelativeShopLinks, sanitizeProductUrls) coprivano solo `/shop/`
 * e `/p/`: qui si generalizza. Deterministico, nessuna chiamata AI.
 */

/** Un path relativo che in realta voleva essere un link allo shop/affiliato. */
const SHOP_HINT = /(doterra|amzn|amazon|OwnerID|EnrollerID|\/[a-z]{2}_[A-Z]{2}\/|\/shop\/|\/produit\/|\/produse\/|\/producto\/|\/prodotto\/|\/produkt\/|\/product\/)/i

/**
 * A) Ripara i link affiliati scritti male. `fallback` e l'URL affiliato del brand (porta
 * gia OwnerID/EnrollerID): quando il link non e ricostruibile si manda li, che e sempre
 * meglio di una 404 — l'utente atterra comunque sullo shop giusto.
 */
export function repairAffiliateLinks(content: string, fallback?: string): string {
  let out = content

  // "](/https://..." o "](//..." → prefisso doppio o protocollo monco
  out = out.replace(/\]\(\/+(https?:\/\/)/gi, ']($1')

  // "](/shop.doterra.com/..." → host finito dentro il path
  out = out.replace(/\]\(\/+((?:shop|www|office)\.doterra\.com\/[^)\s]*)\)/gi, '](https://$1)')

  // "](/NL/nl_NL/shop/..." → path completo dello shop EU senza host
  out = out.replace(/\]\(\/([A-Za-z]{2}\/[a-z]{2}_[A-Z]{2}\/shop\/[^)\s]*)\)/g, '](https://shop.doterra.com/$1)')

  // Resta il caso non ricostruibile: "](/fr/produit/xxx-doterra)", "](/nl/wierook)" …
  // path relativo, NON un articolo del blog, ma che parla di prodotto/shop → all'affiliato.
  if (fallback) {
    out = out.replace(/\]\((\/[^)\s]+)\)/g, (m, path: string) => {
      if (/\/blog\//.test(path)) return m           // articoli: li tratta la rete B
      if (!SHOP_HINT.test(path)) return m           // non sembra un link commerciale: lascio stare
      return `](${fallback})`
    })
  }
  return out
}

/**
 * B) Toglie i link verso articoli che NON esistono, lasciando il testo dell'anchor.
 * Meglio una frase senza link che un link a una 404: il lettore non perde nulla e Google
 * smette di scoprire pagine inesistenti. `slugs` = slug REALI del brand.
 */
const PAGINE_NOTE = new Set(['about','contact','contatti','privacy','terms','cookie','sitemap','chi-siamo','sobre','kontakt','apropos','blog'])

export function stripDeadArticleLinks(content: string, slugs: Set<string>, domain?: string): string {
  const host = (domain ?? '').replace(/^https?:\/\//, '').split('/')[0]
  return content.replace(/\[([^\]]+)\]\((\/[^)\s]+|https?:\/\/[^)\s]+)\)/g, (m, testo: string, url: string) => {
    let path: string
    if (url.startsWith('/')) path = url
    else {
      let u: URL
      try { u = new URL(url) } catch { return m }
      if (!host || u.hostname !== host) return m    // link esterno: non ci riguarda
      path = u.pathname
    }
    const parti = path.split('?')[0].split('#')[0].split('/').filter(Boolean)
    if (parti.length < 2) return m                   // home o home-lingua: esistono
    const slug = parti[parti.length - 1]
    if (slugs.has(slug)) return m                    // articolo vero: si tiene
    // Non e uno slug reale. Se il path porta /blog/ e certamente un articolo inventato.
    // Anche un path corto tipo /nl/wierook (lingua + nome prodotto) e inventato: misurato
    // 404 su tutti quelli trovati. Si salvano solo le pagine di servizio note.
    if (PAGINE_NOTE.has(slug.toLowerCase())) return m
    return testo                                     // resta il testo, sparisce il link
  })
}
