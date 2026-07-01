import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { pinArticle } from '@/lib/pinterest'

export const maxDuration = 60

// POST /api/pinterest/create-pin  { article_id }
// Protected by CRON_SECRET (same as cron endpoints) — posting to Pinterest is a write action.
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { article_id } = await req.json()
  if (!article_id) return NextResponse.json({ error: 'article_id required' }, { status: 400 })

  const supabase = createAdminClient()
  const { data: article, error } = await supabase
    .from('articles')
    .select('id, slug, title, meta_description, content_markdown, keyword_source, brand_id, featured_image, pinterest_image, status, brands(language_code)')
    .eq('id', article_id)
    .single()

  if (error || !article) {
    return NextResponse.json({ error: `article not found: ${error?.message}` }, { status: 404 })
  }
  if (article.status !== 'published') {
    return NextResponse.json({ error: `article not published (status=${article.status})` }, { status: 400 })
  }

  const language_code = (article.brands as { language_code?: string } | null)?.language_code ?? 'en'

  const result = await pinArticle(supabase, { ...article, language_code })
  return NextResponse.json(result)
}
