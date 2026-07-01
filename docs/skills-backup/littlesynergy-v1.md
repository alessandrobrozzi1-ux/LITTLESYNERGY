---
name: littlesynergy
description: Skill di MANUTENZIONE di LittleSynergy.com — blog affiliate doTERRA nicchia OLI ESSENZIALI PER BAMBINI E MAMME, 2 brand EN+ES, live dal 1 luglio 2026. Clone adattato di SoloSEO su account Davidino (Vercel+Supabase) + GitHub Alessandro. Il CUORE è la COMPLIANCE BAMBINI (più severa di SoloSEO): mai dosaggi topici numerici, mai età numeriche, oli high-risk nominati, salvaguardia mentolo-diffusione, doppia difesa prompt+scan. Eredita income zero-tolerance/CPTG/no-prezzi/no-a-vita/meccanismo-libero/nomi-nativi. TOV mamma-a-mamma. Footer multi-mercato (EN: US/CA/UK; ES: España + 8 LatAm). Autopilot cron+backfill su Hobby 60s. Use trigger: littlesynergy, littlesynergy status, check littlesynergy, health littlesynergy, nuovo articolo littlesynergy, audit littlesynergy.
triggers:
  - "littlesynergy"
  - "littlesynergy status"
  - "check littlesynergy"
  - "health littlesynergy"
  - "audit littlesynergy"
  - "nuovo articolo littlesynergy"
  - "littlesynergy footer"
---

# LittleSynergy — Skill di Manutenzione v1 (1 luglio 2026)

> Blog doTERRA **bambini + mamme**, EN (root) + ES (/es). Backend Next.js su Vercel **Davidino**, Supabase **Davidino**, frontend **Lovable**, backup GitHub **Alessandro**. Live dal 1/7/2026, autopilot notturno. **NON è SoloSEO** — progetto separato, account separati, mai mischiare.

---

## §0 — IDENTITÀ & STATO

- **Dominio pubblico:** https://littlesynergy.com (EN root + ES `/es`)
- **API backend:** https://littlesynergy.vercel.app
- **2 brand attivi:** EN + ES. OwnerID doTERRA **Davidino = 15958005**.
- **Nicchia:** oli essenziali per bambini e mamme (NON doTERRA generico). Rischio compliance MASSIMO → vedi §2.
- **Split account (MAI mischiare):** Vercel + Supabase = **Davidino** (Davidegennari00@gmail.com). GitHub backup = **Alessandro** (`alessandrobrozzi1-ux/LITTLESYNERGY`). OpenAI/Anthropic key = riuso Alessandro (billing suo).

---

## §1 — ARCHITETTURA & REFERENCE IDs

| Cosa | Valore |
|---|---|
| Brand EN `id` | `65fc8d72-8799-4abc-a17e-da6cb6efc2df` |
| Brand ES `id` | `f64c94ed-e3c4-4ebc-821c-011e06bdd89b` |
| Supabase project ref | `qyldowriqfsktdbqhvii` → URL `https://qyldowriqfsktdbqhvii.supabase.co` |
| Vercel project | `littlesynergy` · id `prj_3IbX81HDxIpzfYtncuZJ7reqX0T2` · team `team_I0m9FkIxACPUsbGs06DkR0Dn` |
| GitHub repo | `https://github.com/alessandrobrozzi1-ux/LITTLESYNERGY.git` (privata, main) |
| Cartella locale | `C:\Users\aless\Desktop\littlesynergy` (FUORI da OneDrive) |
| Pillar slug EN | `how-to-buy-doterra` → `/blog/how-to-buy-doterra` |
| Pillar slug ES | `como-comprar-doterra-paso-a-paso-espana` → `/es/blog/como-comprar-doterra-paso-a-paso-espana` |
| Public API lista | `GET /api/public/articles/{en\|es}` (array, senza `content_markdown`) |
| Public API singolo | `GET /api/public/article/{slug}` (oggetto, con `content_markdown`) |

**Stack:** Next.js (backend + dashboard) su Vercel Davidino · Supabase Davidino (Postgres + pgvector + Storage bucket `article-images` public) · frontend blog su **Lovable** (consuma la public API) · Anthropic `claude-sonnet-4-5` (testo) + OpenAI (immagini gpt-image-2, embeddings text-embedding-3-small).

**Secret:** MAI nel file/git. Vivono in `.env.local` (gitignored) + env Vercel Production (Encrypted): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `CRON_SECRET`.

---

## §2 — 🚨 COMPLIANCE BAMBINI — IL CUORE DELLA SKILL

**Questo è ciò che rende LittleSynergy diverso e più rischioso di SoloSEO.** Contenuti su oli PER BAMBINI e per mamme in gravidanza/allattamento = massima cautela legale (FTC + claim su minori). Vive nel blocco `childrenSafety` in `app/api/generate-article/route.ts` (SEMPRE attivo, tutte le lingue) + **doppia difesa** con lo scan regex.

### 2.1 — Blocco `childrenSafety` (regole integrali)
- **MAI dosaggi/diluizioni TOPICHE numeriche** per bambini, neonati, gravidanza/allattamento: niente conteggio gocce, rapporti o percentuali per uso su pelle/bagno («1 goccia sulla pelle», «2%», «1:10», «X gocce per ml di portante»). La diluizione cutanea si descrive SOLO in modo qualitativo («diluisci sempre generosamente con un olio portante», «usa con parsimonia», «molto più diluito che per un adulto»).
  - **ECCEZIONE gocce DIFFUSORE:** il conteggio gocce per la sola diffusione ambientale È permesso (l'olio non è applicato al bambino), es. «2-3 gocce nel diffusore», tenendolo piccolo e «meno che per un adulto». Vale SOLO per diffusione, MAI pelle/bagno/ingestione.
- **MAI claim che un olio cura/tratta/previene** una condizione, sintomo o problema nel bambino (colica, dentizione, febbre, tosse, otite, eczema, ADHD, autismo, ecc.). Claim medico su minore = vietato.
- **MAI uso su NEONATI/LATTANTI, e MAI un'età-soglia numerica come fatto** («under 6 years», «menores de 6 años», «a partir de 3 meses»…). L'età è compito dell'etichetta doTERRA + pediatra: rimanda sempre a «doTERRA's official age guidance on the product label» e «il tuo pediatra», mai un numero scelto dal modello. Un numero sbagliato = rischio reale.
- **MAI «safe for babies / gentle enough for newborns / 100% safe / harmless / no side effects»** per bambini.
- **MAI l'olio come sostituto** di cure pediatriche, vaccini, terapia prescritta o visita medica.
- **SEMPRE** ricordare di **consultare il pediatra** prima dell'uso su/attorno a un bambino + seguire etichetta doTERRA.
- **SEMPRE** nota «tenere fuori dalla portata dei bambini» dove si parla di uso con bambini.
- **Registro esperienziale, gentile, mamma-a-mamma:** rituali serali di calma, aromi piacevoli in casa, diffusione in spazi condivisi, autocura della mamma. Descrivi profumo/atmosfera/rituali quotidiani, MAI fisiologia/malattia/cura. Nel dubbio, PIÙ cauti.

### 2.2 — NAMED HIGH-RISK OILS (nominati, mai «adatti/sicuri per bambini»)
- **CALDI / irritanti** (Cinnamon, Clove, Oregano, Thyme): MAI sulla pelle di un bambino.
- **FOTOTOSSICI citrus** (Bergamot, Lemon, Wild Orange e altri agrumi): MAI su pelle esposta al sole.
- **ALTO-MENTOLO / 1,8-cineolo** (Peppermint, Eucalyptus, Rosemary, Wintergreen): NON per bambini piccoli.
- Se citati, dire chiaramente che vanno tenuti lontani dai piccoli / off children's skin + chiedi al pediatra.

### 2.3 — SALVAGUARDIA MENTOLO-DIFFUSIONE (specifica)
- **MAI suggerire di DIFFONDERE** oli alto-mentolo/1,8-cineolo (Peppermint, Eucalyptus, Rosemary, Wintergreen) attorno a **neonati/lattanti o bambini molto piccoli**: il rischio respiratorio esiste per **inalazione**, non solo cutaneo. L'eccezione «gocce diffusore OK» **NON si applica** a questi oli coi piccoli. Se se ne parla: solo spazi condivisi ben ventilati, MAI la cameretta di un bimbo piccolo, sempre «chiedi al pediatra».

### 2.4 — POLICY GOCCE
- ✅ **Gocce nel diffusore** (ambientale) = permesse (numeri ok, piccoli).
- 🚫 **Numeri TOPici** (pelle/bagno/portante) = vietati (solo qualitativo).
- 🚫 **Età numeriche** = vietate (rimando etichetta+pediatra).
- ⚠️ Eccezione mentolo §2.3: nemmeno il diffusore vicino ai piccoli.

### 2.5 — GESTIONE query «safe for kids / seguro para niños»
Keyword tenute (le mamme le cercano, ottime per SEO) MA risposta prudente: **MAI «è sicuro»**. Rispondi «**dipende** dall'olio e dall'età», dai i principi di cautela (diluisci generosamente, evita gli high-risk, preferisci diffondere in spazi condivisi all'applicazione sulla pelle), e rimanda **sempre a pediatra + etichetta doTERRA**.

### 2.6 — DOPPIA DIFESA (blocco prompt + scan regex)
Anche col prompt blindato un caso sfugge (lezione: EN «4 drops in 100ml per un bambino», ES «menores de 6 años» sfuggiti al primo giro) → **scan regex OBBLIGATORIO** prima di pubblicare, colonna **KIDS** in `scripts/healthcheck-quality.cjs`. La regex KIDS flagga (verifica sempre a mano): età numeriche; numeri in contesto topico (skin/bath/carrier/piel/baño/portador/aplica); «safe for babies/seguro para bebés»; olio high-risk presso neonato; cura+condizione pediatrica; **olio mentolato + diffus + bambino-piccolo**. NON flagga le gocce-diffusore (permesse). Falsi positivi noti: la domanda FAQ «is it safe for babies?» (gestita bene), le negazioni.

---

## §3 — BLOCCHI EREDITATI DA SOLOSEO (universali, tutte le lingue)

Tutti in `universalDoterraRules` (sempre attivo):
- **INCOME CLAIMS — ZERO TOLERANCE** (rischio legale #1, FTC/DSA): mai cifre di guadagno/reddito/«earning potential»/ROI/guadagno-per-rank, né numero né range né «up to X», in nessuna valuta; mai tabella rank×reddito (i rank sono milestone di VOLUME PV/OV); se il contesto è inevitabile, dire che la maggioranza nel direct-selling guadagna poco/nulla e doTERRA non garantisce reddito.
- **CPTG = Certified Pure Tested Grade** (MAI «Therapeutic Grade»/«terapeutico»): standard proprietario doTERRA di purezza e test, attribuito a doTERRA, non efficacia medica.
- **PREZZI:** mai cifre in valuta (€, $, £, MXN…) per prodotti/kit/quota. Solo «prezzo membro», «25% di sconto sul prezzo al pubblico», «piccola quota annuale gratis sopra 150 PV».
- **REGOLA 25% = sconto** sul catalogo (membro vs pubblico), MAI «a vita/forever/permanente/para siempre».
- **MECCANISMO ACQUISTO LIBERO:** registrazione gratis (~5 min, email + qualsiasi prodotto nel carrello), nessun kit obbligatorio; membership = piccola quota annuale gratis sopra 150 PV; kit = opzione consigliata, MAI obbligo.
- **NOMI PRODOTTO NATIVI:** anche se la keyword è in inglese, nel titolo/corpo usa il nome nativo (ES: Lavanda, Incienso, Manzanilla Romana…). Eccezioni inglesi: «Tea Tree» + blend (On Guard, Deep Blue, Serenity, Balance).
- **STILE:** mai em-dash spaziato « — » come separatore (usa virgole/parentesi/punti). Titoli: **MAI due punti «X: Y»** (tell da AI) — regola assoluta, non legata alla lunghezza.

---

## §4 — TOV MAMMA-A-MAMMA + LUNGHEZZA (cron-safe)

- **Voce portante** (`brand_dna_brand_voice` EN+ES, nel DB): prima persona vissuta («quando ho iniziato anch'io», «ricordo che ero confusa da»), empatia sul punto di partenza della lettrice («se sei qui, probabilmente ti stai chiedendo»), come un'amica davanti a un caffè, mai markettaro. Calore = voce PORTANTE, non decorazione. + le regole compliance restano.
- **`purchaseTone`** (in `buildUserPrompt`, attivato da keyword acquisto «how to buy/cómo comprar»): il pillar acquisto è il pezzo più caldo e personale del sito.
- **LUNGHEZZA (critico per il cron 60s):** GEO rule #8 = CONCISENESS («caldo ≠ prolisso, le mamme leggono di fretta»), `LENGTH_CONFIG.medium = '700-850'`, cap esplicito nel prompt. Il modello tende comunque a ~1050-1150 (ES verboso). Vedi §7 per l'operating point.

---

## §5 — FOOTER MULTI-MERCATO (URL verbatim pronti)

Pattern (come essentialsynergybr): **1 shop del mercato primario + lista GATEWAY per-paese nella stessa lingua** + pillar link + WhatsApp + disclaimer bambini + «LittleSynergy Team» (mai nomi reali). Gateway = `https://office.doterra.com/Application/index.cfm?Country=XXX&EnrollerID=YYY`.

⚠️ **EnrollerID split (DA CONFERMARE):** Spagna shop + gateway ESP + anglofoni (US/CA/UK) = **Davidino 15958005**. Gateway **LatAm = Alessandro 15957920** (Davidino non è attivo in quei market LatAm). Verificare in back office doTERRA per mercato. ⚠️ **doterra.com in ritiro per Europa/UK verso doterra.eu** — ricontrollare periodicamente gli URL `shop.doterra.com/GB` e `/ES`.

### 5.1 — FOOTER EN (anglofoni)
| Riga | URL verbatim |
|---|---|
| Shop US | `https://www.doterra.com/US/en/shop/?OwnerID=15958005` |
| Shop CA | `https://www.doterra.com/CA/en/shop/?OwnerID=15958005` |
| Shop UK | `https://shop.doterra.com/GB/en_GB/shop/?OwnerID=15958005` ⚠️ host `shop.doterra.com`, codice **GB** |
| Gateway US | `https://office.doterra.com/Application/index.cfm?Country=USA&EnrollerID=15958005` |
| Gateway CA | `https://office.doterra.com/Application/index.cfm?Country=CAN&EnrollerID=15958005` |
| Gateway UK | `https://office.doterra.com/Application/index.cfm?Country=GBR&EnrollerID=15958005` ⚠️ GBR da verificare |
| Pillar | `/blog/how-to-buy-doterra` |
| WhatsApp | ⚠️ numero Davidino TBD |
| Disclaimer | `*These statements have not been evaluated by the Food and Drug Administration. This content is educational and is not medical advice. Essential oils are not intended to diagnose, treat, cure, or prevent any disease. Always consult your pediatrician before using essential oils on or around children, during pregnancy, or while breastfeeding. Keep essential oils out of reach of children. Individual results may vary.*` |

### 5.2 — FOOTER ES (España + LatAm)
| Riga | URL verbatim |
|---|---|
| Shop España | `https://shop.doterra.com/ES/es_ES/shop/?OwnerID=15958005` (Davidino) |
| Gateway España | `https://office.doterra.com/Application/index.cfm?Country=ESP&EnrollerID=15958005` (Davidino) |
| Gateway México | `https://office.doterra.com/Application/index.cfm?Country=MEX&EnrollerID=15957920` |
| Gateway Colombia | `…?Country=COL&EnrollerID=15957920` |
| Gateway Chile | `…?Country=CHL&EnrollerID=15957920` |
| Gateway Brasil | `…?Country=BRA&EnrollerID=15957920` (lusofono, come su essentialsynergybr) |
| Gateway Ecuador | `…?Country=ECU&EnrollerID=15957920` |
| Gateway Costa Rica | `…?Country=CRI&EnrollerID=15957920` |
| Gateway Guatemala | `…?Country=GTM&EnrollerID=15957920` |
| Gateway El Salvador | `…?Country=SLV&EnrollerID=15957920` |
| Pillar | `/es/blog/como-comprar-doterra-paso-a-paso-espana` |
| WhatsApp | ⚠️ numero Davidino TBD |
| Disclaimer | `*Estas afirmaciones no han sido evaluadas por las autoridades reguladoras. Este contenido es educativo y no constituye consejo médico. Los aceites esenciales no están destinados a diagnosticar, tratar, curar ni prevenir ninguna enfermedad. Consulta siempre con tu pediatra antes de usar aceites esenciales en niños, durante el embarazo o la lactancia. Mantén los aceites esenciales fuera del alcance de los niños. Los resultados individuales pueden variar.*` |

⚠️ **Formato query gateway:** preservare verbatim il prefisso di essentialsynergybr (alcuni gateway doTERRA usano `?&Country=` da NON normalizzare). Il ground-truth assoluto dei codici è il footer essentialsynergybr: in caso di dubbio, copia da lì e cambia solo l'EnrollerID.

### 5.3 — Link prodotto nel CORPO (diverso dal footer)
Il corpo usa i product link del `link_expert` (31 EN Pattern-2 `www.doterra.com/US/en/p/[slug]/?OwnerID=15958005`, 31 ES Pattern-1 `shop.doterra.com/ES/es_ES/shop/[slug]/?OwnerID=15958005`). `sanitizeProductUrls` mantiene solo gli slug verificati, gli altri → fallback shop. Il footer multi-paese è un chooser separato; il corpo EN linka US, il corpo ES linka España.

---

## §6 — OPS & MONITORING

**`node scripts/ops.cjs <cmd>`** (legge `.env.local`, ORDER=['en','es']):
- `health` — brand attivi / articoli-oggi + foto / sito API (30s)
- `today` — articoli di oggi per brand + stato foto
- `nullimg` — published senza foto
- `backfill` — drena le foto mancanti (loop fino a 0)
- `publish` / `keywords` — ri-triggera i cron
- `site` — public API EN/ES (HTTP)
- `find "<testo>"` — cerca testo nei published (prezzi/claim)
- `fix <slug> "<old>" "<new>"` — sostituisci testo esatto + re-embed

**`node scripts/healthcheck-quality.cjs`** — 6 problemi (mecc / a-vita / cifre / therapeutic / income / **KIDS**), EN+ES. **Falsi positivi noti** (NON sono violazioni): «safe for babies» in domanda FAQ; negazioni «don't need a kit / no compromiso permanente»; «not therapeutic grade» (clarificazione CPTG corretta). Regola: kids = verifica SEMPRE a mano.

---

## §7 — CRON & BACKFILL (AUTOPILOT)

- **Cron Vercel** (`vercel.json`, registrati+enabled): `daily-keywords` `0 6 * * *` (06:00 UTC) + `daily-publish` `0 7 * * *` (07:00 UTC). Ogni notte: 1 articolo EN + 1 ES.
- **Operating point Hobby 60s:** `generate-article` chiude **<60s** → il TESTO si salva SEMPRE (nessun orfano-di-testo). L'orchestratore `daily-publish` (2 brand + immagine inline) muore a 60s → alcune immagini nascono `null`.
- **Backfill immagini:** endpoint `/api/cron/backfill-images` (gated `CRON_SECRET`, idempotente, ~1 img/call sotto il cap). Hobby = max 2 cron giornalieri → **pinger esterno `cron-job.org`** (account Davidino): GET `https://littlesynergy.vercel.app/api/cron/backfill-images`, schedule `*/3 7 * * *` UTC, header `Authorization: Bearer <CRON_SECRET>`. **DEVE essere armato PRIMA di active=TRUE.**
- **Keyword:** pool da `editorial_themes` (25/brand). Il `daily-publish` pesca lì + pytrends + AI fallback, evitando le usate (30gg).

---

## §8 — RUNBOOK (attività comuni)

- **Nuovo articolo manuale:** `POST https://littlesynergy.vercel.app/api/generate-article` `{brand_id, keyword, length:'medium', draft:true}` → verifica DB (`status='draft'`) → `generate-image` `{article_id, keyword}` → scan KIDS → se ok `status='published'`.
- **Pillar / articolo LUNGO (>~1300 parole, sfora i 60s su Vercel):** genera in **LOCALE** con `npm run dev` (next dev, no cap 60s) → `POST http://localhost:3000/api/generate-article` → poi immagine via prod. **MAI ritentare alla cieca sui timeout 60s** (l'insert avviene prima della risposta → ogni retry crea un ORFANO duplicato; controlla il DB, non ripetere).
- **Immagine mancante:** `ops backfill` o `generate-image` diretto. Bucket Storage `article-images` (public) deve esistere.
- **Embedding mancante (internal linking):** `node scripts/backfill-embeddings.mjs`.
- **Dedup orfani:** inventario per id/slug/parole/img → tieni 1 per slug (il completo con immagine) → cancella gli altri **solo se `status='draft'`** (guard).
- **Fix contenuto:** `ops fix <slug> "<esatto>" "<nuovo>"` (+ re-embed automatico).
- **Deploy:** `vercel --prod --token <Davidino>` dalla cartella littlesynergy. **`vercel --prod` PRIMA del primo draft** dopo modifiche ai blocchi (gli endpoint girano il codice deployato).

---

## §9 — VINCOLI ETERNI / LEZIONI

1. **Cap Hobby 60s:** testo salvo <60s; immagini via backfill. Pillar lunghi → local next dev.
2. **Mai retry cieco sui timeout** → orfani duplicati (anche uno con prezzi inventati). Controlla il DB dopo ogni timeout.
3. **`vercel --prod` prima del draft** (codice deployato, non le edit locali).
4. **Scan+fix per-draft OBBLIGATORIO** anche col prompt blindato (specie bambini).
5. **Separazione account:** Vercel/Supabase Davidino, GitHub Alessandro, comandi Vercel sempre `--token` Davidino. Mai toccare SoloSEO.
6. **Frontend Lovable: repointare l'API su TUTTE le lingue** (trappola: ripuntato EN, mancato ES → il blog ES pescava da soloseo-alpha). Search&replace globale `soloseo-alpha.vercel.app` → `littlesynergy.vercel.app`.
7. **PBN-risk:** la rete backlink cross-sito (§10) va fatta sparsa/contestuale, mai fitta/automatica (Google penalizza).
8. **doterra.com in ritiro Europa/UK** → monitorare `shop.doterra.com/GB` e `/ES`.
9. **Cache Next.js:** `createAdminClient` usa `cache:'no-store'`; se una modifica DB non si vede subito, è cache browser/CDN, non un bug backend.

---

## §10 — INTERNAL LINKING & RETE CROSS-SITO

- **Same-brand (esiste, automatico):** `generate-article` embedda la keyword → `findRelatedArticles` (stesso brand, soglia 0.4, pgvector) → inietta hint → Claude mette 1-2 link interni → salva embedding. Isolato (EN→EN, ES→ES). Si popola col crescere del corpus (ora pochi/zero link, normale).
- **Rete BACKLINK CROSS-SITO (LittleSynergy ↔ essentialsynergy ↔ futuri): NON esiste, DA PROGETTARE** (sessione dedicata). Servirebbe indice federato + step cross-sito in generate-article. Cautela PBN.

---

## §11 — FRONTEND LOVABLE

- **API base:** `https://littlesynergy.vercel.app` (lista `/api/public/articles/{en|es}`, singolo `/api/public/article/{slug}`). **MAI `soloseo-alpha.vercel.app`.**
- **Route:** EN root (`/blog/{slug}`), ES `/es` (`/es/blog/{slug}`). **9 lingue rimosse** (de/fr/pt/ro/jp/ar/it/nl/pl), niente RTL.
- **JSON:** nessun campo `author` (l'autore è la riga in corsivo nel `content_markdown`); la lista non ha il corpo. `featured_image` = URL Supabase (hero + og:image).
- **Render:** markdown GFM + **CSS tabelle** (border-collapse/padding/zebra/overflow-x mobile). `<html lang/dir>` per route (en/es, entrambi ltr). hreflang a livello sito (en/es/x-default); articoli con canonical self (EN e ES NON sono traduzioni 1:1). GA4 + consent collegato all'init.

---

## §12 — REFERENCE RAPIDO

- **Brand:** EN `65fc8d72-8799-4abc-a17e-da6cb6efc2df` · ES `f64c94ed-e3c4-4ebc-821c-011e06bdd89b`
- **OwnerID/EnrollerID:** Davidino `15958005` (ES-Spain + anglo) · Alessandro `15957920` (LatAm gateway — confermare)
- **Pillar:** EN `how-to-buy-doterra` · ES `como-comprar-doterra-paso-a-paso-espana`
- **API:** `https://littlesynergy.vercel.app` · **Dominio:** `https://littlesynergy.com`
- **Supabase:** ref `qyldowriqfsktdbqhvii` · **Vercel:** `prj_3IbX81HDxIpzfYtncuZJ7reqX0T2` / team `team_I0m9FkIxACPUsbGs06DkR0Dn`
- **GitHub:** `alessandrobrozzi1-ux/LITTLESYNERGY`
- **Cron:** keywords `0 6 * * *` · publish `0 7 * * *` UTC · backfill pinger `*/3 7 * * *` (cron-job.org)
- **doTERRA host:** US/CA = `www.doterra.com/{US|CA}/en/shop` · UK/ES = `shop.doterra.com/{GB/en_GB|ES/es_ES}/shop`
- **Env (in .env.local/Vercel, MAI in git):** NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, CRON_SECRET
