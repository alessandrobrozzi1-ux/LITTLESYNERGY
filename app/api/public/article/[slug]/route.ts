import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { buildImageAlt } from '@/lib/image-prompt'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = createAdminClient()

  const { data: article } = await supabase
    .from('articles')
    .select('id, title, slug, meta_description, content_markdown, published_at, featured_image, keyword_source')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const payload = { ...article, featured_image_alt: article.featured_image ? buildImageAlt(article.title) : null }

  return NextResponse.json(payload, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
  })
}
