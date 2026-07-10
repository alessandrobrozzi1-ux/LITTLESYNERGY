import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { buildImageAlt } from '@/lib/image-prompt'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { language_code: string } }
) {
  const supabase = createAdminClient()

  const { data: brand } = await supabase
    .from('brands')
    .select('id')
    .eq('language_code', params.language_code)
    .single()

  if (!brand) return NextResponse.json([], { status: 200 })

  // WORKAROUND: createAdminClient ora usa @supabase/supabase-js plain (non SSR)
  // per evitare bug Vercel runtime che restituisce righe stale/vecchie.
  // .order() rimosso, sort in JS. EN/ES non impattati.
  const { data: rawArticles } = await supabase
    .from('articles')
    .select('id, title, slug, meta_description, published_at, featured_image, keyword_source')
    .eq('brand_id', brand.id)
    .eq('status', 'published')

  const articles = (rawArticles ?? []).sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  ).map((a) => ({ ...a, featured_image_alt: a.featured_image ? buildImageAlt(a.title) : null }))

  return NextResponse.json(articles, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
  })
}
