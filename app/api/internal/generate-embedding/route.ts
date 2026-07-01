import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateEmbedding, storeArticleEmbedding } from '@/lib/embeddings'

export async function POST(req: NextRequest) {
  try {
    const { article_id, text } = await req.json()
    let brandId: string | undefined
    let input: string

    if (article_id) {
      const supabase = createAdminClient()
      const { data: article } = await supabase
        .from('articles')
        .select('brand_id, title, meta_description, content_markdown')
        .eq('id', article_id)
        .single()
      if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      brandId = article.brand_id
      input = [article.title, article.meta_description, (article.content_markdown ?? '').slice(0, 2000)]
        .filter(Boolean).join('\n')
    } else if (text) {
      input = text
    } else {
      return NextResponse.json({ error: 'article_id or text required' }, { status: 400 })
    }

    const embedding = await generateEmbedding(input)
    if (article_id && brandId) await storeArticleEmbedding(article_id, brandId, embedding)

    return NextResponse.json({ embedding, dimensions: embedding.length })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
