import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { scoredKeywords } from '@/lib/keyword-scorer'

// GET /api/keywords?brand_id=xxx&status=pending
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const brand_id = searchParams.get('brand_id')
  const status = searchParams.get('status') ?? 'pending'

  if (!brand_id) return NextResponse.json({ error: 'brand_id required' }, { status: 400 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('keywords')
    .select('*')
    .eq('brand_id', brand_id)
    .eq('status', status)
    .order('score', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/keywords — add manual keyword or refresh
export async function POST(req: NextRequest) {
  const { brand_id, keyword, refresh } = await req.json()
  if (!brand_id) return NextResponse.json({ error: 'brand_id required' }, { status: 400 })

  const supabase = createAdminClient()

  // Manual keyword add
  if (keyword) {
    const { data, error } = await supabase
      .from('keywords')
      .insert({ brand_id, keyword, score: 50, volume: 'medium', difficulty: 'medium', relevance: 7, status: 'pending' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // Refresh: generate new keywords via Claude Haiku
  if (refresh) {
    const { data: usedRows } = await supabase
      .from('keywords')
      .select('keyword')
      .eq('brand_id', brand_id)
      .in('status', ['used', 'pending', 'scheduled'])
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const usedSet = new Set(usedRows?.map((r: { keyword: string }) => r.keyword.toLowerCase()) ?? [])

    const { data: brand } = await supabase.from('brands').select('language_code').eq('id', brand_id).single()
    if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

    const scored = await scoredKeywords(brand.language_code, usedSet)
    if (!scored.length) return NextResponse.json({ keywords: [] })

    const rows = scored.map((k) => ({
      brand_id,
      keyword: k.keyword,
      score: k.score,
      volume: k.volume,
      difficulty: k.difficulty,
      relevance: k.relevance,
      status: 'pending',
    }))

    const { data, error } = await supabase.from('keywords').insert(rows).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ keywords: data })
  }

  return NextResponse.json({ error: 'Provide keyword or refresh:true' }, { status: 400 })
}
