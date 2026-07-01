# SoloSEO DB Backup — dump-2026-06-29-22-39 (v3.14, 11 brand)

Export LOGICO (dati) via Supabase service key. NESSUNA credenziale (le API key sono env var Vercel, non nel DB).

## Contenuto
- brands.json (11) — config + DNA + affiliate base per ogni brand
- articles.json (116) — TUTTI gli articoli (content_markdown, featured_image, slug, status) = il valore curato a mano
- article_embeddings.json (109) — vettori pgvector (RIGENERABILI da content via OpenAI text-embedding-3-small)
- keywords.json (380), link_expert.json (1261), pinterest_pins.json (22), editorial_themes.json (55), cron_runs.json (0)

## Restore
1. Ricrea lo schema (se DB nuovo) — vedi migrations Supabase del progetto.
2. Per ogni tabella: `sb.from('<table>').upsert(JSON.parse(fs.readFileSync('<table>.json')))`.
3. Gli embeddings si possono re-inserire da article_embeddings.json OPPURE rigenerare (backfill-embeddings-*.mjs).

## Note
- Critico/irrecuperabile = brands + articles (content). Tutto il resto è rigenerabile.
- Doppio backup: full dump qui (OneDrive) + brands/articles anche in git (repo docs/db-backup/).
