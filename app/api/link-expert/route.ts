import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const brand_id = new URL(req.url).searchParams.get('brand_id')
  if (!brand_id) return NextResponse.json({ error: 'brand_id required' }, { status: 400 })
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('link_expert')
    .select('*')
    .eq('brand_id', brand_id)
    .eq('active', true)
    .order('priority', { ascending: false })
    .order('anchor_text')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { brand_id, anchor_text, full_url, category = 'product', priority = 0, notes = '' } = body
  if (!brand_id || !anchor_text || !full_url) return NextResponse.json({ error: 'brand_id, anchor_text, full_url required' }, { status: 400 })
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('link_expert')
    .insert({ brand_id, anchor_text, full_url, category, priority, notes })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
