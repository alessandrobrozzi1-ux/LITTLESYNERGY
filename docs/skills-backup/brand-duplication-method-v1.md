---
name: brand-duplication-method
description: PLAYBOOK per clonare un nuovo brand affiliate doTERRA dall'architettura esistente (SoloSEO/LittleSynergy). Porta da "ho un'idea + un dominio" a "brand live e autopilot" senza ripetere gli errori già pagati. Copre: decisioni account (Vercel/Supabase del proprietario che paga vs GitHub di chi lavora), scaffold tecnico, schema DB Supabase, adattamento DNA + blocco compliance di nicchia (doppia difesa prompt+scan), deploy col token giusto, primo draft di verifica prima di attivare, backfill armato PRIMA di active=TRUE, remix frontend Lovable con repoint API su TUTTE le lingue + differenziazione visiva (rete backlink), backup GitHub separato, skill di manutenzione. Include le TRAPPOLE (cache=browser, OneDrive, codici-paese doTERRA, env Sensitive, retry-ciechi=orfani, 60s Hobby). Use trigger: clona brand, nuovo brand doterra, duplica brand, brand duplication, launch new brand, playbook brand, metodo duplicazione.
triggers:
  - "clona brand"
  - "duplica brand"
  - "nuovo brand doterra"
  - "brand duplication"
  - "launch new brand"
  - "playbook brand"
  - "metodo duplicazione brand"
---

# Brand Duplication Method — Playbook impero oli doTERRA

> Da "idea + dominio" a "brand live e autopilot". Ogni 🚨 è un errore già pagato su SoloSEO/LittleSynergy: seguilo e non lo ripeti. Le skill dei singoli brand (`soloseodoterra`, `littlesynergy`) sono le istanze concrete di questo metodo — consultale per i valori reali.

**Regola d'oro:** ogni brand nasce PULITO. Si tara compliance, tono e lunghezza **prima** di `active=TRUE` (§5), non dopo. Un cron che parte su un brand mal tarato accumula articoli sbagliati ogni notte.

---

## FASE 0 — DECISIONI PRIMA DI TOCCARE CODICE

- **Nicchia + lingue:** quante, quali mercati (ogni lingua = 1 brand nel DB).
- **OwnerID doTERRA (chi monetizza):** 🚨 **OwnerID accettato ≠ monetizzabile.** Verifica in back office che monetizzi sui mercati scelti. Gli ID possono essere **diversi per mercato** (es. Spagna di uno, LatAm di un altro) — mappali esplicitamente, non assumere uno solo.
- **Account (separali dove serve):**
  - Vercel + Supabase = **chi paga i free tier** (es. Davidino).
  - GitHub backup = **chi ci lavora col suo setup** (es. Alessandro).
  - API key OpenAI/Anthropic = riuso (billing di chi le presta) o nuove.
  - Possono NON coincidere. Decidi ORA e usa il `--token`/credenziali giusti in ogni fase.
- **Compliance di nicchia:** ogni nicchia ha i suoi rischi (bambini = dosaggi/età numeriche; salute adulti = claim medici; income = FTC). **Definisci il blocco compliance PRIMA**, con **doppia difesa**: blocco system-prompt + scan regex. La teoria non basta (vedi §5).

---

## FASE 1 — SCAFFOLD (clone tecnico)

- Copia il repo pilota **ESCLUDENDO** `node_modules`, `.next`, `.env.local`/`.env*`, `.git`, **`.vercel`** (🚨 il `.vercel` porta il link al progetto Vercel del pilota → deve NON essere ereditato). Robocopy/rsync con esclusioni.
- `npm install`, `git init` pulito (nuovo branch `main`).
- Verifica `.gitignore` copra `.env*.local`, `.env*.real`, `.vercel`, `node_modules`.
- 🚨 **NEUTRALIZZA gli script legacy:** molti one-off del pilota **hardcodano l'URL Supabase del pilota** (`const supabaseUrl = 'https://<ref-pilota>.supabase.co'`) → sostituiscili con `process.env.NEXT_PUBLIC_SUPABASE_URL` (sennò girano contro il DB sbagliato). Rimuovi anche log/CSV/artefatti del pilota.

---

## FASE 2 — DB (Supabase target)

- Ricostruisci lo **schema SQL** dal pilota: tutte le tabelle (brands, articles, editorial_themes, link_expert, keywords, keywords_history, cron_runs, cost_log, article_embeddings) + `create extension vector` + indice `ivfflat` + **RPC `find_related_articles`** + RLS.
- Incollalo nel **SQL Editor** del Supabase target → atteso "Success. No rows returned". Verifica nel Table Editor.
- 🚨 **Lo schema SQL NON crea i bucket Storage.** Crea a mano il bucket **`article-images` (public)**, altrimenti `generate-image` dà "Storage upload failed: Bucket not found".

---

## FASE 3 — ADATTA IL CODICE

- **DNA dei brand** (`brand-dna-templates`) per ogni lingua: business type, service area, **topics-to-avoid** (metti anche i divieti di nicchia), key themes, **brand voice** (il TOV), mandatory footer/disclaimer.
- **Editorial themes** per lingua (keyword nella lingua target, incluso un tema "how to buy" per il pillar).
- **Blocco compliance di nicchia** nel system-prompt (`generate-article`), sempre-attivo, + eredita i blocchi universali (income zero-tolerance, CPTG, no-prezzi, no-a-vita, meccanismo libero, nomi nativi, no em-dash, **titoli senza due punti**).
- **Author lines** + **footer package** (OwnerID target, gateway per mercato, pillar link, WhatsApp, "Team" localizzato mai nomi reali).
- **`ops.cjs` + `healthcheck`:** `ORDER` = le lingue del brand; aggiungi la **colonna compliance di nicchia** allo scan (regex per-lingua) = la seconda metà della doppia difesa.
- 🚨 **LUNGHEZZA vs cap 60s:** se il TOV è più caldo/lungo, il testo può sforare i 60s Hobby → il cron crea orfani. Tara `LENGTH_CONFIG` (medium più stretto) + una regola "conciseness" e **ri-testa i tempi** (§5/§6) finché un articolo normale sta comodo <60s.

---

## FASE 4 — DEPLOY (Vercel target)

- Crea/linka il progetto Vercel **col token del proprietario target** (`vercel whoami --token` per confermare l'account giusto PRIMA).
- 🚨 Progetto creato via `projects add` nasce **senza framework preset** → il primo deploy fallisce "No Output Directory named 'public'". Fix: **PATCH `framework=nextjs`** via API (`PATCH /v9/projects/{id}` `{"framework":"nextjs","buildCommand":null,"outputDirectory":null}`).
- **TUTTE le env** su Vercel Production: Supabase (URL/anon/service), OpenAI, **Anthropic vera**, **CRON_SECRET NUOVO** (generane uno dedicato, mai riusare quello del pilota).
- 🚨 Le API key riusabili: `vercel env pull` dal pilota **NON restituisce le var "Sensitive"** (tornano vuote `""`) → mettile **a mano** nella dashboard/CLI del target. (La key OpenAI locale del pilota spesso è reale e riusabile; la Anthropic locale è spesso un placeholder.)
- `vercel --prod` → verifica READY + endpoint `/api/public/articles/{lang}` risponde `[]` (non 500).
- 🚨 **`--token` del proprietario target su OGNI comando Vercel** (mai mischiare account).

---

## FASE 5 — PRIMO CONTENUTO (verifica PRIMA di attivare)

- `create-brand` (**active=FALSE**) + seed **Link Expert** (slug prodotto per mercato; riusa il catalogo EU condiviso se serve, verifica in browser non con curl batch) + **pillar** ("how to buy").
- 🚨 **GENERA IL PRIMO DRAFT E LEGGILO:** è la PROVA che la compliance di nicchia regge sul **contenuto reale**, non solo in teoria. Genera un tema che **stressa** i divieti (per bambini: un articolo d'uso, non solo il pillar acquisto). **Tara DNA/tono/blocco ORA**, prima dell'attivazione. Lezione: il modello ha scritto dosaggi numerici e età-soglia nonostante il prompt → lo scan li ha presi, si è rafforzato blocco+scan, si è ri-generato.
- 🚨 **RETRY ALLA CIECA = DUPLICATI:** `generate-article` **inserisce l'articolo PRIMA di rispondere**. Se sfora i 60s e "sembra fallito" (HTTP 000/timeout), **NON ritentare** → **controlla il DB**, è probabilmente salvato. Ritentare crea orfani (uno aveva perfino prezzi inventati).
- **Articoli lunghi (pillar) che sforano i 60s:** generali in **LOCALE** con `npm run dev` (`next dev`, nessun cap) → `POST localhost:3000/api/generate-article`; immagine via prod.
- **Pulizia orfani/duplicati per-slug:** inventario (id/slug/parole/img/scan) → tieni 1 per slug (il completo con immagine, scan pulito) → cancella gli altri **solo se `status='draft'`** (guard). 🚨 Attento ai duplicati coi **prezzi/claim** — quelli vanno eliminati di sicuro.
- Scan compliance sui draft (incl. colonna nicchia) → **0 residui reali** (distingui i falsi positivi noti: domande FAQ, negazioni).

---

## FASE 6 — AUTOPILOT (blindare)

- 🚨 **BACKFILL ARMATO PRIMA DI active=TRUE.** Su Hobby l'orchestratore `daily-publish` muore a 60s (più brand + immagine inline) → immagini `null`. Il fix è il pinger esterno:
  - **cron-job.org** (account target), GET `https://<app>.vercel.app/api/cron/backfill-images`
  - schedule `*/3 <ora-publish> * * *` **UTC** (subito dopo il `daily-publish`)
  - header `Authorization: Bearer <CRON_SECRET>`, **auto-disable OFF**
  - "Run now" di prova → atteso `{done:0,remaining:0}` (gating 401 senza auth).
  - Sennò la **prima notte** = immagini scoperte.
- Verifica i cron Vercel registrati+enabled (project object `crons.definitions`, non l'endpoint `/crons` che dà 404).
- Pubblica i keeper (`status=published`) → `active=TRUE` sui brand → **healthcheck (0 residui reali)** → checkpoint. Il TESTO si salva sempre <60s (nessun orfano-di-testo); le immagini le copre il backfill = **operating point provato su Hobby**.

---

## FASE 7 — FRONTEND (Lovable, qualità SEO/GEO)

- **REMIX del progetto Lovable pilota** (eredita SEO/hreflang/sitemap/GEO/qualità già rodati).
- 🚨 **REPOINT API SU TUTTE LE LINGUE (non solo la prima!):** **search & replace globale** `URL-API-pilota` → `URL-API-nuovo` in tutto il progetto (lista + singolo articolo + sitemap + RSS, per OGNI lingua). **TRAPPOLA #1:** l'ES di LittleSynergy pescava articoli di SoloSEO perché fu ripuntato solo l'EN. Verifica ogni lingua dopo.
- Rimuovi le **lingue non usate** (route/switcher/sitemap/hreflang/RTL); adatta **footer/routing** (root + subdirectory per le altre lingue).
- 🚨 **DIFFERENZIA VISIVAMENTE dal pilota** (palette/font/layout diversi): serve per la **rete backlink** — siti gemelli identici = Google li legge come stessa rete = link penalizzati (PBN). La differenziazione è anche SEO, non estetica.
- Rimuovi il badge "Edit with Lovable".
- **Gotcha frontend:** nessun campo `author` (è la riga corsivo nel `content_markdown`); lista senza corpo (usa il singolo `/article/{slug}`); **CSS tabelle GFM** obbligatorio; `<html lang/dir>` per route; hreflang a livello sito (articoli non 1:1 tradotti → canonical self); GA4 + consent collegato all'init.
- **Connetti il dominio** (Lovable → add custom domain → record DNS esatti dal registrar → verify + SSL auto).

---

## FASE 8 — BACKUP + SKILL

- **Push su GitHub: repo NUOVA e SEPARATA** (nome diverso dal pilota, account di chi lavora). 🚨 Prima: scan secret (0 hardcoded → `process.env`), `.env.local` gitignored, artefatti pilota rimossi. **Guardia sul remote** (verifica che l'URL sia il repo giusto e NON quello del pilota) PRIMA di ogni push.
- **Skill di manutenzione** del nuovo brand (`~/.claude/skills/<brand>.md` + copia in `docs/skills-backup/`): compliance di nicchia (cuore), blocchi ereditati, footer/URL, ops/cron/backfill, reference IDs. **Nessun secret nel file** (referenziali per nome).
- **Clone su portatile** per lavoro 1:1: `git clone` + `npm install` + `.env.local` a mano (non è su git).

---

## 🕳️ TRAPPOLE (le abbiamo pagate, tu no)

- 🚨 **La CACHE sembra un bug:** `/es` mostra roba vecchia/del pilota → spesso è **browser/CDN**, non il backend. Verifica in **incognito** o con l'**API diretta** PRIMA di "fixare" un backend che è già giusto. (Il backend usa `cache:'no-store'`.)
- 🚨 **OneDrive MAI su un progetto live** (sync corrompe `node_modules`/`.next`/git). Cartella FUORI da OneDrive; il sync tra macchine si fa con **Git**.
- 🚨 **Token/OwnerID per mercato:** metti l'ID di chi monetizza **dove monetizza**; i token specifici (es. LatAm) vanno a chi li ha generati, anche se diverso dal proprietario principale. Documenta lo split.
- 🚨 **Codici paese doTERRA DIVERSI tra shop e gateway, e per mercato:** UK shop = host `shop.doterra.com/GB/en_GB` (non `www.doterra.com/UK`), gateway = `Country=GBR`. US/CA = `www.doterra.com/{US|CA}/en/shop`. **Verifica dal vivo, non assumere.** `doterra.com` in ritiro per Europa/UK → doterra.eu.
- 🚨 **Le API key "Sensitive" su Vercel NON escono via CLI** (`env pull` → vuote) → inseriscile a mano.
- 🚨 **Retry ciechi sui timeout 60s = orfani** (l'insert precede la risposta). Controlla il DB, non ripetere.
- 🚨 **`vercel --prod` PRIMA del primo draft** dopo modifiche ai blocchi (gli endpoint girano il codice deployato).
- 🚨 **Titoli con due punti «X: Y»** = tell da AI: vietali nel prompt in assoluto (non solo per lunghezza).

---

## ✅ CHECKLIST GO-LIVE (sintesi)

- [ ] Account/OwnerID decisi e verificati (monetizza sui mercati)
- [ ] Repo clonato pulito + script legacy neutralizzati
- [ ] Schema SQL girato + bucket `article-images` creato
- [ ] DNA + blocco compliance nicchia + scan regex (doppia difesa)
- [ ] Lunghezza tarata <60s
- [ ] Vercel target: framework=nextjs, 6 env (CRON_SECRET nuovo), `vercel --prod` READY
- [ ] Brand active=FALSE + Link Expert + pillar
- [ ] **Primo draft letto** + compliance regge + 0 residui reali
- [ ] Duplicati/orfani puliti
- [ ] **Backfill pinger armato** (cron-job.org, UTC, header) → `{done:0,remaining:0}`
- [ ] active=TRUE + healthcheck 0 residui
- [ ] Frontend remix: **API repointata su TUTTE le lingue** + differenziato visivamente + dominio connesso
- [ ] Backup GitHub (repo separata, 0 secret) + skill manutenzione + clone portatile
