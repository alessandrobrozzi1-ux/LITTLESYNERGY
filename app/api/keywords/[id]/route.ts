import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// PATCH /api/keywords/[id] — update status or scheduled_date
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('keywords')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/keywords/[id] — reject keyword
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('keywords')
    .update({ status: 'rejected' })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
