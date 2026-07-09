// Hero image generation via fal.ai FLUX.2 [turbo]. Replaces OpenAI gpt-image-2.
// Returns RAW image bytes (Buffer); callers keep their own sharp→webp conversion + Storage upload.
// The prompt is passed through UNCHANGED (buildImagePrompt output).
// FAL_KEY lives in env (Vercel, Davidino account) — never hardcoded.
// Model slug is env-overridable (FAL_MODEL) so a slug change needs no redeploy.

const FAL_MODEL = process.env.FAL_MODEL || 'fal-ai/flux-2/turbo'

/**
 * Generate one hero image from a prompt and return its raw bytes.
 * @param prompt  image prompt (unchanged from buildImagePrompt)
 * @param width   default 1792 (blog hero); pass 1024 for a vertical Pinterest pin
 * @param height  default 1024 (blog hero); pass 1536 for a vertical Pinterest pin
 */
export async function generateHeroImage(prompt: string, width = 1792, height = 1024): Promise<Buffer> {
  const key = process.env.FAL_KEY
  if (!key) throw new Error('FAL_KEY missing from environment')

  const res = await fetch(`https://fal.run/${FAL_MODEL}`, {
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
    throw new Error(`fal ${FAL_MODEL} HTTP ${res.status}: ${detail.slice(0, 300)}`)
  }

  const data = (await res.json()) as { images?: Array<{ url?: string }> }
  const url = data.images?.[0]?.url
  if (!url) throw new Error('fal returned no image url')

  const imgRes = await fetch(url, { signal: AbortSignal.timeout(30000) })
  if (!imgRes.ok) throw new Error(`fal image download HTTP ${imgRes.status}`)
  return Buffer.from(await imgRes.arrayBuffer())
}
