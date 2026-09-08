import { llmText } from './llm'

/**
 * ═══ WORD FLOOR (1 set 2026) ═══
 *
 * Rete di allungamento: quando l'articolo nasce sotto le ~900 parole (misurato: capita
 * soprattutto in arabo e a volte in en/it), UNA chiamata flash aggiunge 2-3 sezioni di
 * approfondimento nella lingua dell'articolo, inserite PRIMA della FAQ. Sopra la soglia
 * la rete è un no-op totale: zero costi per l'80% degli articoli.
 *
 * Guardie (stessa filosofia di ensureHumanProse): non-blocking (errore flash → articolo
 * invariato), niente H1, output troppo corto → scartato, sezione che duplica un heading
 * esistente → scartata.
 */

// Conteggio parole coerente con lo scorer (lib/seo-score.ts): CJK ≈ caratteri/2.
export function countWordsLikeScorer(content: string): number {
  const cjkChars = (content.match(/[぀-ヿ一-鿿㐀-䶿]/g) ?? []).length
  const spaceWords = content.split(/\s+/).filter(Boolean).length
  return cjkChars > spaceWords ? Math.round(cjkChars / 2) + spaceWords : spaceWords
}

const WORD_FLOOR = 880 // soglia scorer 900 meno margine: sotto, l'articolo perde 8 punti secchi

export async function ensureWordFloor(
  content: string,
  languageName: string,
  keyword: string,
): Promise<string> {
  const wc = countWordsLikeScorer(content)
  if (wc >= WORD_FLOOR) return content

  try {
    const mancanti = Math.max(980 - wc, 200)
    const extra = await llmText({
      size: 'large',
      maxTokens: 1600,
      system: [
        `You expand blog articles. You write ONLY in ${languageName}.`,
        'Output ONLY new markdown sections, each starting with "## ".',
        'Never write an H1 ("# "), an introduction, a conclusion, or meta commentary.',
        'Match the tone and style of the article you are given. Never invent prices or statistics.',
      ].join(' '),
      user: [
        `This article about "${keyword}" is too short (${wc} words). Write 2-3 NEW "## " sections`,
        `totaling about ${mancanti} words in ${languageName} that deepen it with practical value`,
        '(concrete examples, common mistakes to avoid, actionable tips). Do NOT repeat topics the',
        'article already covers. Do NOT summarize or conclude. Output only the new sections.',
        '',
        '--- ARTICLE ---',
        content,
      ].join('\n'),
    })

    const nuovo = (extra ?? '').trim()
    // guardie: deve essere sostanza vera, in forma di sezioni, senza H1
    if (!nuovo.startsWith('##') || countWordsLikeScorer(nuovo) < 120 || /^#\s/m.test(nuovo)) return content
    // una sezione che duplica un heading gia presente tradisce un modello che ha ignorato le istruzioni
    const nuoviHeading = [...nuovo.matchAll(/^##\s+(.+)$/gm)].map(m => m[1].trim().toLowerCase())
    if (nuoviHeading.some(h => content.toLowerCase().includes(`## ${h}`))) return content

    // inserimento PRIMA della FAQ se c'e (la FAQ chiude), altrimenti in coda
    const faqMatch = content.match(/^##\s+(FAQ|Frequently Asked Questions|Preguntas Frecuentes|Häufige Fragen|Foire aux Questions|Domande Frequenti|Perguntas Frequentes|Veelgestelde vragen|Întrebări frecvente|Najczęściej zadawane pytania|よくある質問|الأسئلة الشائعة)/im)
    if (faqMatch && typeof faqMatch.index === 'number') {
      return `${content.slice(0, faqMatch.index).trimEnd()}\n\n${nuovo}\n\n${content.slice(faqMatch.index)}`
    }
    return `${content.trimEnd()}\n\n${nuovo}\n`
  } catch {
    return content // non-blocking: meglio un articolo corto che nessun articolo
  }
}
