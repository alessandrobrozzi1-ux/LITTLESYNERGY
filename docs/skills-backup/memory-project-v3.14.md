---
name: project-soloseo-next-steps
description: SoloSEO doTERRA — stato brand attivi e sistema v3.9 (7 brand incl. JP world-link, aggiornato 2026-06-29)
metadata: 
  node_type: memory
  type: project
  originSessionId: 71b8e71b-73c8-40df-a111-737354e881ce
---

Sistema SoloSEO v3.14 — **11 BRAND ATTIVI (impero completo)**: EN/ES/DE/FR/PT/RO + JP + AR (world-link) + IT + **NL + PL** (pattern prodotto). Cron a 11. Deploy via `vercel --prod` (push GitHub bloccato su Hobby). Skill v3.14.

**v3.14 (giugno) — 🇳🇱🇵🇱 NL + PL LAUNCH (10°+11° brand):** NL pillar `hoe-doterra-kopen`, PL pillar `jak-kupic-doterra` (slug forzati = footer Lovable). Entrambi pattern prodotto (Link Expert 150, `shop.doterra.com/{NL,PL}/...?OwnerID=15957920`). Nati puliti dal system-prompt v3.13 ma **scan+fix per-draft confermato necessario** (PL draft test «20-40 zł», pillar «1 PV ≈ 1 euro» sfuggiti → rimossi). Nomi PL nativi: Kadzidłowiec/Lawenda/Mięta Pieprzowa/Cytryna. Healthcheck finale **11/11 × 5 = 0 residui reali**.

**v3.13 (giugno) — CLEANUP CONTENUTI SISTEMICO + INCOME ZERO-TOLERANCE:** fix retroattivo su tutti gli articoli pre-blocchi (CPTG no-«therapeutic», 25% no-«a vita/permanent», **cifre valuta=0 ovunque**, em-dash→virgola, **income claims rimossi** — la tabella rank×$/month dell'EN `doterra-work-from-home-opportunity-guide-en` era il peggiore caso FTC/DSA). Nuovo blocco system-prompt **income ZERO-TOLERANCE** (`universalDoterraRules`, deployato). Tool nuovo **`scripts/healthcheck-quality.cjs`** (11 brand × 5 problemi: meccanismo/a-vita/cifre/therapeutic/income). **Healthcheck finale: 0 residui reali su 11×5** (solo falsi positivi noti). Lezioni: income=rischio legale max; check che CRASHA ≠ pulito; `.limit(1)` su slug duplicato draft+published colpisce la riga sbagliata (filtrare `status='published'`/`id`). ⚠️ 2 draft junk `doterra-work-from-home-opportunity-guide` (senza -en) con $ residui — non live, da decidere se eliminare.

**URL pattern:** EN=root, ES=/es/blog/$slug, DE=/de/$slug, FR=/fr/$slug, PT=/pt/$slug
**Vercel deploy:** `vercel --prod` da CLI (GitHub push bloccato su Hobby plan)

## Brand attivi — 6 LINGUE (tutti image_style v3.2 doTERRA-branded 314c)
- EN: `eceba851-228a-45cf-8775-b0f7fc9ae7de`
- ES: `a20e4f07-e572-4605-acfc-5c53355f2ada`
- DE: `1314a2d9-9ed6-475e-9235-8dffebb9384b`
- FR: `82dee695-83be-4e96-94ea-05078dea3681`
- PT: `8edf37b6-73c1-4742-862b-b4649bfa0f55`
- RO: `97933a00-3604-464a-92d6-e6ea8175cbc1` (active dal 26/6, skill v3.7, Link Expert 150, pillar `cum-cumperi-doterra`)
- JP: `398fafd9-4a2b-4642-82c9-73add6fbc134` (active dal 29/6, **world-link only**, language_code=`ja` ma path pubblico `/jp`, pillar `doterra-hajimekata-guide`. Test draft riserva: `7c53398f`)
- AR: `afc6299a-fe74-4162-b0fd-6ccceb55b8e7` (active dal 29/6, **world-link only RTL**, language_code=`ar`=path `/ar` (no mismatch), gateway `office.doterra.com/Application/index.cfm?&Country=ARE&EnrollerID=15957920` (`?&` VERBATIM), pillar `kayfiyat-shira-doterra`. Test draft riserva: `7f1bdbf2`. **Compliance Gulf** ar-only (GCC/GSO: no claim medici + no garanzia مضمون/100٪). RTL: dir=rtl sui container, ⚠️ root `<html lang="en">` da migliorare a `lang="ar"` lato Lovable)

## v3.9 — JP WORLD-LINK + 薬機法 (2026-06-29, vedi [[feedback-vercel-deploy]])
- **World-link**: JP non ha Link Expert (slug JP fragili). TUTTI i link prodotto nel corpo → gateway worldwide `https://office.doterra.com/Application/index.cfm?Country=JPN&EnrollerID=15957920`. Anchor giapponese naturale, href=gateway. Footer Lovable = stesso gateway (CTA 会員価格/25%オフ, MAI business/MLM).
- **Implementazione** (`lib/world-link-markets.ts` → `getWorldLinkUrl(lang)`): in `generate-article` il fallbackUrl del prompt = gateway per market world-link; `sanitizeProductUrls` redirige ogni link shop/www.doterra→gateway. Generalizzato ai market con `productPattern:null` (doterra-markets.js). **RO/PT/etc INVARIATI** (getWorldLinkUrl→undefined).
- **ja→jp**: builder internal-link usa `LANG_PATH_OVERRIDE={ja:'jp'}` (dati=ja API `/api/public/articles/ja`, path pubblico `/jp/blog/$slug`). Gli altri 6 brand byte-identici.
- **薬機法 compliance**: blocco system-prompt **ja-only** che vieta riferimenti neuro/fisiologici/anatomici (神経/副交感/ホルモン/血圧/免疫/脳/科学的研究…); resta su benefici esperienziali/tradizionali. Il cron eredita tutto (chiama `/api/generate-article`).
- Il cron `daily-publish` legge `brands WHERE active=true` (ora 8) → JP+AR inclusi da domani 09:00 IT, articoli published già compliant + immagine doTERRA-branded.

## v3.11 — AR/UAE WORLD-LINK + RTL + Gulf compliance (2026-06-29)
- **Identico a JP** (world-link, `getWorldLinkUrl('ar')`→gateway ARE, productPattern:null, no Link Expert) + **layer RTL** (frontend Lovable) + **Gulf compliance** ar-only.
- **Gateway ARE VERBATIM** (con `?&`): `https://office.doterra.com/Application/index.cfm?&Country=ARE&EnrollerID=15957920` — NON normalizzare il `?&`.
- **`ar`=path `/ar`** (ISO=path, NESSUN override a differenza di ja→jp).
- **Compliance Gulf** (`arCompliance` blocco ar-only in buildSystemPrompt, GCC/GSO): vieta claim medici/terapeutici E linguaggio garanzia/miracolo (مضمون/100٪/شفاء/يعالج/آمن تمامًا). UAE Advertising Council fa causa per claim non comprovati.
- **🐛 LEZIONE (in skill v3.10)**: (1) `vercel --prod` PRIMA del primo draft (sennò author EN + link negozio + compliance off); (2) pillar "acquisto" tenta linguaggio garanzia commerciale (مضمون/100٪) → scan extra compliance sui pillar Gulf. Entrambi beccati sul draft (costo zero).
- RTL render verificato live (Chrome): tabella RTL (header a destra), liste a destra, 25٪/doTERRA non rovesciati, footer package v3.10 completo (gateway+pillar link+WhatsApp).

## TABLE RENDERING (v3.7): se "tabelle malformate" → markdown DB è GFM ok, problema = CSS frontend Lovable (fix retroattivo, NO rigenerare). Cron 6 brand ~$0.37/giorno.

## STORAGE v3.8 (skill ora v3.8): immagini in Supabase Storage permanente (no URL temp OpenAI). WebP q85 via sharp in generate-image + cron daily-publish upload (~15-18× più piccole, fallback PNG). ⚠️ Il cron ha upload immagine INLINE separato da generate-image — fix storage vanno su ENTRAMBI. Cleanup orfani: find-orphan-images.mjs (referenced vs bucket). Free 1GB runway ~2-3 anni.

## Stato published (post-cleanup 2026-06-26)
EN: 8 | ES: 22 | DE: 4 | FR: 3 | PT: 1 = 38 totali

## Fix deployati (2026-06-26, commit 666f568)
- `lib/image-prompt.ts`: async buildImagePrompt + translateKeywordToEnglish (gpt-4o-mini)
- `generate-image/route.ts`: langCode da brands join
- `daily-publish/route.ts`: await buildImagePrompt + brand.language_code
- `generate-article/route.ts`: draft param fix (draft:true + status:'draft')
- `create-brand.js` v3: DEFAULT_IMAGE_STYLE auto-set per nuove lingue

## IMAGE GENERATION ARCHITECTURE v3.2 (CRITICO — mai dimenticare)
- `brand_dna_image_style` nel DB = prompt principale per le immagini
- Se NULL → DEFAULT_STYLE hardcoded → bottiglie 3D inventate (BUG)
- Se manca "doTERRA" nel testo → gpt-image-2 testa-o-croce sul brand (bottiglie generiche)
- **Testo LOCKED v3.2 (314 chars), tutti i 5 brand**: `Bright, clean lifestyle photography. Natural light, botanical elements, and doTERRA-branded essential oil bottles (amber glass, black cap, minimal white label clearly reading "doTERRA" above the oil name) arranged with diffusers in cozy home settings. Warm earth tones with pops of lavender, green, and soft amber.`
- create-brand.js v3 auto-imposta questo testo per future lingue
- Snapshot: docs/SYSTEM_SNAPSHOT_2026-06-26_5lang_brand_locked.md (commit 8a13f7b)

## ⚠️ VINCOLI OPERATIVI CRITICI (26/6/2026)
- **Vercel Hobby = cap 60s** sulle serverless function (`maxDuration:120` nel codice è IGNORATO/clampato a 60s). `generate-article` length `long` (1400-1600w) supera SEMPRE i 60s → funzione uccisa. Usare `length:'medium'` (~1000-1300w, ~50-56s, sul filo). Per `long` serve upgrade Vercel Pro (cap 300s).
- **Orphan trap**: quando la chiamata a `generate-article` va in timeout/socket-close lato CLIENT, l'articolo viene comunque INSERITO published lato server. NON ritentare alla cieca → crea duplicati published. Verificare sempre il DB prima di ritentare.
- **generate-image manuale**: passa `image_style` o (dal fix commit 78d8af6) fa fallback a `brand_dna_image_style` dal DB. Senza, cadeva su DEFAULT_STYLE → bottiglie 3D singole inventate. Il CRON passa già `brand.brand_dna_image_style`.
- **GEO prompt attivo** (commit 78d8af6): direct-answer intro, FAQ 4-6, tabella comparativa, author line localizzata, no income/medical claims. Il cron `medium` lo applica automaticamente.

## Cron schedule (ogni giorno)
- 07:47 IT: daily-keywords (7 brand × 6 keywords)
- 09:47 IT: daily-publish (7 articoli, ~$0.43/giorno) — cron `0 7 * * *` UTC = 09:00 IT, fire reale ~07:47-07:59 UTC su Hobby

## Brand IT/NL/PL (pattern prodotto, Link Expert 150 ciascuno) — TUTTI ATTIVI
- IT: `9709597d-1c02-4b1a-8d16-08ac9a37616b` (**active**, pillar `come-comprare-doterra`)
- NL: `15e4e632-bfb1-4160-8c02-8ce9956e3087` (**active**, pillar `hoe-doterra-kopen`)
- PL: `22be89f9-8297-45eb-8a56-e4c0329d79f2` (**active**, pillar `jak-kupic-doterra`)

## Pendenti
1. **PT keywords** — pending keywords < 5 (il cron le rigenera)
2. **Dedup draft junk** (opzionale, non urgente): tanti draft duplicati da timeout-insert (DE `besseren-schlaf` ×7, EN `evening-relaxation` ×5, ES ×4, ecc.) — **0 published duplicati** (sito pulito), solo clutter. I 2 EN `work-from-home-guide` junk già ELIMINATI. Un dedup-pass (tieni il più recente) è opzionale.
3. **Cleanup scripts diagnostici** in /scripts/ (decine di .mjs/.cjs test)
