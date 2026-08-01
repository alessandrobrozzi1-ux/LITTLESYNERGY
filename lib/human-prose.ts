/**
 * ═══ HUMAN WRITING LAW — rete anti-frasi-AI (port da Body Reset, 1 ago 2026) ═══
 * Google affonda per primo il contenuto che suona-AI. Doppio livello:
 *  1. blocco nel system prompt (esempi negativi) — vedi humanWritingLaw in generate-article;
 *  2. QUESTA rete deterministica post-gen: un paragrafo che porta ancora una frase bandita viene
 *     riscritto via flash (llmText small), con le guardie del sorgente.
 *
 * ⚠️ LISTE VALIDATE SOLO en+es (misurate sui brand telehealth). Le altre 9 lingue del pilota
 * (de/fr/pt/ro/it/nl/pl/ja/ar) sono PASS-THROUGH ESPLICITO: nessuna lista = nessun trigger = articolo
 * invariato. Le liste per-lingua arriveranno CURATE per-lingua — MAI improvvisate/tradotte alla cieca
 * (una traduzione letterale bannerebbe frasi legittime nella lingua target).
 *
 * Guardie: headings/tabelle/byline/FAQ-bold/disclaimer-corsivo skippati; max 3 rewrite/articolo;
 * link markdown → stesso multiset di URL o si tiene l'originale; rewrite ancora sporco → originale;
 * non-blocking (errore flash → articolo invariato).
 */
import { llmText } from './llm'

const AI_PHRASES_BY_LANG: Record<string, RegExp[]> = {
  en: [
    /in today'?s (fast-paced |modern |busy |digital )?world/i,
    /\bdive (in|into|deeper)\b/i,
    /\bunlock(s|ed|ing)?\b/i,
    /look no further/i,
    /it'?s (important|worth) (to note|noting)/i,
    /whether you'?re\b/i,
    /game[- ]?changer/i,
    /\bin conclusion\b/i,
    /navigating the (world|landscape|maze) of/i,
    /when it comes to/i,
    /embark on (a|your) journey/i,
    /seamless(ly)?/i,
    /\belevate your\b/i,
    /comprehensive guide/i,
    /it'?s no secret/i,
    /in the (ever-evolving|realm) (world )?of/i,
  ],
  es: [
    /en el (mundo|panorama) (actual|moderno|acelerado|digital)/i,
    /sumérg(ete|ase|irse)/i,
    /sumergirse en/i,
    /desbloquea(r|s)?\b/i,
    /no busques más/i,
    /es importante (destacar|señalar|tener en cuenta|mencionar)/i,
    /cabe (destacar|señalar|mencionar)/i,
    /ya sea que\b/i,
    /cuando se trata de/i,
    /en conclusión/i,
    /navegar por el (mundo|panorama) de/i,
    /embarcarse en un viaje/i,
    /eleva(r)? tu\b/i,
    /guía (completa|definitiva)/i,
    /un antes y un después\b/i,
  ],
}

/** true se il testo contiene una frase bandita PER QUELLA LINGUA (lingue senza lista → sempre false). */
export function hasAiPhrase(text: string, languageCode: string): boolean {
  const phrases = AI_PHRASES_BY_LANG[languageCode]
  return !!phrases && phrases.some((re) => re.test(text))
}

const MD_LINK_RE = /\[[^\]]+\]\([^)\s]+\)/g
const urlMultiset = (t: string) =>
  (t.match(MD_LINK_RE) ?? [])
    .map((l) => l.match(/\(([^)\s]+)\)/)?.[1] ?? '')
    .sort()
    .join('|')

export async function ensureHumanProse(
  content: string,
  languageName: string,
  languageCode: string,
  bylinePrefix: string,
): Promise<string> {
  if (!AI_PHRASES_BY_LANG[languageCode]) return content // pass-through esplicito (vedi header)
  const blocks = content.split(/\n\n+/)
  let rewrites = 0
  for (let i = 0; i < blocks.length && rewrites < 3; i++) {
    const b = blocks[i]
    const t = b.trim()
    if (!t) continue
    if (/^#{1,6}\s/.test(t)) continue // headings: compito del prompt, non della rete
    if (t.startsWith('|') || t.startsWith('---')) continue // tabelle / rule
    if (bylinePrefix && t.includes(bylinePrefix)) continue // byline
    if (/^\*\*[^*\n]+\?\*\*$/.test(t)) continue // riga-domanda FAQ in bold
    if (t.startsWith('*') && t.endsWith('*') && !t.includes('\n')) continue // disclaimer corsivo
    if (!hasAiPhrase(t, languageCode)) continue
    // Elenco ESPLICITO delle frasi bandite trovate: il flash da solo non riconosce cosa sia
    // "filler AI" (misurato al gate: lasciava "in today's world" e "game-changer" intatti).
    const found = AI_PHRASES_BY_LANG[languageCode]
      .map((re) => t.match(re)?.[0])
      .filter((s): s is string => !!s)
    const origUrls = urlMultiset(t)
    try {
      let out = (
        await llmText({
          size: 'small',
          maxTokens: 400,
          system: `You are a human line editor. Rewrite the paragraph in natural, native ${languageName}. These exact phrases are BANNED and must NOT appear in your rewrite (rephrase the idea plainly or drop it): ${found.map((s) => `"${s}"`).join(', ')}. Keep the meaning, the facts and EVERY markdown link exactly as written. Vary sentence lengths (mix short and long). No em-dashes. Output ONLY the rewritten paragraph, no commentary.`,
          user: t,
        })
      ).trim()
      if (!out || out.length < 20) continue
      out = out.replace(/\s+—\s+/g, ', ').replace(/(\w)—(\w)/g, '$1-$2').replace(/—/g, ', ')
      if (urlMultiset(out) !== origUrls) continue // un link perso/alterato → originale
      if (hasAiPhrase(out, languageCode)) continue // rewrite ancora sporco → originale
      blocks[i] = b.replace(t, out)
      rewrites++
    } catch {
      /* non-blocking */
    }
  }
  if (rewrites > 0) console.log(`[human-prose] rewrote ${rewrites} block(s) [${languageCode}]`)
  return blocks.join('\n\n')
}
