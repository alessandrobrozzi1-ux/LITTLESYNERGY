import OpenAI from 'openai'
import { createAdminClient } from '@/lib/supabase/server'

export interface RelatedArticle {
  article_id: string
  title: string
  slug: string
  similarity: number
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000),
  })
  return res.data[0].embedding
}

export async function storeArticleEmbedding(
  articleId: string,
  brandId: string,
  embedding: number[]
): Promise<void> {
  const supabase = createAdminClient()
  await supabase.from('article_embeddings').upsert(
    {
      article_id: articleId,
      brand_id: brandId,
      embedding: `[${embedding.join(',')}]`,  // pgvector text format: [0.1,0.2,...]
      generated_at: new Date().toISOString(),
    },
    { onConflict: 'article_id' }
  )
}

export async function findRelatedArticles(
  brandId: string,
  embedding: number[],
  excludeId?: string,
  limit = 3,
  threshold = 0.7
): Promise<RelatedArticle[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('find_related_articles', {
    query_embedding: embedding,  // raw JS array — supabase-js serializes as JSON array, PostgREST casts to vector
    target_brand_id: brandId,
    exclude_article_id: excludeId ?? null,
    match_threshold: threshold,
    match_count: limit,
  })
  if (error) console.error('[find-related] rpc error:', error.message)
  return (data ?? []) as RelatedArticle[]
}
