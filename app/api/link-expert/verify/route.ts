import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { id, full_url } = await req.json()
  if (!id || !full_url) return NextResponse.json({ error: 'id and full_url required' }, { status: 400 })
  try {
    const res = await fetch(full_url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(8000) })
    const verified = res.ok
    const supabase = createAdminClient()
    await supabase.from('link_expert').update({ verified, verified_at: verified ? new Date().toISOString() : null }).eq('id', id)
    return NextResponse.json({ verified, status: res.status })
  } catch {
    return NextResponse.json({ verified: false, status: 0 })
  }
}
