import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { scoredKeywords } from '@/lib/keyword-scorer'

export async function GET(req: NextRequest) {
  const brandId = req.nextUrl.searchParams.get('brand_id')
  if (!brandId) return NextResponse.json({ error: 'brand_id required' }, { status: 400 })

  const supabase = createAdminClient()

  const { data: brand } = await supabase
    .from('brands')
    .select('language_code')
    .eq('id', brandId)
    .single()

  if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

  const { data: recent } = await supabase
    .from('keywords_history')
    .select('keyword')
    .eq('brand_id', brandId)
    .order('used_at', { ascending: false })
    .limit(30)

  const usedKeywords = new Set(recent?.map((r: { keyword: string }) => r.keyword.toLowerCase()) ?? [])
  const scored = await scoredKeywords(brand.language_code, usedKeywords)

  return NextResponse.json({
    keywords: scored.slice(0, 3).map((k) => ({
      keyword: k.keyword,
      volume: k.volume,
      difficulty: k.difficulty,
    }))
  })
}
