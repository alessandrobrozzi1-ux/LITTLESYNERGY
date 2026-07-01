import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { scoredKeywords } from '@/lib/keyword-scorer'

async function run() {
  const t0 = Date.now()
  const supabase = createAdminClient()

  const { data: brands } = await supabase
    .from('brands')
    .select('id, language_code, brand_name')
    .eq('active', true)

  if (!brands?.length) {
    void supabase.from('cron_runs').insert([{ cron_name: 'daily-keywords', status: 'ok', brands_processed: 0, articles_created: 0, duration_ms: Date.now() - t0 }])
    return { message: 'No active brands', processed: 0 }
  }

  const results = await Promise.allSettled(
    brands.map(async (brand) => {
      // Get all used keywords to avoid repeats
      const { data: usedRows } = await supabase
        .from('keywords')
        .select('keyword')
        .eq('brand_id', brand.id)
        .in('status', ['used', 'pending', 'scheduled'])
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      const usedSet = new Set(usedRows?.map((r: { keyword: string }) => r.keyword.toLowerCase()) ?? [])

      const scored = await scoredKeywords(brand.language_code, usedSet)

      if (!scored.length) return { brand: brand.brand_name, saved: 0 }

      const rows = scored.map((k) => ({
        brand_id: brand.id,
        keyword: k.keyword,
        score: k.score,
        volume: k.volume,
        difficulty: k.difficulty,
        relevance: k.relevance,
        status: 'pending',
      }))

      const { error } = await supabase.from('keywords').insert(rows)
      if (error) throw new Error(`${brand.brand_name}: ${error.message}`)

      return { brand: brand.brand_name, saved: rows.length }
    })
  )

  const succeeded = results.filter((r) => r.status === 'fulfilled').map((r) => (r as PromiseFulfilledResult<unknown>).value)
  const failed = results.filter((r) => r.status === 'rejected').map((r) => (r as PromiseRejectedResult).reason?.message)

  void supabase.from('cron_runs').insert([{
    cron_name: 'daily-keywords',
    status: failed.length > 0 ? 'partial' : 'ok',
    brands_processed: brands.length,
    articles_created: 0,
    errors: failed.length > 0 ? failed : null,
    duration_ms: Date.now() - t0,
  }])

  return { processed: brands.length, succeeded: succeeded.length, failed: failed.length, results: succeeded, errors: failed }
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await run()
  return NextResponse.json(result)
}
