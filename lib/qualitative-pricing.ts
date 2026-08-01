/**
 * ═══ QUALITATIVE-PRICING NET (port da Body Reset, 1 ago 2026) ═══
 * Su keyword cost-adjacent il modello scrive cifre in valuta NONOSTANTE il divieto nel prompt
 * (misurato sui telehealth: "$25 and $150", "900 y 1,400 dólares" con sourcing inventato).
 * Nuance doTERRA: i nostri articoli non devono citare prezzi MAI — le cifre sono quasi sempre
 * training data stantio/inventato, e la regola-prezzi dell'impero è "meccanismo libero, no cifre".
 *
 * Trigger DETERMINISTICO multi-valuta (simboli + parole-valuta ADIACENTI a cifre) per blocco →
 * rewrite qualitativo via flash (llmText small). Guardie del sorgente:
 *  - i link markdown devono sopravvivere IDENTICI (stesso multiset di URL), sennò si tiene l'originale;
 *  - una tabella deve conservare lo stesso numero di righe;
 *  - se il rewrite contiene ancora valuta → originale;
 *  - max 4 rewrite per articolo, non-blocking (errore flash → articolo invariato).
 */
import { llmText } from './llm'

const MD_LINK_RE = /\[[^\]]+\]\([^)\s]+\)/g

// Cifra (anche numerali arabo-orientali ٠-٩) con separatori , . — es. "1,400" / "٧٩"
const NUM = '[0-9\\u0660-\\u0669][0-9\\u0660-\\u0669.,]*'

// Multi-valuta per gli 11 mercati del pilota. SOLO adiacenza a cifre: "lei"/"euro" da soli non
// scattano mai (falsi positivi pronome it / prosa generica). "de" opzionale per il romeno "80 de lei".
export const CURRENCY_RE = new RegExp(
  [
    // simbolo prima della cifra: $79, € 79, £79, ¥1,000
    `[$€£¥]\\s?${NUM}`,
    // cifra prima di simbolo/suffisso (anche CJK/arabo, dove \\b non funziona): 79 €, 79 zł, 249 Kč, 1000円, ٧٩ درهم
    `${NUM}\\s?(?:[$€£¥]|zł|Kč|円|ドル|ユーロ|دولار|يورو|درهم|ريال)`,
    // cifra + parola-valuta latina: 79 euro, 1,400 dólares, 80 de lei, 50 złotych, 30 kr
    `${NUM}\\s?(?:de\\s)?(?:dollars?|dollari|d[óo]lares?|dolar[óo]w|dolary|euros?|euro['’]?s?|pounds?|lei|kr|złotych|złote)\\b`,
    // codici ISO: USD 79 / 79 USD
    `\\b(?:USD|EUR|GBP|PLN|RON|CZK|JPY|AED|SAR)\\s?${NUM}`,
    `${NUM}\\s?(?:USD|EUR|GBP|PLN|RON|CZK|JPY|AED|SAR)\\b`,
    // parola-valuta prima della cifra: "dollars 79" (raro ma gratis)
    `\\b(?:dollars?|d[óo]lares?|euros?)\\s?${NUM}`,
  ].join('|'),
  'iu'
)

/** Blocchi (split su riga vuota) che contengono valuta+cifra — usato anche dallo scan report-only. */
export function findPricingBlocks(content: string): string[] {
  return content.split(/\n\n+/).filter((b) => CURRENCY_RE.test(b))
}

const urlMultiset = (t: string) =>
  (t.match(MD_LINK_RE) ?? [])
    .map((l) => l.match(/\(([^)\s]+)\)/)?.[1] ?? '')
    .sort()
    .join('|')

export async function ensureQualitativePricing(content: string, languageName: string): Promise<string> {
  const blocks = content.split(/\n\n+/)
  let rewrites = 0
  for (let i = 0; i < blocks.length && rewrites < 4; i++) {
    const b = blocks[i]
    if (!CURRENCY_RE.test(b)) continue
    const isTable = b.trim().startsWith('|')
    const origUrls = urlMultiset(b)
    const origRows = isTable ? b.trim().split('\n').length : 0
    try {
      let out = (
        await llmText({
          size: 'small',
          maxTokens: 600,
          system: `You are a compliance editor for a wellness affiliate blog. Specific prices must NEVER appear: money figures in drafts are unverified and usually invented. Rewrite the ${isTable ? 'markdown table' : 'paragraph'} in native ${languageName}, REMOVING every specific money figure (dollar/euro/any-currency amounts, numeric price ranges) and replacing them with qualitative wording (e.g. "an accessible entry point", "the pricier end of the range", "varies by market"). Keep everything else: meaning, structure, EVERY markdown link exactly as written${isTable ? ', and the EXACT same number of table rows and cells (same | structure)' : ''}. Never add new facts, never invent sources. No em-dashes. Output ONLY the rewritten ${isTable ? 'table' : 'paragraph'}.`,
          user: b,
        })
      ).trim()
      if (!out || out.length < 20) continue
      // scrub anti-em-dash deterministico (il flash può reintrodurli; il blocco non è mai la byline)
      out = out.replace(/\s+—\s+/g, ', ').replace(/(\w)—(\w)/g, '$1-$2').replace(/—/g, ', ')
      if (urlMultiset(out) !== origUrls) continue // un link perso/alterato → si tiene l'originale
      if (isTable && out.trim().split('\n').length !== origRows) continue
      if (CURRENCY_RE.test(out)) continue // rewrite ancora sporco → originale
      blocks[i] = b.replace(b.trim(), out)
      rewrites++
    } catch {
      /* non-blocking */
    }
  }
  if (rewrites > 0) console.log(`[qualitative-pricing] rewrote ${rewrites} block(s)`)
  return blocks.join('\n\n')
}
