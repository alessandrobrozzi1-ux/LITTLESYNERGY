import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import sharp from 'sharp'
import { buildImagePrompt, NICHE } from '@/lib/image-prompt'
import { generateHeroImage } from '@/lib/hero-image'

export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    const { article_id, title, keyword, image_style, size, target } = await req.json()
    if (!article_id) return NextResponse.json({ error: 'article_id required' }, { status: 400 })

    // Backward compatible: default horizontal 1792x1024 → featured_image (blog).
    // Pinterest vertical pins pass size='1024x1536' + target='pinterest_image' (additive, never touches featured_image).
    const imgSize: '1792x1024' | '1024x1536' = size === '1024x1536' ? '1024x1536' : '1792x1024'
    const targetColumn: 'featured_image' | 'pinterest_image' = target === 'pinterest_image' ? 'pinterest_image' : 'featured_image'

    const supabase = createAdminClient()

    const { data: articleData } = await supabase.from('articles')
      .select('slug, content_markdown, brands(language_code, brand_dna_image_style)')
      .eq('id', article_id).single()
    const brand = articleData?.brands as { language_code?: string; brand_dna_image_style?: string } | null
    const langCode = brand?.language_code ?? 'en'
    const effectiveStyle = image_style ?? brand?.brand_dna_image_style ?? undefined
    const prompt = await buildImagePrompt(keyword || title, effectiveStyle, NICHE, articleData?.content_markdown ?? undefined, langCode, articleData?.slug)

    const [imgW, imgH] = imgSize.split('x').map(Number)
    const generateImage = async () => generateHeroImage(prompt, imgW, imgH)

    // 1 automatic retry on failure
    let pngBuffer: Buffer
    try {
      pngBuffer = await generateImage()
    } catch {
      await new Promise(r => setTimeout(r, 3000))
      try {
        pngBuffer = await generateImage()
      } catch (e) {
        return NextResponse.json({ error: `No image returned after retry: ${(e as Error).message}` }, { status: 500 })
      }
    }

    // Convert raw bytes → WebP (q85, ~15x smaller). Fallback PNG if sharp fails.
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
