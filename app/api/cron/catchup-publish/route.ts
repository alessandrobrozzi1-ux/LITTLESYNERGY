// CATCHUP-PUBLISH — rete di sicurezza per i brand che daily-publish non è riuscito a pubblicare
// (kill del provider, timeout, concorrenza). Idempotente: pubblica SOLO i brand attivi che oggi
// non hanno ancora un articolo. Chiamabile in loop da un pinger (cron-job.org) finché remaining=0.
//
// Testo soltanto: le immagini le drena backfill-images (stesso operating point del cron notturno).
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getKeywordForBrand } from '../daily-publish/route'

export const maxDuration = 60 // Hobby cap — restiamo DENTRO i 60s

async function run() {
  const t0 = Date.now()
  const supabase = createAdminClient()

  const { data: brands } = await supabase
    .from('brands')
    .select('id, language_code, brand_name')
    .eq('active', true)

  if (!brands?.length) return { done: 0, remaining: 0, message: 'no active brands' }

  const todayStart = new Date(); todayStart.setUTCHours(0, 0, 0, 0)

  // brand attivi SENZA articolo pubblicato oggi
  const missing: typeof brands = []
  for (const b of brands) {
    const { count } = await supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', b.id)
      .eq('status', 'published')
      .gte('published_at', todayStart.toISOString())
    if ((count ?? 0) === 0) missing.push(b)
  }

  if (!missing.length) {
    void supabase.from('cron_runs').insert([{ cron_name: 'catchup-publish', status: 'ok', brands_processed: 0, articles_created: 0, duration_ms: Date.now() - t0 }])
    return { done: 0, remaining: 0, message: 'all brands published today' }
  }

  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000'

  let done = 0
  const failed: string[] = []
  for (const brand of missing) {
    if (Date.now() - t0 > 45000) break // guard: una generazione richiede ~45-55s, non iniziarne un'altra
    try {
      const { keyword, keywordId } = await getKeywordForBrand(supabase, brand.id, brand.language_code)
      const res = await fetch(`${baseUrl}/api/generate-article`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_id: brand.id, keyword, length: 'medium' }),
      })
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error ?? `HTTP ${res.status}`) }
      const data = await res.json()
      if (keywordId) await supabase.from('keywords').update({ status: 'used', article_id: data.article.id }).eq('id', keywordId)
      done++
    } catch (e) {
      failed.push(`${brand.language_code}: ${(e as Error).message}`)
    }
    break // una generazione per chiamata: resta sotto i 60s. Il pinger richiama finché remaining=0.
  }

  // ricalcola quanti mancano ancora
  let remaining = 0
  for (const b of brands) {
    const { count } = await supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', b.id)
      .eq('status', 'published')
      .gte('published_at', todayStart.toISOString())
    if ((count ?? 0) === 0) remaining++
  }

  void supabase.from('cron_runs').insert([{
    cron_name: 'catchup-publish',
    status: failed.length ? 'partial' : 'ok',
    brands_processed: missing.length,
    articles_created: done,
    duration_ms: Date.now() - t0,
  }])

  return { done, remaining, failed: failed.length ? failed : undefined }
}

// 🔒 GATED da CRON_SECRET (come daily-publish / backfill-images)
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await run())
}
export async function POST(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await run())
}
