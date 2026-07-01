import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const brand_id = new URL(req.url).searchParams.get('brand_id')
  if (!brand_id) return NextResponse.json({ error: 'brand_id required' }, { status: 400 })

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('articles')
    .select('id, title, created_at')
    .eq('brand_id', brand_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return NextResponse.json(data ?? null)
}
