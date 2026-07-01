# SYSTEM SNAPSHOT — June 25, 2026

> Punto di ritorno validato. Sistema 3 lingue in autopilot confermato dopo primo cron automatico (25 giugno 2026 9:00 AM IT).

---

## STATO OPERATIVO

3 brand attivi autopilot:

| Brand | Path | Articoli | Link Expert |
|---|---|---|---|
| EN — Essential Synergy | root `/blog/` | 7 | 140 |
| ES — Essential Synergy | `/es/blog/` | 21 | 106 |
| DE — Essential Synergy | `/de/blog/` | 3 | 115 |

**URLs production:**
- Sito: `https://www.essentialsynergybr.com`
- SoloSEO Dashboard: `https://soloseo-alpha.vercel.app`
- API lista articoli: `/api/public/articles/[lang]`
- API singolo articolo: `/api/public/article/[slug]`

---

## INFRASTRUCTURE STACK

| Layer | Service | Piano | Note |
|---|---|---|---|
| Hosting API | Vercel | Hobby | Deploy via `vercel --prod` da `/soloseo` |
| Database + Storage | Supabase | Free | 1 GB storage limit — monitorare |
| Frontend | Lovable | — | `essentialsynergybr.com` |
| Image generation | OpenAI | Pay-per-use | gpt-image-2, ~$0.011/img |
| Content generation | Anthropic | Pay-per-use | claude-haiku-4-5, ~$0.05/articolo |
| Cron | cron-job.org | Free | 3 job configurati |
| Search indexing | IndexNow | Free | Bing/Yandex ping |
| Analytics | GA4 + GSC | Free | |

**Supabase project:** `lcgyimqfjhafdvmjsrir.supabase.co`

---

## CRON SCHEDULE

| Ora (IT) | Job | Endpoint | Note |
|---|---|---|---|
| 08:00 | daily-keywords | `POST /api/cron/daily-keywords` | 6 keywords/brand (v2.0) |
| 09:00 | daily-publish | `POST /api/cron/daily-publish` | 1 articolo/brand attivo |
| 09:30 | IndexNow ping | `GET /api/public/notify-search-engines` | via cron-job.org |

Autenticazione cron: `Authorization: Bearer $CRON_SECRET`

---

## SKILL v2.0

**Path:** `~/.claude/skills/soloseodoterra.md`  
**Trigger:** `/soloseodoterra` (o parole chiave: "lancia lingua", "audit lang", "check tutto")  
**Modalità:**
- A) LAUNCH — lancia nuova lingua
- B) AUDIT — verifica stato lingua (19 check, score /19)
- C) BOTH — audit + lancio parallelo

---

## CRITICAL FILES (production)

### Backend — SoloSEO (`soloseo/`)

```
lib/
  image-prompt.ts          — content-aware image system v2.0:
                             DEFAULT_STYLE (single bottle, brand visible)
                             COLLAGE_STYLE (3 bottiglie, topic generali)
                             MULTI_PRODUCT_SCENES (schlaf/sleep/stress/immune/...)
                             PRODUCT_NAME_MAP (EN+ES+DE anchor → canonical name)
                             BOTANICAL_MAP (EN+ES+DE topic → scene description)
  keyword-scorer.ts        — 6 keywords/run (v2.0, era 15)
  supabase/server.ts       — createAdminClient: plain @supabase/supabase-js +
                             global.fetch cache:'no-store' (bypassa Next.js 14
                             Data Cache + @supabase/ssr stale-row bug)
  trends.ts                — fetchTrendingKeywords per lingua

app/api/
  cron/daily-keywords/route.ts    — genera 6 keywords/brand, inserisce in DB
  cron/daily-publish/route.ts     — pubblica 1 articolo/brand, logica:
                                    1. Scheduled keyword
                                    2. Monday = Lavender (se isAllowed())
                                    3. Pytrends trending
                                    4. Editorial theme fallback
                                    5. Best pending DB keyword
                                    6. AI fallback
                                    Lavender max 2/14 giorni (v2.0, era 3)
  generate-article/route.ts       — genera articolo + sanitize doTERRA URLs
  generate-image/route.ts         — rigenerazione manuale (gpt-image-2, 1792x1024)
  public/articles/[language_code]/route.ts  — lista articoli, force-dynamic, no-store
  public/article/[slug]/route.ts            — singolo articolo, force-dynamic, no-store
  public/notify-search-engines/route.ts     — IndexNow ping

scripts/
  create-brand.js          — clona brand (active=false default)
  lib/brand-dna-templates.js        — DNA pre-tradotto EN/ES/DE/IT/FR/PT/NL
  lib/editorial-themes-by-language.js — 5 temi + keywords in lingua target
  lib/doterra-markets.js            — URL pattern per mercato (verified/non-verified)
```

### Frontend — Lovable (`essentialsynergybr.com`)

```
src/
  english-blog/soloseo.functions.ts   — fetch EN articoli da SoloSEO API
  spanish-blog/soloseo.functions.ts   — fetch ES articoli
  german-blog/soloseo.functions.ts    — fetch DE articoli
  routes/
    blog.$slug.tsx            — EN blog post (root domain)
    es.blog.$slug.tsx         — ES blog post (/es/)
    de.$slug.tsx              — DE blog post (/de/)
    index.tsx                 — homepage (merge EN/ES/DE featured)
    sitemap[.]xml.ts          — sitemap multi-lingua
  EnglishMandatoryFooter.tsx  — footer EN con link affiliazione
  SpanishMandatoryFooter.tsx  — footer ES
  GermanMandatoryFooter.tsx   — footer DE
  cookieTranslations.ts       — GDPR banner multi-lingua
```

---

## DATABASE SCHEMA

### Tabelle principali

| Tabella | Campi chiave |
|---|---|
| `brands` | id, language_code, active, owner_id, affiliate_base_url, domain, brand_dna_*, brand_dna_image_style |
| `articles` | id, brand_id, slug, title, status, published_at, featured_image, content_markdown, keyword_source |
| `link_expert` | id, brand_id, anchor_text, full_url, category, priority, active |
| `editorial_themes` | id, brand_id, theme_name, keywords (text[]), active |
| `keywords` | id, brand_id, keyword, score, volume, difficulty, status, scheduled_date |
| `keywords_history` | id, brand_id, keyword, used_at |
| `cron_runs` | id, cron_name, status, brands_processed, articles_created, errors, duration_ms, created_at |
| `cost_log` | id, brand_id, cost_usd, tokens_used, model, created_at |

### Brand UUIDs

| Brand | UUID |
|---|---|
| EN | `eceba851-228a-45cf-8775-b0f7fc9ae7de` |
| ES | `a20e4f07-e572-4605-acfc-5c53355f2ada` |
| DE | `1314a2d9-9ed6-475e-9235-8dffebb9384b` |

---

## CRITICAL CONFIG VALUES

| Parametro | Valore |
|---|---|
| OwnerID doTERRA | `15957920` |
| WhatsApp | `+393662156309` |
| Image model | `gpt-image-2` |
| Image size | `1792x1024` (16:9 landscape) |
| Image quality | `medium` |
| maxDuration generate-image | `120s` |
| Lavender max threshold | `2 per 14 giorni` |
| Daily keywords per brand | `6` |
| Title constraint | `45–58 chars, no "X: Y" colon-subtitle` |
| Cache su endpoint public | `Cache-Control: no-store` + `force-dynamic` |
| Supabase client (server) | `@supabase/supabase-js` + `cache: 'no-store'` su global.fetch |

---

## VINCOLI ASSOLUTI (non negoziabili)

```
🚨 brand.active = true SOLO dopo test manual con "Run Now" e verifica articolo live
🚨 createAdminClient usa @supabase/supabase-js plain — MAI @supabase/ssr per route server
🚨 buildImagePrompt è UNICO entry point per image gen — MAI prompt custom hardcoded
🚨 gpt-image-2 SEMPRE — MAI gpt-image-1 (qualità inferiore)
🚨 size 1792x1024 SEMPRE — MAI 1536x1024 o altro
🚨 force-dynamic + Cache-Control: no-store su tutti gli endpoint public
🚨 SLUG articoli INVARIATI dopo pubblicazione — il cambio rompe Lovable routing
🚨 NON toccare brand attivi durante launch nuova lingua — modifiche additive only
🚨 Vercel deploy via 'vercel --prod' da cartella /soloseo — GitHub push bloccato su Hobby
🚨 Soro disattivato definitivamente dal 23 giugno 2026 — nessun fallback Soro
```

---

## METRICS SNAPSHOT (25 giugno 2026, post-primo-cron)

| Metrica | Valore |
|---|---|
| Articoli totali pubblicati | 31 (7 EN + 21 ES + 3 DE) |
| Costo medio generazione articolo | ~$0.05 |
| Costo medio generazione immagine | ~$0.011 |
| Costo giornaliero totale (3 brand) | ~$0.50 |
| Proiezione mensile (3 brand) | ~$15 |
| Status tutti i brand | 🟢 HEALTHY |
| Audit score EN | 17/19 🟢 |
| Audit score ES | 17/19 🟢 |
| Audit score DE | 17/19 🟢 |

---

## ROLLBACK PROCEDURE

### Se modifica futura rompe il sistema:

**Step 1 — Identifica regressione:**
```bash
git log --oneline --since="2026-06-25" --until="oggi"
```

**Step 2 — Revert commit problematico:**
```bash
git revert <commit-hash>
vercel --prod
```

**Step 3 — Verifica rollback:**
```bash
curl https://soloseo-alpha.vercel.app/api/public/articles/en
curl https://soloseo-alpha.vercel.app/api/public/articles/es
curl https://soloseo-alpha.vercel.app/api/public/articles/de
```
Tutti devono rispondere JSON con articoli. Se OK → rollback completato.

**Step 4 — Se git revert non disponibile:**
Restore manuale da questo file. Tutti i config values, file paths e vincoli documentati sopra.  
Skill v2.0 (`~/.claude/skills/soloseodoterra.md`) contiene i workflow completi.

---

## NEXT STEPS PIANIFICATI

- [ ] Verifica cron 26 giugno 9 AM IT — articoli con nuove logiche v2.0
- [ ] Audit EN+ES+DE post-26 giugno = 17-19/19
- [ ] Implementare Internal Linking — settimana 1 luglio 2026
- [ ] Lanciare lingua #4: IT — target lunedì 30 giugno 2026
- [ ] Scalare a 10 lingue (FR, PT, NL, PL, JA, ...)
- [ ] Backlink strategy white-hat
- [ ] Monitor 7 giorni autopilot prima di ogni nuovo lancio

---

## CHANGELOG SESSION 23–25 GIUGNO 2026

| Data | Evento |
|---|---|
| 23 giu | Soro → SoloSEO EN migration completata. Image style locked v1.3. Primo articolo EN live. |
| 24 giu | DE brand lanciato. `@supabase/ssr` stale-row bug identificato e fixato. Next.js 14 Data Cache bug fixato (`global.fetch cache: no-store`). Pillar articles EN+DE creati. Kit URL body-check workflow documentato (HEAD 200 ≠ live). Skill v1.7 → v1.9. |
| 25 giu | Primo cron autopilot confermato: EN+ES+DE pubblicano automaticamente 9 AM IT. Post-launch fix applicati: brand doTERRA sempre visibile (DEFAULT_STYLE), collage multi-prodotto per topic generali (MULTI_PRODUCT_SCENES), anti-lavender-dominance (soglia 3→2), keywords 15→6. Skill v1.9 → v2.0. Deploy production `dpl_2Xm91FPUGzRgpiPYHqpNeGzUBYJw`. |
