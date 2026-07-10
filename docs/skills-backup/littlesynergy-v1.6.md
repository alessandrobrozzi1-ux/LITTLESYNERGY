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

# LittleSynergy — Skill di Manutenzione v1.6 (10 luglio 2026)

> **v1.6:** 🔌 **ANTHROPIC FUORI, tutto su DeepSeek v4-pro** (§2.13). Reti link/safety (`stripWarningContextLinks` sentence-scoped, `ensureAffiliateId`, floor esteso ai world-link), `catchup-publish`, **concorrenza MISURATA** (parallelo 11 giusto, pool 3 romperebbe Hobby). Gate sequenziale **verde ×2** su 11 lingue.

> **v1.5:** **LINK FLOOR ≥2** (`ensureDoterraBridge`) + **catalogo COMPLETO del Main su ogni sito** (mai potarlo) + espansione kids + presidio contestuale nel prompt esteso ai blend forti (§2.12). Lezioni: il catalogo NON è il vincolo sul numero di link (EN aveva 140 slug e un articolo a 1 link); **il presidio è il CERVELLO, non la rimozione dal catalogo** (un divieto cieco mutila contenuto legittimo).
> **v1.4:** **11 LINGUE** (§0) EN/ES/FR/IT/PT + DE/NL/RO/PL (shop-diretto) + JA/AR (world-link RTL/CJK). Espansione CP1(de/nl/ro/pl)+CP2(ja/ar) validata a checkpoint (§2.11). Cervello: **numeri-età ZERO anche cautelativo** (§2.1), **LANG_LENGTH_OVERRIDE** cron-safe (§2.11). **LEZIONE keyword non-latina** (§2.11): per ja/ar generare via **node fetch**, MAI curl-in-bash (corruzione UTF-8/RTL → keyword `????`).
> **v1.3:** **5 LINGUE** EN/ES/FR/IT/PT (§0) · immagini migrate a **fal.ai FLUX.2 turbo** (§2.10) · aggiornamenti cervello: no tabelle età×dose, regola neonati zero-numeri, no-link-oli-da-evitare, em-dash esteso, gancio variato, **ptRegister** portoghese europeo (§2.8).
> **v1.2:** keyword-guard nicchia bambini a 3 livelli (§7.1) · loophole "own use" chiuso nel childrenSafety (§2.7) · link_expert importato dal main (172 prodotti, 140 EN + 106 ES, OwnerID 15958005).
> **v1.1:** EnrollerID LatAm (Alessandro 15957920) + WhatsApp (+39 348 6601210) confermati nel footer.

> Blog doTERRA **bambini + mamme**, 11 lingue. Backend Next.js su Vercel **Davidino**, Supabase **Davidino**, frontend **Lovable**, backup GitHub **Alessandro**. Live dal 1/7/2026, autopilot notturno. **NON è SoloSEO** — progetto separato, account separati, mai mischiare.

---

## §0 — IDENTITÀ & STATO

- **Dominio pubblico:** https://littlesynergy.com (EN root + ES `/es`)
- **API backend:** https://littlesynergy.vercel.app
- **11 brand attivi** (dal 9/7/2026), tutto NATIVO per lingua. OwnerID doTERRA **Davidino = 15958005** (EnrollerID gateway = anch'esso 15958005, incl. ja/ar). Struttura:
  - **Shop-diretto** (product-link nativi in `link_expert`, 29 link/lingua): EN (US www), ES, FR, IT, **DE, NL, RO, PL** (`shop.doterra.com/{XX}/{xx_XX}/shop/…?OwnerID=15958005`).
  - **World-link** (solo gateway `office.doterra.com`, 0 shop, in `lib/world-link-markets.ts`): **PT** (Country=PRT), **JA** (Country=JPN), **AR** (Country=`?&ARE` verbatim, RTL).
  - Footer-gateway per lingua in `lib/footer-gateways.ts` (USA/ESP/DEU/NLD/ROU/POL + PRT/JPN/ARE, EnrollerID Davidino).
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

**Stack:** Next.js (backend + dashboard) su Vercel Davidino · Supabase Davidino (Postgres + pgvector + Storage bucket `article-images` public) · frontend blog su **Lovable** (consuma la public API) · Anthropic `claude-sonnet-4-5` (testo) · **fal.ai FLUX.2 turbo** (immagini hero 1792×1024, `lib/hero-image.ts`) · OpenAI (embeddings `text-embedding-3-small`). Vedi §2.10 per la generazione immagini.

**Secret:** MAI nel file/git. Vivono in `.env.local` (gitignored) + env Vercel Production (Encrypted): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `CRON_SECRET`, **`FAL_KEY`** (account fal.ai UNICO dell'utente, condiviso da tutti i brand dell'impero, costi sul suo billing fal — NON Davidino).

---

## §2 — 🚨 COMPLIANCE BAMBINI — IL CUORE DELLA SKILL

**Questo è ciò che rende LittleSynergy diverso e più rischioso di SoloSEO.** Contenuti su oli PER BAMBINI e per mamme in gravidanza/allattamento = massima cautela legale (FTC + claim su minori). Vive nel blocco `childrenSafety` in `app/api/generate-article/route.ts` (SEMPRE attivo, tutte le lingue) + **doppia difesa** con lo scan regex.

### 2.1 — Blocco `childrenSafety` (regole integrali)
- **MAI dosaggi/diluizioni TOPICHE numeriche** per bambini, neonati, gravidanza/allattamento: niente conteggio gocce, rapporti o percentuali per uso su pelle/bagno («1 goccia sulla pelle», «2%», «1:10», «X gocce per ml di portante»). La diluizione cutanea si descrive SOLO in modo qualitativo («diluisci sempre generosamente con un olio portante», «usa con parsimonia», «molto più diluito che per un adulto»).
  - **ECCEZIONE gocce DIFFUSORE:** il conteggio gocce per la sola diffusione ambientale È permesso (l'olio non è applicato al bambino), es. «2-3 gocce nel diffusore», tenendolo piccolo e «meno che per un adulto». Vale SOLO per diffusione, MAI pelle/bagno/ingestione.
- **MAI claim che un olio cura/tratta/previene** una condizione, sintomo o problema nel bambino (colica, dentizione, febbre, tosse, otite, eczema, ADHD, autismo, ecc.). Claim medico su minore = vietato.
- **MAI uso su NEONATI/LATTANTI, e MAI un'età-soglia numerica come fatto** («under 6 years», «menores de 6 años», «a partir de 3 meses», «under six months», «poniżej szóstego miesiąca», «sub șase luni»…), **nemmeno in senso CAUTELATIVO** («especially babies under 6 months»): riferirsi ai più piccoli solo A PAROLE («newborns and infants», «i più piccoli», «die ganz Kleinen», «cei mai mici», «najmłodsze dzieci»). L'età è compito dell'etichetta doTERRA + pediatra: rimanda sempre a «doTERRA's official age guidance on the product label» e «il tuo pediatra», mai un numero scelto dal modello. Un numero sbagliato = rischio reale.
- **REGOLA NEONATI — ZERO NUMERI (v1.3):** per un neonato o bimbo sotto ~6 mesi, NESSUN conteggio gocce, **nemmeno per il diffusore** (l'eccezione gocce-diffusore NON vale per i neonati). Solo qualitativo («una quantità minima», «con estrema parsimonia», «molto meno che per un adulto») + rimando al pediatra. Vietati per neonati: «1-2 gocce», «qualche goccia», qualsiasi numero di gocce/ml/%.
- **NO TABELLE/SCALE ETÀ×DOSE — ASSOLUTO (v1.3):** MAI costruire o riempire una scala/tabella/lista che accoppia un'ETÀ (o fascia «6mesi-2anni», «2-6 anni», «oltre 6») a gocce, dose, tempo di diffusione o diluizione. È esattamente la guida età+dose auto-attribuita che spetta SOLO all'etichetta doTERRA + pediatra. Vietati es.: colonna «Età | Gocce», «under 2s: 1-2 gocce», «per un bimbo di 3 anni usa 2-3 gocce». Si può dire in generale «molte meno gocce di un adulto, dipende dall'olio e dal bambino» → poi rimando. (Lezione prima-notte: il modello aveva creato una tabella Età×Gocce in IT.)
- **GRAVIDANZA/ALLATTAMENTO → professionista giusto:** rimanda a MEDICO/ostetrica/ginecologo (non solo pediatra, che è per il bimbo). Termini nativi: ES «médico, ginecólogo o matrona»; IT «medico o ostetrica»; FR «médecin ou sage-femme»; PT «médico ou obstetra».
- **MAI «safe for babies / gentle enough for newborns / 100% safe / harmless / no side effects»** per bambini.
- **MAI l'olio come sostituto** di cure pediatriche, vaccini, terapia prescritta o visita medica.
- **SEMPRE** ricordare di **consultare il pediatra** prima dell'uso su/attorno a un bambino + seguire etichetta doTERRA.
- **SEMPRE** nota «tenere fuori dalla portata dei bambini» dove si parla di uso con bambini.
- **Registro esperienziale, gentile, mamma-a-mamma:** rituali serali di calma, aromi piacevoli in casa, diffusione in spazi condivisi, autocura della mamma. Descrivi profumo/atmosfera/rituali quotidiani, MAI fisiologia/malattia/cura. Nel dubbio, PIÙ cauti.

### 2.7 — NO "OWN USE" LOOPHOLE (l'ambiente governa) — v1.2
Chiuso il buco per cui il modello inquadrava dose/diffusione come «uso personale della mamma» per aggirare le regole. **La cautela vale sulla STANZA CONDIVISA che il bambino respira, non su chi usa l'olio.** Se un bambino è (o può essere) presente: (a) MAI diffondere oli alto-mentolo «for yourself»/«para ti» in una stanza che un piccolo condivide; (b) MAI far passare un numero TOPico riframandolo come «la dose della mamma». La policy gocce-diffusore ambientali generiche (§2.1) resta. **Scan:** flag own-use aggiunto alla regex KIDS (EN: `your own/for yourself/for mom + numero` o `menthol + your own`; ES: `para ti/uso personal + gotas` o `menta + para ti`).

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

### 2.8 — NO LINK AFFILIATO SU OLI DA-EVITARE (v1.3)
I link doTERRA (shop/office/qualsiasi URL) esistono per vendere ciò che **raccomandi**. **MAI** attaccare un link markdown a un olio mentre dici di NON usarlo coi bambini: qualsiasi olio in un'avvertenza, in una lista «da evitare / da tenere lontano», o «non per bambini piccoli» (Peppermint, Eucalyptus, Rosemary, Wintergreen, Cinnamon, Clove, Oregano, Thyme…) va nominato come **testo semplice**. I link solo sugli oli raccomandati e sicuri. Linkare un olio che dici di evitare = incoerente + spinge a comprare il prodotto sbagliato. Bonifica retro: `scripts/strip-avoid-links.mjs` (iniezione + re-embed, no rigenerazione).

### 2.9 — PORTOGHESE EUROPEO (ptRegister) + STILE (v1.3)
- **PT = Portogallo (pt_PT), MAI brasiliano.** Blocco `ptRegister` in `generate-article/route.ts` (gated su `language_code==='pt'`) + DNA PT europea + `AUTHOR_LINES.pt` = «Da **equipa** LittleSynergy» (non «equipe»). Regole: **tu** (mai «você»), «**stress**» (non «estresse»), «bebé» (non «bebê»), «partilhar» (non «compartilhar»), «pequeno-almoço», «consigo», costruzioni «estou **a** fazer» (non gerúndio progressivo «estou fazendo»). Scan boundary-safe: usa `/voc[eê]/` e `/est(á|ou…)\s+\w+ndo/` — **NON** `/\bvocê\b/` (in JS `\b` è ASCII → fallisce dopo la «ê» = falsi negativi; stesso baco nel keyword-guard PT con «bebê» singolare, da valutare).
- **GANCIO VARIATO (v1.3):** l'apertura NON è più il fotocopiato «the short answer is…». Una frase-gancio breve e DIVERSA ogni volta, POI la risposta diretta 100-150 parole. Regola in `buildSystemPrompt`/`buildUserPrompt`.
- **EM-DASH ESTESO (v1.3):** vietato l'em/en-dash (—, –) ovunque, sia spaziato « — » sia attaccato «word—word». Post-processore deterministico `stripEmDashes` in `generate-article` (dopo `sanitizeProductUrls`) li strippa, **preservando la byline** (detection `*…LittleSynergy`) + `stripDashLine` su title/meta. Retro: `scripts/reclean-emdash.mjs`.

### 2.10 — IMMAGINI: fal.ai FLUX.2 turbo (v1.3, migrato da gpt-image-2)
- Helper unico `lib/hero-image.ts` → `generateHeroImage(prompt, width=1792, height=1024)`: POST `https://fal.run/fal-ai/flux-2/turbo` (Header `Authorization: Key $FAL_KEY`, body `{prompt, image_size:{width,height}, num_images:1, output_format:'jpeg'}`), scarica l'URL restituito e ritorna i **byte grezzi** (Buffer). Slug overridabile via env `FAL_MODEL` (se il path fal cambia, nessun redeploy).
- **Prompt INVARIATO**: continua a usare l'output di `buildImagePrompt` (nessuna modifica ai prompt immagine).
- **3 call site** (tutti passano da `generateHeroImage`, mantenendo sharp→webp q85 + upload bucket `article-images` + colonna `featured_image`): `app/api/generate-image/route.ts` (parametrizza width/height → copre anche il verticale Pinterest 1024×1536), `app/api/cron/daily-publish/route.ts`, `app/api/cron/backfill-images/route.ts`.
- `FAL_KEY` = account fal.ai **unico dell'utente** (condiviso da tutti i brand dell'impero, costi sul suo billing fal, NON Davidino). Solo in `.env.local` + Vercel env (Encrypted), MAI hardcoded/committato. fal è più veloce di gpt-image (~5s vs ~15-30s) → margine in più sotto il cap Hobby 60s.
- **Per i cloni futuri:** copiare `lib/hero-image.ts`, fare i 3 swap, aggiungere `FAL_KEY` alle env. Nessun'altra dipendenza.

### 2.11 — ESPANSIONE 11 LINGUE + LEZIONI (v1.4)
Da 5 a 11 lingue via CP1 (de/nl/ro/pl shop-diretto) + CP2 (ja/ar world-link), a checkpoint con gate safety per lingua. Ogni nuova lingua ha: DNA kids-native (6 campi) + 5 temi editoriali + `NICHE_CONTEXT` + `NICHE_MODIFIER` (guard L3) + `AUTHOR_LINES` LittleSynergy + footer-gateway. **AUTHOR_LINES**: le nuove lingue arrivavano dal clone SoloSEO con "Essential Synergy" (brand sbagliato) → sempre verificare che dicano LittleSynergy.
- **NICHE_MODIFIER (guard L3):** senza la regex per una lingua, `hasNicheModifier` ritorna `true` (guard SPENTO) → il cron genererebbe keyword non-kids. Aggiungere SEMPRE la regex per ogni nuova lingua in `lib/keyword-scorer.ts`. Latine: `\b(stem…)` con **boundary iniziale aperto** (niente `\b` finale) = diacritic-proof. CJK/arabo: **substring senza `\b`** (es. ja `/(子ども|赤ちゃん|ママ|…)/`, ar `/(أطفال|رضّع|أمهات|…)/`, evitare stem troppo corti tipo bare `أم`).
- **LANG_LENGTH_OVERRIDE** (`generate-article/route.ts`, cron-safe 60s): il modello NON obbedisce ai cap stretti (target 550-650 → DE reale 915w/51s, RO 58s = troppo vicino al cap; nessun backfill testo → timeout = articolo perso). Cap effettivo: **de/nl/ro/pl/ja/ar = 450-550** (verificato prod: RO 54s, DE 44s, AR 51-55s, JA 42s). Misurare SEMPRE il tempo reale prod, non fidarsi del word target.
- **🚨 LEZIONE KEYWORD NON-LATINA (ja/ar):** una keyword araba/giapponese passata via **curl-in-bash con `-d` inline** si CORROMPE in `????` (UTF-8/RTL mangled dallo shell) → il modello riceve spazzatura e genera l'articolo sbagliato (successo: draft AR "how-to-buy" invece di "safe-for-babies"). **Per ja/ar generare SEMPRE via `node fetch`** (UTF-8-safe) o curl `-d @file` UTF-8, MAI keyword inline nel comando bash. Verificare `keyword_source` nel DB dopo la generazione.
- **world-link ja/ar:** `WORLD_LINK_GATEWAYS` (body link → gateway) + `doterra-markets.js` worldLink + footer-gateway, tutti con **EnrollerID Davidino 15958005** (il clone SoloSEO aveva 15957920 di Alessandro = leftover, SWAPPARE). AR mantiene il quirk `?&Country=ARE` verbatim. RTL nativo, slug romanizzati (auto). `jpCompliance`(薬機法)/`arCompliance`(GCC) sono blocchi gated già ereditati.
- **create-brand world-link:** `create-brand.js` setta `affiliate_base_url = shopUrl/essential-oils`; per i world-link (pt/ja/ar) fare **UPDATE affiliate_base_url = gateway** dopo la creazione. Verificare che `LANG_NAMES` abbia la lingua (ro mancava → language_name "RO" invece di "Romanian").
- **Gate safety per nuova lingua:** generare 1 draft "safe-for-babies" (tema a rischio massimo) + verificare a mano: risposta cauta (mai "sì sicuro"), no tabella età×dose, **no numero-età nemmeno cautelativo**, oli alto-rischio come avvertenza, pediatra nativo, byline native, link corretti (shop nativo o gateway). Attivare solo dopo OK.

### 2.12 — LINK FLOOR ≥2 + CATALOGO COMPLETO (il presidio è il CERVELLO) (v1.5)
**🚫 REGOLA ETERNA: MAI mutilare il catalogo.** Il `link_expert` deve essere il **catalogo INTEGRALE del Main** (scraping di ore) su ogni sito, oli e blend forti inclusi (Peppermint, Eucalyptus, Deep Blue, doTERRA Air, ZenGest, On Guard). Il catalogo è un **riferimento**, non una lista della spesa. Il presidio è la **regola prompt contestuale + il giudizio del modello**, come fa il Main. *(Errore commesso e corretto il 9/7: avevo rimosso 38 avoid-oil dal link_expert. Sbagliato: un divieto cieco mutila contenuto legittimo.)*

**Diagnosi da non ripetere (link pochi ≠ catalogo piccolo):** EN aveva **140 slug** e produceva comunque un articolo a **1 link**; le lingue con 29 slug stavano a 4-9. → **Il vincolo è l'enforcement del minimo, non il catalogo.** Prima di "seminare 100-150 slug", misura: slug per lingua + min/avg/max link nei published.

- **`ensureDoterraBridge(content, linkExpert, worldLinkUrl)`** in `generate-article` (dopo `stripEmDashes`): se i link doTERRA sono <2, **linkifica menzioni testuali di prodotti già presenti nel corpo**. Non inventa frasi, non tocca testo già dentro un link. **World-link (pt/ja/ar) esclusi** (già instradati al gateway). Retro: `scripts/retro-link-floor.mjs`.
- **`AVOID_AUTOLINK_SLUG`** governa **SOLO l'auto-iniezione del bridge** (automazione conservativa: il post-processor non sceglie da sé un olio forte o un blend che lo contiene). **NON pota il catalogo**: il modello vede tutto.
- **Prompt LINK RULES:** floor ≥2 esplicito ("mai zero, mai uno"), **anchor = nome prodotto NATIVO**, + **eccezione FALLBACK** (un prodotto in avvertenza non si linka nemmeno al fallback).
- **Presidio contestuale (childrenSafety):** in un articolo **per bambini** non si linkano gli oli forti (Peppermint, Eucalyptus, Rosemary, Wintergreen, Cinnamon, Clove, Oregano, Thyme) **né i blend costruiti su di essi** (Deep Blue, doTERRA Air/Breathe, ZenGest, On Guard): si **NOMINANO in testo semplice**. Si linkano dove il contesto è chiaramente l'uso adulto/della mamma. «**LINKARE = AVALLARE**; il catalogo è completo, il giudizio è tuo.»
- **Catalogo kids-curato (espansione, non potatura):** alle 6 lingue nuove sono stati AGGIUNTI prodotti adatti — doTERRA **Kids Collection** (`doterra-calmer-oil`, `kids-collection-kit/enrolment`), blend emotivi (Adaptiv/Cheer/Console/Forgive/Peace), oli gentili (arborvitae, petitgrain, siberian-fir, sandalwood, helichrysum, neroli/rose touch). Fonte: `doterra-knowledge-master.json` (repo soloseo, read-only) — ⚠️ i suoi `seeded_anchors` sono **inglesi placeholder** per fr/pt/ro/it/nl/pl: anchor nativi da scrivere a mano. Stato: **en 140, es 106** (Main integrale) · fr 50 · it/nl/ro/pl 49 · de 40. Ripristino: `scripts/import-link-expert-from-main.mjs` (en/es) + `scripts/restore-avoid-oils.mjs` (6 nuove).
- **⚠️ Verifica CONTESTUALE, mai hard-fail:** un regex "link su olio forte" è cieco al contesto. Es. reale: nei pillar *how-to-buy* IT/DE **On Guard è linkato** dentro l'elenco "cosa contiene il kit" (nessuna avvertenza) e **Menta Piperita accanto è testo semplice**: comportamento CORRETTO, non violazione. Ogni flag va letto a mano.
- **E2E di verifica:** con catalogo completo, genera 1 draft su un tema bambini che nomina gli oli forti (es. "beruhigende ätherische Öle für Kinder", "oli essenziali calmanti per bambini piccoli") → attesi ≥2 link, **0 link su oli/blend forti**, forti **nominati in testo semplice**. Validato 9/7 su DE+IT.

### 2.13 — DEEPSEEK v4-pro (Anthropic fuori dal giro notturno) (v1.6)
🚨 **KILL-SWITCH NUOVO:** i crediti Anthropic sono a ZERO e non si ricaricano. **MAI rimuovere `DEEPSEEK_API_KEY`** (fermerebbe tutto). Piano B = **`DEEPSEEK_MODEL=deepseek-v4-flash`** (declassa il modello, non il provider).
- **Env (Vercel prod):** `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL=deepseek-v4-pro`, `DEEPSEEK_MODEL_SMALL=deepseek-v4-flash`, `PUBLISH_CONCURRENCY=11`.
- **Helper unico `lib/llm.ts`** (`llmText({size:'small'|'large'})`): keyword-scorer, `/api/trends/[lang]`, `lib/pinterest.ts` → flash. Articoli → v4-pro in `generate-article`. `lib/trends.ts` delega già a keyword-scorer (un solo punto). Anthropic resta **solo** come fallback se la key DeepSeek manca. Endpoint diagnostici (`/api/debug`, `brand-alignment-*`) restano Anthropic di proposito (manuali, fuori dal cron).
- **Switch (generate-article):** `baseURL: https://api.deepseek.com/anthropic`, `thinking:{type:'disabled'}`, **niente prompt-caching** (feature Anthropic), `cost_log.model` dinamico, `test_model` per i gate. **Parsing thinking-safe:** i reasoning model mettono un blocco `thinking` prima del testo → usare `content.find(b=>b.type==='text')`, MAI `content[0]`.
- **🔑 LEZIONE LINK EXPERT (dal Main):** l'`anchor_text` inglese faceva SALTARE i link (conflitto con "usa il nome nativo"). Header **"HOW TO READ THIS TABLE"**: la colonna sinistra è un nome di RIFERIMENTO per il matching, l'anchor visibile va tradotto, l'URL si copia verbatim.
- **⚠️ CAP PAROLE — DeepSeek IGNORA il target.** Misurato: senza override → **1078-1362 parole**, `it` KILLED a 60s, `fr` 58s. Con `LANG_LENGTH_OVERRIDE = 450-550` su **tutte le 11** → 607-995 parole, **30-50s**. Il cap 60s non ha backfill del testo: un timeout perde l'articolo. **Misura i secondi, non fidarti del word target.**
- **⚠️ Deriva intermittente di v4-pro** su FAQ e numeri-età: risolta rendendo la FAQ **regola #9 non negoziabile** e aggiungendo esempi di età **nella scrittura nativa** (「生後6ヶ月未満」「3歳から」، «أقل من 6 أشهر») — il modello non riconosceva il pattern da esempi latini.
- **🚨 CONCORRENZA — misura, non copiare** (Tail dice pool 3; su LittleSynergy è SBAGLIATO):
  | | kill | wall | effetto su Hobby (orchestratore 60s) |
  |---|:--:|:--:|---|
  | parallelo 11 | 0 | **54s** | ✅ tutte le 11 partono |
  | pool 3 | 0 | **150s** | ❌ l'orchestratore muore: solo ~4 lingue |
  Ogni `/api/generate-article` è una funzione a sé (60s suoi) → il **parallelo è corretto**. `PUBLISH_CONCURRENCY` è la valvola (abbassare solo se il provider inizia a killare).
- **`/api/cron/catchup-publish`** (gated CRON_SECRET, idempotente, **1 lingua per chiamata**): pubblica solo i brand attivi senza articolo oggi. Chiamalo in loop da un pinger finché `remaining=0`. Immagini → `backfill-images`.
- **RETI post-processing** (ordine in `generate-article`): `sanitizeProductUrls` → `stripEmDashes` → `dedupeProductLinks` (salta world-link) → **`stripWarningContextLinks`** (sentence-scoped: nelle frasi con parole-pericolo nessun prodotto resta linkato; **On Guard nel kit di un pillar resta linkato** perché lì non c'è avvertenza) → `ensureDoterraBridge` (floor ≥2, **esteso ai world-link** con anchor nativi gentili → gateway) → **`ensureAffiliateId`** (rete finale OwnerID/EnrollerID).
- **`nativizeAnchors` NON serve**: misurato 0 regressioni reali su 246 anchor (i "Vetiver/Ylang Ylang/Bergamot" sono nomi nativi). Non portarlo.
- **GATE:** `node scripts/gate-deepseek.mjs gate` (sequenziale, 11 lingue, cancella i draft) e `... conc <N>` (misura concorrenza). Verde = 0 kill, 0 ≥58s, OwnerID 100%, 0 link su oli/blend forti, 0 anchor inglesi, 0 numeri-età, 0 em-dash, FAQ presente, floor ≥2. **Eseguirlo ×2**: v4-pro ha varianza.

### 2.14 — GENERATORE IMMAGINI topic-varied + alt-text (v1.6)
**Bug (era il 100% duplicati):** `buildImagePrompt` faceva **early-return sullo style del brand**, che NON ha i `{placeholder}` che il ramo si aspettava → i `.replace()` erano no-op → **tutte le immagini nascevano dallo stesso prompt di 113 char** (misurato 1/5 distinti; stesso bug del Main con 190 immagini identiche). L'`image_style` di tutti gli 11 brand è identico e senza placeholder (lo setta `create-brand`).
- **Nuovo `buildImagePrompt(kw, brandLock, cfg, content?, lang?, slug?)`** in `lib/image-prompt.ts`: la scena si sceglie per **topic-bucket + `hash(slug)` deterministico**, indipendente dallo style (usato solo come prefisso, ripulito dei placeholder). Hero bottle = **1° prodotto linkato** dal corpo (content-aware, nome canonico EN via `PRODUCT_NAME_MAP`). Model-agnostic.
- **`translateKeywordToEnglish` via `llmText`** (DeepSeek flash) con **retry a 2 prompt + validazione `latinRatio>0.8`** (ja/ar → topic-EN latino nel prompt immagine).
- **`AVOID_UNIVERSAL`** (no text/parole/cartoon/3D) + **`NICHE.avoid` CHILD-SAFETY** (mai neonato vicino agli oli, mai flacone/gocce in mano, diffusore alto e fuori portata, no cap bianco/oro/argento). **`buildImageAlt`** = alt-text nativo dal titolo (125 char).
- **`NICHE` bambini:** 7 topic-bucket (sleep/calm/skin/immunity/focus/buy_guide/default), 2 scene ciascuno.
- **3 call-site** (`daily-publish`, `generate-image`, `backfill-images`) passano `NICHE` + `slug` (aggiunto `slug` ai select di generate-image e backfill). **ALT-TEXT** nei 2 endpoint pubblici (`featured_image_alt` dal titolo).
- Il **cervello BAMBINI (testo)** resta INTATTO: questa patch è SOLO immagini.
- **Gate:** offline `buildImagePrompt` su 5 topic diversi → 5 prompt DISTINTI (era 1/5), 0 testo spurio, `CHILD-SAFETY`+`OUT OF REACH`+`NO text` ovunque. E2E live: prompt distinti + traduzione ja + alt-text API 11/11.
- ⚠️ **I 52 published hanno ancora l'immagine vecchia** (prompt identico): il fix vale sui NUOVI. Per rigenerare i vecchi → loop su `backfill` dopo aver messo `featured_image=NULL` (decisione + costo fal, non fatto in automatico).

## §3 — BLOCCHI EREDITATI DA SOLOSEO (universali, tutte le lingue)

Tutti in `universalDoterraRules` (sempre attivo):
- **INCOME CLAIMS — ZERO TOLERANCE** (rischio legale #1, FTC/DSA): mai cifre di guadagno/reddito/«earning potential»/ROI/guadagno-per-rank, né numero né range né «up to X», in nessuna valuta; mai tabella rank×reddito (i rank sono milestone di VOLUME PV/OV); se il contesto è inevitabile, dire che la maggioranza nel direct-selling guadagna poco/nulla e doTERRA non garantisce reddito.
- **CPTG = Certified Pure Tested Grade** (MAI «Therapeutic Grade»/«terapeutico»): standard proprietario doTERRA di purezza e test, attribuito a doTERRA, non efficacia medica.
- **PREZZI:** mai cifre in valuta (€, $, £, MXN…) per prodotti/kit/quota. Solo «prezzo membro», «25% di sconto sul prezzo al pubblico», «piccola quota annuale gratis sopra 150 PV».
- **REGOLA 25% = sconto** sul catalogo (membro vs pubblico), MAI «a vita/forever/permanente/para siempre».
- **MECCANISMO ACQUISTO LIBERO:** registrazione gratis (~5 min, email + qualsiasi prodotto nel carrello), nessun kit obbligatorio; membership = piccola quota annuale gratis sopra 150 PV; kit = opzione consigliata, MAI obbligo.
- **NOMI PRODOTTO NATIVI:** anche se la keyword è in inglese, nel titolo/corpo usa il nome nativo (ES: Lavanda, Incienso, Manzanilla Romana…). Eccezioni inglesi: «Tea Tree» + blend (On Guard, Deep Blue, Serenity, Balance).
- **STILE:** mai em/en-dash (—, –), spaziato « — » O attaccato «word—word» (vedi §2.9, c'è anche il post-processore `stripEmDashes`). Titoli: **MAI due punti «X: Y»** (tell da AI, il modello lo ignora ~13.5%) → **PATCH G deterministica** `stripTitleColon` su title + ramo H1 di `stripEmDashes`: `:` → «, » · `：` ideografico JA → «、» (comma ideografica, NON latina) · pulizia virgola in coda; corpo e meta intatti. Retro: `scripts/retro-strip-title-colon.mjs`. Apertura = gancio variato, non fotocopia (§2.9).

---

## §4 — TOV MAMMA-A-MAMMA + LUNGHEZZA (cron-safe)

- **Voce portante** (`brand_dna_brand_voice` EN+ES, nel DB): prima persona vissuta («quando ho iniziato anch'io», «ricordo che ero confusa da»), empatia sul punto di partenza della lettrice («se sei qui, probabilmente ti stai chiedendo»), come un'amica davanti a un caffè, mai markettaro. Calore = voce PORTANTE, non decorazione. + le regole compliance restano.
- **`purchaseTone`** (in `buildUserPrompt`, attivato da keyword acquisto «how to buy/cómo comprar»): il pillar acquisto è il pezzo più caldo e personale del sito.
- **LUNGHEZZA (critico per il cron 60s):** GEO rule #8 = CONCISENESS («caldo ≠ prolisso, le mamme leggono di fretta»), `LENGTH_CONFIG.medium = '700-850'`, cap esplicito nel prompt. Il modello tende comunque a ~1050-1150 (ES verboso). Vedi §7 per l'operating point.

---

## §5 — FOOTER MULTI-MERCATO (URL verbatim pronti)

Pattern (come essentialsynergybr): **1 shop del mercato primario + lista GATEWAY per-paese nella stessa lingua** + pillar link + WhatsApp + disclaimer bambini + «LittleSynergy Team» (mai nomi reali). Gateway = `https://office.doterra.com/Application/index.cfm?Country=XXX&EnrollerID=YYY`.

✅ **EnrollerID split (CONFERMATO — decisione consapevole del proprietario):** Spagna shop + gateway ESP + anglofoni (US/CA/UK) + world-link = **Davidino 15958005**. Gateway **LatAm (MEX/COL/CHL/BRA/ECU/CRI/GTM/SLV) = Alessandro 15957920**. **Nota: il footer ES LatAm usa i token di Alessandro (non Davidino) — scelta voluta** (Davidino non è attivo in quei market LatAm; i token LatAm sono di Alessandro). ⚠️ **doterra.com in ritiro per Europa/UK verso doterra.eu** — ricontrollare periodicamente gli URL `shop.doterra.com/GB` e `/ES`.

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
| WhatsApp | +39 348 6601210 (Davidino) |
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
| WhatsApp | +39 348 6601210 (Davidino) |
| Disclaimer | `*Estas afirmaciones no han sido evaluadas por las autoridades reguladoras. Este contenido es educativo y no constituye consejo médico. Los aceites esenciales no están destinados a diagnosticar, tratar, curar ni prevenir ninguna enfermedad. Consulta siempre con tu pediatra antes de usar aceites esenciales en niños, durante el embarazo o la lactancia. Mantén los aceites esenciales fuera del alcance de los niños. Los resultados individuales pueden variar.*` |

⚠️ **Formato query gateway:** preservare verbatim il prefisso di essentialsynergybr (alcuni gateway doTERRA usano `?&Country=` da NON normalizzare). Il ground-truth assoluto dei codici è il footer essentialsynergybr: in caso di dubbio, copia da lì e cambia solo l'EnrollerID.

### 5.3 — Link prodotto nel CORPO (diverso dal footer)
Il corpo usa i product link del `link_expert` — **importati dal main** (essentialsynergybr) via `scripts/import-link-expert-from-main.mjs` da `link-expert-export-main.json`: **172 prodotti → 140 righe EN + 106 ES** (OwnerID swap 15957920→**15958005**, matching per-lingua intrinseco `url_en`→EN/`url_es`→ES, 0 mix). EN Pattern-2 `www.doterra.com/US/en/p/[slug]/?OwnerID=15958005`, ES Pattern-1 `shop.doterra.com/ES/es_ES/shop/[slug]/?OwnerID=15958005`. `sanitizeProductUrls` mantiene solo gli slug verificati, gli altri → fallback shop. Il footer multi-paese è un chooser separato; il corpo EN linka US, il corpo ES linka España. Re-import/allineamento: rilancia l'importer (replace delete+insert).

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

### §7.1 — KEYWORD-GUARD NICCHIA BAMBINI (3 livelli) — v1.2
Fix del drift (il cron generava keyword generiche adulti, es. "essential oils for sleep" invece di "…for kids"). Tre livelli:
- **L1** `editorial_themes` (`scripts/lib/editorial-themes-by-language.js`): tutte le keyword con modificatore esplicito (kids/baby/toddler/mom/pregnancy) + gravidanza. Fallback curato.
- **L2** `lib/keyword-scorer.ts`: `NICHE_CONTEXT` en+es riscritto bambini/mamme/gravidanza + istruzione "CRITICAL NICHE RULE" nel prompt + filtro output `hasNicheModifier`.
- **L3** `hasNicheModifier(kw, lang)` (whitelist EN: kids/baby/toddler/child/infant/newborn/pregnancy/mom/mother… · ES: niño/bebé/embarazo/lactancia/mamá/pequeños/infantil): guardia in `scoredKeywords` E in `daily-publish` `isAllowed` → scarta ogni keyword senza modificatore. Se scarta tutto → fallback `editorial_themes`.
- Test: 11/11 keyword generate = tutte nicchia. Le lingue senza whitelist passano (`return true`).

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
- **OwnerID/EnrollerID:** Davidino `15958005` (ES-Spain + anglo US/CA/UK + world-link) · Alessandro `15957920` (LatAm gateway, scelta voluta) · **WhatsApp footer** `+39 348 6601210`
- **Pillar:** EN `how-to-buy-doterra` · ES `como-comprar-doterra-paso-a-paso-espana`
- **API:** `https://littlesynergy.vercel.app` · **Dominio:** `https://littlesynergy.com`
- **Supabase:** ref `qyldowriqfsktdbqhvii` · **Vercel:** `prj_3IbX81HDxIpzfYtncuZJ7reqX0T2` / team `team_I0m9FkIxACPUsbGs06DkR0Dn`
- **GitHub:** `alessandrobrozzi1-ux/LITTLESYNERGY`
- **Cron:** keywords `0 6 * * *` · publish `0 7 * * *` UTC · backfill pinger `*/3 7 * * *` (cron-job.org)
- **doTERRA host:** US/CA = `www.doterra.com/{US|CA}/en/shop` · UK/ES = `shop.doterra.com/{GB/en_GB|ES/es_ES}/shop`
- **Env (in .env.local/Vercel, MAI in git):** NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, CRON_SECRET
