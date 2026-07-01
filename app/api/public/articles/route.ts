import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' }

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  const supabase = createAdminClient()

  if (slug) {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, slug, content_markdown, meta_description, featured_image, published_at, keyword_source')
      .eq('status', 'published')
      .eq('slug', slug)
      .single()

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data, { headers: CORS })
  }

  const { data } = await supabase
    .from('articles')
    .select('id, title, slug, meta_description, featured_image, published_at, keyword_source')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50)

  return NextResponse.json(data ?? [], { headers: CORS })
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}
