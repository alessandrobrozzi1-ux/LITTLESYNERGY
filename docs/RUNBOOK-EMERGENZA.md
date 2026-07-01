# 🚨 SoloSEO — RUNBOOK DI EMERGENZA (offline-readable)

**Prerequisiti** (vedi GUIDA PORTABILITÀ): dalla cartella `soloseo`, con `.env.local` presente, `npm install` fatto, `vercel login` fatto.

**Tool unico:** `node scripts/ops.cjs <comando>` (legge `.env.local`, nessun secret nel file). Lancia `node scripts/ops.cjs` senza argomenti per la lista completa.

> ⚠️ I comandi `publish` / `keywords` / `backfill` usano `CRON_SECRET` da `.env.local`: se danno 401, `.env.local` manca o è incompleto.
> ⚠️ I comandi `vercel ...` richiedono `vercel login` fatto sul portatile.

---

## ☀️ I 3 COMANDI DI SALUTE (appena sveglio — 30 secondi)

```bash
node scripts/ops.cjs health
```
Stampa 3 righe:
- **① brand attivi : 11/11 ✅**
- **② articoli oggi: 11/11, senza foto: 0 ✅**
- **③ sito (API)   : HTTP 200 ✅**

Tutto ✅ → relax. Una riga ⚠️ → vai al problema sotto:
- ① ≠ 11 → un brand si è disattivato (raro) → **Problema 1**
- ② < 11 → cron non ha pubblicato tutto → **Problema 1**
- ② "senza foto: N>0" → backfill non ha drenato → **Problema 2**
- ③ ≠ 200 → sito/API giù → **Problema 3**

Dettaglio: `node scripts/ops.cjs today` (articoli+foto per brand) · `node scripts/ops.cjs site` (11 lingue) · `node scripts/ops.cjs nullimg`

---

## 1. ❌ Cron non ha pubblicato (mattina senza articoli nuovi)

- **SINTOMO:** `health` riga ② mostra meno di 11 (o 0) articoli oggi.
- **DIAGNOSI:**
  ```bash
  node scripts/ops.cjs today
  ```
  → riga finale "brand SENZA articolo oggi: ⚠️ xx,yy". Se è **0 articoli totali** = il cron Vercel non è proprio partito (Hobby a volte salta/ritarda). Se è **parziale** (es. 8/11) = alcuni brand saltati.
- **FIX:** ri-triggera il publish a mano (la *guard* salta i brand già pubblicati oggi → riempie solo i mancanti):
  ```bash
  node scripts/ops.cjs publish
  ```
  Poi genera le foto dei nuovi articoli:
  ```bash
  node scripts/ops.cjs backfill
  ```
  *(Se mancano TANTI brand, rilancia `publish` 1-2 volte: ogni run, col cap 60s, ne pubblica un po'.)*
- **VERIFICA:**
  ```bash
  node scripts/ops.cjs today      # → "brand SENZA articolo oggi: nessuno ✅"
  ```

---

## 2. 🖼️ Articoli pubblicati ma SENZA foto (backfill non ha drenato)

- **SINTOMO:** `health` riga ② "senza foto: N>0", o visivamente manca l'immagine su `/xx/blog/...`.
- **DIAGNOSI:**
  ```bash
  node scripts/ops.cjs nullimg
  ```
  → lista esatta degli articoli published con `featured_image=null`.
- **FIX:** drena tutto a mano (ogni call genera 1 immagine, ~50s; il comando cicla fino a 0):
  ```bash
  node scripts/ops.cjs backfill
  ```
  *Causa probabile:* cron-job.org non ha pingato (→ Problema 6). Questo fix risolve l'OGGI; per il futuro controlla cron-job.org.
- **VERIFICA:**
  ```bash
  node scripts/ops.cjs nullimg    # → "✅ 0 articoli published senza foto"
  ```

---

## 3. 🌐 Sito giù / pagina non carica

- **SINTOMO:** essentialsynergybr.com/xx/blog non carica, o `health` riga ③ ≠ 200.
- **DIAGNOSI:**
  ```bash
  node scripts/ops.cjs site        # public API 11 lingue
  vercel ls --prod                 # ultimo deploy: ● Ready?
  ```
  Interpreta:
  - **`site` tutte ≠ 200** = backend/Vercel giù → vedi FIX-A.
  - **`site` tutte 200 ma il SITO non carica** = problema **frontend Lovable** (non il tuo backend) → vedi FIX-B.
  - **una sola lingua ≠ 200** = problema dati di quel brand (raro) → `node scripts/ops.cjs today`.
- **FIX:**
  - **A (Vercel):** se `vercel ls --prod` NON è ● Ready o un deploy recente ha rotto qualcosa → ri-deploya l'ultimo buono:
    ```bash
    vercel --prod --yes
    ```
    *(Nota: un deploy fallito NON sostituisce la produzione — il sito resta sull'ultimo deploy READY. Vedi Problema 5.)*
  - **B (Lovable):** apri il pannello Lovable di essentialsynergybr.com → è lato frontend, **non si fixa dal repo**. Controlla lo stato Lovable / l'ultima modifica fatta lì.
- **VERIFICA:**
  ```bash
  node scripts/ops.cjs site        # → 11/11 HTTP 200 ✅
  ```

---

## 4. ⚠️ Articolo con claim/prezzo sbagliato (fix LIVE)

- **SINTOMO:** vedi un prezzo (€/$/zł) o un claim vietato (lifetime/income/therapeutic) in un articolo pubblicato.
- **DIAGNOSI:** trova dove (cerca il termine in tutti i published):
  ```bash
  node scripts/ops.cjs find "€"
  node scripts/ops.cjs find "lifetime"
  node scripts/ops.cjs find "terapéutico"
  ```
  → stampa `[lang] slug → …contesto…`. Copia la **frase ESATTA** da correggere.
- **FIX:** sostituzione mirata + re-embed automatico (copia-incolla la frase vecchia ESATTA tra virgolette):
  ```bash
  node scripts/ops.cjs fix <slug> "frase vecchia esatta" "frase nuova"
  ```
  Esempio:
  ```bash
  node scripts/ops.cjs fix beneficios-do-oleo-de-hortela-pimenta "por apenas 20€" "a um preço de membro"
  ```
  *(Il contenuto è nel DB, non serve deploy: la correzione è LIVE appena salvata. Il footer/CTA invece è lato Lovable.)*
- **VERIFICA:**
  ```bash
  node scripts/ops.cjs find "frase vecchia esatta"   # → "✅ nessuna occorrenza"
  ```
  *(Se il problema è sistemico — stesso claim su molti articoli — apri Claude Code e chiedi un batch tipo la sessione del 30/6, non fixare a mano 1 a 1.)*

---

## 5. 🚀 Deploy fallito (`vercel --prod` dà errore)

- **SINTOMO:** `vercel --prod --yes` → error.
- **🟢 PRIMA DI TUTTO, RESPIRA:** un deploy fallito **NON manda giù il sito** — la produzione resta sull'ultimo deploy ● Ready. Verifica con `node scripts/ops.cjs site` (se 200, il sito è su, hai tempo).
- **DIAGNOSI:** leggi il messaggio d'errore. Cause tipiche:
  - "not authorized / please log in" → non sei loggato.
  - "project not linked" / chiede di linkare → manca il link.
  - errore di **build** (TypeScript/compile) → l'errore indica file:riga.
- **FIX:**
  - non loggato: `vercel login`
  - non linkato: `vercel link` → scegli **brondors-projects/soloseo**
  - build rotta da una TUA modifica recente: annulla la modifica e ri-deploya:
    ```bash
    git diff                      # vedi cosa hai toccato
    git checkout -- <file>        # annulla la modifica che rompe
    vercel --prod --yes
    ```
- **VERIFICA:**
  ```bash
  vercel ls --prod                 # ultimo = ● Ready
  node scripts/ops.cjs site        # 11/11 200
  ```

---

## 6. ⏰ cron-job.org auto-disabilitato / non pinga più

- **SINTOMO:** ogni mattina si accumulano articoli senza foto (Problema 2 ricorrente), o la dashboard cron-job.org mostra il job rosso/disabilitato.
- **DIAGNOSI:** prima verifica che l'ENDPOINT funzioni (il problema è cron-job.org, non il backend):
  ```bash
  node scripts/ops.cjs backfill    # se risponde HTTP 200 → l'endpoint è sano, è cron-job.org che non pinga
  ```
  Poi apri **cron-job.org → il job soloseo** → guarda: è "Attivo"? Ultima esecuzione? History.
- **FIX (su cron-job.org):**
  1. Riattiva il toggle **"Attiva cronjob"** se è spento.
  2. Verifica che sia ancora tutto a posto: **Timezone UTC**, schedule **`*/3 7-8 * * *`**, header **`Authorization: Bearer <CRON_SECRET>`** presente, e **"disabilita per troppi fallimenti" = OFF**.
  3. Intanto svuota il backlog di oggi a mano: `node scripts/ops.cjs backfill`.
- **VERIFICA:** cron-job.org mostra "Prossime esecuzioni" + il job Attivo; e:
  ```bash
  node scripts/ops.cjs nullimg     # → 0
  ```

---

## 🆘 Se nulla funziona / non capisci
Apri **Claude Code** nella cartella `soloseo` (la skill `soloseodoterra` si carica) e descrivi il sintomo + incolla l'output di `node scripts/ops.cjs health`. Hai tutto il know-how operativo lì.

**Backup salvavita** (se serve ripristinare): dump DB in `OneDrive\Desktop\CLAUDE CODE\db-backup-soloseo\` + `docs/db-backup/` (brands+articles in git).
