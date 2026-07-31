// Hero image generation via fal.ai FLUX.2 [turbo]. Replaces OpenAI gpt-image-2.
// Returns RAW image bytes (Buffer); callers keep their own sharp→webp conversion + Storage upload.
// The prompt is passed through UNCHANGED (buildImagePrompt output).
// FAL_KEY lives in env (Vercel, Davidino account) — never hardcoded.
// Model slug is env-overridable (FAL_MODEL) so a slug change needs no redeploy.

const FAL_MODEL = process.env.FAL_MODEL || 'fal-ai/flux-2/turbo'

// ── Modello PER-LINGUA (31 lug, ordine Alessandro): le lingue in FAL_PREMIUM_LANGS (es. "en,es")
// usano il modello premium (FAL_MODEL_PREMIUM, default flux-2/turbo — etichette leggibili);
// tutte le altre il default del brand (FAL_MODEL, tipicamente schnell). undefined = default. ──
const PREMIUM_LANGS = (process.env.FAL_PREMIUM_LANGS ?? '').split(',').map(s => s.trim()).filter(Boolean)
export function heroModelForLang(lang?: string): string | undefined {
  if (lang && PREMIUM_LANGS.includes(lang)) return process.env.FAL_MODEL_PREMIUM ?? 'fal-ai/flux-2/turbo'
  return undefined
}

/**
 * Generate one hero image from a prompt and return its raw bytes.
 * @param prompt  image prompt (unchanged from buildImagePrompt)
 * @param width   default 1792 (blog hero); pass 1024 for a vertical Pinterest pin
 * @param height  default 1024 (blog hero); pass 1536 for a vertical Pinterest pin
 */
export async function generateHeroImage(prompt: string, width = 1792, height = 1024, modelOverride?: string): Promise<Buffer> {
  const key = process.env.FAL_KEY
  if (!key) throw new Error('FAL_KEY missing from environment')
  const model = modelOverride ?? FAL_MODEL

  const res = await fetch(`https://fal.run/${model}`, {
    method: 'POST',
    headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      image_size: { width, height },
      num_images: 1,
      output_format: 'jpeg',
      enable_safety_checker: true,
    }),
    signal: AbortSignal.timeout(90000),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`fal ${model} HTTP ${res.status}: ${detail.slice(0, 300)}`)
  }

  const data = (await res.json()) as { images?: Array<{ url?: string }> }
  const url = data.images?.[0]?.url
  if (!url) throw new Error('fal returned no image url')

  const imgRes = await fetch(url, { signal: AbortSignal.timeout(30000) })
  if (!imgRes.ok) throw new Error(`fal image download HTTP ${imgRes.status}`)
  return Buffer.from(await imgRes.arrayBuffer())
}

// ═══ IMAGE SANITY GATE (nato su AromaTouch, propagato dal capofila 30 lug — versione portable) ═══
// Di rado il modello immagini restituisce un file tecnicamente valido ma CORROTTO (rumore/moiré/
// griglia di pixel senza soggetto). Dopo OGNI generazione fal, PRIMA dell'upload, l'immagine passa
// da gpt-4o-mini vision con un check binario {"ok":bool}. ok=false → UNA rigenerazione (scena
// ricomposta) → secondo check → se fallisce ancora, l'articolo resta SENZA immagine (backfill la
// ritenta) + log esplicito. CAP: max 2 generazioni + 2 check. Fail-OPEN: se il vision check è
// indisponibile (OpenAI down/key assente) l'immagine passa. Questa versione NON impone size:
// delega a generateHeroImage(prompt) col suo default (le firme divergono tra brand).
const SANITY_PROMPT = 'You are validating a machine-generated hero image. Is the image a visually coherent photo or illustration (a recognizable scene or subject), or is it corrupted output (pure noise, moiré, glitch bands, a grid/pattern of pixels with no subject, or unrecognizable garbage)? Reply ONLY with JSON: {"ok": true} if coherent, {"ok": false} if corrupted.'
const VISION_IN_PER_TOKEN = 0.15 / 1_000_000
const VISION_OUT_PER_TOKEN = 0.60 / 1_000_000

export interface SanityVerdict { ok: boolean; inputTokens: number; outputTokens: number; costUsd: number }

/** Vision check binario. null = check indisponibile (errore rete/API) → il caller fa fail-open. */
export async function checkImageSanity(image: Buffer): Promise<SanityVerdict | null> {
  const key = process.env.OPENAI_API_KEY
  if (!key) { console.warn('[image-sanity] OPENAI_API_KEY missing — fail-open'); return null }
  try {
    const sharp = (await import('sharp')).default
    const small = await sharp(image).resize({ width: 768, withoutEnlargement: true }).webp({ quality: 70 }).toBuffer()
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        max_tokens: 20,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: SANITY_PROMPT },
            { type: 'image_url', image_url: { url: `data:image/webp;base64,${small.toString('base64')}`, detail: 'low' } },
          ],
        }],
      }),
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) { console.warn(`[image-sanity] OpenAI HTTP ${res.status} — fail-open`); return null }
    const data = await res.json()
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content ?? '{}')
    if (typeof parsed.ok !== 'boolean') { console.warn('[image-sanity] malformed verdict — fail-open'); return null }
    const inputTokens = data?.usage?.prompt_tokens ?? 0
    const outputTokens = data?.usage?.completion_tokens ?? 0
    return { ok: parsed.ok, inputTokens, outputTokens, costUsd: inputTokens * VISION_IN_PER_TOKEN + outputTokens * VISION_OUT_PER_TOKEN }
  } catch (e) {
    console.warn(`[image-sanity] ${e instanceof Error ? e.message : String(e)} — fail-open`)
    return null
  }
}

const RETRY_SUFFIX = '\nALTERNATIVE TAKE: recompose the same scene from a slightly different camera angle, with a different arrangement of the same supporting objects.'

export interface ValidatedHero {
  buffer: Buffer | null
  attempts: number
  checks: number
  verdicts: (boolean | null)[]
  failedSanity: boolean
  visionInputTokens: number
  visionOutputTokens: number
  visionCostUsd: number
}

/** Genera l'immagine hero E la valida col sanity gate. CAP: max 2 generazioni + 2 check.
 * `checker` iniettabile SOLO per i test; default = checkImageSanity. */
export async function generateValidatedHeroImage(
  prompt: string,
  modelOverride?: string,
  checker: (img: Buffer) => Promise<SanityVerdict | null> = checkImageSanity,
): Promise<ValidatedHero> {
  const out: ValidatedHero = { buffer: null, attempts: 0, checks: 0, verdicts: [], failedSanity: false, visionInputTokens: 0, visionOutputTokens: 0, visionCostUsd: 0 }
  for (let attempt = 1; attempt <= 2; attempt++) {
    out.attempts = attempt
    const img = await generateHeroImage(attempt === 1 ? prompt : prompt + RETRY_SUFFIX, undefined, undefined, modelOverride)
    if (!img) {
      if (attempt === 1) await new Promise(r => setTimeout(r, 3000))
      continue
    }
    out.checks++
    const v = await checker(img)
    out.verdicts.push(v ? v.ok : null)
    if (v) { out.visionInputTokens += v.inputTokens; out.visionOutputTokens += v.outputTokens; out.visionCostUsd += v.costUsd }
    if (!v || v.ok) { out.buffer = img; return out }
    console.warn(`[image-sanity] corrupted image detected (attempt ${attempt}/2)${attempt === 2 ? ' — giving up, article stays without image (backfill will retry)' : ' — regenerating with recomposed scene'}`)
  }
  out.failedSanity = out.checks > 0
  return out
}
