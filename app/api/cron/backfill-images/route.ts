import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import sharp from 'sharp'
import { buildImagePrompt } from '@/lib/image-prompt'

export const maxDuration = 60 // Hobby cap — lavoriamo DENTRO i 60s (~1 img/call)

type PendingArticle = {
  id: string
  title: string
  keyword_source: string | null
  content_markdown: string | null
  brands: { language_code?: string; brand_dna_image_style?: string } | null
}

async function generateOneImage(
  supabase: ReturnType<typeof createAdminClient>,
  openai: OpenAI,
  a: PendingArticle
): Promise<boolean> {
  const brand = a.brands
  const langCode = brand?.language_code ?? 'en'
  const prompt = await buildImagePrompt(
    a.keyword_source || a.title,
    brand?.brand_dna_image_style ?? undefined,
    a.content_markdown ?? undefined,
    langCode
  )
  const gen = () => openai.images.generate({ model: 'gpt-image-2', prompt, n: 1, size: '1792x1024', quality: 'medium' })
  let res = await gen()
  let b64 = res.data?.[0]?.b64_json
  // 1 automatic retry (come generate-image)
  if (!b64) { await new Promise(r => setTimeout(r, 3000)); res = await gen(); b64 = res.data?.[0]?.b64_json }
  if (!b64) return false

  const png = Buffer.from(b64, 'base64')
  let out: Buffer = png, ext = 'png', ct = 'image/png'
  try { out = await sharp(png).webp({ quality: 85 }).toBuffer(); ext = 'webp'; ct = 'image/webp' } catch { /* fallback PNG */ }

  const filename = `${a.id}-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('article-images').upload(filename, out, { contentType: ct, upsert: true })
  if (error) return false
  const { data: pub } = supabase.storage.from('article-images').getPublicUrl(filename)
  await supabase.from('articles').update({ featured_image: pub.publicUrl }).eq('id', a.id)
  return true
}

async function run() {
  const t0 = Date.now()
  const supabase = createAdminClient()
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  // IDEMPOTENTE: i published più vecchi senza immagine, in coda
  const { data: pending } = await supabase
    .from('articles')
    .select('id, title, keyword_source, content_markdown, brands(language_code, brand_dna_image_style)')
    .eq('status', 'published')
    .is('featured_image', null)
    .order('published_at', { ascending: true })
    .limit(5)

  if (!pending?.length) return { done: 0, remaining: 0, message: 'no null-image articles' }

  let done = 0
  for (const a of pending as unknown as PendingArticle[]) {
    if (Date.now() - t0 > 50000) break // guard: resta sotto i 60s → ~1 img/call su Hobby
    if (await generateOneImage(supabase, openai, a)) done++
  }

  const { count: remaining } = await supabase
    .from('articles')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published')
    .is('featured_image', null)

  void supabase.from('cron_runs').insert([{ cron_name: 'backfill-images', status: 'ok', articles_created: done, brands_processed: 0, duration_ms: Date.now() - t0 }])
  return { done, remaining }
}

// 🔒 GATED da CRON_SECRET (come daily-publish / daily-keywords)
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await run())
}
export async function POST(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await run())
}
