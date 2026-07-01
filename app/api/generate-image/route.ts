import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import sharp from 'sharp'
import { buildImagePrompt } from '@/lib/image-prompt'

export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    const { article_id, title, keyword, image_style, size, target } = await req.json()
    if (!article_id) return NextResponse.json({ error: 'article_id required' }, { status: 400 })

    // Backward compatible: default horizontal 1792x1024 → featured_image (blog).
    // Pinterest vertical pins pass size='1024x1536' + target='pinterest_image' (additive, never touches featured_image).
    const imgSize: '1792x1024' | '1024x1536' = size === '1024x1536' ? '1024x1536' : '1792x1024'
    const targetColumn: 'featured_image' | 'pinterest_image' = target === 'pinterest_image' ? 'pinterest_image' : 'featured_image'

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const supabase = createAdminClient()

    const { data: articleData } = await supabase.from('articles')
      .select('content_markdown, brands(language_code, brand_dna_image_style)')
      .eq('id', article_id).single()
    const brand = articleData?.brands as { language_code?: string; brand_dna_image_style?: string } | null
    const langCode = brand?.language_code ?? 'en'
    // v3.0 fix: when no image_style in body, fall back to the brand's configured style (gold standard)
    // instead of letting buildImagePrompt drop to the hardcoded DEFAULT_STYLE (fake 3D bottles).
    const effectiveStyle = image_style ?? brand?.brand_dna_image_style ?? undefined
    const prompt = await buildImagePrompt(keyword || title, effectiveStyle, articleData?.content_markdown ?? undefined, langCode)

    const generateImage = async () => openai.images.generate({
      model: 'gpt-image-2',
      prompt,
      n: 1,
      size: imgSize,
      quality: 'medium',
    })

    let response = await generateImage()
    let b64 = response.data?.[0]?.b64_json

    // 1 automatic retry on null/empty response
    if (!b64) {
      await new Promise(r => setTimeout(r, 3000))
      response = await generateImage()
      b64 = response.data?.[0]?.b64_json
    }

    if (!b64) return NextResponse.json({ error: 'No image returned from API after retry' }, { status: 500 })

    // Convert base64 → WebP (q85, ~15x smaller). Fallback PNG if sharp fails.
    const pngBuffer = Buffer.from(b64, 'base64')
    let outBuffer: Buffer = pngBuffer, ext = 'png', contentType = 'image/png'
    try {
      outBuffer = await sharp(pngBuffer).webp({ quality: 85 }).toBuffer()
      ext = 'webp'; contentType = 'image/webp'
    } catch (e) {
      console.warn(`[generate-image] WebP conversion failed, fallback PNG: ${(e as Error).message}`)
    }
    const filename = `${article_id}-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(filename, outBuffer, { contentType, upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 })
    }

    const { data: publicData } = supabase.storage.from('article-images').getPublicUrl(filename)
    const image_url = publicData.publicUrl

    await supabase.from('articles').update({ [targetColumn]: image_url }).eq('id', article_id)

    return NextResponse.json({ image_url, prompt, size: imgSize, target: targetColumn })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
