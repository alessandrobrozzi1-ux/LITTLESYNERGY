/**
 * ═══ COMPETENZA DI MESTIERE NEL PROMPT (11 set 2026) ═══
 *
 * Richiesta di Alessandro: "metti al servizio dell'impero degli esperti". La versione che
 * funziona NON e inventare esperti — firme tipo "Dr.ssa Rossi, aromaterapeuta certificata" sono
 * false, ingannano chi legge su temi di salute, e in una nicchia YMYL sono precisamente il
 * segnale che fa retrocedere un dominio. Abbiamo gia 4 brand che Google ha smesso di scaricare:
 * credenziali finte sono il modo piu rapido per perdere anche gli altri. La firma resta quella
 * vera (il Team, come oggi).
 *
 * La versione che funziona e mettere dentro la COMPETENZA. Un articolo scritto da un
 * aromaterapeuta vero non si riconosce dalla firma: si riconosce perche dice "1% sul viso,
 * 2-3% sul corpo", sa perche il jojoba e non il cocco sul viso, sa che il bergamotto
 * fotosensibilizza per 12 ore e che i gatti non hanno la glucuronil-transferasi. Quella
 * specificita e anche cio che distingue una pagina che si posiziona da una che sparisce
 * ([[profondita-posizioni]]: il 66% delle nostre impression sta oltre la posizione 50).
 *
 * REGOLE DI QUESTO FILE
 * - Solo fatti verificabili e stabili (rapporti di diluizione, nomi botanici, meccanismi noti,
 *   controindicazioni riconosciute). Niente che debba essere "aggiornato" ogni mese.
 * - Niente affermazioni terapeutiche: qui si insegna al modello a essere PRECISO, non a curare.
 *   La regola "linguaggio wellness, mai claim medici" del system prompt resta sopra a tutto.
 * - Ogni blocco e compatto: se ne iniettano al massimo due per articolo, altrimenti si mangia
 *   il budget di token che serve all'articolo stesso.
 * - Quando un blocco impone una CAUTELA (gatti, gravidanza, fotosensibilita) quella cautela e
 *   la parte piu importante: e cio che rende il contenuto affidabile invece che pericoloso.
 */

export type Competenza = { chiave: string; quando: RegExp; blocco: string }

/** Base aromaterapia: vale per ogni articolo sugli oli, e la fonda di tutto il resto. */
const AROMATERAPIA_BASE = `COMPETENZA — AROMATERAPIA PRATICA (usa questi numeri, non genericita):
- DILUIZIONE, sempre esplicita quando suggerisci un uso cutaneo: 1% (≈1 goccia per 5 ml di vettore)
  per viso, bambini sopra i 2 anni, anziani, pelli sensibili · 2-3% (2-3 gocce per 5 ml) per il corpo
  negli adulti · oltre il 3% solo per uso locale e breve. "Diluisci bene" senza numeri e inutile.
- VETTORE giusto e perche: jojoba sul viso (e una cera liquida, non irrancidisce e non occlude),
  cocco frazionato per il corpo e i massaggi (leggero, stabile, non macchia), mandorla dolce per
  pelli secche, avocado per pelli molto secche. Non sono intercambiabili: dillo.
- DIFFUSIONE: 3-5 gocce per 100 ml d'acqua, a intervalli di 30-45 minuti, non in continuo, in una
  stanza areata. La diffusione continua satura l'olfatto e non aggiunge nulla.
- NOME BOTANICO quando cambia la sostanza: Lavandula angustifolia (la lavanda vera, dolce, per il
  relax) NON e Lavandula latifolia (spigo, ricca di canfora, tutt'altro profilo). Se l'articolo
  parla di un olio dove la specie conta, scrivila.
- CONSERVAZIONE: vetro scuro, lontano da luce e calore, tappo chiuso. Gli agrumi ossidano in
  6-12 mesi, le resine e i legni durano anni. Un olio ossidato irrita di piu: non e solo "vecchio".`

/** Sicurezza: la parte che rende il contenuto affidabile invece che pericoloso. */
const SICUREZZA = `COMPETENZA — SICUREZZA (non e un disclaimer di rito, sono fatti precisi):
- FOTOSENSIBILIZZAZIONE: bergamotto, limone, lime, pompelmo spremuti a freddo contengono furocumarine.
  Sulla pelle esposta al sole possono dare macchie e ustioni: niente sole o lampade per ~12 ore dopo
  l'applicazione. Le versioni "FCF"/distillate non hanno il problema: se citi l'olio, cita anche questo.
- GRAVIDANZA E ALLATTAMENTO: rimanda sempre alla valutazione del proprio medico o ostetrica prima
  dell'uso, e non proporre uso interno. Non elencare oli "vietati" come se fosse una lista chiusa:
  la decisione e clinica e individuale.
- BAMBINI: sotto i 2 anni niente oli essenziali sulla pelle senza indicazione pediatrica; eucalipto e
  menta piperita (ricchi di 1,8-cineolo e mentolo) vanno tenuti lontani dal viso dei piccoli.
- EPILESSIA: rosmarino, eucalipto, salvia e finocchio sono tradizionalmente sconsigliati a chi ha
  disturbi convulsivi. Se l'argomento li tocca, dillo.
- USO INTERNO: non proporlo mai. Se il lettore lo chiede, la risposta e "solo sotto controllo di un
  professionista qualificato", senza dosi.
- PATCH TEST: una goccia diluita nell'incavo del gomito, 24 ore di attesa, prima del primo uso.`

/** Animali: la competenza che su essentialtail vale piu di tutte. */
const ANIMALI = `COMPETENZA — ANIMALI IN CASA (qui la precisione evita danni veri):
- GATTI: mancano dell'enzima glucuronil-transferasi epatica, quindi metabolizzano male fenoli e
  monoterpeni. Tea tree (melaleuca), agrumi, pino, eucalipto, menta, cannella, chiodi di garofano
  e ylang ylang sono da EVITARE dove vive un gatto — anche diffusi. Non e una precauzione generica:
  e una differenza fisiologica, spiegala.
- DIFFUSIONE CON ANIMALI: sempre in stanza aperta, con l'animale libero di uscire, mai in spazi
  chiusi o in trasportino, mai nella stanza dove dorme. L'olfatto del cane e centinaia di volte
  piu sensibile del nostro: quello che per noi e delicato per lui e intenso.
- CANI: mai olio puro sul pelo o sulla cute; diluizioni molto piu basse che sull'uomo, e solo dopo
  parere veterinario. Attenzione al leccamento: quello che sta sul pelo finisce in bocca.
- UCCELLI e piccoli roditori: apparato respiratorio estremamente sensibile, nessuna diffusione
  nella loro stanza.
- La frase "chiedi al tuo veterinario" va messa dove serve una decisione, non come formula vuota a
  fine articolo.`

const SONNO = `COMPETENZA — SONNO E RILASSAMENTO (rituale, non rimedio):
- Il valore sta nella RIPETIZIONE e nell'associazione: stesso profumo, stessa ora, stessa sequenza.
  E il condizionamento che aiuta ad addormentarsi, non la singola goccia. Dillo esplicitamente.
- TEMPISTICA: diffondere 30-45 minuti PRIMA di coricarsi e spegnere, non tutta la notte. L'aria
  satura disturba e l'olfatto si adatta comunque dopo pochi minuti.
- Oli tipici della sera e perche: Lavandula angustifolia (dolce, il classico), camomilla romana
  (delicata, adatta anche a chi trova la lavanda invadente), cedro e vetiver (note di base, "pesanti",
  danno sensazione di ancoraggio), bergamotto FCF (agrumato ma non stimolante).
- Il contesto conta quanto l'olio: luce calda e bassa, schermi lontani, temperatura fresca.
  Un articolo che ignora questo sta vendendo una scorciatoia che non esiste.
- MAI presentare gli oli come trattamento dell'insonnia: e un disturbo clinico. Si parla di
  atmosfera, rituale e rilassamento.`

const PELLE = `COMPETENZA — PELLE E COSMESI:
- Diluizione sul viso 1%, mai di piu, e sempre dopo patch test.
- Oli piu usati e loro senso: tea tree (localizzato sulle imperfezioni, mai su tutto il viso),
  incenso (Boswellia carterii, pelli mature), lavanda (lenitiva, ben tollerata), geranio (equilibrio),
  camomilla romana (pelli reattive).
- Gli oli ESSENZIALI non sono oli VEGETALI: non idratano, non nutrono, non sostituiscono una crema.
  Vanno sempre dentro un vettore. Questa confusione e l'errore piu comune dei lettori: chiariscila.
- Agrumi spremuti a freddo: mai prima dell'esposizione al sole (vedi fotosensibilizzazione).
- Su acne, eczema, psoriasi e dermatiti si parla di benessere della pelle e di routine, mai di cura.`

const CASA = `COMPETENZA — CASA E PULIZIA:
- Gli oli essenziali non sono disinfettanti registrati: profumano e rendono gradevole la pulizia,
  non sostituiscono un prodotto sanificante. Dirlo e cio che rende credibile il resto.
- Limone e arancio dolce sciolgono bene i residui grassi e appiccicosi (limonene); tea tree e
  eucalipto per il bagno; lavanda per la biancheria.
- Attenzione alle superfici: gli oli agrumati possono opacizzare plastiche e finiture cerate.
  Prova sempre in un angolo nascosto.
- In presenza di gatti valgono le cautele del blocco animali, anche per i detergenti profumati.`

const MEDITAZIONE = `COMPETENZA — MEDITAZIONE, RESPIRO E PRATICA:
- Una pratica si descrive con precisione: posizione, dove mettere l'attenzione (l'ancora: respiro,
  suono, sensazione), cosa fare quando la mente scappa (accorgersene e tornare, senza giudizio —
  e la pratica, non un fallimento), durata realistica (5-10 minuti all'inizio, non 30).
- Il profumo funziona come ANCORA: lo stesso olio usato sempre nella stessa pratica diventa un
  segnale che il corpo riconosce. Vale la ripetizione, non l'olio "giusto".
- Oli tradizionalmente usati e perche: incenso e sandalo (note di base, respiro lungo), cedro
  (radicamento), lavanda (distensione). Sono associazioni culturali e sensoriali: presentale
  come tali, non come effetti garantiti.
- Respirazione: descrivi ritmi concreti (per esempio inspirazione 4 / espirazione 6, o il
  respiro in scatola 4-4-4-4) invece di "respira profondamente".
- Niente promesse su ansia, depressione o trauma: sono ambiti clinici. Si parla di calma,
  attenzione e rituale.`

const SPORT = `COMPETENZA — SPORT E RECUPERO:
- Prima e dopo sono cose diverse: note fresche e stimolanti (menta piperita, eucalipto, rosmarino)
  si associano al riscaldamento; note calde e distensive (lavanda, maggiorana, incenso) al dopo.
- Il massaggio conta piu dell'olio: la manualita e il calore fanno il grosso del lavoro, l'olio
  accompagna. Un articolo onesto lo dice.
- Diluizione sportiva tipica 2-3%, su muscoli grandi; mai su ferite, abrasioni o pelle irritata.
- La sensazione di caldo/freddo di mentolo e canfora e un effetto sensoriale sui recettori
  termici: NON e antinfiammatorio. Non confondere le due cose.
- Dolore persistente, gonfiore o limitazione del movimento = medico o fisioterapista, non oli.`

/**
 * OMEOPATIA — trattata con onesta, perche e l'unico modo che non ci si ritorca contro.
 * La ricerca non ha dimostrato efficacia oltre l'effetto placebo, e le principali revisioni
 * sistematiche concordano. Scrivere il contrario significa (a) dire una cosa falsa a chi legge
 * di salute, (b) esporsi in una nicchia YMYL dove e esattamente cio che fa retrocedere un
 * dominio. Si puo parlarne benissimo: spiegando cos'e, come viene usata e cosa dicono le prove.
 */
const OMEOPATIA = `COMPETENZA — OMEOPATIA (accuratezza obbligatoria):
- Descrivi cos'e: diluizioni seriali con succussione, principio del "simile cura il simile",
  scale CH e DH. Alle diluizioni piu alte non resta materialmente nulla della sostanza di partenza:
  e un fatto chimico, va detto.
- Le prove: le principali revisioni sistematiche non hanno trovato efficacia superiore al placebo.
  Riportalo con chiarezza e senza tono polemico. Non presentare l'omeopatia come cura.
- Si puo spiegare perche molte persone riferiscono benefici (effetto placebo, tempo dedicato dal
  praticante, regressione naturale dei sintomi) senza deridere nessuno.
- MAI suggerire di sostituire o rimandare un trattamento medico. Questo e il punto piu importante
  dell'intero blocco.
- Gli oli essenziali NON sono omeopatia: sono due cose diverse, chiariscilo se l'articolo le tocca
  entrambe.`

/**
 * L'ordine conta: si scorre dall'alto e si prendono al massimo DUE blocchi (piu la base).
 * I temi che comportano un rischio concreto (animali, omeopatia) stanno in cima apposta.
 */
export const COMPETENZE: Competenza[] = [
  { chiave: 'animali', quando: /\b(gatt|cane|cani|cucciol|animal|pet|dog|cat|kitten|puppy|hund|katze|chien|chat|perro|gato|cavall|horse|pferd|caballo|coelho|konijn|pies|kot|犬|猫|كلب|قطة)/i, blocco: ANIMALI },
  { chiave: 'omeopatia', quando: /\b(omeopat|homeopath|homöopath|homéopath|homeopat|ホメオパシ|المثلية)/i, blocco: OMEOPATIA },
  { chiave: 'meditazione', quando: /\b(meditaz|meditat|mindful|yoga|respiraz|breath|atem|respiration|respirac|medytac|瞑想|تأمل)/i, blocco: MEDITAZIONE },
  { chiave: 'sonno', quando: /\b(sonno|dormir|sleep|schlaf|sommeil|sono|somn|slaap|sen\b|notte|night|nacht|nuit|noche|noite|insonn|insomn|relax|rilassa|calm|睡眠|نوم)/i, blocco: SONNO },
  { chiave: 'sport', quando: /\b(sport|muscol|muscle|muskel|muscul|allenamen|training|entrena|treino|recuper|recovery|erholung|massag|massage|atlet|runner|corsa|運動|رياضة)/i, blocco: SPORT },
  { chiave: 'pelle', quando: /\b(pelle|piel|skin|haut|peau|pele|piele|huid|skór|viso|face|gesicht|visage|rostro|rosto|acne|rughe|wrinkl|falten|arrug|capell|hair|haar|cheveux|cabell|肌|بشرة)/i, blocco: PELLE },
  { chiave: 'casa', quando: /\b(casa|home|haus|maison|hogar|dom\b|pulizi|clean|reinig|nettoy|limpie|limpez|curat|detergen|bucato|laundry|wäsche|掃除|تنظيف)/i, blocco: CASA },
]

/**
 * I blocchi di competenza da iniettare per una keyword. Ritorna stringa vuota se il brand non e
 * di nicchia "oli essenziali" (gli altri brand hanno la loro competenza nel brand_dna).
 */
export function competenzePer(keyword: string, nicchiaOli: boolean): string {
  if (!nicchiaOli) return ''
  const k = String(keyword ?? '')
  const scelti = COMPETENZE.filter(c => c.quando.test(k)).slice(0, 2).map(c => c.blocco)
  // La spaziatura sta QUI e non nel punto di innesto: il prompt e un template literal enorme e
  // metterci dentro un'espressione con newline e il modo piu facile per spezzarlo (successo).
  return '\n\n' + [AROMATERAPIA_BASE, SICUREZZA, ...scelti].join('\n\n') + '\n'
}
