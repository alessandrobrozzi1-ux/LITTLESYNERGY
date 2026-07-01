import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { calculateSeoScore } from '@/lib/seo-score'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { title, content_markdown, meta_description, slug, status, published_at } = await req.json()
  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from('articles')
    .select('keyword_source, featured_image')
    .eq('id', params.id)
    .single()

  const seoScore = calculateSeoScore(
    content_markdown,
    title,
    meta_description,
    existing?.keyword_source ?? '',
    !!existing?.featured_image
  )

  const updatePayload: Record<string, unknown> = {
    title, content_markdown, meta_description, slug,
    seo_score: seoScore.score,
  }
  if (status) updatePayload.status = status
  if (published_at !== undefined) updatePayload.published_at = published_at

  const { data, error } = await supabase
    .from('articles')
    .update(updatePayload)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ article: data, seo_score: seoScore })
}
