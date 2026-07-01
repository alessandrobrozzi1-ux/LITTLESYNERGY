import { NextRequest, NextResponse } from 'next/server'
import { findRelatedArticles } from '@/lib/embeddings'

export async function POST(req: NextRequest) {
  try {
    const { brand_id, embedding, exclude_id, limit = 3, threshold = 0.7 } = await req.json()
    if (!brand_id || !embedding) {
      return NextResponse.json({ error: 'brand_id and embedding required' }, { status: 400 })
    }
    const related = await findRelatedArticles(brand_id, embedding, exclude_id, limit, threshold)
    return NextResponse.json(related)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
