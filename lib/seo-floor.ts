import { publicUrl } from './weave-links'

/**
 * ═══ SEO FLOOR (1 set 2026) ═══
 *
 * Rete finale di qualità: porta l'articolo appena generato a ~100/100 sullo scorer di
 * lib/seo-score.ts con SOLI interventi deterministici, prima che il punteggio venga
 * calcolato e salvato. Niente chiamate AI: le falle misurate sull'impero (meta fuori
 * range, titolo fuori range, meno di 5 link alla nascita) sono tutte meccaniche.
 *
 * Cosa sistema:
 *  - meta description fuori da 140-160 → taglio a confine di parola o padding localizzato
 *  - titolo fuori da 30-65 → taglio pulito o suffisso localizzato
 *  - meno di 5 link → blocco "Articoli correlati" con gli ultimi articoli del brand
 *    (URL costruiti con publicUrl di weave-links: stessi quirk per-lingua della maglia;
 *    la maglia poi aggiunge i SUOI link semantici in un blocco separato coi marker)
 *
 * Parole, heading, FAQ e immagine restano compito delle reti esistenti (ensureFaqSection,
 * prompt, backfill-images): qui non si tocca la prosa.
 */

const RELATED_HEADING: Record<string, string> = {
  en: 'Related articles', es: 'Artículos relacionados', de: 'Verwandte Artikel',
  fr: 'Articles connexes', it: 'Articoli correlati', pt: 'Artigos relacionados',
  nl: 'Gerelateerde artikelen', pl: 'Powiązane artykuły', ro: 'Articole similare',
  ja: '関連記事', ar: 'مقالات ذات صلة',
}

// Frasi brevi e neutre per portare la meta nel range 140-160 quando esce corta.
const META_PAD: Record<string, string[]> = {
  en: [' A practical guide with clear, honest tips.', ' Find out what really works.', ' Everything you need to choose with confidence.'],
  es: [' Una guía práctica con consejos claros y honestos.', ' Descubre lo que funciona de verdad.', ' Todo lo que necesitas para elegir con confianza.'],
  de: [' Ein praktischer Leitfaden mit klaren, ehrlichen Tipps.', ' Erfahren Sie, was wirklich funktioniert.', ' Alles, was Sie für eine sichere Wahl brauchen.'],
  fr: [' Un guide pratique avec des conseils clairs et honnêtes.', ' Découvrez ce qui fonctionne vraiment.', ' Tout ce qu\'il faut pour choisir en confiance.'],
  it: [' Una guida pratica con consigli chiari e onesti.', ' Scopri cosa funziona davvero.', ' Tutto quello che serve per scegliere con fiducia.'],
  pt: [' Um guia prático com dicas claras e honestas.', ' Descubra o que realmente funciona.', ' Tudo o que você precisa para escolher com confiança.'],
  nl: [' Een praktische gids met duidelijke, eerlijke tips.', ' Ontdek wat echt werkt.', ' Alles wat je nodig hebt om met vertrouwen te kiezen.'],
  pl: [' Praktyczny przewodnik z jasnymi, szczerymi wskazówkami.', ' Sprawdź, co naprawdę działa.', ' Wszystko, czego potrzebujesz, aby wybrać z pewnością.'],
  ro: [' Un ghid practic cu sfaturi clare și oneste.', ' Află ce funcționează cu adevărat.', ' Tot ce ai nevoie ca să alegi cu încredere.'],
  ja: ['実践的なポイントをわかりやすく解説します。', '本当に役立つ方法を紹介します。', '選び方のコツも詳しく説明します。'],
  ar: [' دليل عملي بنصائح واضحة وصادقة.', ' اكتشف ما ينجح فعلاً.', ' كل ما تحتاجه للاختيار بثقة.'],
}

const TITLE_PAD: Record<string, string> = {
  en: ': A Complete Guide', es: ': guía completa', de: ': der komplette Guide',
  fr: ': le guide complet', it: ': guida completa', pt: ': guia completo',
  nl: ': de complete gids', pl: ': kompletny przewodnik', ro: ': ghid complet',
  ja: '：完全ガイド', ar: ': دليل شامل',
}

// Lunghezza EFFETTIVA allineata allo scorer (1 set 2026): i caratteri CJK pesano 2,
// perche' un titolo giapponese da 15 caratteri equivale a uno latino da 30.
const CJK_RE = /[぀-ヿ一-鿿㐀-䶿]/g
const CJK_ONE = /[぀-ヿ一-鿿㐀-䶿]/ // senza /g: test() su singolo carattere senza stato
function effLen(s: string): number {
  return s.length + ((s.match(CJK_RE) ?? []).length)
}

/** Taglio a confine di parola entro maxLen EFFETTIVO, ripulendo code deboli. */
function cutAtWord(s: string, maxLen: number): string {
  if (effLen(s) <= maxLen) return s
  // indice massimo col peso CJK: si accumula 1 (latino) o 2 (CJK) per carattere
  let peso = 0, idx = s.length
  for (let i = 0; i < s.length; i++) {
    peso += CJK_ONE.test(s[i]) ? 2 : 1
    if (peso > maxLen) { idx = i; break }
  }
  let cut = s.slice(0, idx + 1)
  const lastSpace = cut.lastIndexOf(' ')
  // lingue senza spazi (ja): taglio secco al limite, niente confine di parola da rispettare
  cut = lastSpace > 0 ? cut.slice(0, lastSpace) : cut.slice(0, idx)
  cut = cut.replace(/[\s:;,.\-–—、。]+$/u, '')
  const words = cut.split(' ')
  if (words.length > 1 && words[words.length - 1].length <= 3) cut = words.slice(0, -1).join(' ')
  return cut.replace(/[\s:;,.\-–—、。]+$/u, '')
}

export function fixTitle(title: string, languageCode: string): string {
  let t = title.trim()
  if (effLen(t) > 65) t = cutAtWord(t, 65)
  if (effLen(t) < 30) {
    const pad = TITLE_PAD[languageCode] ?? TITLE_PAD.en
    if (!t.includes(pad)) t = `${t}${pad}`
  }
  return t
}

export function fixMetaDescription(meta: string, languageCode: string): string {
  let m = meta.trim().replace(/\s+/g, ' ')
  if (effLen(m) > 160) {
    m = cutAtWord(m, 160)
    if (!/[.!?。！？؟]$/.test(m)) m += '.'
  }
  if (effLen(m) < 140) {
    const pads = META_PAD[languageCode] ?? META_PAD.en
    // i pad possono ripetersi in coda finche' non si entra nel range: meglio una meta con
    // due frasi di servizio che una penalita' fissa su ogni articolo di quella lingua
    for (let i = 0; effLen(m) < 140 && i < 6; i++) {
      const pad = pads[i % pads.length]
      if (i < pads.length || !m.endsWith(pad)) m = `${m}${pad}`
    }
    if (effLen(m) > 160) {
      m = cutAtWord(m, 160)
      if (!/[.!?。！？؟]$/.test(m)) m += '.'
    }
  }
  return m
}

export type RecentArticle = { title: string; slug: string }

/**
 * Se l'articolo nasce con meno di 5 link markdown, appende un blocco "Articoli correlati"
 * con gli ultimi articoli del brand. Link interni veri (stesso brand e lingua), non riempitivo:
 * aiutano crawl e lettore, e il blocco semantico della maglia arriverà comunque dopo.
 */
export function ensureLinkCountFloor(
  content: string,
  languageCode: string,
  recenti: RecentArticle[],
  brandDomain?: string | null,
  selfSlug?: string,
): string {
  const links = (content.match(/\[([^\]]+)\]\(([^)]+)\)/g) ?? []).length
  if (links >= 5) return content
  const candidates = recenti.filter(a => a.slug && a.slug !== selfSlug).slice(0, Math.max(5 - links, 3))
  if (candidates.length === 0) return content
  const heading = RELATED_HEADING[languageCode] ?? RELATED_HEADING.en
  if (content.includes(`## ${heading}`)) return content
  const items = candidates.map(a => `- [${a.title}](${publicUrl(languageCode, a.slug, brandDomain)})`).join('\n')
  return `${content.trimEnd()}\n\n## ${heading}\n\n${items}\n`
}
