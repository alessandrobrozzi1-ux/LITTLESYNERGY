---
name: soloseodoterra
description: DUAL MODE skill v3.15 — Launch nuova lingua (A) o Audit lingua esistente (B) o entrambi (C). Sistema SoloSEO doTERRA multi-language blog su essentialsynergybr.com. Battle-tested 11 brand LIVE: EN+ES+DE+FR+PT+RO+IT+NL+PL (pattern prodotto) + JP+AR (world-link), giugno 2026. Income claims ZERO-TOLERANCE (FTC/DSA, system-prompt block); scan+fix per-draft obbligatorio (healthcheck-quality.cjs, 11×5). Image v3.2 (lifestyle + doTERRA-branded clause) + WebP storage v3.8 + GEO/E-E-A-T prompt + Internal Linking v2.1 (pgvector) + Pinterest auto-pin v3.4 (EN+ES, vertical 1024x1536) + Lovable footer standard package (pillar link obbligatorio) + table CSS fix + world-link markets/薬機法 (JP) + Gulf compliance + RTL (AR). Da 23 giugno 2026 sito 100% SoloSEO, no Soro fallback. Use trigger words: soloseodoterra, lancia lingua, clona blog, nuovo brand doterra, launch language, audit lang, controlla lang, stato lang, check tutto, soloseodoterra status.
triggers:
  - "soloseodoterra"
  - "soloseodoterra status"
  - "check tutto"
  - "clona blog"
  - "nuova lingua"
  - "lancia lingua"
  - "lancia [language]"
  - "nuovo brand doterra"
  - "launch language"
  - "global expansion next"
  - "audit [language]"
  - "controlla [language]"
  - "stato [language]"
---

# SoloSEO — DUAL MODE v3.15 (Launch + Audit)

> **v3.15 (30 giugno 2026): 🌙 PRIMA NOTTE CRON 11 BRAND — fix sistemico immagini + slug non-latino.** Prima notte a 11 brand: 11 articoli generati, 7 con foto, **4 con `featured_image=null`** (nl/pt/ar/pl). Diagnosi: il cron `daily-publish` **muore a 60s su Hobby** (11 catene parallele ~100-130s in una funzione con `maxDuration=300` clampato; prova = `cron_runs` vuoto). Fix one-off: 4 immagini rigenerate via `generate-image`. Fix sistemico: nuovo endpoint **`backfill-images`** (gated CRON_SECRET, idempotente `featured_image IS NULL`, ~1 img/call sotto il cap, self-healing) pingato da **cron-job.org** `*/3 8 * * *` (Hobby cron = max 2 + solo giornalieri → pinger esterno obbligatorio). Testato live (gating 401 ✅, `{done:1}` su null forzato ✅). + Fix slug: AR aveva slug inglese (`best-essential-oils-...-arabic`) perché l'LLM traduce i titoli non-latini → istruzione prompt ora **traslittera** (`afdal-zuyut-...`); slug AR esistente forzato. Backfill **da configurare su cron-job.org (lato utente)**. Vedi sezioni LESSON SISTEMICA cron 60s + LESSON SLUG NON-LATINO.

> **v3.14 (giugno 2026): 🇵🇱 POLISH LAUNCH — 11° brand, IMPERO COMPLETO 11/11.** PL `22be89f9-8297-45eb-8a56-e4c0329d79f2`, **active**, pattern PRODOTTO (Link Expert 150 `shop.doterra.com/PL/pl_PL/...?OwnerID=15957920`), pillar `jak-kupic-doterra`. Lanciato insieme a **NL** `15e4e632-bfb1-4160-8c02-8ce9956e3087` (pillar `hoe-doterra-kopen`). **11 brand attivi**: en/es/de/fr/pt/ro/ja/ar/it/nl/pl, cron a 11. Nomi nativi PL verificati da nativo (Kadzidłowiec=Frankincense, Lawenda, Mięta Pieprzowa, Cytryna, Rumianek Rzymski; blend commerciali On Guard/Serenity/Balance/Citrus Bliss invariati). **LEZIONE confermata:** anche col system-prompt blindato un prezzo può sfuggire (draft test PL: «20-40 zł»; pillar: «1 PV ≈ 1 euro») → **scan+fix per-draft resta OBBLIGATORIO prima di pubblicare**, specie sui pillar. Healthcheck finale 11/11 × 5 = 0 residui reali. PL/NL nati puliti (income/prezzi/a-vita/CPTG bloccati dal system-prompt v3.13), confermati con scan.

> **v3.13 (giugno 2026): 🧹 CLEANUP CONTENUTI SISTEMICO 11 BRAND + INCOME ZERO-TOLERANCE.** Fix retroattivo su tutti gli articoli pre-blocchi: CPTG (no «therapeutic»), 25% (no «a vita/permanent/permanente»), **cifre in valuta = 0 ovunque** (€/$/£/zł/EUR/円/درهم + parole «euros/dollars»), em-dash → virgola, e **income claims rimossi** (la tabella rank×$/month dell'EN work-from-home era il caso peggiore, FTC/DSA). Nuovo **blocco system-prompt income ZERO-TOLERANCE** (universale, `universalDoterraRules`, deployato) + nuova sezione skill «INCOME CLAIMS». Tool nuovo: **`scripts/healthcheck-quality.cjs`** (11 brand × 5 problemi). Tabelle PT/RO/EN riscritte (colonna prezzi/income → relativo/milestone). Lezioni eterne: income=rischio legale max; un check che CRASHA ≠ articolo pulito; `.limit(1)` su slug duplicato draft+published colpisce la riga sbagliata. **Healthcheck finale: 0 residui reali su 11×5** (restano solo falsi positivi noti: «Lifelong Vitality Pack», negazioni «non serve kit», «aromathérapeutique», «دائمًا»). Vedi sezione INCOME CLAIMS.

> **v3.11 (29 giugno 2026): 🇦🇪 ARABIC/UAE LAUNCH (8° brand, world-link RTL).** AR `afc6299a-fe74-4162-b0fd-6ccceb55b8e7`, active. **world-link only** come JP (`getWorldLinkUrl('ar')`→gateway ARE), + **layer RTL** (Lovable) + **compliance Gulf** ar-only. Gateway ARE VERBATIM (con `?&`): `office.doterra.com/Application/index.cfm?&Country=ARE&EnrollerID=15957920` — NON normalizzare il `?&`. **`ar`=path `/ar`** (ISO=path, nessun override a differenza di ja→jp). **Compliance Gulf** (GCC/GSO; UAE Advertising Council fa causa per claim non comprovati): blocco system-prompt ar-only che vieta claim medici/terapeutici + linguaggio garanzia/miracolo (مضمون/100٪/شفاء/يعالج). 2 BUG STORICI catturati: (1) `vercel --prod` PRIMA del 1° draft; (2) pillar acquisto tenta garanzia commerciale → scan extra (vedi sezione WORLD-LINK). RTL verificato live (tabella RTL header-a-destra, footer package v3.10 completo, 25٪/doTERRA non rovesciati). Pillar `kayfiyat-shira-doterra`. Commit `361c541`. **8 brand attivi** (en/es/de/fr/pt/ro/ja/ar), cron a 8.
>
> **v3.10 (29 giugno 2026): 📌 FOOTER STANDARD PACKAGE (eterna) + lezioni.** Ogni MandatoryFooter di OGNI lingua DEVE includere: CTA monetizzazione (shop+gateway per market normale / SOLO gateway per world-link), **link costante al pillar article** (internal nav client-side, SEO cornerstone), WhatsApp, affiliate disclosure+copyright, no nomi reali (v3.6). 🐛 BUG STORICO JP (29/6): footer JP nato SENZA pillar link (il prompt Lovable lo omise) → fix retroattivo + pillar link ora OBBLIGATORIO nel footer package di ogni lancio. Aggiunte lezioni eterne: MONETIZATION VERIFICATION (`shop.doterra.com` dà stub/404 → usare `www.doterra.com`; Owner ID accettato ≠ monetizzabile, verificare nel back office), GA4 (`window.gtag` wrapper obbligatorio + consent gate collegato all'init), SECURITY (token/secret rotation). Vedi sezioni FOOTER STANDARD PACKAGE / WORLD-LINK MARKETS / MONETIZATION / GA4 / SECURITY.
>
> **v3.9 (29 giugno 2026): 🇯🇵 JAPANESE LAUNCH (7° brand, world-link).** JP `398fafd9-4a2b-4642-82c9-73add6fbc134`, active. **`language_code='ja'` (ISO 639-1, NON `jp`) ma path pubblico `/jp`** → `LANG_PATH_OVERRIDE={ja:'jp'}` nel builder internal-link di `generate-article` (dati/API = `/api/public/articles/ja`, path = `/jp/blog/$slug`); gli altri 6 brand byte-identici. **PATTERN WORLD-LINK MARKETS:** market dove i product link non monetizzano col nostro OwnerID (slug fragili: JP/Gulf) → `doterra-markets.js` entry `productPattern:null` + `worldLink`; `lib/world-link-markets.ts` `getWorldLinkUrl(lang)`; in `generate-article` fallbackUrl del prompt = gateway + `sanitizeProductUrls` redirige OGNI link shop/www.doterra → gateway. **TUTTI i link (corpo + footer) → gateway worldwide** (JP: `office.doterra.com/Application/index.cfm?Country=JPN&EnrollerID=15957920`). Zero impatto market normali (`getWorldLinkUrl→undefined`). **薬機法 compliance ja-only:** blocco system-prompt che vieta claim neuro/fisiologici (神経/副交感/ホルモン/血圧/免疫/脳/科学的研究…) e resta su esperienziale/tradizionale. Cron eredita tutto (stesso `/api/generate-article`). Pillar `doterra-hajimekata-guide`. Commit `34ae7e9`. Verifica auto: `scripts/verify-jp-cron.mjs`. Vedi sezione WORLD-LINK MARKETS + 薬機法.
>
> **v3.8 (26 giugno 2026): 📦 STORAGE OPTIMIZATION — WebP + cleanup orfani.** Cleanup: 36 immagini orfane cancellate (75.7 MB liberati, backup CSV `cleanup-log-2026-06-26.csv` commit `34949ae`); bucket 102→66 oggetti (1:1 con referenced), usage 209→133 MB. WebP: gpt-image-2 PNG → WebP q85 (`sharp`) in **generate-image + cron daily-publish** (blocco upload, fallback PNG try-catch, schedule/keyword/publish intatti). Test live: 2.36 MB PNG → 132 KB WebP = **~15-18× riduzione**, qualità indistinguibile. Runway Free 1GB da ~3 mesi → ~2-3 anni. Vedi sezione STORAGE OPTIMIZATION.
>
> **v3.7 (26 giugno 2026): 📐 TABLE RENDERING FIX + RO LIVE (6 lingue attive).** RO `active=true`, cron 09:47 IT ora include 6 brand (en/es/de/fr/pt/ro), commit `7eeb7e9`. Bug "tabelle malformate" su tutte le lingue diagnosticato: il markdown nel DB è **GFM perfetto** (pipe + separator row `|---|` presente su EN/ES/DE/RO verificato), il problema era **CSS frontend Lovable** mancante. Fix: prompt Lovable (table border-collapse, padding, zebra rows, overflow-x mobile) → retroattivo su esistenti + futuri, nessuna rigenerazione. Vedi sezione TABLE RENDERING.
>
> **v3.6 (26 giugno 2026): 🇷🇴 RO LAUNCH (6° lingua) + LOVABLE FOOTER/AUTHOR RULE.** Brand RO creato (`97933a00-3604-464a-92d6-e6ea8175cbc1`, active=false), `doterra-markets.js` RO verified (slug `lavender-oil` → "Levănțică", Pattern 1), DNA rumeno nativo + 5 temi RO, image maps RO (PRODUCT_NAME_MAP +29, BOTANICAL_MAP +17, MULTI_PRODUCT_SCENES +5; skip duplicati `energie`/`vetiver`/`oregano`/`copaiba`/`bergamota`/`ylang-ylang`), AUTHOR_LINES `ro`. **2 best practice nuove:** (A) **LOVABLE FOOTER/AUTHOR RULE** — MAI nomi personali reali in footer/author/about; usare SEMPRE "Essential Synergy Team" localizzato (Equipo/Team/Équipe/Equipe/**Echipa**). Root cause: competitor surveillance + privacy + brand neutrality. (B) **RO FOOTER LOCALIZATION** — author RO: `Echipa Essential Synergy — Wellness Advocates și entuziaști doTERRA`; plurale "noi", mai "eu". Vedi sezione LOVABLE FOOTER / AUTHOR RULE.
>
> **v3.4 (26 giugno 2026 — sera): 📌 PINTEREST PIN VERTICALI.** Pin format VERTICAL 1024×1536 (Pinterest optimal) generato custom via gpt-image-2 + `brand_dna_image_style` v3.2 doTERRA-branded. Salvato in `articles.pinterest_image` (ADDITIVO — non sostituisce `featured_image` orizzontale del blog). `generate-image` ora accetta `size` (default `1792x1024`) + `target` (`featured_image`|`pinterest_image`), retrocompatibile col cron normale. `lib/pinterest.ts` → `generatePinImage` (reuse se esiste, genera se NULL). `daily-pin` esegue in PARALLELO (image gen offloadata a generate-image separato → resta sotto 60s cap). Costo aggiornato: ~$15/anno (image $12 + Claude text $3).
>
> **v3.3 (26 giugno 2026 — sera): 📌 PINTEREST AUTO-PIN integration (EN+ES).** Layer isolato, Pinterest API v5. `lib/pinterest.ts` (generatePinContent via Claude + createPinterestPin + pinArticle orchestrator), `app/api/pinterest/create-pin` (POST, CRON_SECRET), `app/api/cron/daily-pin` (2 EN + 1 ES/giorno, ultimi 30gg non pinnati), `app/api/pinterest/callback` (OAuth Standard Access). Tabelle `pinterest_pins` + `pinterest_boards`. Token via `process.env.PINTEREST_ACCESS_TOKEN` (mai hardcoded). Trial mode: pin `pinned_trial` (visibili solo owner) finché Pinterest approva Standard Access → swap token env. ⚠️ Vercel Hobby max 2 cron (già usati) → daily-pin va triggerato da scheduler esterno (cron-job.org/GitHub Actions) o Vercel Pro. Vedi sezione PINTEREST AUTO-PIN.
>
> **v3.2 (26 giugno 2026 — sera): 🔒 IMAGE BRAND IDENTITY LOCKED FINAL.** Root cause finale: il gold standard v3.0/3.1 NON nominava "doTERRA" nel prompt → gpt-image-2 testa-o-croce sul brand (EN/ES/PT fortunati con bottiglie doTERRA, DE/FR generiche "100% PURE ESSENTIAL OIL"). Prova: 5 articoli identico image_style + stesso topic → 3/5 doTERRA, 2/5 anonime. Fix: clausola brand esplicita nel `brand_dna_image_style` (314 chars): `doTERRA-branded essential oil bottles (amber glass, black cap, minimal white label clearly reading "doTERRA" above the oil name)`. UPDATE 5 brand + `create-brand.js` v3 `DEFAULT_IMAGE_STYLE`. Risultato: 5/5 bottiglie doTERRA-marchiate, stile lifestyle mantenuto. Inoltre: GEO/E-E-A-T prompt in generate-article (direct-answer intro, FAQ 4-6, tabella, author line localizzata, no income/medical claims) + `generate-image` fallback a `brand_dna_image_style` dal DB. Scoperto cap Vercel Hobby 60s (vedi OPERATIONAL CONSTRAINTS). 5 articoli "work from home" pubblicati (1/lingua).
>
> **v3.0 (26 giugno 2026): 🎨 IMAGE GENERATION ARCHITECTURE LOCKED. Root cause definitivo immagini brutte: `brand_dna_image_style = NULL` su DE/FR/PT → fallback `DEFAULT_STYLE` hardcoded → bottiglie 3D inventate con "Lavandula angustifolia 15 mL". Fix: UPDATE 4 brand (ES/DE/FR/PT) con gold standard lifestyle prompt (193 chars). `create-brand.js` v3: auto-imposta `DEFAULT_IMAGE_STYLE` per future lingue. Task A: keyword tradotta in inglese prima di buildImagePrompt (ES/DE/FR/PT). Visual test: FR 10/10, DE 9/10, ES/PT 8/10 vs EN reference gold standard. Cron 27/6 onward: tutti i brand fotorealistici. Contatori post-cleanup: EN 8, ES 22, DE 4, FR 3, PT 1 published (38 totali).**
>
> **Da 23 giugno 2026: sito 100% SoloSEO. Nessun Soro fallback. Tutte le lingue attive sono gestite esclusivamente da SoloSEO + Lovable.**
> **v1.5 (23 giugno 2026):** fix pre-launch DE — `create-brand.js` v2 con `active=false`, DNA localizzato, themes con keywords in lingua target, `lib/doterra-markets.js` per URL pattern per mercato.
> **v1.6 (24 giugno 2026):** fix falsi allarmi audit — A3 skip mandatory_footer se footer Lovable-side (root brand), B4 filtra solo articoli post-23/6/2026, C1/D2/D3 URL derivato da `brand.domain` (root vs subdirectory), C2 endpoint corretto `/api/public/notify-search-engines`, B2/B3 contesto brand <14gg, A5 aggiunge keyword pool count.
> **v1.7 (24 giugno 2026):** content-aware image system documentato e locked. DE PRODUCT_NAME_MAP + BOTANICAL_MAP estesi. Step 1.1f aggiunto (map extension pre-launch). Check C4 audit aggiunto (image coherence). Troubleshooting immagine prodotto random aggiunto.
> **v1.8 (24 giugno 2026):** DE launch completato. Bug @supabase/ssr root-cause identificato e fixato: `createAdminClient()` usa `@supabase/supabase-js` plain (non SSR). Kit URL pattern per market documentato (EU `enrolment-kits` single-L, US `enrollment-kits`). Article regeneration workflow via API documentato.
> **v1.9 (24 giugno 2026):** **Next.js 14 Data Cache bug** identificato e fixato definitivamente. `createAdminClient()` ora passa `global.fetch cache: 'no-store'` — bypassa il Data Cache interno di Next.js che cachava le chiamate Supabase anche con `force-dynamic`. Modifiche dashboard ora visibili live real-time senza deploy. Kit body-check workflow aggiornato (HEAD status 200 ≠ page working — verificare body per "Page Not Found"). `/api/public/article/[slug]` aggiunto `force-dynamic` + `no-store`.
> **v2.8 (26 giugno 2026):** 🚨 CRITICAL — generate-article ignorava `status` dal request body. API leggeva `draft` (boolean), NON `status: 'draft'` (string). Fix: ora accetta entrambi — `draft: true` e `status: 'draft'`. Deploy prod. LESSON LEARNED: 13 articoli duplicati pubblicati sui 4 brand attivi durante test diagnostici (script inviavano `{status:'draft'}` ignorato → articoli sempre published). Rimossi con UPDATE status='draft'. Regola: SEMPRE usare `draft: true` nei test, VERIFICARE status in DB post-insert. PREFERIRE test su brand con `active=false`. PROCEDURA TEST SICURA: `{ draft: true }` nel body → verificare `SELECT status FROM articles WHERE id='...'` → atteso 'draft'. Se 'published' → STOP. Articoli test sempre rimossi con `UPDATE SET status='draft'` (mai DELETE). Contatori post-cleanup: EN 10, ES 24, DE 8, FR 5, PT 3 published (50 totali).
> **v2.7 (26 giugno 2026):** BUG 1 DEFINITIVO fixato. Colonna DB è `content_markdown` (mai `content` — colonna inesistente). `generate-image/route.ts` ora seleziona correttamente `content_markdown`. Il "fix" del 25 giugno (content_markdown→content) era SBAGLIATO — verificato via `SELECT * FROM information_schema.columns WHERE table_name='articles'`. Re-fixato con verifica schema reale. LESSON LEARNED: SEMPRE verificare schema reale via query Supabase prima di assumere nomi colonne. Test post-fix confermato: `extractLinkedProducts` ora estrae prodotti reali dal content (PRIMARY SUBJECT: Peppermint + secondary: Lavender per articolo headache EN). Il pillar PT immagine collage era corretto per coincidenza: keyword `comprar` → MULTI_PRODUCT_SCENES → collage, NON perché extractLinkedProducts funzionasse (era rotto). Deploy `soloseo-ftfqdq0oo`.
> **v2.6 (26 giugno 2026):** PT launch. 3 blocker risolti: URL pattern verificato, PRODUCT_NAME_MAP 32 entries PT, BOTANICAL_MAP + MULTI_PRODUCT_SCENES PT completi. `create-brand.js` bug doppio `/essential-oils/` fixato con input sanitization. Brand PT UUID `8edf37b6` creato, affiliate_base_url corretto via SQL. PRODUCT_NAME_MAP lingue attive: EN/ES/DE/FR/PT ≥30 each.
> **v2.5 (25 giugno 2026):** Internal linking isolation verificata e confermata. `find_related_articles` RPC filtra per `target_brand_id` → EN articles link SOLO a EN, ES→ES, DE→DE, FR→FR. Test cross-brand: EN embedding con FR brand_id → 0 EN articles, solo articoli FR. Zero leak. Documentato in audit check C5.
> **v2.4 (25 giugno 2026):** Image System v1.4 locked. DEFAULT_STYLE: BLACK matte cap, no ribbons, minimal label, AVOID ABSOLUTELY block. COLLAGE_STYLE stessa brand accuracy. PRODUCT_NAME_MAP: EN 37, ES 31, FR 30, DE 32 entries (≥30 per lingua attiva). BOTANICAL_MAP + MULTI_PRODUCT_SCENES universali (EN/ES/FR/DE copertura completa topic sleep/energy/immune/stress/focus/buy). BUG FIX: generate-image ora fetch colonna `content` (non `content_markdown`). buildImagePrompt secondary injection anchor aggiornato a `\nAVOID ABSOLUTELY:`. Steps 1.1g-j aggiunti a LAUNCH checklist.
> **v2.3 (25 giugno 2026):** FR launch completato. CRITICAL RULE Lovable prompts aggiunta (lingua blindata, no cross-language merge). API troubleshooting: SoloSEO API = soloseo-alpha.vercel.app (NON essentialsynergybr.com = Lovable frontend). generate-image richiede keyword o title nel body (altrimenti toLowerCase crash). FR brand attivo, 175 Link Expert, pillar article `comment-acheter-doterra` pubblicato.
> **v2.2 (26 giugno 2026):** Skill aggiornata con Internal Linking System v2.1 documentato. Audit check C5 aggiunto (20 check totali). Step 1.1g aggiunto (URL pattern check per nuova lingua). LANGS_WITHOUT_BLOG set documentato. Threshold scaling guide (0.4 → 0.55 → 0.7 per corpus size).
> **v2.1 (26 giugno 2026):** **Internal Linking System** via vector embeddings. `article_embeddings` table (pgvector, 1536 dims) + `find_related_articles` RPC function in Supabase. `lib/embeddings.ts` (generateEmbedding, storeArticleEmbedding, findRelatedArticles). `generate-article` ora: (1) embeds keyword PRIMA di generare → (2) trova top-3 articoli semanticamente simili (threshold 0.4, `text-embedding-3-small`) → (3) passa "INTERNAL LINKS TO INCLUDE" hint a Claude → (4) Claude inserisce 2-3 link contestuali nel markdown → (5) dopo INSERT, store embedding del nuovo articolo async (fire-and-forget). Backfill 31 articoli esistenti eseguito ($0.000350 totale). Bug fix: threshold iniziale 0.7 troppo alto per corpus piccolo → abbassato a 0.4. Formato pgvector: INSERT usa `[${arr.join(',')}]` (stringa), RPC usa array JS raw. Costo annuale stimato: $0.04 a 3 brand, $0.11 a 10 brand.
> **v2.0 (26 giugno 2026):** **Primo cron autopilot validato (25/6/2026)** — EN+ES+DE pubblicati automatici. 4 fix post-launch applicati: (1) **Brand always visible** — `DEFAULT_STYLE` rafforzato: `amber glass, WHITE LABEL clearly showing "doTERRA" brand name (must be legible)` — bottiglia anonima non più possibile. (2) **Collage per topic generali** — `MULTI_PRODUCT_SCENES` + `COLLAGE_STYLE` in `lib/image-prompt.ts`: topic come schlaf/sleep/stress/immune/wellness → collage 3 bottiglie doTERRA, non singolo Lavender. Attivato SOLO se `linkedProducts.length === 0` (articoli specifici non impattati). (3) **Anti-lavender-dominance** — soglia Lavender ridotta 3→2 per 14 giorni in `isAllowed()`, Monday override ora rispetta `isAllowed()` (prima la bypassava). (4) **Keywords pool 15→6** per brand/giorno — riduce waste, rinnovo più veloce.

---

## 📦 STORAGE OPTIMIZATION v3.8 (26 giugno 2026)

**ARCHITETTURA STORAGE (confermata):** le immagini gpt-image-2 sono salvate in **Supabase Storage** bucket `article-images` (URL pubblici **permanenti**, NO URL temporanei OpenAI → articoli vecchi non si rompono mai). gpt-image-2 ritorna `b64_json` (base64), non URL.

**CLEANUP orfani (26/6):** 36 oggetti orfani cancellati (~75.7 MB liberati), backup CSV prima del delete. Orfano = oggetto bucket NON referenziato da `featured_image`/`pinterest_image` (accumulo da rigenerazioni — ogni `generate-image` crea un file nuovo `{id}-{ts}.{ext}`, non sovrascrive). Check trimestrale: `find-orphan-images.mjs` (read-only diff) → backup CSV → delete con guard anti-referenced.

**WEBP CONVERSION (v3.8):** gpt-image-2 PNG → **WebP quality 85** via `sharp`. Riduzione **~15-18×** (2.36 MB → ~135 KB), qualità indistinguibile. Applicato in DUE punti (entrambi uploadano immagini):
- `app/api/generate-image/route.ts` (chiamate manuali + Pinterest)
- `app/api/cron/daily-publish/route.ts` blocco upload (l'autopilot — **il vero driver di crescita storage**)

⚠️ **LESSON CRITICA:** il cron `daily-publish` ha un **upload immagine INLINE separato** (NON chiama `generate-image`). Fix che riguardano lo storage/formato immagine vanno applicati in ENTRAMBI i path, altrimenti il cron resta sul vecchio formato.

🚨 **LESSON PUBLISH MANUALE (PL launch v3.14):** `generate-article` **NON genera l'immagine** (è l'endpoint separato `generate-image`). Quando pubblichi un pillar/articolo generato fresh via API in manuale, dopo `generate-article` chiama **SEMPRE** `generate-image` (`POST {article_id, title, keyword}` → gpt-image-2 + `brand_dna_image_style` v3.2 → WebP → aggiorna `featured_image`), altrimenti `featured_image=null` e l'`og:image` resta vuoto sul frontend. Sul **cron è automatico** (upload inline). **Step obbligatorio nel LAUNCH manuale: genera immagine subito dopo publish del pillar, prima di `active=TRUE`.** Verifica: `featured_image` set + URL HTTP 200 + public API la espone. (Sul PL il passo era saltato → fixato a posteriori; gli altri 10 pillar erano ok.)

**PATTERN:** fallback PNG con `try/catch` su `sharp` (se la conversione fallisce → upload PNG, mai crash). Backward compatible: PNG vecchi + WebP nuovi convivono nel bucket. Runway Free 1GB esteso da ~3 mesi a ~2-3 anni.

🚨 **LESSON SISTEMICA — il cron `daily-publish` MUORE a 60s su Hobby (v3.15, 30 giugno).** Prima notte a 11 brand: 7 articoli con foto, **4 con `featured_image=null`** (contenuto completo). Causa-radice: `daily-publish` fa `Promise.allSettled` su TUTTI i brand **in parallelo**, ogni catena = `generate-article` (~60-80s) + immagine inline (~40s) = ~100-130s, in **una sola funzione** con `maxDuration=300` **ignorato/clampato a 60s su Hobby**. A 60s la funzione è uccisa: gli articoli si salvano (li inserisce `generate-article`, funzione separata) ma le immagini non finite restano null. **PROVA DEFINITIVA: `cron_runs` vuoto** (la insert finale è DOPO il `Promise.allSettled` → se non c'è la riga, la funzione è morta a metà). Quali ~4-5 falliscono **varia ogni notte** (corsa contro il cap, NON ordine: una di mezzo fallisce, l'ultima riesce). **Diagnosi: cron_runs vuoto + published_at a 3-6s l'uno dall'altro = parallelo killato dal cap.**

✅ **FIX (v3.15): backfill-images idempotente + pinger esterno (Hobby-native, gratis).** Nuovo endpoint `app/api/cron/backfill-images/route.ts` (gated `CRON_SECRET`, isolato/additivo, NON tocca daily-publish): query `status='published' AND featured_image IS NULL ORDER BY published_at ASC`, genera **~1 img/call** (guard a 50s sotto il cap) con 1 retry, logga `cron_runs`. **Idempotente + self-healing** (gli stragglers li riprende la call/giorno dopo). **Hobby cron = max 2, frequenza solo giornaliera** → NON si può schedulare nativo per pingare ogni 2-3 min → si usa **cron-job.org** (gratis): URL `.../api/cron/backfill-images`, schedule `*/3 8 * * *` (20 call 08:00-08:57 UTC, dopo il publish ~07:58), header `Authorization: Bearer <CRON_SECRET>`. Testato live: gating 401 senza auth ✅, `{done:1,remaining:0}` su null forzato ✅. (Vercel Pro $20/mese = cap 300s risolverebbe tutto in 1 run, ma su sandbox a ricavi-zero si resta Hobby+pinger.)

🏷️ **LESSON SLUG NON-LATINO (v3.15):** lo slug lo genera l'LLM in `generate-article` (campo `---SLUG---`), poi post-processing `[^a-z0-9-]→-` **distrugge l'arabo** → l'LLM per scampo **traduce in inglese** (es. articolo AR con slug `best-essential-oils-for-relaxation-arabic`). Fix: istruzione prompt slug = **TRASLITTERA/romanizza** i titoli non-latini, NON tradurre (es. `كيفية شراء دوتيرا` → `kayfiyat-shira-doterra`). Slug AR esistente forzato a romanizzato (`afdal-zuyut-atria-lil-istirkha`), 0 referenze interne, sitemap Lovable-side si auto-aggiorna dalla public API.

**REGOLE ETERNE:** image storage = SEMPRE Supabase Storage permanente. Formato = SEMPRE WebP q85 (post v3.8). Cleanup orfani = check trimestrale referenced vs bucket.

---

## 📐 TABLE RENDERING (v3.7, 26 giugno 2026)

**ROOT CAUSE bug "tabelle malformate" su 6 lingue:**
Il markdown nel DB è **GFM perfetto** (pipe + separator row `|---|`). Il frontend Lovable non aveva CSS table styling → il `<table>` veniva generato ma senza bordi/padding (sembrava colonne sparse).

**FIX:** prompt Lovable applicato — `table border-collapse`, padding celle, header background, alternating rows (zebra), `overflow-x: auto` per mobile. **Frontend only**, nessun deploy SoloSEO, nessuna rigenerazione articoli.

**LESSON ETERNA — quando l'utente segnala "tabelle malformate" su tutte le lingue:**
1. PRIMA estrai il markdown dal DB e verifica la struttura GFM (pipe header + separator row + righe).
2. Se il markdown è ok → il problema è **CSS frontend** (NON il modello). Indizio: nel render l'header bold appare e NON si vedono `|` o `**` letterali = tabella parsata ma non stilizzata.
3. Fix CSS **retroattivo** → risolve esistenti + futuri in un colpo.
4. **NO rigenerare articoli** (waste). NO toccare il system prompt (il modello già scrive GFM valido).

**PATTERN PER NUOVE LINGUE:** CSS table styling già universale post-fix 26 giugno. Nessuna azione lingua-specifica necessaria.

---

## 🔒 LOVABLE FOOTER / AUTHOR RULE (eterna — v3.6)

**REGOLA ETERNA:** MAI nomi personali reali in footer, author bio o pagine "about" Lovable.
USARE SEMPRE **"Essential Synergy Team"** localizzato come autore universale.

**Root cause (lesson 26 giugno):** competitor surveillance + privacy personale + neutralità del brand.

**Pattern per ogni nuova lingua** (footer/about/author = "Team" localizzato + plurale "noi"):
| Lingua | Author line |
|--------|-------------|
| EN | By Essential Synergy Team — Wellness Advocates & doTERRA enthusiasts |
| ES | Por el Equipo Essential Synergy — Wellness Advocates y entusiastas doTERRA |
| DE | Vom Essential Synergy Team — Wellness Advocates und doTERRA Enthusiasten |
| FR | Par l'Équipe Essential Synergy — Wellness Advocates et passionnés doTERRA |
| PT | Pela Equipe Essential Synergy — Wellness Advocates e entusiastas doTERRA |
| RO | Echipa Essential Synergy — Wellness Advocates și entuziaști doTERRA |

- Sincronizzato con `AUTHOR_LINES` in `generate-article/route.ts` (GEO author line) + footer Lovable.
- Voce sempre plurale "noi/we/wir/nous/nós/noi" — MAI prima persona singolare ("eu", "ich", "soy", "I").

---

## 📌 FOOTER STANDARD PACKAGE (v3.10 — eterna, ogni brand)

Ogni `MandatoryFooter` di OGNI lingua DEVE contenere, sempre:

1. **CTA principale monetizzazione:**
   - market normale (RO/PT/etc): link shop locale + worldwide gateway
   - market world-link (JP/etc): **SOLO** gateway worldwide
2. **Link COSTANTE al pillar article** della lingua (internal link, client-side nav, **NON `target=_blank`**). Es:
   - EN: "New here? How to buy doTERRA guide" → `/blog/[pillar-slug]`
   - JP: 「はじめての方へ：doTERRAの始め方完全ガイド」 → `/jp/blog/doterra-hajimekata-guide`
3. **WhatsApp contact**
4. **Affiliate disclosure + copyright**
5. **NO nomi personali reali** (Essential Synergy Team — regola v3.6, vedi sopra)

**RATIONALE pillar link:** SEO — segnala il cornerstone a Google e fa fluire autorità verso la pagina di conversione. Va incluso nel prompt Lovable **FIN DALL'INIZIO** di ogni nuova lingua.

**🐛 BUG STORICO (JP, 29 giugno 2026):** il footer JP fu generato senza il pillar link perché il prompt Lovable lo omise. Fix retroattivo applicato. Per evitare ricaduta: il pillar link è ora parte **OBBLIGATORIA** del footer package di ogni lancio.

**Pillar slug per lingua** (target del link #2 — verificare in DB: `status=published`, keyword business/buy):
| Lingua | Pillar slug |
|--------|-------------|
| FR | `comment-acheter-doterra` |
| RO | `cum-cumperi-doterra` |
| JP | `doterra-hajimekata-guide` |
| EN/ES/DE/PT | verificare in DB |

---

## 🌐 WORLD-LINK MARKETS + 薬機法 (v3.9 — JP launch, 29 giugno 2026)

**JP LAUNCH (7° brand):** `398fafd9-4a2b-4642-82c9-73add6fbc134`, active dal 29/6. Pillar `doterra-hajimekata-guide`.

**⚠️ `language_code='ja'` (ISO 639-1) ma path pubblico `/jp`** — primo brand con mismatch lingua≠path. Gestito da `LANG_PATH_OVERRIDE={ja:'jp'}` nel builder internal-link di `generate-article`: dati/API = `/api/public/articles/ja`, path pubblico = `/jp/blog/$slug`. Gli altri 6 brand restano byte-identici (override solo per `ja`). **Regola futura:** se data-key ≠ path-segment, override additivo nel builder, mai toccare gli altri.

**PATTERN WORLD-LINK MARKETS (eterno):** per mercati dove i product link NON monetizzano col nostro OwnerID (slug fragili, es. JP/Gulf):
- `scripts/lib/doterra-markets.js`: entry con `productPattern: null` + `worldLink: <gateway>`.
- `lib/world-link-markets.ts`: `WORLD_LINK_GATEWAYS[lang] = gateway` + `getWorldLinkUrl(lang)`.
- `generate-article`: se `getWorldLinkUrl(lang)` è definito → `fallbackUrl` del prompt = gateway, e `sanitizeProductUrls` redirige OGNI link `shop.`/`www.doterra.com` → gateway (anchor text naturale nella lingua, href = gateway).
- **TUTTI i link (corpo + footer) → gateway worldwide.** JP: `https://office.doterra.com/Application/index.cfm?Country=JPN&EnrollerID=15957920`.
- **Zero impatto market normali:** `getWorldLinkUrl` ritorna `undefined` → RO/PT/etc usano i product link reali, percorso INVARIATO.

**薬機法 COMPLIANCE (Giappone — eterna, ja-only):** la legge 薬機法 vieta claim medici/fisiologici per prodotti non farmaceutici. Blocco system-prompt **ja-only** in `buildSystemPrompt` (`if brand.language_code==='ja'`): VIETA riferimenti a meccanismi neuro/fisiologici/anatomici (神経/副交感/自律神経/ホルモン/セロトニン/メラトニン/血圧/血流/免疫/消化器/脳/科学的研究/臨床). Resta su framing **esperienziale/tradizionale** (「リラックスしたいときに」「多くの方が〜のために使っています」「伝統的に〜」「穏やかな香り」). Il framing positivo (su cosa restare) conta quanto i divieti.

**🐛 BUG STORICO (test draft JP, 29 giugno):** il primo draft lavanda conteneva «副交感神経系» (sistema nervoso parasimpatico) — claim 薬機法-rischioso. Causa: prompt non blindato per il Giappone. Fix: blocco ja-only sopra. **Lezione:** per mercati con regolamentazione severa, blindare il prompt PRIMA di attivare l'automatico (sennò il cron accumula articoli non-compliant su scala). Verifica automatica: `scripts/verify-jp-cron.mjs` (scan termini proibiti + link gateway + GEO + immagine).

**Cron + world-link/薬機法:** `daily-publish` chiama lo stesso `/api/generate-article` → eredita TUTTO automaticamente (gateway + 薬機法). Nessun prompt duplicato da mantenere.

**🐛 BUG STORICO (AR, 29 giugno) — DEPLOY PRIMA DEL DRAFT:** generato il primo draft AR contro prod PRIMA di fare `vercel --prod` dei diff backend → prod girava il codice VECCHIO: author line fallback EN (manca `AUTHOR_LINES.ar`), link al **negozio** AE invece del gateway (manca `getWorldLinkUrl('ar')`), e **blocco compliance Gulf NON attivo**. **REGOLA ETERNA:** gli endpoint girano il codice **DEPLOYATO**, non le edit locali → per ogni nuovo brand, `vercel --prod` DEVE precedere la generazione del primo draft. Sequenza corretta: Phase 0 diff → `tsc` → **`vercel --prod`** → Phase 1 `create-brand` → draft. Critico soprattutto per i world-link (senza deploy i link vanno al negozio + compliance off). Beccato sul primo draft (costo zero) dalla verifica.

**⚠️ PILLAR "acquisto/come comprare" + market con compliance pubblicitaria (Gulf):** il tema acquisto/iniziare tenta il modello a usare **linguaggio di garanzia commerciale** («مضمون»/«100٪»/«ضمان الجودة») ANCHE quando i claim medici sono 0 — è l'esatto wording che l'UAE Advertising Council contesta (success/garanzia "certa o assoluta"). **Controllo EXTRA sui pillar di questi market:** scansionare il linguaggio di garanzia (مضمون/100٪/ضمان) OLTRE ai claim medici. Lezione AR pillar (29/6): «فأنت مضمون بنسبة 100٪ أن المنتج أصلي» (garanzia di **autenticità**, non efficacia — distinzione corretta ma sul pillar va tolta comunque) → fix chirurgico → «تحصل على منتج doTERRA أصلي مباشرةً من المصدر الرسمي». Lo sconto «25٪» resta lecito (è un fatto, non una garanzia di risultato). La verifica becca i casi-limite: estendere lo scan compliance ai termini di garanzia per i market Gulf.

---

## 💰 MONETIZATION VERIFICATION (eterna — lezione 28-29 giugno)

**`shop.doterra.com` ≠ verifica affidabile:** per alcuni market (JP, Gulf) `shop.doterra.com/[path]` restituisce stub ~126 byte / 404 a curl (Miva server-render). Per verificare esistenza/struttura di un market usare **`www.doterra.com`** (Pattern 2, server-rendered, 404 reali, path `/[CC]/[locale]/p/[slug]` e liste `/pl/[category]`).

**🚨 Owner ID ACCETTATO ≠ MONETIZZABILE:** un enrollment link che accetta il tuo OwnerID/EnrollerID NON garantisce che il market generi commissione coi product link diretti. **Verificare nel back office doTERRA** (non solo che l'URL risponda). Per JP i product link non portavano il nostro OwnerID → scelto pattern world-link (tutto al gateway worldwide, che accetta `EnrollerID=15957920` nello state; enroller = Alessandro Brozzi). Gateway worldwide: `office.doterra.com/Application/index.cfm?Country=[XXX]&EnrollerID=15957920`.

**🐛 BOT-PROTECTION `shop.doterra.com` (lezione IT/Link Expert, 29 giugno):** sotto fetch concorrenti/ripetuti via `curl`, shop.doterra.com serve **pagine-sfida a size VARIABILE** (2.8-19KB, SENZA prezzo) — facilmente scambiate per slug rotti/404. ⚠️ Il 404 VERO è un stub da ~139b con "Page Not Found"; le pagine-sfida NON lo contengono → **falsi negativi**. Prova IT 29/6: stessa URL `family-essentials-kit` ha reso 39→14.5→2.8KB su 3 tentativi. **Metodo affidabile per il Link Expert:** (a) **CATALOGO EU CONDIVISO** — gli slug doTERRA sono identici tra i market EU (slug = nome prodotto in inglese, cambia solo il path locale), quindi un set validato una volta (es. RO 150) vale per TUTTI i market EU (IT/NL/PL/ES/RO/DE/FR/PT) → `seed-[lang]-links.mjs` riusa i 150 slug RO; (b) oppure **scrape via browser** (Chrome reale passa la bot-detection). **MAI `curl` batch/concorrente per validare slug.** 8 spot-check browser (oregano/lavender-touch/microplex-vmz/family-kit…) → catalogo IT=RO confermato.

---

## 🛒 MECCANISMO ACQUISTO doTERRA + REGOLA 25% (eterna — TUTTE le lingue)

**MECCANISMO D'ACQUISTO doTERRA (worldwide):** la registrazione è **LIBERA** — bastano email + dati e l'aggiunta al carrello di **QUALSIASI prodotto** (nessun kit obbligatorio, nessun vincolo, ~5 min). La membership (sconto 25% sul catalogo) ha una **piccola quota annuale, GRATUITA se l'ordine supera 150 PV** (spesso anche spedizione gratis). I **kit sono un'OPZIONE consigliata** (spesso >150 PV → quota gratis + buon valore), **MAI l'unico modo né un obbligo**.
- 🚫 MAI scrivere/implicare «devi comprare un kit per diventare membro».
- 🚫 MAI citare la **cifra esatta** della quota (cambia per mercato/promo) → usa il concetto «piccola quota annuale, gratis sopra 150 PV».
- Vale per i market a **pattern PRODOTTO** (EN/ES/DE/FR/PT/RO/IT/NL/PL). I **world-link (JP/AR)** monetizzano SOLO via gateway (registrazione worldwide), niente narrativa kit/membership locale.

**REGOLA 25% (tutte le lingue):** il 25% è uno **sconto sul catalogo doTERRA** (prezzo membro vs prezzo al pubblico), **MAI «a vita» / «forever» / «per sempre» / «voor het leven» / «na zawsze»**. Vale sugli acquisti da membro, non è una garanzia perpetua. (Il footer Lovable va corretto a parte se usa «a vita».)

**🐛 STORICO (29/6):** pillar IT/NL implicavano «kit obbligatorio» + quota fissa €25 + footer «25% a vita» → corretti: meccanismo di registrazione libero, quota generalizzata, 25% = sconto catalogo.

---

## 🏷️ CPTG — DEFINIZIONE CORRETTA (eterna — TUTTE le lingue)

**CPTG = Certified Pure TESTED Grade** (NON «Therapeutic Grade»!). doTERRA ha cambiato la dicitura ufficiale — «Therapeutic» non esiste più. È uno standard **PROPRIETARIO doTERRA** di **purezza e test**, NON di efficacia medica: doTERRA stessa dichiara che non esiste uno standard internazionale e che «terapeutico» è una parola usata liberamente anche su oli adulterati. Fonte: `doterra.com/US/en/the-cptg-standard`.

**REGOLA (tutte le lingue: EN/ES/DE/FR/PT/RO/JP/AR/IT/NL/PL):** descrivi CPTG come «standard di test e purezza di doTERRA», sempre **attribuito a doTERRA**, MAI come «Therapeutic Grade» / «grado terapeutico» / «qualità terapeutica» / «therapeutic quality». ⚠️ I blocchi compliance esistenti (薬機法 JP, Gulf AR) escludono i claim terapeutici, ma «terapeutico» riferito a CPTG può sfuggire come *nome-grado* → vietarlo esplicitamente anche lì se emerge.

**🐛 STORICO (IT pillar, 29/6):** «oli essenziali di qualità terapeutica certificata» → corretto in «qualità pura, testata e certificata secondo lo standard CPTG di doTERRA».

**REGOLA PREZZI collegata (tutte le lingue):** NON citare cifre in valuta specifiche negli articoli (es. €25, €170, €85→€64) — il modello le inventa e su un pillar cornerstone danneggiano la credibilità. Usa «prezzo membro» / «sconto del 25% sul prezzo al pubblico» senza numeri.

---

## 🌿 NOMI PRODOTTO — SEMPRE NATIVI (eterna — TUTTE le lingue)

**Anche se la keyword contiene il nome prodotto in INGLESE (frankincense, peppermint, lavender, wild orange…), nel TITOLO e nel CORPO usa SEMPRE il nome NATIVO della lingua target.** Il nome inglese della keyword serve solo al match SEO, NON deve comparire come nome prodotto nel testo. Vale per **TUTTI** i prodotti, non solo frankincense.

**frankincense →** Kadzidłowiec (PL) · اللبان *al-lubān* (AR) · Incenso (IT/PT) · Weihrauch (DE) · Encens (FR) · Incienso (ES) · Tămâie (RO) · Wierook (NL) · **フランキンセンス** (JA — katakana ufficiale doTERRA JP; NON 乳香, che è il termine tradizionale/incenso, non il nome prodotto). **Eccezioni che restano inglesi:** «Tea Tree» + blend doTERRA (On Guard, Deep Blue, Serenity, Balance). Segui la **DNA del brand** per lo spelling esatto.

**Blocco system-prompt** (`route.ts` → `universalDoterraRules`, deployato) — vale per il futuro. **🐛 STORICO:** PL/AR frankincense (cron) usavano «Frankincense»/«الفرانكنسينس» perché la keyword era EN → corretti a Kadzidłowiec/اللبان (titolo+corpo+slug), URL `frankincense-oil` e gateway ARE tenuti intatti. **Lezione:** la keyword EN inquina il nome prodotto nel testo se il system-prompt non forza il nativo.

---

## 💵 INCOME CLAIMS — ZERO TOLERANCE (eterna — FTC/DSA, TUTTE le lingue)

**Il rischio legale PIÙ ALTO del sistema.** Una tabella guadagni-per-rank o «earn $X/month» è esattamente ciò che FTC/DSA perseguono di più (specie in inglese). Vale per OGNI lingua.
- 🚫 MAI cifre di guadagno, redditi mensili/annuali, «earning/income potential», guadagno-per-rank, ROI, o QUALSIASI importo che il lettore potrebbe fare — né numero, né range, né «up to X», in nessuna valuta.
- 🚫 MAI una tabella che accoppia un rank/volume a un importo di reddito. I rank si descrivono SOLO come milestone di **volume** (PV/OV), mai come reddito.
- 🚫 MAI «la maggior parte guadagna X», «puoi arrivare a X/mese», «sostituisci lo stipendio», «reddito passivo di…».
- ✅ Descrivi l'opportunità SOLO in termini di impegno, flessibilità, struttura e MECCANISMO della compensazione (margine retail = prezzo membro vs pubblico; esistono bonus team) — MAI gli importi.
- ✅ Se il contesto guadagni è inevitabile, di' chiaramente che **la maggior parte di chi entra nel direct-selling guadagna poco o nulla, alcuni spendono più di quanto guadagnano, e doTERRA non garantisce alcun reddito** (formulazione attesa da FTC).
- **Blocco system-prompt v3.13** (`route.ts` → `universalDoterraRules`, universale tutte le lingue, deployato): nessun articolo futuro di nessuna lingua rigenera una tabella income.

**🐛 STORICO (giugno, EN work-from-home):** `doterra-work-from-home-opportunity-guide-en` aveva DUE tabelle income (rank × $50–$15,000+/month, Power of 3 $200–$500) + prosa («earn $1,000-$3,000/month», «a few hundred dollars per month») → rimossa colonna $ / rank riscritti come milestone di volume + disclaimer FTC + heading «Income Potential» → «How the Compensation Plan Works». ES/FR avevano «potencial de ingresos / potentiel de revenus» (senza cifra) → ammorbiditi in crescita/opportunità.

**🩺 LESSON ETERNA — un check-script che CRASHA NON certifica «pulito».** Se uno script di scan/classifica va in errore su un articolo, quell'articolo NON è verificato — anzi **l'articolo che fa crashare il check è spesso proprio l'anomalo** (l'EN work-from-home fece crashare la classifica E nascondeva la tabella income peggiore). Verifica SEMPRE i crash a mano. Inoltre: `.limit(1)` su uno slug **duplicato** (draft + published, frequenti su EN per i timeout-insert) può colpire la riga sbagliata → filtra per `status='published'` o per `id`.

**Tool:** `scripts/healthcheck-quality.cjs` — healthcheck riusabile 11 brand × 5 problemi (meccanismo / a-vita / cifre-valuta / therapeutic / income), regex per-lingua + classifica hit (distingui falsi positivi: «Lifelong Vitality Pack» = nome prodotto, «for life's challenges», «dauerhaft/permanente» in contesto non-sconto, negazioni «non serve kit», «aromathérapeutique», «دائمًا»=sempre). Run prima di ogni lancio.

---

## 📊 GA4 / ANALYTICS (eterna — lezione bug GA)

**🐛 BUG STORICO GA4 (giugno):** GA4 a 0 visite. Causa: init rotto — `window.gtag` non definito; il config era pushato come array literal (`dataLayer.push(['config','G-XXX'])`) SENZA definire il wrapper `gtag()` → nessuna richiesta `/collect` inviata.

**REGOLA:** usare lo snippet standard gtag — `window.dataLayer=window.dataLayer||[]; function gtag(){dataLayer.push(arguments)} gtag('js',new Date()); gtag('config','G-XXX')` — + evento `page_view` su navigazione SPA. Il **consent banner deve essere COLLEGATO all'init**: GA4 bloccato finché l'utente accetta, poi init. Verificare con DevTools → Network: richiesta `/collect` presente dopo consenso (**HEAD 200 della pagina ≠ GA funzionante**). NB: in finestra incognito il banner riappare sempre (cookie per-sessione) — non è un bug.

---

## 🌐 HTML LANG/DIR PER ROUTE (eterna — SEO, lezione 29 giugno)

**🐛 BUG STORICO:** il root `<html>` era hardcoded `lang="en"` su TUTTE le route (anche /ar, /jp, /es…), nel **DOM renderizzato post-JS** (non solo HTML statico) → **bug SEO lingua**: Google usa `<html lang>` per decidere in che lingua rankare → una pagina araba/giapponese dichiarata "inglese" ranka peggio proprio dove vuoi essere trovato. L'RTL su /ar funzionava solo via container interno, root senza `dir`.

**FIX (Lovable, frontend):** `LANG_MAP` per prefisso route che setta `document.documentElement.lang` + `dir` a ogni navigazione (root layout / `__root.tsx`), su initial load E client-side nav. Map: `/`→en, `/es`→es, `/de`→de, `/fr`→fr, `/pt`→pt, `/ro`→ro, **`/jp`→`ja`**, **`/ar`→`ar`+`dir="rtl"`**. Default en/ltr per route ignote. Future-proof: nuova lingua = 1 entry.
- ⚠️ **`/jp` deve dare `lang="ja"`** (ISO 639-1), NON "jp" — il path è `/jp` ma il codice lingua è `ja` (stesso principio di `language_code=ja` / path `/jp`).
- ⚠️ **`/ar` → `lang="ar"` + `dir="rtl"`** sul root, SENZA double-flip: `dir="rtl"` annidati restano tutti rtl (valore assoluto, non toggle) → nessun doppio ribaltamento. Verificare `getComputedStyle(document.body).direction==='rtl'`.
- **VERIFICA post-fix sul DOM RENDERIZZATO** (Chrome/JS, non `curl` dell'HTML statico — Googlebot renderizza JS): `document.documentElement.lang`/`dir` su ogni route. 29/6: 8/8 corretti (en/es/de/fr/pt/ro + jp→ja + ar→ar/rtl, no double-flip).

---

## 🔐 SECURITY / SECRETS (eterna)

**Token/secret rotation:** se un secret finisce nella git history (PAT GitHub, Supabase `service_role` key, API key), **ruotarlo SUBITO** (revoca + rigenera). La rotazione invalida l'esposto; cancellare la history NON basta (resta in fork/clone/cache). `.gitignore` deve includere `.env*.local` e `.env*.real`. Mai hardcodare secret negli script: `process.env` + dotenv da `.env.local`.

**🐛 STORICO (giugno):** PAT GitHub esposto → ruotato (revoca) + GCM attivato (`credential.helper=manager`). Scoperto anche Supabase `service_role` key hardcoded in ~14 script `.js`, 2 già committati/pushati su repo **privato** → rischio accettato dall'utente per ora (repo privato), NON ripulire history/ruotare salvo richiesta esplicita. Deploy: GitHub push bloccato su Hobby → **`vercel --prod` da CLI**. La key locale `ANTHROPIC_API_KEY` in `.env.local` è un **placeholder finto** (la generazione gira in prod su Vercel con la key vera) — per testare codice nuovo: `vercel --prod` poi chiamare l'endpoint prod.

---

## 📌 PINTEREST AUTO-PIN v3.3 (26 giugno 2026)

**ARCHITETTURA** (layer isolato — ogni errore Pinterest loggato, mai propagato al sistema main):
- Pinterest API v5 (gratis). Token: `process.env.PINTEREST_ACCESS_TOKEN` (mai hardcoded, mai committato)
- 3 pin/giorno: 2 EN + 1 ES, ultimi 30 giorni, non ancora pinnati (`LEFT JOIN pinterest_pins`)
- Pin VERTICALI 1024×1536 (v3.4) generati custom via gpt-image-2 + brand_dna_image_style v3.2, salvati in `articles.pinterest_image` (additivo; il blog resta orizzontale su `featured_image`). Reuse se già esiste.
- Board routing automatico: main board per lingua + topic board se keyword match (sleep/lifestyle)
- UTM: `?utm_source=pinterest&utm_medium=organic`

**FILE:**
- `lib/pinterest.ts` — `generatePinContent` (Claude: title ≤100c + description 250-500c + 3-5 hashtags), `createPinterestPin`, `getPinterestBoards`, `pinArticle` (orchestrator)
- `app/api/pinterest/create-pin/route.ts` — POST `{article_id}`, protetto CRON_SECRET
- `app/api/cron/daily-pin/route.ts` — seleziona + pinna, protetto CRON_SECRET
- `app/api/pinterest/callback/route.ts` — OAuth code→token (per Standard Access)
- `scripts/pinterest-schema.sql` + `scripts/create-pinterest-tables.mjs` — tabelle
- `scripts/seed-pinterest-boards.mjs` — fetch board reali + auto-map + upsert (run by user con token)

**DATABASE:** `pinterest_pins` (track pin + status), `pinterest_boards` (mapping board_id→lingua/topic/main)

**TOKEN MANAGEMENT / TRIAL MODE:**
- Trial = pin `pinned_trial` (visibili SOLO all'owner). Il flusso funziona e valida tutto.
- Standard Access (review Pinterest ~7-14gg) → `UPDATE PINTEREST_ACCESS_TOKEN` env su Vercel + redeploy → pin futuri pubblici. I pin trial restano secret (Pinterest non li promuove retroattivamente).

**SCHEDULING (⚠️ Hobby):** Vercel Hobby = max 2 cron, già usati (daily-keywords + daily-publish). `daily-pin` NON aggiunto a vercel.json (romperebbe il deploy). Opzioni: (a) scheduler esterno gratuito (cron-job.org / GitHub Actions) che chiama `GET /api/cron/daily-pin` con header `Authorization: Bearer $CRON_SECRET` alle 11:00 IT; (b) Vercel Pro → aggiungere a vercel.json `{"path":"/api/cron/daily-pin","schedule":"0 10 * * *"}`.

**SETUP STEPS (richiedono il token — li esegue l'utente):**
1. Crea tabelle: incolla `scripts/pinterest-schema.sql` nel Supabase SQL editor
2. Env Vercel: `PINTEREST_ACCESS_TOKEN`, `PINTEREST_APP_ID` (+ `PINTEREST_APP_SECRET` per OAuth)
3. `node scripts/seed-pinterest-boards.mjs` → popola pinterest_boards
4. Test: `POST /api/cron/daily-pin` con Bearer CRON_SECRET → verifica `pinterest_pins`
5. Configura scheduler esterno 11:00 IT

**COSTI (v3.4 vertical):** Pinterest API gratis; gpt-image-2 vertical ~$0.011/pin + Claude text ~$0.003/pin = ~$0.014 × 3/giorno × 365 ≈ **$15/anno** (image $12 + text $3). Reuse `pinterest_image` evita rigenerazioni.

**AUDIT CHECK D6 (nuovo):** `pinterest_boards` popolato per EN+ES (≥2 board/lingua: main + topic). Score 1/1 se ≥1 main board per lingua.

---

## 🎨 IMAGE BRAND IDENTITY v3.2 (26 giugno 2026 — LOCKED FINAL)

**ROOT CAUSE FINALE** (scoperto 26/6): il gold standard v3.0/3.1 non nominava "doTERRA" nel prompt → gpt-image-2 lottery sul brand:
- EN/ES/PT: random fortunati con bottiglie doTERRA
- DE/FR: sfortunati con bottiglie generiche "100% PURE ESSENTIAL OIL"

**PROVA EMPIRICA:** 5 articoli, identico `image_style` + stesso topic (work-from-home) → 3/5 bottiglie doTERRA, 2/5 anonime. Con `image_style` privo di placeholder, `extractLinkedProducts`/`PRODUCT_NAME_MAP`/`MULTI_PRODUCT_SCENES` NON entrano nel prompt (dead path): l'output dipende SOLO dal testo del prompt → senza "doTERRA" è testa-o-croce.

**FIX DEFINITIVO v3.2** — clausola brand esplicita nel `brand_dna_image_style` (314 chars, LOCKED):
```
Bright, clean lifestyle photography. Natural light, botanical elements, and doTERRA-branded essential oil bottles (amber glass, black cap, minimal white label clearly reading "doTERRA" above the oil name) arranged with diffusers in cozy home settings. Warm earth tones with pops of lavender, green, and soft amber.
```
RISULTATO: 5/5 brand generano SEMPRE bottiglie doTERRA-marchiate; stile lifestyle mantenuto; nessun ritorno alle 3D inventate del `DEFAULT_STYLE`.

**REGOLA NUOVE LINGUE:**
1. `create-brand.js` v3 auto-configura `DEFAULT_IMAGE_STYLE` enhanced
2. POST-create verifica `brand_dna_image_style` contiene `doTERRA-branded`
3. Test 1 immagine draft pre-activation per validare

**ARCHITETTURA IMAGE GENERATION FINALE:**
1. `brand_dna_image_style` (DB) = prompt principale lifestyle + clausola doTERRA-branded
2. `generate-image` legge `brand_dna_image_style` dal DB se override non passato nel body (fix 26/6)
3. Task A keyword→EN translation garantisce `topic_context` in inglese
4. `DEFAULT_STYLE` codice = LAST RESORT, mai triggered in produzione

**AUDIT CHECK D5 (v3.2):** `SELECT brand_dna_image_style WHERE id='[uuid]'` → deve contenere `doTERRA-branded` AND length ~314 chars. Score 1/1 se valid, 0/1 se NULL/manca clausola brand.

---

## 🚨 OPERATIONAL CONSTRAINTS (26 giugno 2026 — LOCKED)

**VERCEL HOBBY 60s CAP:**
- `maxDuration:120` nel codice è IGNORATO/clampato a 60s su Hobby
- `generate-article` SOLO con `length:'medium'` (~1000-1300 parole, ~50-56s)
- MAI `length:'long'` (>60s → funzione uccisa → articolo non salvato o orphan)
- Il cron quotidiano usa `medium` = safe
- Per `long`: serve upgrade Vercel Pro ($20/mese, cap 300s)

**ORPHAN ARTICLES POST-TIMEOUT:**
- `generate-article` INSERISCE l'articolo published PRIMA di rispondere al client
- Se il client va in timeout (60s)/socket-close, l'articolo è comunque published → orphan
- NON ritentare alla cieca → crea duplicati published
- ROUTINE post-failure: `SELECT ... WHERE brand_id=X AND created_at > now()-5min` → unpublish orphan (`status='draft'`, MAI delete)

**PUBLISH MANUALE RULE:**
1. SEMPRE `length:'medium'`
2. SEMPRE verifica DB post-call
3. SEMPRE 1 alla volta, NON parallel
4. STOP IMMEDIATO al primo timeout (no retry batch)
5. Per test: `{ draft: true }` GARANTITO + verifica `status='draft'` post-insert

**GEO/E-E-A-T PROMPT (attivo in generate-article):** direct-answer intro (100-150 parole), FAQ 4-6, ≥1 tabella comparativa, lista numerata, author line localizzata, tono conversazionale; guard: no claim medici/clinici, no promesse di guadagno/income, no studi inventati.

---

## 🎨 IMAGE GENERATION ARCHITECTURE v3.0 (26 giugno 2026 — LOCKED)

**ARCHITETTURA REALE:**
`generate-image` API usa `brand_dna_image_style` dal DB come PROMPT PRINCIPALE.
Se NULL → fallback `DEFAULT_STYLE` iper-prescrittivo nel codice → bottiglie 3D inventate.

**GOLD STANDARD (use forever per ogni nuova lingua):**
```
Bright, clean lifestyle photography. Natural light, botanical elements, essential oil 
bottles and diffusers in cozy home settings. Warm earth tones with pops of lavender, 
green, and soft amber.
```

**PERCHÉ FUNZIONA:**
- Prompt vago = gpt-image-2 ha libertà creativa
- gpt-image-2 ha training data lifestyle doTERRA → genera foto fotorealistiche
- Senza specifiche bottle/cap/label → zero hallucination 3D
- Topic context tradotto in inglese (Task A, giugno 26) → coerenza linguistica garantita

**REGOLA NUOVA LINGUA:**
1. `create-brand.js` v3 auto-imposta `brand_dna_image_style = DEFAULT_IMAGE_STYLE`
2. POST-launch verifica: `SELECT brand_dna_image_style FROM brands WHERE language_code='[X]';`
3. Se NULL → `UPDATE brands SET brand_dna_image_style = '[gold standard]' WHERE language_code='[X]'`
4. Il cron usa `brand.brand_dna_image_style` → mai `DEFAULT_STYLE` codice in produzione

**`DEFAULT_STYLE` codice = LAST RESORT FALLBACK, non production path.**

**LESSON LEARNED giugno 26 2026:**
4 brand (ES/DE/FR/PT) avevano `image_style` NULL o sub-ottimale (ES: "no labels visible").
gpt-image-2 cadeva su `DEFAULT_STYLE` → cap nero forzato + "Lavandula angustifolia 15 mL" hallucinated.
Fix: `UPDATE brands SET brand_dna_image_style = '[gold standard]' WHERE language_code IN ('es','de','fr','pt')`.
Visual test risultato: FR 10/10, DE 9/10, ES/PT 8/10 vs EN reference.

**TASK A FIX (keyword translation) RESTA ATTIVO:**
- ES/DE/FR/PT: keyword tradotta in inglese via `gpt-4o-mini` prima di buildImagePrompt
- Cache in-memory per evitare API repeat nella stessa serverless instance
- Costo: ~$0.40/anno a 10 brand (trascurabile)
- Sinergico con image_style fix: entrambi necessari per qualità ottimale

**AUDIT CHECK D5 (IMAGE STYLE):**
```sql
SELECT brand_dna_image_style FROM brands WHERE id='[uuid]';
```
Atteso: stringa lifestyle (≥100 chars, NON NULL, NON contiene "no labels visible").
Score: 1/1 ✅ se valid | 0/1 ❌ se NULL o sub-ottimale.

---

## 🤖 ON INVOCATION — SCEGLI MODALITÀ

All'avvio di questa skill, **chiedi sempre** (salvo trigger automatico riconosciuto):

```
Cosa vuoi fare?

A) 🚀 LAUNCH — lancia una nuova lingua (DE, FR, IT, PT, NL...)
B) 🩺 AUDIT  — verifica stato di una lingua esistente (EN, ES...)
C) 🔄 BOTH   — audit lingua esistente + prepara lancio nuova lingua
```

**Routing automatico da trigger:**
| Trigger rilevato | Modalità |
|---|---|
| "lancia [lang]", "clona blog", "nuovo brand", "launch language" | → A) LAUNCH direttamente |
| "audit [lang]", "controlla [lang]", "stato [lang]" | → B) AUDIT direttamente |
| "check tutto", "soloseodoterra status", "soloseodoterra" senza args | → chiedi A/B/C |

---

## 🩺 AUDIT MODE — Verifica lingua esistente

> Chiedi: **quale lingua vuoi auditare?** (es: `en`, `es`, `fr`)
> Poi esegui tutti i check sotto e produci la tabella output.

### A. BACKEND (6 checks)

| # | Check | Come verificare |
|---|---|---|
| A1 | Brand esiste in DB | `SELECT id, active, language_code FROM brands WHERE language_code = '[lang]'` |
| A2 | Brand `active = true` | stesso query — campo `active` |
| A3 | DNA completo (5+1 campi) | `SELECT brand_dna_business_type, brand_dna_service_area, brand_dna_topics_to_avoid, brand_dna_key_themes, brand_dna_brand_voice, brand_dna_mandatory_footer FROM brands WHERE language_code = '[lang]'` — tutti non-null e non placeholder. **ECCEZIONE:** se `brand.domain` NON ha suffix lingua (es. `essentialsynergybr.com` senza `/en`) → root brand → footer è Lovable-side (es. `EnglishMandatoryFooter.tsx`) → `brand_dna_mandatory_footer` è unused. Conta 5/5 ✅, NON segnalare ⚠️ sul campo footer. |
| A4 | Link Expert ≥ 100 entries | `SELECT COUNT(*) FROM link_expert WHERE brand_id = '[uuid]' AND active = true` |
| A5 | Themes ≥5 + keyword pool | `SELECT COUNT(*) AS themes, SUM(array_length(keywords, 1)) AS keyword_pool FROM editorial_themes WHERE brand_id = '[uuid]' AND active = true` — themes ≥ 5 AND keyword_pool ≥ 25 (= 5 temi × 5 kw min). Entrambe le condizioni devono essere ✅. |
| A6 | owner_id + affiliate_base_url presenti | `SELECT owner_id, affiliate_base_url FROM brands WHERE language_code = '[lang]'` — entrambi non-null |

### B. PUBLISHING (6 checks)

| # | Check | Come verificare |
|---|---|---|
| B1 | Ultimo articolo ≤ 48h | `SELECT title, published_at FROM articles WHERE brand_id='[uuid]' AND status='published' ORDER BY published_at DESC LIMIT 1` |
| B2 | cron_runs ultimi 7gg | `SELECT * FROM cron_runs WHERE created_at > NOW()-INTERVAL '7 days' ORDER BY created_at DESC` — almeno 7 righe ok/partial. **Se brand `active=true` da < 14gg:** 0 righe è ⚠️ EXPECTED (non ❌). Verifica età: `SELECT created_at FROM brands WHERE id='[uuid]'`. Output: "B2: 0 cron runs (brand attivo da Xgg — expected, si popola dal cron 9AM IT)". |
| B3 | cost_log ultimo mese | `SELECT SUM(cost_usd), COUNT(*) FROM cost_log WHERE brand_id='[uuid]' AND created_at > NOW()-INTERVAL '30 days'` — cost/article ≤ $0.15. **Se brand < 14gg:** 0 righe è ⚠️ EXPECTED. `cron_runs` e `cost_log` si popolano SOLO con cron schedulato (9AM IT), mai con Run Now. |
| B4 | Titoli ≤65 (post-23/6) | `SELECT title, LENGTH(title) FROM articles WHERE brand_id='[uuid]' AND status='published' AND published_at >= '2026-06-23' ORDER BY published_at DESC LIMIT 20` — nessuno > 65. Articoli pre-23 giugno 2026 esclusi (title constraint non esisteva ancora). |
| B5 | Link Expert usato negli articoli | spot-check: apri 2 articoli recenti → verifica che i link doTERRA puntino a URL specifici (non generic /shop/) |
| B6 | Immagini 16:9 presenti | `SELECT COUNT(*) FROM articles WHERE brand_id='[uuid]' AND featured_image IS NOT NULL AND status='published'` — ≥ 80% con immagine |

### C. SEO (3 checks)

| # | Check | Come verificare |
|---|---|---|
| C1 | Sitemap include lingua | Prima leggi `brand.domain`: se root (nessun suffix `/<lang>`) → grep per `/blog/`; se subdirectory → grep per `/[lang]/blog/`. `curl https://www.essentialsynergybr.com/sitemap.xml` → risultati > 0. |
| C2 | IndexNow include URL lingua | `GET https://www.essentialsynergybr.com/api/public/notify-search-engines` (endpoint Lovable). Root brand: cerca `/blog/` in `urls[]`. Subdirectory: cerca `/[lang]/blog/`. `urlCount` coerente con totale published. |
| C3 | force-dynamic attivo su endpoint lista | `curl -I https://soloseo-alpha.vercel.app/api/public/articles/[lang]` → `Cache-Control: no-store` presente |
| C4 | Image coherence | Apri ultime 3 immagini brand. Ogni immagine deve mostrare: bottle doTERRA riconoscibile + elements topic-relevant. Se 1+ immagini mostrano prodotto non menzionato nell'articolo → check `PRODUCT_NAME_MAP` copre anchor text lingua. |
| C5 | Internal Linking | `SELECT COUNT(*) FROM article_embeddings WHERE brand_id='[uuid]'` — count deve = totale articoli published. Se count < articoli → esegui `node scripts/backfill-embeddings.mjs`. Spot-check: apri 1 articolo recente → deve contenere 1-2 link a articoli interni della stessa lingua. **ISOLATION VERIFIED (25/6/2026):** `find_related_articles` RPC filtra per `target_brand_id` — zero cross-language leak (EN→EN, ES→ES, DE→DE, FR→FR). |

### D. SAFETY (3 checks)

| # | Check | Come verificare |
|---|---|---|
| D1 | Altri brand non interrotti | per ogni altra lingua attiva: `SELECT status, published_at FROM articles WHERE brand_id='[other_uuid]' ORDER BY published_at DESC LIMIT 1` — tutti hanno articolo recente |
| D2 | Routing Lovable OK | Leggi `brand.domain`. Root (EN): apri `https://www.essentialsynergybr.com/blog`. Subdirectory (ES/DE/...): apri `https://www.essentialsynergybr.com/[lang]/blog`. Lista articoli visibile, nessun 404. |
| D3 | Ultimo articolo live su sito | Root: `https://www.essentialsynergybr.com/blog/[slug]`. Subdirectory: `https://www.essentialsynergybr.com/[lang]/blog/[slug]`. Pagina carica, footer visibile, immagine 16:9 presente. |

---

### OUTPUT AUDIT — formato obbligatorio

```
## Audit [LANG] — [DATA]

| # | Check | Stato | Note |
|---|---|---|---|
| A1 | Brand exists | ✅/❌ | |
| A2 | active = true | ✅/❌ | |
| A3 | DNA 6/6 | ✅/⚠️/❌ | campo mancante se ⚠️ |
| A4 | Link Expert ≥100 | ✅/⚠️/❌ | count attuale |
| A5 | Themes ≥5 + pool ≥25 | ✅/❌ | N themes, M total keywords |
| A6 | owner_id + url | ✅/❌ | |
| B1 | Ultimo articolo ≤48h | ✅/⚠️/❌ | data ultimo |
| B2 | Cron 7gg ok | ✅/⚠️/❌ | N/7 successi |
| B3 | Cost ≤$0.15/art | ✅/⚠️/❌ | avg attuale |
| B4 | Titoli 45-58 | ✅/⚠️/❌ | N outlier |
| B5 | Link Expert usato | ✅/⚠️/❌ | |
| B6 | Immagini presenti | ✅/⚠️/❌ | % copertura |
| C1 | Sitemap OK | ✅/❌ | N URL trovati |
| C2 | IndexNow include lang | ✅/❌ | urlCount totale |
| C3 | force-dynamic | ✅/❌ | |
| C4 | Image coherence | ✅/⚠️/❌ | N/3 immagini coerenti |
| C5 | Internal Linking | ✅/⚠️/❌ | N embeddings vs M articoli |
| D1 | Altri brand OK | ✅/⚠️/❌ | |
| D2 | Routing Lovable | ✅/❌ | |
| D3 | Articolo live | ✅/❌ | |

**Score: X/20**

**Verdict:**
🟢 HEALTHY (18-20/20) — sistema nominale
🟡 MONITOR (14-17/20) — action items sotto, monitora 24h
🔴 CRITICAL (<14/20) — blocca nuovi lanci, fixa prima

**Action items:** [lista ordinata per priorità]
```

---

## 🎯 PURPOSE (LAUNCH MODE)

Replicate the validated Spanish blog system (`essentialsynergybr.com/es`) to a new language with zero quality deviation. Every clone must match or exceed Spanish quality at launch.

**CRITICAL CONSTRAINT — NON NEGOZIABILE:**
The Spanish brand (`a20e4f07-e572-4605-acfc-5c53355f2ada`) is OFF LIMITS during any launch procedure. All changes must be additive. After every step, verify ES cron + manual publish still work identically.

---

## 🚀 LAUNCH MODE — PRE-FLIGHT CHECKLIST (do BEFORE starting)

### Inputs required from user:
- [ ] Language code (ISO 639-1: `en`, `fr`, `de`, `it`, `pt`, `nl`)
- [ ] Owner ID for primary doTERRA market (e.g. `15957920`)
- [ ] Primary market shop URL (full, with `?OwnerID=`) — verify it loads in browser
- [ ] Domain configuration (root vs `/xx/` subdirectory)
- [ ] Secondary markets list (for footer enrollment links)
- [ ] WhatsApp number for that audience
- [ ] Existing content to migrate? (Y/N — affects timeline)

### System state verification:
- [ ] Spanish brand still publishing (run manual publish, verify article created)
- [ ] SoloSEO dashboard accessible
- [ ] Lovable site building successfully
- [ ] No active P1 bugs in SoloSEO
- [ ] Vercel deployments healthy (`vercel ls` shows last deploy OK)

### Risk register:
- [ ] doTERRA market actually exists in target language (open shop URL in incognito)
- [ ] Owner ID validated (test enrollment link: `https://www.doterra.com/[MARKET]/[lang]/join/?OwnerID=[ID]`)
- [ ] Domain DNS/SSL already configured (no waiting blockers)

---

## 🛫 PHASE 1 — TAXI: Backend Setup (~45 min)

### Step 1.1: Create brand via cloning script

**Interactive mode:**
```bash
node scripts/create-brand.js
```

**Non-interactive mode (recommended for speed):**
```bash
node scripts/create-brand.js \
  --language=de \
  --ownerID=15957920 \
  --marketUrl=https://shop.doterra.com/DE/de_DE/shop \
  --domain=essentialsynergybr.com/de \
  --brandName="Essential Synergy DE"
```

The script uses:
- `scripts/lib/brand-dna-templates.js` → DNA pre-tradotto nella lingua target (DE, IT, FR, PT, NL, ES, EN)
- `scripts/lib/editorial-themes-by-language.js` → 5 temi con keywords nella lingua target
- `scripts/lib/doterra-markets.js` → URL pattern per mercato, avvisa se non verificato

**Expected output:**
- ✅ Brand UUID generated → **save this, needed in every subsequent step**
- ✅ Brand DNA popolato in lingua target (tedesco per DE, italiano per IT, ecc.)
- ✅ 5 editorial themes con keywords localizzate (es. `Lavendelöl ätherisches Öl` per DE)
- ✅ `active = false` — NON auto-pubblica. Attiva manualmente dopo verifica completa
- ⚠️ Warning se URL pattern mercato non ancora verificato in produzione

### Step 1.1b: Slug collision check — MANDATORY if new lang shares domain root

If new language uses the same root domain as existing content (e.g. EN shares `/blog/[slug]` with Soro):
- [ ] Verify `getSoroSlugs()` in `generate-article/route.ts` fetches the live sitemap
- [ ] Confirm `safeSlug` logic appends `-[lang]` on collision
- [ ] Test: publish article with known Soro slug → confirm suffix added

### Step 1.1c: sanitizeProductUrls — verify URL pattern for new market

The function handles two URL patterns (in `generate-article/route.ts`):
- **Pattern 1 — ES/shop style**: `shop.doterra.com/XX/xx_XX/shop/[slug]/` → covers DE, IT, FR, PT, NL (assumed)
- **Pattern 2 — EN/US style**: `www.doterra.com/US/en/p/[slug]/` → covers US/EN only

Verified market patterns are documented in `scripts/lib/doterra-markets.js`.
Markets marked `verified: false` MUST be manually confirmed before launch (see Step 0.X below).

**⚠️ Step 0.X — Verify doTERRA market URL pattern (mandatory pre-flight)**

1. Apri `https://shop.doterra.com/[CC]/[lang]_[CC]/shop` nel browser (es. `DE/de_DE/shop`)
2. Cerca un prodotto noto (es. Lavendel / Lavender)
3. Apri la pagina prodotto → copia l'URL dalla barra del browser
4. Verifica che corrisponda a Pattern 1 o Pattern 2
5. Se è un pattern nuovo → aggiungi Pattern 3 in `generate-article/route.ts` (BACKEND CHANGE — richiede review separata)
6. Aggiorna `verified: true` in `scripts/lib/doterra-markets.js`

Test: generate 1 draft article → inspect all doTERRA links → zero should point to generic `/shop/`.

### Step 1.1d: Title length constraint

Verify `buildUserPrompt` in `generate-article/route.ts` contains:
```
TITLE REQUIREMENTS (HARD CONSTRAINT):
- MUST be 45-58 characters total.
- NO "X: Y" colon-subtitle pattern.
```
Without this, generated titles run 65-75 chars = SEO yellow zone for every article.

## 🎨 IMAGE GENERATION — Content-Aware System v2.4 (locked June 25, 2026)

---

### 🔒 BRAND ACCURACY CHECKLIST per nuova lingua (Steps 1.1g-j)

**Step 1.1g — PRODUCT_NAME_MAP universal coverage (≥30 entries/lang)**
Verifica che i prodotti core doTERRA siano coperti nella lingua target:
- 8 single oils: Lavender, Peppermint, Frankincense, Lemon, Wild Orange, Tea Tree, Eucalyptus, Rosemary
- 7 blends: On Guard, Balance, Serenity, Deep Blue, DigestZen, Breathe, AromaTouch (universal brand names — NO translation)
- Conteggio entrate: `EN ≥37 ✅ | ES ≥31 ✅ | FR ≥30 ✅ | DE ≥32 ✅`

**Step 1.1h — BOTANICAL_MAP topic coverage (11 topic universali per lingua)**
Verifica entries per: sleep, skin, cleaning, energy, focus, immune, stress, relaxation, wellness, kids/baby, buy/pillar.
Senza queste → fallback `'fresh botanicals and natural wellness elements on marble'` (non critico ma subottimale).

**Step 1.1i — MULTI_PRODUCT_SCENES coverage (7 scene generali)**
Forza collage 3 bottiglie quando topic è broad e l'articolo non ha link specifici:
- sleep → Lavender + Serenity + Roman Chamomile
- energy → Peppermint + Citrus Bliss + Wild Orange
- immune → On Guard + Frankincense + Lemon
- stress/relax → Lavender + Balance + Serenity
- focus → InTune + Peppermint + Rosemary
- buy/guide/pillar → Lavender + On Guard + Frankincense
- wellness → Lavender + On Guard + Peppermint

**Step 1.1j — DEFAULT_STYLE brand accuracy (v1.4)**
Conferma che `DEFAULT_STYLE` in `lib/image-prompt.ts` contenga:
- `BLACK matte cap (CRITICAL: NEVER white, NEVER gold, NEVER silver)`
- `NO ribbons, NO decorative bows, NO ornate borders`
- `AVOID ABSOLUTELY:` block con lista completa
- `Aspect ratio: 16:9 landscape`

---

### IMAGE TROUBLESHOOTING v2.4

| Sintomo | Causa | Fix |
|---|---|---|
| Bottiglia con cap bianco/oro/argento | gpt-image-2 inventa colore — prompt v1.3 non lo lockava | Verificare DEFAULT_STYLE ha `BLACK matte cap, NEVER white` |
| Label decorativa con ribbon/bow | Prompt non specificava `NO ribbons` | Verificare AVOID list include ribbons, bows |
| Prodotto random non menzionato in articolo | BUG 1: `generate-image` fetchava colonna sbagliata → `extractLinkedProducts` non girava | Verificare `generate-image/route.ts` seleziona `content_markdown` (colonna reale DB). MAI `content` (non esiste). Verificato via information_schema 26/6/2026. |
| Tutte immagini Lavender per topic vario | Fallback default quando keyword no match | Aggiungere entries in BOTANICAL_MAP + MULTI_PRODUCT_SCENES per topic |
| Immagine FR/DE/IT generica senza brand | PRODUCT_NAME_MAP lingua incompleto | Aggiungere traduzioni prodotti core lingua target (Step 1.1g) |
| Errore `toLowerCase` in generate-image | `keyword` e `title` entrambi undefined nel body | Passare sempre `keyword` E `title` nel body di `/api/generate-image` |

---

**Flusso attuale (v2.4):**
1. Articolo generato (cron 9AM IT o manual Run Now)
2. `buildImagePrompt(keyword, imageStyle, content_markdown)` riceve il testo completo
3. Se `imageStyle` custom → usa quello (override admin, bypass tutto)
4. `extractLinkedProducts` legge tutti i `[anchor](doterra.com...)` link nel markdown
5. **Decision branch (NEW v2.0):**
   - Se keyword batte `MULTI_PRODUCT_SCENES` AND `linkedProducts.length === 0` → **COLLAGE_STYLE** (3 bottiglie, topic-specific)
   - Altrimenti → **DEFAULT_STYLE** (single hero bottle, doTERRA brand sempre leggibile)
6. `PRODUCT_NAME_MAP` normalizza anchor text → canonical EN product name (multi-lingua)
7. Primary product = primo linked → bottle in primo piano
8. Secondary product (se 2+) → bottle in background composizione
9. `BOTANICAL_MAP` seleziona botanicals/scene da keyword topic
10. gpt-image-2 genera 1792×1024 (16:9 landscape)

**Topic generali → COLLAGE (MULTI_PRODUCT_SCENES):**
| Topic | Prodotti collage |
|---|---|
| sleep / dormir / sueño / insomnio / schlaf / schlafen | Lavender + Serenity + Roman Chamomile |
| stress / estrés / estres / entspannung | Lavender + Balance + Serenity |
| energy / energie / energi / vitalid | Peppermint + Citrus Bliss + Wild Orange |
| immune / immunsystem | On Guard + Frankincense + Lemon |
| wellness / bienestar / wohlbefinden | Lavender + On Guard + Peppermint |
| focus / concentr / fokus | InTune + Peppermint + Rosemary |

**Vantaggi vs sistema precedente:**
- Zero prodotti random non menzionati nell'articolo
- Coerenza immagine ↔ contenuto automatica
- Universale: zero branching per lingua
- Auto-scaling: nuove lingue ereditano se PRODUCT_NAME_MAP esteso

**IMAGE GENERATION RULE — INVIOLABILE:**
Per qualsiasi articolo, qualsiasi lingua, qualsiasi brand:
1. Prompt: SEMPRE `buildImagePrompt(keyword, null, content_markdown)` — MAI prompt custom hardcoded
2. Modello: SEMPRE `gpt-image-2` — MAI `gpt-image-1` (qualità notevolmente inferiore)
3. Size: SEMPRE `1792x1024` — MAI `1536x1024` o altro
4. Quality: `medium`

Se il risultato non piace: fix i mappings (`PRODUCT_NAME_MAP`, `BOTANICAL_MAP`) in `lib/image-prompt.ts`, NON il prompt.
Script manuale di rigenerazione: `scripts/regen-de-images.mjs` — copia logica production 1:1.
⚠️ ERRORE COMUNE 1: usare `gpt-image-1` o size `1536x1024` negli script manuali → immagini scadenti. Verificare SEMPRE model+size prima di generare manualmente.
⚠️ ERRORE COMUNE 2: `extractLinkedProducts` restituiva anchor text grezzo (es. "Foundational Wellness Bundle") se non in `PRODUCT_NAME_MAP` → bottiglia con label assurda. Fix (24/6/2026): `canonical` inizia a `null`, si skippa se nessun mapping trovato → fallback corretto a Lavender. Già fixato in `lib/image-prompt.ts`.

**Call site production (SOLO 2 — non aggiungerne altri):**
- `app/api/cron/daily-publish/route.ts` — cron automatico 9AM IT
- `app/api/generate-image/route.ts` — rigenerazione manuale da dashboard

**Lingue coperte da PRODUCT_NAME_MAP:** EN ✅  ES ✅  DE ✅  FR ✅  PT ✅ (v2.6)

**Per debug immagine sub-standard:**
1. Verifica `PRODUCT_NAME_MAP` copre anchor text lingua articolo
2. Verifica `BOTANICAL_MAP` copre topic keyword articolo
3. Verifica `content_markdown` passato dal caller (cron + manual)
4. Rigenera: dashboard → articolo → "Generate Image"

---

### 🐛 BUG NOTO — create-brand.js: doppio `/essential-oils/` (fixato v2.6)

**Problema:** Se `--marketUrl` passato già contiene il path `/essential-oils/` (es. utente copia URL completo dallo shop), lo script concatenava `/essential-oils/?OwnerID=...` → doppio path:
```
WRONG: shop.doterra.com/PT/pt_PT/shop/essential-oils/essential-oils/?OwnerID=15957920
```

**Impatto:** `affiliate_base_url` errato in DB → link affiliato non funziona.

**Fix applicato (26/6/2026):** `scripts/create-brand.js` ora sanitizza `marketUrl` prima di buildare:
```javascript
const baseShopUrl = marketUrl.replace(/\/essential-oils\/?$/, '')
const affiliateBaseUrl = `${baseShopUrl}/essential-oils/?OwnerID=${ownerID}`
```

**Brand impattati e corretti manualmente:**
- FR brand (`82dee695`): `affiliate_base_url` corretto via SQL post-create
- PT brand (`8edf37b6`): `affiliate_base_url` corretto via SQL post-create

**Come prevenire:** Non passare URL con path `/essential-oils/` in `--marketUrl`. Passare sempre il base shop URL (es. `https://shop.doterra.com/PT/pt_PT/shop`). Ma lo script ora gestisce entrambi i casi.

---

### Step 1.1e: Image style standard — VERIFY before activation

**Standard locked June 23 2026** after lavender-oil-uses-and-benefits success (EN brand).

Verify `lib/image-prompt.ts` `DEFAULT_STYLE` contains (v1.4, locked June 25 2026):
- `BLACK matte cap (CRITICAL: NEVER white, NEVER gold, NEVER silver)`
- `NO ribbons, NO decorative bows, NO ornate borders`
- `AVOID ABSOLUTELY:` block
- `Aspect ratio: 16:9 landscape`
- `{doterra_product}` placeholder (replaced at runtime by `buildImagePrompt()`)

> v1.4 upgrade: BLACK cap explicitly locked, AVOID ABSOLUTELY block replaces old vague Avoid line, no ribbons added. Collage style has same constraints.

Verify `app/api/generate-image/route.ts` uses `size: '1792x1024'` (16:9).
Verify `app/api/cron/daily-publish/route.ts` uses same size.

This template applies universally — EN, ES, FR, DE, IT, PT, all languages, both cron and manual.
Do NOT customize per-brand unless user explicitly requests a different aesthetic for a new brand.

Test: generate 1 draft article image → confirm amber bottle + botanicals + premium lifestyle composition.

### Step 1.1f: PRODUCT_NAME_MAP + BOTANICAL_MAP language extension (5 min)

Per ogni nuova lingua, verifica che `lib/image-prompt.ts` copra i termini in lingua target:

- [ ] `PRODUCT_NAME_MAP` ha entries per i nomi prodotto doTERRA in [lingua] → canonical EN name
  (es. DE: `'lavendelöl': 'Lavender'`, `'weihrauch': 'Frankincense'`, `'teebaum': 'Tea Tree'`)
- [ ] `BOTANICAL_MAP` ha entries per topic keywords in [lingua]
  (es. DE: `'akne': 'fresh tea tree leaves...'`, `'schlaf': 'soft linen...'`)

Se mancano → aggiungili prima di proseguire. File: `lib/image-prompt.ts`. Pattern: lowercase keys, English canonical values. Richiede deploy (`vercel --prod`) dopo modifica.

Lingue già coperte: EN ✅  ES ✅  DE ✅ (aggiunto v1.7)

### Step 1.1g: Internal Linking — verifica URL pattern nuova lingua (2 min)

Prima di attivare il brand, verifica il routing Lovable per la nuova lingua:

- **Pattern A** (`/[lang]/blog/[slug]`) — come ES, FR, IT, PT, NL → nessuna modifica necessaria
- **Pattern B** (`/[lang]/[slug]` senza `/blog/`) — come DE → aggiungi `language_code` al `LANGS_WITHOUT_BLOG` set in `generate-article/route.ts`:

```typescript
const LANGS_WITHOUT_BLOG = new Set(['de', 'nuovalingua'])  // aggiungi qui se Pattern B
```

Dopo i primi articoli published → backfill embeddings:
```bash
node scripts/backfill-embeddings.mjs
```
Con 5+ articoli per brand il sistema trova risultati rilevanti automaticamente.

---

---

## 🔗 INTERNAL LINKING SYSTEM (v2.1 — 26 giugno 2026)

Ogni nuovo articolo riceve 2–3 internal link semanticamente rilevanti, inseriti da Claude durante la generazione.

### Architettura

**Supabase (pgvector):**
```sql
-- Tabella
article_embeddings (id, article_id FK, brand_id FK, embedding vector(1536), generated_at)
UNIQUE CONSTRAINT su article_id

-- Index
ivfflat (embedding vector_cosine_ops) WITH (lists = 10)

-- Funzione RPC
find_related_articles(query_embedding, target_brand_id, exclude_article_id, match_threshold, match_count)
```

**Files:**
- `lib/embeddings.ts` — `generateEmbedding()` / `storeArticleEmbedding()` / `findRelatedArticles()`
- `app/api/internal/generate-embedding/route.ts` — endpoint (POST: article_id o text)
- `app/api/internal/find-related/route.ts` — endpoint (POST: brand_id + embedding)
- `scripts/backfill-embeddings.mjs` — one-shot backfill nuova lingua

**Flusso in generate-article (automatico, non-blocking):**
1. Embeds keyword via `text-embedding-3-small`
2. `findRelatedArticles(brand_id, kwEmbedding, threshold=0.4, limit=3)`
3. Se risultati → hint "INTERNAL LINKS TO INCLUDE" aggiunto al user prompt
4. Claude inserisce 2-3 link markdown contestuali durante generazione
5. Dopo INSERT articolo → store embedding nuovo articolo (fire-and-forget)

### Threshold per corpus size

| Articoli per brand | Threshold raccomandato |
|---|---|
| < 50 | `0.4` (attuale) |
| 50–200 | `0.55` |
| 200+ | `0.7` |

Per cambiare: modifica `findRelatedArticles(brand_id, kwEmbedding, undefined, 3, 0.4)` in `generate-article/route.ts`.

### URL pattern per brand — CRITICO

```
EN (root):  https://essentialsynergybr.com/blog/[slug]
ES:         https://essentialsynergybr.com/es/blog/[slug]
DE:         https://essentialsynergybr.com/de/[slug]      ← NO /blog/
```

Logica in `generate-article/route.ts`:
```typescript
const LANGS_WITHOUT_BLOG = new Set(['de'])   // lingue con /[lang]/[slug] invece /[lang]/blog/[slug]
const langPath  = language_code === 'en' ? '' : `/${language_code}`
const blogPath  = LANGS_WITHOUT_BLOG.has(language_code) ? '' : '/blog'
// → https://essentialsynergybr.com{langPath}{blogPath}/{slug}
```

**⚠️ ERRORE COMUNE:** usare `brand.domain.includes('/')` per rilevare root brand — sempre `true` per domini con `https://`. Usare `language_code === 'en'` esplicitamente.

### Costo

- `text-embedding-3-small`: $0.02/1M tokens — articolo ~600t → $0.000012/articolo
- 3 brand × 365 articoli/anno: **~$0.04/anno**
- 10 brand: **~$0.11/anno**
- Backfill 31 articoli esistenti: **$0.000350 totale**

---

### Step 1.2: Populate Link Expert — Manual Chrome Scrape

> ⚠️ **Why manual?** doTERRA shop is a JS-rendered SPA. Server-side fetch, sitemap, and `querySelectorAll` from Node all return 0 results. The only working method is a real browser rendering the page DOM.
> ⏱️ Allow +30 min extra for complex markets (non-US, non-EN).

**A) Open Chrome and navigate to the market's product category pages:**

For US/EN market:
```
https://www.doterra.com/US/en/pl/single-oils
https://www.doterra.com/US/en/pl/proprietary-blends
https://www.doterra.com/US/en/pl/supplements-daily-vitality
https://www.doterra.com/US/en/pl/enrollment-kits   ← DO NOT SKIP
```

For other markets, replace `US/en` with market code (e.g. `FR/fr`, `DE/de`).

**B) On each page, open Chrome DevTools Console and run:**

```javascript
// Wait for JS render + lazy load all products
for (let i = 0; i < 10; i++) {
  window.scrollTo(0, document.body.scrollHeight)
  await new Promise(r => setTimeout(r, 1500))
}
// Extract all product links — adjust href pattern per market
const links = [...new Set(
  [...document.querySelectorAll('a[href*="/p/"]')]
    .map(a => a.href.replace(/\?.*/, ''))
    .filter(h => h.includes('/en/p/') || h.includes('/fr/p/') || h.includes('/de/p/'))
)]
copy(links.join('\n'))
console.log(`Copied ${links.length} links`)
```

> `copy()` always returns `undefined` — that's normal. Content IS copied to clipboard.

**C) Repeat for each category page. Collect all unique links.**

**D) Build seed script for this market:**

Create `scripts/seed-[lang]-links.mjs` modeled on `scripts/seed-en-links-final.mjs`:
- Set `BRAND` = new brand UUID from Step 1.1
- Set `OID` = Owner ID
- Set `B` = base URL for this market (e.g. `https://www.doterra.com/FR/fr/p`)
- Paste collected slugs as entries

```bash
node scripts/seed-[lang]-links.mjs
```

**Expected output:**
- ✅ 70–150 product URLs inserted from real DOM (no guessing)
- ✅ Slugs verified by definition (came from rendered links, not invented)
- ✅ Saturation: Single Oils, Blends, Supplements, Kits

---

### Step 1.3: Manual curation Link Expert (10 min)

- [ ] Open dashboard → Brands → [new brand] → Link Expert
- [ ] Verify these 10 priority products exist and URLs work:
  `Lavender`, `Peppermint`, `On Guard`, `Frankincense`, `Tea Tree`,
  `Lemon`, `Wild Orange`, `Deep Blue`, `Serenity`, `DigestZen`
- [ ] Add manual CTAs: Foundational Bundle / Starter Kit equivalent for that market
- [ ] Mark broken or irrelevant slugs as `active = false`

---

### Step 1.3b: Touch products verification (mandatory for EN/US)

Touch products have **different slugs** from their standard counterparts. The scraper often misses them or conflates them.

**US/EN Touch slug pattern:** `[product]-touch-blend-oil` (note: `-blend-`)
**ES Touch slug pattern:** `[product]-touch-oil` (no `-blend-`)

Verify these Touch products exist in Link Expert for EN/US:
- `lavender-touch-blend-oil`
- `peppermint-touch-blend-oil`
- `frankincense-touch-blend-oil`
- `on-guard-touch-blend-oil`
- `breathe-touch-blend-oil`
- `digestzen-touch-blend-oil`
- `adaptiv-touch-oil`
- `serenity-touch-blend-oil`
- `balance-touch-blend-oil`
- `deep-blue-touch-oil`
- `doterra-cheer-touch-uplifting-blend-oil`
- `console-touch`
- `doterra-forgive-touch-renewing-blend-oil`
- `doterra-motivate-touch-encouraging-blend-oil`
- `doterra-passion-touch-inspiring-blend-oil`
- `doterra-peace-touch-reassuring-blend-oil`

Test: generate 1 draft article on topic "Touch oils" → verify all links point to specific product pages, not generic `/shop/`.

---

### Step 1.3c: Verify Starter Kits / Enrollment Bundles

The initial scraper often skips `enrollment-kits` category. Verify manually.

Minimum kit coverage required:
- [ ] `foundational-wellness-bundle`
- [ ] `home-essentials-enrollment-kit`
- [ ] `natural-solutions-enrollment-kit`
- [ ] `vmg-eo-mega` (Lifelong Vitality Pack)
- [ ] `healthy-habits-enrollment-kit`
- [ ] `essentials-kit`
- [ ] At least 10-15 kits total

> **DB category for kits:** `cta` (NOT `product` — check constraint enforced)
> **Priority:** 7-9 (high — these are conversion drivers)

Scrape `enrollment-kits` category directly if missing:
```
https://www.doterra.com/US/en/pl/enrollment-kits
```

> ⚠️ **KIT URL PATTERN PER MARKET (scoperta DE launch, 24/6/2026):**
> 
> | Market | Kit collection page | Spelling | Example slug |
> |---|---|---|---|
> | US/EN | `doterra.com/US/en/pl/enrollment-kits` | `enrollment-kits` (double-L) | `home-essentials-enrollment-kit` |
> | DE/EU | `shop.doterra.com/DE/de_DE/shop/collections-kits` | `enrolment-kits` (single-L) | `home-essentials-enrolment-kit` |
> | Other EU | `shop.doterra.com/[CC]/[cc_CC]/shop/collections-kits` | `enrolment-kits` (single-L) | Varies — scrape target market |
> 
> **REGOLA ASSOLUTA:** MAI copiare slug kit da un market ad un altro. Ogni market ha i propri slug. Scrapare SEMPRE la pagina kit del market target e HEAD-testare ogni URL. US `enrollment` ≠ EU `enrolment`.

---

### Step 1.4: Decide footer architecture — BEFORE Lovable work

> ⚠️ This decision affects Phase 2 significantly. Make it now.

| Domain pattern | Footer approach | Notes |
|---|---|---|
| Root domain (`/blog/[slug]`) | Lovable-side component (e.g. `EnglishMandatoryFooter.tsx`) | Hardcoded in Lovable; not in `content_markdown` |
| Subdirectory (`/es/blog/[slug]`) | DB-side (`brand_dna_mandatory_footer` field) | Injected via system prompt; appended to article content |

**If Lovable-side:** SoloSEO `brand_dna_mandatory_footer` field is unused. Footer lives entirely in Lovable.
**If DB-side:** Populate `brand_dna_mandatory_footer` carefully; it appears in every generated article.

Commit to one pattern before starting Step 2.

---

### Step 1.5: Customize Brand DNA (15 min review)

- [ ] Dashboard → Brands → [new brand] → Brand DNA
- [ ] Read auto-generated DNA carefully — verify tone is culturally appropriate
- [ ] Customize Voice & Style for regional tone (e.g. DE = formal, IT = warm)
- [ ] Update Service Area (specific to market/country)
- [ ] Update Topics to Avoid (compliance per region)
- [ ] Spot-check DNA completeness: all fields filled, no placeholder text
- [ ] If Brand Alignment score visible → target 85+/100
- [ ] If DNA visually incomplete or Alignment < 70 → **STOP. Fix DNA before continuing.**

---

## ✈️ PHASE 2 — TAKEOFF: Frontend Lovable (2–3 hours)

---

### 🚨 CRITICAL RULE — LOVABLE PROMPTS (v2.3 lock)

**REGOLA ASSOLUTA quando si generano prompt per Lovable durante lancio nuova lingua:**

✅ DO:
- Generare 1 SOLO prompt UNICO E SINGOLO per ogni task
- Verificare 3 volte ogni prompt PRIMA di mostrarlo all'utente
- Considerare l'architettura "lingua blindata" — ogni lingua è isola separata (`/` = EN, `/es` = ES, `/de` = DE, `/fr` = FR, ecc.)
- NESSUNA homepage aggregata multi-lingua
- NESSUN merge feed cross-language
- Hreflang sì (SEO), ma routing/UI separato per lingua

❌ NEVER:
- Suggerire "merge with existing EN/ES/DE feeds"
- Suggerire homepage aggregata multi-lingua
- Mandare prompt bozza/draft — deve essere finale
- Errori che richiedono correzione utente

**LESSON LEARNED (25 giugno 2026):**
Durante lancio FR, mandato PROMPT B errato proponendo homepage aggregata con merge EN+ES+DE+FR feeds. Utente ha corretto. Errore evitabile.

ROOT CAUSE: Pattern mentale "homepage = lista globale articoli" è SBAGLIATO per questa architettura. Architettura corretta: ogni lingua = sito isolato con propria homepage che mostra SOLO articoli quella lingua.

**CHECKLIST PRE-PROMPT LOVABLE:**
- [ ] Il prompt è UNICO (1 task = 1 prompt)?
- [ ] Specifica esplicitamente "ONLY [language] articles, no merging"?
- [ ] Replica pattern lingua già esistente che funziona (ES/DE)?
- [ ] Verificato che routing pattern è corretto (subdirectory vs root)?
- [ ] Nessuna assunzione su "shared layout cross-language"?

---

### Step 2.1: Routes scaffolding

- [ ] Lovable: create `/[lang]/` route tree
- [ ] Copy `SpanishHeader.tsx` → `[Lang]Header.tsx` (no language switcher)
- [ ] Copy `SpanishMandatoryFooter.tsx` → `[Lang]MandatoryFooter.tsx`
- [ ] Copy `SpanishAuthorBio.tsx` → `[Lang]AuthorBio.tsx`
- [ ] Copy `SpanishArticleCard.tsx` → `[Lang]ArticleCard.tsx`
- [ ] Create `/[lang]/blog/$slug.tsx` with SSR pattern (no client fetch)

### Step 2.2: API integration

- [ ] `fetchArticles([lang])` → `/api/public/articles/[lang]`
- [ ] `fetchArticleBySlug(slug)` → `/api/public/article/[slug]`
- [ ] Use `createServerFn` — NEVER `useEffect` for article data
- [ ] Cache 1h server-side

### Step 2.3: Cache configuration — CRITICAL (lesson from EN launch)

**Apply to every data-fetching layer for the new language:**

- [ ] SoloSEO list endpoint (`/api/public/articles/[lang]`): `force-dynamic` + `Cache-Control: no-store` ✅ already set
- [ ] SoloSEO single endpoint (`/api/public/article/[slug]`): verify same
- [ ] Lovable `fetchArticles` server function: max cache TTL = 60 seconds
- [ ] Homepage merge function: max cache TTL = 60 seconds
- [ ] Sitemap: revalidate ≤ 1h

> **Without this:** articles published via cron are invisible on homepage for up to 5 minutes. The first article cached at T=0 prevents new articles from appearing until TTL expires.

### Step 2.4: Route handler conflict check

If SoloSEO has both `articles/route.ts` AND `articles/[language_code]/route.ts`:

- [ ] Confirm `/api/public/articles/[lang]` routes to `[language_code]/route.ts`, not the catch-all
- [ ] Add debug header temporarily: `'X-Debug-Handler': 'language_code'`
- [ ] Test: `curl -I https://[deploy]/api/public/articles/[lang]` → verify header present
- [ ] Remove debug header after confirmation

> Without this check, a cached catch-all response (which has no brand filter) can serve stale data to Lovable indefinitely.

### Step 2.5: SEO & Schema markup

- [ ] `head()` with title, meta description, hreflang
- [ ] Schema.org JSON-LD `BlogPosting` per article
- [ ] Schema.org JSON-LD `Organization` (root)
- [ ] OpenGraph tags + Twitter cards

### Step 2.6: GDPR Banner localization

- [ ] `cookieTranslations.ts` → add `[lang]` section
- [ ] Translate: message, accept button, decline button, privacy link text
- [ ] Test: banner appears in correct language on `/[lang]/*`
- [ ] Test: GA4 is blocked until user accepts
- [ ] Create `/[lang]/privacy` page (template translated)

### Step 2.7: Sitemap inclusion

- [ ] Verify `sitemap.xml.ts` fetches articles from new brand
- [ ] Test sitemap URL after deploy → `/[lang]/blog/[slug]` entries present
- [ ] Hreflang alternates correct

### Step 2.8: IndexNow configuration

- [ ] Verify `cron-job.org` (or equivalent) calls `notify-search-engines` endpoint after each cron run
- [ ] Endpoint must include new language article URLs in the ping payload
- [ ] Test: trigger endpoint manually → verify response includes `[lang]` URLs
- [ ] Submit sitemap to GSC for new language

> IndexNow is NOT auto-configured for new languages. Without this, new articles take days longer to index.

### Step 2.9: Performance baseline

- [ ] Build production + deploy (`vercel --prod` from `/soloseo`)
- [ ] PageSpeed on `/[lang]` homepage → target **85+ mobile**
- [ ] PageSpeed on `/[lang]/blog/[example]` → target **70+ mobile**
- [ ] Fix any major issues (CLS, LCP, render-blocking scripts)

---

## 🌍 PHASE 3 — CRUISE: Activation & 24h Test Window

### Step 3.1: Pre-activation gate — ALL must pass

- [ ] Brand DNA spot-check: complete + culturally appropriate ✅
- [ ] Link Expert: 70+ URLs, top 10 products + Touch variants + kits verified ✅
- [ ] Footer architecture decided and implemented ✅
- [ ] Lovable deployed and accessible ✅
- [ ] GDPR banner: correct language + GA4 gating ✅
- [ ] Sitemap: includes new language URLs ✅
- [ ] Cache TTL: all endpoints ≤ 60s ✅
- [ ] Route handler conflict: verified correct handler responds ✅
- [ ] PageSpeed: meets targets ✅
- [ ] Spanish brand: still publishing correctly ✅

### Step 3.2: Manual test BEFORE activating brand

> ⚠️ **ACTIVATION ORDER IS MANDATORY** (lesson from EN launch)

1. Publish 1 article manually via SoloSEO dashboard (Run Now, draft mode)
2. Publish it (set status = published)
3. Verify it appears on Lovable site within 1 minute
4. Verify `/blog/[slug]` opens correctly
5. Verify MandatoryFooter renders
6. **ONLY THEN proceed to Step 3.3**

If you activate `brand.active=true` before Lovable can serve articles → cron publishes daily articles → 404 silently on the site.

### Step 3.3: Activate brand

```sql
UPDATE brands SET active = true WHERE id = '[uuid]';
```

### Step 3.4: Force first automatic article

Wait for next 9 AM IT cron, OR force via:
- [ ] Dashboard → Brands → [new brand] → "Run Now"
- [ ] Wait 60 seconds
- [ ] Verify article generated:
  - [ ] Title 45-58 characters (count strictly)
  - [ ] Title in target language
  - [ ] 800–1100 words
  - [ ] Uses Link Expert URLs (no invented links)
  - [ ] Mandatory Footer rendered on site
  - [ ] Image generated
  - [ ] `status = published`, `published_at` = timestamp
  - [ ] `cron_runs` table shows new row ← first time this populates
  - [ ] `cost_log` table shows new row ← first time this populates

> **Note:** `cron_runs` and `cost_log` are empty during setup (Run Now does NOT populate them). They populate only after the first scheduled cron run at 9 AM IT. Do not interpret empty tables as a bug.

### Step 3.5: Live verification on site

- [ ] Open `/[lang]/blog` → article appears in list
- [ ] Click article → opens correctly
- [ ] View Page Source → article content in HTML (SSR confirmed, not JS-rendered)
- [ ] Mandatory Footer visible with working links
- [ ] Mobile rendering OK

### Step 3.5b: Force vercel --prod post Run Now — OBBLIGATORIO

> **GOTCHA (scoperta DE launch, 24/6/2026):** brand creato o articoli inseriti dopo un deploy possono NON essere visibili via API Vercel a causa di un bug `@supabase/ssr` runtime con brand small-article-count. `.order('published_at')` ritorna dati stantii o parziali anche dopo `force-dynamic`. Il fix è già nel codice (sort JS), ma il deploy deve avvenire DOPO la creazione del brand e del primo articolo.

1. Crea brand e primo articolo (Run Now o manuale)
2. Verifica articolo in DB: `SELECT id, status, featured_image FROM articles WHERE brand_id='...'`
3. **Esegui `vercel --prod`** dalla cartella `/soloseo`
4. Attendi deploy READY
5. Verifica: `curl https://soloseo-alpha.vercel.app/api/public/articles/[lang]` → deve ritornare count corretto con `featured_image` popolato
6. Solo se check ✅ → procedi con Step 3.6

### Step 3.6: Search engine notification

- [ ] GSC: URL Inspection on new pillar article → Request Indexing
- [ ] Verify next IndexNow ping includes new URLs
- [ ] Verify sitemap submitted/updated in GSC

### Step 3.7: Analytics verification

- [ ] GA4 Realtime: visit `/[lang]` → active user visible
- [ ] Page path tracked correctly (e.g. `/blog/[slug]`)

### Step 3.8: 24h cron test window

- [ ] Wait until next 9 AM IT (next cron window)
- [ ] Verify automatic article published for new brand
- [ ] Check cost per article → expected ~$0.08–$0.15
- [ ] Check Health dashboard → cron success status ✅
- [ ] Check `cron_runs` row: `brands_processed ≥ 2`, `articles_created ≥ 2`

---

## 🛬 PHASE 4 — LANDING: Initial Backlinks (1 hour + ongoing)

### Step 4.1: Social signals (day 1)

- [ ] Post pillar article on personal social (IG, FB, LinkedIn)
- [ ] Update bio/linktree with new language URL

### Step 4.2: Quora / Reddit seeding (week 1)

- [ ] Find 3 high-traffic Quora questions in target language
- [ ] Write expert answer with link to pillar article
- [ ] Find 2 relevant subreddits → value-add comments with link

### Step 4.3: Email outreach (week 2–4, optional)

- [ ] Identify 5 wellness/aromatherapy blogs in target language
- [ ] Send personalized outreach for guest post or link exchange

---

## 📈 PHASE 5 — FIRST 30 DAYS POST-LAUNCH

### Week 1 — Daily checks:
- [ ] Health dashboard: cron published today? ✅
- [ ] Cost per article: ≤ $0.15? ✅
- [ ] Spot-check 1 article/day: correct language, no invented URLs, footer present
- [ ] Title length ≤ 58 chars? (check first 7 articles)

### Week 2 — SEO signals:
- [ ] GSC: first articles indexed? (target: 3+ indexed by day 14)
- [ ] GSC: any crawl errors? Fix immediately
- [ ] IndexNow log: pings going out daily?
- [ ] First organic impressions appearing in GSC?

### Week 3 — Traffic:
- [ ] GA4: first organic sessions? (even 1–5/day is good at this stage)
- [ ] Identify top performing article → add internal links from it
- [ ] Backlink count ≥ 3 (from Quora/Reddit seeding)

### Week 4 — Quality review:
- [ ] Brand Alignment still 85+? (re-check after 20 articles)
- [ ] Link Expert: any broken links? Deactivate them
- [ ] Add 10 new product URLs to Link Expert (market restocking)
- [ ] Review top 5 articles for on-page SEO (title, H1, density)

### Readiness for NEXT language (do NOT start until):
- [ ] 14 days of consistent auto-publishing ✅
- [ ] 3+ articles indexed in GSC ✅
- [ ] No P1 bugs in last 7 days ✅
- [ ] Backlink count ≥ 3 ✅
- [ ] Cost per article stable ✅

---

## 🚨 ABORT CHECKLIST — stop immediately if:

| Condition | Action |
|---|---|
| DNA spot-check: fields empty or placeholder text | Fix DNA before activating |
| Brand Alignment < 70 (if visible) | Fix DNA, re-run alignment |
| Link Expert < 40 URLs after scrape | Market too thin — check alternate categories |
| Touch products missing from Link Expert | Add manually before first publish |
| Lovable build fails | Frontend not ready — do not activate |
| PageSpeed mobile < 60 | Fix performance issues |
| First article uses invented URLs | Check `sanitizeProductUrls` + `affiliate_base_url` in DB |
| First article title > 65 chars | Check title constraint in `buildUserPrompt` |
| Spanish brand breaks during process | `active = false` on new brand, ROLLBACK, investigate |
| `curl /api/public/articles/[lang]` returns wrong count | Check route handler conflict (Step 2.4) |

---

## 🔁 ROLLBACK PROCEDURE

If new language launch breaks existing brands:
1. `UPDATE brands SET active = false WHERE id = '[new-uuid]';`
2. Remove Lovable routes for new language
3. Revert `cookieTranslations.ts` changes
4. Revert sitemap include
5. Run `vercel --prod` to redeploy without new language
6. Verify Spanish brand publishing correctly
7. Investigate root cause before retry

---

## 📊 SUCCESS METRICS — 24h post-launch

| Metric | Target | Weight |
|---|---|---|
| First automatic article published | ✅ | Required |
| Article accessible on live site (SSR) | ✅ | Required |
| Title ≤ 58 characters | ✅ | Required |
| Cost per article | ≤ $0.15 | Required |
| PageSpeed mobile homepage | ≥ 80 | Required |
| Health dashboard: no errors | ✅ | Required |
| GA4 tracking active | ✅ | Required |
| Sitemap submitted to GSC | ✅ | Required |
| `cron_runs` row after 9 AM | ✅ | Required |
| IndexNow pings include new URLs | ✅ | Optional |

**8/8 required** → LAUNCH SUCCESSFUL ✅
**6–7/8** → CONDITIONAL — monitor 48h before proceeding
**< 6/8** → ABORT — investigate before continuing

---

## 💬 LOVABLE PROMPT TEMPLATES

Copy-paste questi prompt in Lovable per ogni step del Phase 2.
Sostituisci `[LANG]` con il codice lingua (es. `de`), `[Language]` con il nome (es. `German`), `[BRAND_ID]` con l'UUID del brand.

---

**2.1 — Route scaffolding (MandatoryFooter + ArticleCard + Blog route)**
```
Create a new language section for [Language] ([LANG]).

1. Create component `[Language]MandatoryFooter.tsx` — copy structure from `SpanishMandatoryFooter.tsx`. 
   Footer content: "[USER TO PROVIDE — legal disclaimer in [Language]]"
   Include doTERRA enrollment link for [Language] market with OwnerID.

2. Create component `[Language]ArticleCard.tsx` — copy from `SpanishArticleCard.tsx`, same props, same layout.

3. Create route `/[LANG]/blog/$slug.tsx` — SSR only (createServerFn, no useEffect for article data).
   Fetch from: https://soloseo-alpha.vercel.app/api/public/articles/[LANG]
   Single article: https://soloseo-alpha.vercel.app/api/public/article/$slug
   Use `[Language]MandatoryFooter` and `[Language]ArticleCard` components.
   Cache: max 60 seconds server-side.
```

---

**2.2 — Homepage integration**
```
Add [Language] articles to the homepage blog section.

Fetch [Language] articles from: https://soloseo-alpha.vercel.app/api/public/articles/[LANG]
Merge with existing language feeds. Sort by published_at descending.
Show language badge ([LANG].toUpperCase()) on each card.
Cache TTL: max 60 seconds — same as other language feeds.
```

---

**2.6 — GDPR cookie banner ([Language])**
```
Add [Language] translations to cookieTranslations.ts:

Key: '[LANG]'
message: "[translate: 'We use cookies to improve your experience. You can accept or decline non-essential cookies.']"
accept: "[translate: 'Accept']"
decline: "[translate: 'Decline']"  
privacyLink: "[translate: 'Privacy Policy']"

Trigger the [LANG] banner on all routes starting with /[LANG]/.
GA4 must remain blocked until user accepts.
```

---

**2.7 — Sitemap extension**
```
Extend sitemap.xml.ts to include [Language] articles.

Fetch articles from: https://soloseo-alpha.vercel.app/api/public/articles/[LANG]
Add entries as: /[LANG]/blog/[slug]
Revalidate: 3600 (1 hour max).
Add hreflang alternates where applicable.
```

---

**2.5 — Privacy page**
```
Create page /[LANG]/privacy — translate the existing /es/privacy page into [Language].
Same structure, same legal content, correct language.
Link it from the GDPR cookie banner.
```

---

## 🗃️ AUDIT SQL — Come eseguire le query

Le query del AUDIT MODE (sezione A-D) si eseguono in uno di questi modi:

**Opzione A — Supabase Dashboard (più semplice):**
1. Apri `https://supabase.com/dashboard/project/lcgyimqfjhafdvmjsrir/sql/new`
2. Incolla la query → Run
3. Risultati visibili direttamente nella UI

**Opzione B — Claude Code con Supabase MCP (se configurato):**
Chiedi a Claude di eseguire la query direttamente tramite il connettore Supabase.

**Opzione C — psql diretto:**
```bash
psql "postgresql://postgres:[SERVICE_KEY]@db.lcgyimqfjhafdvmjsrir.supabase.co:5432/postgres"
```

> Per gli audit check C1/C2/C3 (sitemap, IndexNow, cache headers) usa `curl` dalla riga di comando o il browser.

---

## 🔄 ARTICLE REGENERATION WORKFLOW (v1.8+)

Per rigenerare un articolo esistente con nuovo contenuto e/o immagine (senza cambiare slug):

```bash
# Step 1: genera nuovo articolo come draft via API
curl -X POST "https://soloseo-alpha.vercel.app/api/generate-article" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -d '{"brand_id":"[BRAND_ID]","keyword":"[KEYWORD]","draft":true}'
# → ritorna {article:{id:"NEW_DRAFT_ID", content_markdown:..., ...}}

# Step 2: copia content sul vecchio articolo (mantieni slug originale)
# (via script Node.js — vedi scripts/regen-pillar-image.mjs come riferimento)
# UPDATE articles SET title=..., content_markdown=..., featured_image=...,
#   status='published', published_at=NOW() WHERE id = OLD_ID

# Step 3: DELETE draft
# DELETE FROM articles WHERE id = NEW_DRAFT_ID

# Step 4: rigenera immagine con buildImagePrompt + gpt-image-2 + 1792x1024
```

> ⚠️ **IMPORTANTE:** Dopo UPDATE su articoli esistenti, l'API Vercel può restituire dati stantii (bug @supabase/ssr — vedi Troubleshooting). Se l'API non mostra le modifiche dopo `vercel --prod`, fare DELETE + INSERT fresco dello stesso articolo (stesso slug, nuovo ID). I record freschi non hanno stale cache.
>
> **SLUG:** sempre invariato. Non modificare mai lo slug di un articolo esistente — rompe il routing nel SPA Lovable.

---

## 🚨 NEXT.JS DATA CACHE BUG — Fix Definitivo (24 giugno 2026)

> **LOCKED FIX v1.9** — applicare a ogni nuovo progetto Next.js 14+ con Supabase.

**PROBLEMA:** Next.js 14 Data Cache cacha automaticamente le chiamate `fetch()` interne del client Supabase, anche con `force-dynamic` + `Cache-Control: no-store` sui route handlers. Risultato: l'API ritorna stale data nonostante il DB sia aggiornato.

**SINTOMI:**
- `featured_image` stale dopo UPDATE (la vecchia immagine persiste in API)
- Articoli/contenuti stale dopo edit/publish dalla dashboard
- Modifiche manuali al DB non visibili live sul sito
- `createAdminClient()` ritorna valori vecchi anche dopo DELETE + INSERT

**FIX DEFINITIVO** — in `lib/supabase/server.ts` (o equivalent client factory):

```typescript
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      global: {
        fetch: (url: RequestInfo | URL, options?: RequestInit) =>
          fetch(url, { ...options, cache: 'no-store' }),
      },
    }
  )
}
```

**PERCHÉ FUNZIONA:** Supabase JS client usa `fetch()` internamente. Next.js 14 intercetta tutte le chiamate `fetch()` e le cacha nel Data Cache. Passando `cache: 'no-store'` al livello del client, ogni query Supabase bypassa il Data Cache di Next.js → sempre dati freschi dal DB.

**IMPATTO:** Tutti gli endpoint che usano `createAdminClient()` ora sono real-time.  
**COSTO:** Zero (nessuna API call extra, solo cache bypass).  
**APPLICATO:** 24 giugno 2026 a `lib/supabase/server.ts`.

> ⚠️ **PER OGNI NUOVO PROGETTO Next.js 14+ con Supabase:** applicare questo pattern di default in `createAdminClient()`. Non fare affidamento su `force-dynamic` o `Cache-Control: no-store` da soli — il Data Cache opera a livello più basso.

---

## 🔧 TROUBLESHOOTING

| Symptom | Root Cause | Fix |
|---|---|---|
| Slug scraper returns 0 products | JS-rendered SPA | Use Chrome DevTools method (Step 1.2) |
| Article uses invented URLs | `affiliate_base_url` not set in DB | Run migration SQL, verify brand fields |
| Article URL pattern not sanitized | New market URL format not in `sanitizeProductUrls` | Add Pattern N to function (Step 1.1c) |
| Touch products → generic shop fallback | Touch slugs missing from Link Expert | Add manually (Step 1.3b) |
| Starter kits not mentioned in articles | `enrollment-kits` category skipped | Scrape + seed manually (Step 1.3c) |
| Mandatory Footer missing | Depends on architecture (Step 1.4): DB-side → check field; Lovable-side → check component renders | Verify per architecture decision |
| Sitemap doesn't include new lang | Lovable cache or brand not fetched | Force redeploy + verify brand `active = true` |
| GDPR banner wrong language | URL path detection | Check `cookieTranslations.ts` key matches lang code |
| PageSpeed < 60 | Large images / render-blocking JS | Verify `next/image`, remove unused scripts |
| Cron didn't publish | `active = false` or keyword pool empty | Verify `brands.active` in DB + keyword table |
| `cron_runs` empty | Run Now doesn't populate it | Wait for 9 AM IT cron — this is normal |
| Cost per article > $0.20 | Long prompt / high token count | Review brand DNA length, trim if needed |
| Immagine mostra prodotto non menzionato nell'articolo | `PRODUCT_NAME_MAP` non copre anchor text in quella lingua, oppure `content_markdown` non passato | 1) Aggiungi entry mancante in `lib/image-prompt.ts` → PRODUCT_NAME_MAP 2) Deploy `vercel --prod` 3) Rigenera immagine da dashboard 4) Se persiste: gpt-image-2 varianza — retry 1x |
| List API returns fewer articles than DB | Cache TTL on endpoint or wrong handler | Check Step 2.3 + Step 2.4 |
| Article not on site despite `status=published` | Slug in DB differs from title (manual edit) | `SELECT slug FROM articles WHERE title ILIKE '%keyword%'` — use that slug |
| `curl /api/public/articles/[lang]` returns 1 but DB has 2 | CDN cached stale response OR wrong route handler hit | Add `X-Debug-Handler` header (Step 2.4); verify `no-store` header on response |
| API returns `featured_image: null` o articoli mancanti per brand new | **BUG NOTO Vercel runtime (FIX DEFINITIVO 24/6/2026):** `@supabase/ssr` `createServerClient` ha caching aggressivo Vercel che ritorna righe stale/vecchie — anche dopo UPDATE e dopo `vercel --prod`. Causa: connection pooling SSR + warm lambda. | **Fix ROOT CAUSE applicato** a `lib/supabase/server.ts`: `createAdminClient()` ora usa `createClient` da `@supabase/supabase-js` (plain, NON SSR). Production routes che fetchano da Supabase DEVONO usare questo, non `createServerClient` da `@supabase/ssr`. Fix in produzione da 24/6/2026. |
| API ritorna righe con IDs vecchi dopo DELETE + INSERT | Stessa causa sopra (SSR caching warm lambda) — righe deletate tornano nell'API | Fix uguale: switch a `@supabase/supabase-js` plain. Se temporaneamente impossibile: fare `vercel --prod` fresco e aspettare cold start. |
| Articolo appena inserito non appare in API Vercel | Vercel runtime cache / prepared statement non flushato dopo nuovo deploy | Fare `vercel --prod` dalla cartella `/soloseo`. Se persiste dopo deploy: verificare bug `.order()` sopra. |
| `generate-image` returns `Cannot read properties of undefined (reading 'toLowerCase')` | `keyword` e `title` entrambi undefined nel body — `buildImagePrompt(undefined)` chiama `.toLowerCase()` su undefined | Passa sempre `keyword` E `title` nel body della chiamata a `/api/generate-image` |
| **Endpoint API SoloSEO sbagliato (404 HTML)** | Confusione domini: `essentialsynergybr.com` = Lovable frontend, NON ha `/api/generate-article` ecc. | **API SoloSEO SEMPRE su `soloseo-alpha.vercel.app`**. Endpoints: `/api/generate-article`, `/api/generate-image`, `/api/public/articles/[lang]`, `/api/public/article/[slug]`. `essentialsynergybr.com` serve solo il frontend Lovable. |
