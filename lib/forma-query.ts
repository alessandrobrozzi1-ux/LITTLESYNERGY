/**
 * ═══ FORMA DELLA RICERCA — una sola definizione per tutto l'impero (11 set 2026) ═══
 *
 * Misura su 28 giorni di Search Console, impero intero, posizione media per forma della ricerca:
 *   recensione/opinioni  pos 30,5  (34,6% delle impression entro la 20esima)
 *   confronto (X vs Y)   pos 35,2  (12,2%)
 *   generica 1-2 parole  pos 46,8  ( 7,6%)
 *   media 3-4 parole     pos 60,6  ( 5,5%)
 *   coda lunga 5+        pos 62,6  ( 4,2%)
 *   domanda come/cosa    pos 62,8  ( 1,6%)
 *
 * Trenta posizioni di differenza. Il motivo e strutturale: su "come usare gli oli essenziali"
 * competiamo con siti che hanno anni di autorita; su "menta vs eucalipto" non compete quasi
 * nessuno, perche i siti autorevoli non si abbassano al confronto specifico. E chi cerca cosi
 * sta per comprare.
 *
 * Queste funzioni servono a DUE cose, e devono dire la stessa identica cosa in entrambe:
 *  - daily-publish: garantire la quota (~1 articolo su 3 di questa forma)
 *  - generate-article: scrivere l'articolo NELLA forma giusta (confronto che sceglie, recensione
 *    che da un verdetto)
 * Se divergessero, si finirebbe a pubblicare un confronto scritto come articolo generico.
 *
 * ⚠️ Le congiunzioni corte ("oppure") vanno legate alla LINGUA, mai applicate ovunque: "of" e
 * "oppure" in olandese ma e la preposizione piu comune dell'inglese, e "o" apre mezzo portoghese
 * ("o que e..."). Applicate a tutte le lingue, "benefits of lavender oil" diventava un confronto
 * — misurato su casi veri, non ipotizzato.
 */

/** Marcatori di confronto validi in qualunque lingua (nessun rischio di falso positivo). */
const CONFRONTO_UNIVERSALE = /(\bvs\b|\bversus\b|\bmeglio d|\bbetter than\b|\bdifference between\b|\bdifferenza tra\b|\bcomparison\b|\bcomparativa\b|\bvergleich|\bunterschied|\bcomparaison\b|\bcompara[çc][ãa]o\b|\bmelhor que\b|\bmejor que\b|\bcual es mejor\b|\bqual [eé] melhor\b|比較|どっち|أفضل من)/i

/** "oppure" per lingua: solo dove quella parola significa davvero quello. */
const OPPURE_PER_LINGUA: Record<string, RegExp> = {
  it: /\b(o|oppure)\b/i,
  es: /\bo\b/i,
  pl: /\bczy\b/i,
  de: /\boder\b/i,
  nl: /\bof\b/i,
  fr: /\bou\b/i,
  pt: /\bou\b/i,
  ro: /\bsau\b/i,
}

const RECENSIONE = /(\breview\b|\brecensione\b|\bopinioni\b|\bopinii\b|\bpareri\b|\bavis\b|\berfahrungen\b|\bbewertung\b|\brese[ñn]a\b|\bopiniones\b|\ban[áa]lise\b|\brecenzi|\bbeoordeling\b|\bopinie\b|\bmerita\b|\bvale la pena\b|\bworth it\b|\bne vale\b|口コミ|レビュー|مراجعة)/i

export type Forma = 'confronto' | 'recensione' | null

/**
 * ⚠️ 11 set 2026 — i DIACRITICI. Il rumeno "Merită? Recenzia Mea" NON veniva riconosciuto come
 * recensione: `\bmerita\b` non matcha "merită". Misurato su un articolo vero pubblicato oggi.
 * Rimedio: si prova sia la stringa originale sia quella senza segni diacritici.
 * Perche ENTRAMBE e non solo la normalizzata: NFD scompone anche il giapponese ("レビュー"
 * diventa qualcos'altro e smette di matchare), quindi normalizzare e basta romperebbe il ja.
 */
const senzaAccenti = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
const provaDoppia = (re: RegExp, t: string) => re.test(t) || re.test(senzaAccenti(t))

/** La forma di una ricerca (o di un titolo). `lang` e il language_code del brand. */
export function formaDi(testo: string, lang: string): Forma {
  const t = String(testo ?? '')
  const oppure = OPPURE_PER_LINGUA[String(lang ?? '').toLowerCase()]
  if (provaDoppia(CONFRONTO_UNIVERSALE, t) || (oppure && provaDoppia(oppure, t))) return 'confronto'
  if (provaDoppia(RECENSIONE, t)) return 'recensione'
  return null
}

export function haForma(testo: string, lang: string): boolean {
  return formaDi(testo, lang) !== null
}

/**
 * Gli ultimi N articoli pubblicati del brand contengono gia un confronto o una recensione?
 * Serve a tenere la quota senza gonfiare i punteggi: se la risposta e no, il prossimo articolo
 * deve essere di quella forma. In caso di errore torna `true` (= non forzare): un guasto nella
 * lettura non deve stravolgere il palinsesto.
 */
export async function ultimiHannoForma(
  supabase: { from: (t: string) => any },
  brandId: string,
  lang: string,
  n = 3,
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('articles')
      .select('title')
      .eq('brand_id', brandId)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(n)
    const righe = (data ?? []) as { title?: string }[]
    if (!righe.length) return false // nessuno storico: parti con la forma nuova
    return righe.some(r => haForma(String(r.title ?? ''), lang))
  } catch {
    return true
  }
}

/** Il blocco di istruzioni da appendere al prompt dell'articolo, secondo la forma della ricerca. */
export function istruzioniForma(keyword: string, lang: string): string {
  const f = formaDi(keyword, lang)
  if (f === 'confronto') {
    return `
FORMA DELL'ARTICOLO — CONFRONTO (la ricerca mette due cose a paragone):
Chi cerca cosi vuole UNA risposta: quale dei due, per il suo caso. Un articolo che descrive
entrambi senza scegliere non gli serve, e torna indietro.
- Il TITOLO deve tenere il confronto esplicito (entrambi i nomi), non diventare un titolo generico.
- Le PRIME righe dopo l'introduzione devono gia dire quale conviene e a chi: non far aspettare la risposta.
- La tabella di confronto obbligatoria mette a paragone ESATTAMENTE le due cose della ricerca,
  riga per riga sui criteri che contano per chi sceglie (non una tabella generica di caratteristiche).
- Almeno una sezione "quale scegliere se…" con i casi d'uso concreti: per chi va bene l'uno, per chi l'altro.
- Sii onesto sui difetti di entrambi: un confronto che elogia tutto non decide niente e non convince nessuno.`
  }
  if (f === 'recensione') {
    return `
FORMA DELL'ARTICOLO — RECENSIONE / OPINIONI (la ricerca chiede un giudizio):
Chi cerca cosi vuole un verdetto motivato, non una scheda prodotto.
- Il TITOLO deve promettere il giudizio (opinioni, recensione, ne vale la pena), non solo il nome del prodotto.
- Dai il VERDETTO nelle prime righe dopo l'introduzione: vale o non vale, e per chi.
- Una sezione con i PRO e una con i CONTRO, entrambe concrete. Se non trovi nessun contro credibile,
  non stai recensendo: stai facendo pubblicita, e si vede.
- Chiudi con "a chi conviene e a chi no", esplicito.
- Resta dentro cio che si puo affermare davvero: niente esperienze personali inventate, niente
  risultati promessi. Il giudizio si argomenta con caratteristiche, usi e limiti reali.`
  }
  return ''
}
