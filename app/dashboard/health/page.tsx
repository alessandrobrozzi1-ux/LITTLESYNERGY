import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'

const LANG_FLAGS: Record<string, string> = {
  en: '🇺🇸', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪',
  it: '🇮🇹', pt: '🇵🇹', nl: '🇳🇱', pl: '🇵🇱',
}

function fmt(ms: number) {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' })
}

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return fmtDate(iso)
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  const w = 80
  const h = 28
  const barW = 8
  const gap = 2
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      {data.map((v, i) => {
        const barH = Math.max((v / max) * (h - 4), v > 0 ? 3 : 1)
        const x = i * (barW + gap)
        const y = h - barH
        return (
          <rect
            key={i}
            x={x} y={y}
            width={barW} height={barH}
            rx={2}
            fill={v > 0 ? '#111827' : '#e5e7eb'}
          />
        )
      })}
    </svg>
  )
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`} />
  )
}

export default async function HealthPage() {
  const supabase = createAdminClient()

  const sevenDaysAgo = new Date(Date.now() - 7 * 864e5).toISOString()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 864e5).toISOString()
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()

  const [
    { data: cronRuns },
    { data: costRows },
    { data: recentArticles },
    { data: brands },
    { data: weekArticles },
  ] = await Promise.all([
    supabase.from('cron_runs').select('*').order('created_at', { ascending: false }).limit(30),
    supabase.from('cost_log').select('cost_usd, model, created_at'),
    supabase.from('articles').select('id, title, status, slug, published_at, created_at, brand_id').order('created_at', { ascending: false }).limit(10),
    supabase.from('brands').select('id, brand_name, language_code, active').order('created_at'),
    supabase.from('articles').select('brand_id, created_at').gte('created_at', sevenDaysAgo),
  ])

  // Cost aggregations
  const totalCost = (costRows ?? []).reduce((s, r) => s + Number(r.cost_usd), 0)
  const last30Cost = (costRows ?? [])
    .filter(r => new Date(r.created_at) > new Date(thirtyDaysAgo))
    .reduce((s, r) => s + Number(r.cost_usd), 0)
  const todayCost = (costRows ?? [])
    .filter(r => new Date(r.created_at) >= new Date(todayStart))
    .reduce((s, r) => s + Number(r.cost_usd), 0)
  const totalArticles = costRows?.length ?? 0

  // Brand map
  const brandMap = Object.fromEntries((brands ?? []).map(b => [b.id, b]))

  // Last cron runs
  const lastPublish = (cronRuns ?? []).find(r => r.cron_name === 'daily-publish')
  const lastKeywords = (cronRuns ?? []).find(r => r.cron_name === 'daily-keywords')

  // System status
  const recentErrors = (cronRuns ?? [])
    .filter(r => new Date(r.created_at) > new Date(Date.now() - 24 * 3600000))
    .filter(r => r.status === 'error' || (r.errors && r.errors.length > 0))
  const systemOk = recentErrors.length === 0

  // Last publish info
  const lastPublishTime = lastPublish ? fmtRelative(lastPublish.created_at) : null
  const lastPublishArticles = lastPublish?.articles_created ?? 0

  // 7-day sparkline per brand
  function getBrandSparkline(brandId: string): number[] {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      d.setHours(0, 0, 0, 0)
      return d
    })
    return days.map(day => {
      const nextDay = new Date(day.getTime() + 864e5)
      return (weekArticles ?? []).filter(a => {
        const t = new Date(a.created_at)
        return a.brand_id === brandId && t >= day && t < nextDay
      }).length
    })
  }

  // Article count per brand
  function getBrandArticleCount(brandId: string) {
    return (weekArticles ?? []).filter(a => a.brand_id === brandId).length
  }

  // Recent cron runs grouped (last 10 of publish)
  const publishHistory = (cronRuns ?? []).filter(r => r.cron_name === 'daily-publish').slice(0, 10)
  const keywordsHistory = (cronRuns ?? []).filter(r => r.cron_name === 'daily-keywords').slice(0, 5)

  return (
    <div className="space-y-10">

      {/* STATUS HERO */}
      <div className={`rounded-2xl px-6 py-5 flex items-center justify-between ${systemOk ? 'bg-gray-900' : 'bg-red-600'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${systemOk ? 'bg-green-400' : 'bg-white'} animate-pulse`} />
          <div>
            <p className="text-white font-semibold text-base">
              {systemOk ? 'All Systems Operational' : 'System Issues Detected'}
            </p>
            <p className="text-white/60 text-xs mt-0.5">
              {lastPublishTime
                ? `Last publish ${lastPublishTime} · ${lastPublishArticles} article${lastPublishArticles !== 1 ? 's' : ''} created`
                : 'No publish run yet'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white/40 text-[10px] uppercase tracking-widest">Today</p>
          <p className="text-white font-semibold text-lg">${todayCost.toFixed(4)}</p>
        </div>
      </div>

      {/* ALERTS */}
      {recentErrors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 space-y-2">
          <p className="text-sm font-medium text-red-700">⚠ Errors in the last 24h</p>
          {recentErrors.map(r => (
            <div key={r.id} className="text-xs text-red-600 font-mono">
              [{fmtDate(r.created_at)}] {r.cron_name}: {(r.errors ?? []).join(' · ')}
            </div>
          ))}
        </div>
      )}

      {/* BRAND STATUS CARDS */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-gray-900">Brand Status</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(brands ?? []).map(brand => {
            const sparkline = getBrandSparkline(brand.id)
            const weekCount = getBrandArticleCount(brand.id)
            const flag = LANG_FLAGS[brand.language_code] ?? '🌐'
            return (
              <Link
                key={brand.id}
                href={`/dashboard/brands/${brand.id}`}
                className="rounded-xl border border-gray-100 px-5 py-4 flex items-start justify-between hover:border-gray-300 transition-colors group"
              >
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{flag}</span>
                    <span className="text-sm font-bold text-gray-900">{brand.language_code.toUpperCase()}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full uppercase tracking-wide ${brand.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {brand.active ? 'active' : 'paused'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 -mt-2">{brand.brand_name}</p>
                  <div className="flex items-end gap-4">
                    <Sparkline data={sparkline} />
                    <div className="pb-0.5">
                      <p className="text-xl font-bold text-gray-900">{weekCount}</p>
                      <p className="text-[11px] text-gray-400">articles · 7d</p>
                    </div>
                  </div>
                </div>
                <span className="text-gray-300 group-hover:text-gray-500 transition-colors text-xs mt-1 ml-3">→</span>
              </Link>
            )
          })}
          {(brands ?? []).length === 0 && (
            <p className="text-sm text-gray-400">No brands configured.</p>
          )}
        </div>
      </section>

      {/* CRON JOBS */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-gray-900">Cron Jobs</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CronCard
            icon="📰"
            label="daily-publish"
            schedule="9:00 AM Italy"
            run={lastPublish}
            history={publishHistory}
          />
          <CronCard
            icon="🔑"
            label="daily-keywords"
            schedule="8:00 AM Italy"
            run={lastKeywords}
            history={keywordsHistory}
          />
        </div>
      </section>

      {/* COST OVERVIEW */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-gray-900">Cost Overview</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total spent" value={`$${totalCost.toFixed(4)}`} sub="all time" />
          <StatCard label="Last 30 days" value={`$${last30Cost.toFixed(4)}`} sub="API cost" />
          <StatCard label="Articles" value={String(totalArticles)} sub="generated" />
          <StatCard
            label="Avg / article"
            value={totalArticles ? `$${(totalCost / totalArticles).toFixed(4)}` : '—'}
            sub="Sonnet 4.6"
          />
        </div>
      </section>

      {/* RECENT ARTICLES */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-gray-900">Recent Articles</h2>
        <div className="rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {(recentArticles ?? []).length === 0 && (
            <p className="text-sm text-gray-400 px-5 py-4">No articles yet.</p>
          )}
          {(recentArticles ?? []).map(a => {
            const brand = brandMap[a.brand_id]
            const flag = brand ? (LANG_FLAGS[brand.language_code] ?? '🌐') : ''
            return (
              <Link
                key={a.id}
                href={`/dashboard/articles/${a.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm">{flag}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 truncate group-hover:text-gray-900">{a.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {brand?.brand_name ?? a.brand_id} · {fmtRelative(a.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    a.status === 'published' ? 'bg-green-100 text-green-700' :
                    a.status === 'draft' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {a.status}
                  </span>
                  <span className="text-gray-300 group-hover:text-gray-500 text-xs">→</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-gray-100 px-4 py-4">
      <p className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}

type CronRun = {
  id: string
  cron_name: string
  status: string
  brands_processed: number
  articles_created: number
  duration_ms: number
  errors: string[] | null
  created_at: string
}

function CronCard({ icon, label, schedule, run, history }: {
  icon: string
  label: string
  schedule: string
  run?: CronRun | null
  history: CronRun[]
}) {
  const ok = run?.status === 'ok'
  const hasRun = !!run

  return (
    <div className="rounded-xl border border-gray-100 px-5 py-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-sm font-medium text-gray-800">{label}</span>
        </div>
        {hasRun ? (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wide ${
            ok ? 'bg-green-100 text-green-700' :
            run?.status === 'partial' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-600'
          }`}>
            {run?.status}
          </span>
        ) : (
          <span className="text-[10px] text-gray-400">never ran</span>
        )}
      </div>

      {/* Schedule + last run */}
      <div className="space-y-1">
        <p className="text-[11px] text-gray-400">⏱ {schedule}</p>
        {run && (
          <p className="text-[11px] text-gray-500">
            Last run: {fmtDate(run.created_at)}
            {run.duration_ms != null ? ` · ${fmt(run.duration_ms)}` : ''}
            {run.articles_created > 0 ? ` · ${run.articles_created} article${run.articles_created !== 1 ? 's' : ''}` : ''}
          </p>
        )}
        {run?.errors != null && run.errors.length > 0 && (
          <p className="text-[11px] text-red-500 font-mono break-all">{run.errors[0]}</p>
        )}
      </div>

      {/* Mini history dots */}
      {history.length > 0 && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-gray-50">
          <span className="text-[10px] text-gray-300 mr-1">history</span>
          {history.slice(0, 10).reverse().map(r => (
            <span
              key={r.id}
              title={`${fmtDate(r.created_at)} · ${r.status}`}
              className={`w-2 h-2 rounded-full ${
                r.status === 'ok' ? 'bg-green-400' :
                r.status === 'partial' ? 'bg-amber-400' :
                'bg-red-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
