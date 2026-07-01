# SYSTEM SNAPSHOT — June 26, 2026
## 5 Lingue Autopilot + Image Brand Identity Locked (v3.2)

> ⚠️ **FILE IMMUTABILE.** Non modificare dopo il commit. Per cambiamenti, creare un nuovo snapshot datato.

---

## STATO OPERATIVO (26 giugno 2026 — sera)

5 brand attivi autopilot:
- 🇺🇸 **EN**: essentialsynergybr.com (root `/blog/[slug]`) — `eceba851-228a-45cf-8775-b0f7fc9ae7de`
- 🇪🇸 **ES**: essentialsynergybr.com/es (`/es/blog/[slug]`) — `a20e4f07-e572-4605-acfc-5c53355f2ada`
- 🇩🇪 **DE**: essentialsynergybr.com/de (`/de/[slug]`) — `1314a2d9-9ed6-475e-9235-8dffebb9384b`
- 🇫🇷 **FR**: essentialsynergybr.com/fr (`/fr/blog/[slug]`) — `82dee695-83be-4e96-94ea-05078dea3681`
- 🇵🇹 **PT**: essentialsynergybr.com/pt (`/pt/blog/[slug]`) — `8edf37b6-73c1-4742-862b-b4649bfa0f55`

Tutti con `brand_dna_image_style` **enhanced v3.2** (314 chars, clausola `doTERRA-branded`).

---

## IMAGE BRAND IDENTITY v3.2 — LOCKED FINAL

`brand_dna_image_style` (identico su tutti i 5 brand):
```
Bright, clean lifestyle photography. Natural light, botanical elements, and doTERRA-branded essential oil bottles (amber glass, black cap, minimal white label clearly reading "doTERRA" above the oil name) arranged with diffusers in cozy home settings. Warm earth tones with pops of lavender, green, and soft amber.
```

**Root cause storico:** prompt senza "doTERRA" → gpt-image-2 testa-o-croce sul brand (3/5 marchiate, 2/5 generiche). Fix: clausola brand esplicita → 5/5 bottiglie doTERRA-marchiate, stile lifestyle mantenuto.

---

## METRICS (26 giugno 2026 — sera, post-cleanup)

| Brand | Published | Draft | Embeddings | Link Expert |
|-------|-----------|-------|------------|-------------|
| EN | 9 | 15 | 21 | 140 |
| ES | 23 | 8 | 30 | 106 |
| DE | 5 | 13 | 16 | 117 |
| FR | 4 | 4 | 7 | 175 |
| PT | 2 | 4 | 5 | 123 |
| **TOTALE** | **43** | **44** | **79** | **661** |

> Nota draft: includono articoli di test (sleep/work-from-home) mandati in draft durante i test v3.x — NON cancellati (regola: solo `status='draft'`, mai DELETE).

Audit health: 5/5 brand 14/15 (D4 falso allarme timezone; PT C1 keywords < 5 si rigenera al cron).

---

## SKILL VERSION
`~/.claude/skills/soloseodoterra.md` → **v3.2** (IMAGE BRAND IDENTITY + OPERATIONAL CONSTRAINTS + GEO prompt)

---

## FIX APPLICATI dal SNAPSHOT 25 giugno
1. (25/6 sera) BUG `content_markdown` column definitivo
2. (26/6) Internal linking URL pattern fix
3. (26/6) Hreflang dynamic resolver Lovable
4. (26/6) Internal linking scope verify (`brand_id` isolation)
5. (26/6) Snapshot immutability rule lock
6. (26/6) PT brand launch (5° lingua)
7. (26/6) `generate-image` fallback a `brand_dna_image_style` dal DB
8. (26/6) GEO + Author system prompt upgrade (generate-article)
9. (26/6) Vercel Hobby 60s cap discovery + orphan handling
10. (26/6) Image Brand Identity v3.2 — clausola `doTERRA-branded` LOCK

---

## CRITICAL FILES POST-v3.2
- `lib/image-prompt.ts` (async buildImagePrompt + translateKeywordToEnglish; DEFAULT_STYLE last-resort)
- `lib/embeddings.ts` (vector internal linking)
- `lib/supabase/server.ts` (`createAdminClient` no-store cache)
- `lib/keyword-scorer.ts` (6 keywords/giorno)
- `app/api/generate-article/route.ts` (GEO + Author + draft fix; model claude-sonnet-4-5; `length:'medium'` only su Hobby)
- `app/api/generate-image/route.ts` (image_style DB fallback)
- `app/api/cron/daily-publish/route.ts` (Lavender 2/14 threshold; await buildImagePrompt + brand.language_code)
- `scripts/create-brand.js` v3 (DEFAULT_IMAGE_STYLE doTERRA-branded)
- `scripts/lib/brand-dna-templates.js` (multi-lingua DNA)
- `scripts/lib/editorial-themes-by-language.js`
- `scripts/lib/doterra-markets.js` (PT verified)
- `~/.claude/skills/soloseodoterra.md` v3.2

---

## DATABASE STATE (26 giugno 2026 sera)
- `articles` published: 43 (post-cleanup duplicati work-from-home)
- `article_embeddings`: 79
- `brands`: 5 active, tutti `brand_dna_image_style` enhanced v3.2 (314 chars)
- `link_expert`: EN 140, ES 106, DE 117, FR 175, PT 123

---

## COST PROJECTION 5 BRAND
- Daily: ~$0.31 (5 articoli medium + 5 immagini + translation + embedding)
- Monthly: ~$9.30
- Annual: ~$112
- vs Soro €390/mese = €4.680/anno → **savings ~€4.500/anno**

---

## OPERATIONAL CONSTRAINTS (LOCKED)
- **Vercel Hobby 60s cap**: generate-article SOLO `length:'medium'`. Mai `long` (orphan). Pro = cap 300s.
- **Orphan post-timeout**: generate-article pubblica prima della response → timeout client crea orphan. Routine: query last 5min → `status='draft'`.
- **Publish manuale**: medium, verifica DB, 1 alla volta, STOP al primo timeout.

---

## NEXT MILESTONES
- Settimana 1 luglio: monitor cron 7 giorni
- Mese 1 luglio: GSC verification + sitemap submit
- Mese 2 agosto: lancio 6° lingua (IT)
- Mese 3 settembre: backlink white-hat strategy
- Mese 4-6: lancio 7-10° lingue
- Mese 6+: valutazione brand secondari (Pet/Kids)

---

## ROLLBACK PROCEDURE
Se una modifica futura rompe il sistema v3.2:
1. `git log` da 26 giugno in poi
2. `git revert` dei commit problematici
3. Se DB corrotto: `UPDATE brands SET brand_dna_image_style='[testo v3.2 sopra]' WHERE active=true`
4. Restore manuale da questo snapshot

---

## VINCOLI ETERNI
🚨 `brand_dna_image_style` SEMPRE contiene `doTERRA-branded`
🚨 generate-article max `length='medium'` su Vercel Hobby
🚨 Articoli published >60s post-call = check orphan
🚨 Questo file snapshot IMMUTABILE post-commit
