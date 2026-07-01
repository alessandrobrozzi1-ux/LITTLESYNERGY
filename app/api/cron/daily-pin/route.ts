import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { pinArticle } from '@/lib/pinterest'
import type { SupabaseClient } from '@supabase/supabase-js'

export const maxDuration = 60

// How many pins per language per run
const QUOTA: Record<string, number> = { en: 2, es: 1 }

async function pickUnpinned(supabase: SupabaseClient, brandId: string, limit: number) {
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()

  // already pinned article ids for this brand — only count SUCCESSFUL pins,
  // so 'error' rows don't block retry once the underlying issue is fixed.
  const { data: pinned } = await supabase
    .from('pinterest_pins')
    .select('article_id')
    .eq('brand_id', brandId)
    .in('status', ['pinned_trial', 'pinned'])
  const pinnedIds = new Set((pinned ?? []).map((p: { article_id: string }) => p.article_id))

  const { data: articles } = await supabase
    .from('articles')
    .select('id, slug, title, meta_description, content_markdown, keyword_source, brand_id, featured_image, pinterest_image')
    .eq('brand_id', brandId)
    .eq('status', 'published')
    .gte('published_at', since)
    .not('featured_image', 'is', null)
    .order('published_at', { ascending: false })

  return (articles ?? []).filter((a) => !pinnedIds.has(a.id)).slice(0, limit)
}

async function run() {
  const t0 = Date.now()
  const supabase = createAdminClient()

  const { data: brands } = await supabase
    .from('brands')
    .select('id, language_code')
    .eq('active', true)
    .in('language_code', ['en', 'es'])

  // Collect all (article, lang) jobs across brands
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jobs: { a: any; lang: string }[] = []
  for (const brand of brands ?? []) {
    const lang = brand.language_code as string
    const picks = await pickUnpinned(supabase, brand.id, QUOTA[lang] ?? 1)
    for (const a of picks) jobs.push({ a, lang })
  }

  // Run in PARALLEL: each pinArticle offloads vertical image gen to a separate
  // generate-image invocation, so daily-pin itself stays well under the 60s cap.
  const settled = await Promise.allSettled(
    jobs.map((j) => pinArticle(supabase, { ...j.a, language_code: j.lang })),
  )
  const results = settled.map((s, i) =>
    s.status === 'fulfilled'
      ? { lang: jobs[i].lang, slug: jobs[i].a.slug, pins: s.value.pins }
      : { lang: jobs[i].lang, slug: jobs[i].a.slug, error: (s.reason as Error)?.message },
  )

  void supabase.from('cron_runs').insert([{
    cron_name: 'daily-pin',
    status: 'ok',
    brands_processed: brands?.length ?? 0,
    articles_created: results.length,
    duration_ms: Date.now() - t0,
  }])

  return { pinned: results.length, results }
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(await run())
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(await run())
}
