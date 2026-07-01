'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BrandSwitcher } from '@/components/brand-switcher'

interface Brand {
  id: string
  brand_name: string
  language_code: string
}

interface Article {
  id: string
  title: string
  seo_score: number | null
  published_at: string
  keyword_source: string
  slug: string
}

interface Keyword {
  id: string
  keyword: string
  difficulty: string
  volume: string
  status: string
  created_at: string
}

interface Stats {
  totalArticles: number
  publishedThisMonth: number
  avgSeoScore: number
  topArticles: Article[]
  recentKeywords: Keyword[]
  scoreDistribution: { label: string; count: number; color: string }[]
  monthlyCount: { month: string; count: number }[]
}

export default function AnalyticsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('brands').select('id, brand_name, language_code').then(({ data }) => {
      if (data?.length) {
        setBrands(data)
        setSelectedBrand(data[0])
      }
    })
  }, [])

  useEffect(() => {
    if (selectedBrand) loadStats()
  }, [selectedBrand])

  async function loadStats() {
    if (!selectedBrand) return
    setLoading(true)

    const [articlesRes, keywordsRes] = await Promise.all([
      supabase
        .from('articles')
        .select('id, title, seo_score, published_at, keyword_source, slug')
        .eq('brand_id', selectedBrand.id)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(100),
      supabase
        .from('keywords')
        .select('id, keyword, difficulty, volume, status, created_at')
        .eq('brand_id', selectedBrand.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    const articles: Article[] = articlesRes.data ?? []
    const keywords: Keyword[] = keywordsRes.data ?? []

    const now = new Date()
    const thisMonth = articles.filter((a) => {
      const d = new Date(a.published_at)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })

    const scoredArticles = articles.filter((a) => a.seo_score !== null)
    const avgSeoScore = scoredArticles.length
      ? Math.round(scoredArticles.reduce((s, a) => s + (a.seo_score ?? 0), 0) / scoredArticles.length)
      : 0

    const topArticles = [...articles]
      .sort((a, b) => (b.seo_score ?? 0) - (a.seo_score ?? 0))
      .slice(0, 5)

    const scoreDistribution = [
      { label: 'Excellent (80+)', count: articles.filter((a) => (a.seo_score ?? 0) >= 80).length, color: 'bg-green-500' },
      { label: 'Good (60-79)', count: articles.filter((a) => (a.seo_score ?? 0) >= 60 && (a.seo_score ?? 0) < 80).length, color: 'bg-blue-500' },
      { label: 'Fair (40-59)', count: articles.filter((a) => (a.seo_score ?? 0) >= 40 && (a.seo_score ?? 0) < 60).length, color: 'bg-yellow-500' },
      { label: 'Low (<40)', count: articles.filter((a) => (a.seo_score ?? 0) < 40).length, color: 'bg-red-400' },
    ]

    // Last 6 months
    const monthlyCount = Array.from({ length: 6 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (5 - i))
      const label = d.toLocaleString('default', { month: 'short' })
      const count = articles.filter((a) => {
        const ad = new Date(a.published_at)
        return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear()
      }).length
      return { month: label, count }
    })

    setStats({ totalArticles: articles.length, publishedThisMonth: thisMonth.length, avgSeoScore, topArticles, recentKeywords: keywords, scoreDistribution, monthlyCount })
    setLoading(false)
  }

  const maxMonthly = Math.max(...(stats?.monthlyCount.map((m) => m.count) ?? [1]), 1)

  return (
    <div className="space-y-8">
      {brands.length > 1 && (
        <BrandSwitcher
          brands={brands.map(b => ({ ...b, active: true }))}
          selectedBrandId={selectedBrand?.id ?? null}
          onSelect={(id) => { const b = brands.find(x => x.id === id); if (b) setSelectedBrand(b) }}
        />
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
        {stats && (
          <span className="text-xs text-gray-400">{stats.totalArticles} articles total</span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map((i) => <div key={i} className="h-28 bg-gray-50 rounded-xl animate-pulse" />)}
        </div>
      ) : stats ? (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Articles</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalArticles}</p>
              <p className="text-xs text-gray-400 mt-1">Published</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">This Month</p>
              <p className="text-3xl font-bold text-gray-900">{stats.publishedThisMonth}</p>
              <p className="text-xs text-gray-400 mt-1">New articles</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Avg SEO Score</p>
              <p className={`text-3xl font-bold ${stats.avgSeoScore >= 70 ? 'text-green-600' : stats.avgSeoScore >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                {stats.avgSeoScore}
              </p>
              <p className="text-xs text-gray-400 mt-1">Out of 100</p>
            </div>
          </div>

          {/* Monthly chart */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <p className="text-sm font-medium text-gray-700 mb-4">Articles published — last 6 months</p>
            <div className="flex items-end gap-3 h-32">
              {stats.monthlyCount.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">{m.count}</span>
                  <div
                    className="w-full bg-gray-900 rounded-t"
                    style={{ height: `${Math.max((m.count / maxMonthly) * 96, m.count > 0 ? 8 : 2)}px` }}
                  />
                  <span className="text-xs text-gray-400">{m.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* SEO score distribution */}
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <p className="text-sm font-medium text-gray-700 mb-4">SEO Score Distribution</p>
              <div className="space-y-3">
                {stats.scoreDistribution.map((d) => (
                  <div key={d.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">{d.label}</span>
                      <span className="text-xs font-medium text-gray-700">{d.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div
                        className={`h-2 rounded-full ${d.color}`}
                        style={{ width: `${stats.totalArticles > 0 ? (d.count / stats.totalArticles) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top articles by SEO score */}
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <p className="text-sm font-medium text-gray-700 mb-4">Top Articles by SEO Score</p>
              <div className="space-y-2.5">
                {stats.topArticles.map((a, i) => (
                  <div key={a.id} className="flex items-center gap-3">
                    <span className="text-xs text-gray-300 w-4">{i + 1}</span>
                    <span className="text-xs text-gray-600 flex-1 truncate">{a.title}</span>
                    <span className={`text-xs font-semibold ${(a.seo_score ?? 0) >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {a.seo_score ?? '—'}
                    </span>
                  </div>
                ))}
                {stats.topArticles.length === 0 && (
                  <p className="text-xs text-gray-400">No articles yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent keywords */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <p className="text-sm font-medium text-gray-700 mb-4">Recent Keywords</p>
            <div className="space-y-2">
              {stats.recentKeywords.slice(0, 8).map((k, i) => (
                <div key={k.id} className="flex items-center gap-3">
                  <span className="text-xs text-gray-300 w-4">{i + 1}</span>
                  <span className="text-xs text-gray-700 flex-1">{k.keyword}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    k.difficulty === 'easy' ? 'bg-green-50 text-green-600' :
                    k.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                    'bg-red-50 text-red-500'
                  }`}>{k.difficulty}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    k.status === 'used' ? 'bg-gray-100 text-gray-400' :
                    k.status === 'pending' ? 'bg-blue-50 text-blue-600' :
                    'bg-gray-50 text-gray-400'
                  }`}>{k.status}</span>
                </div>
              ))}
              {stats.recentKeywords.length === 0 && (
                <p className="text-xs text-gray-400">No keywords generated yet. Go to Keywords tab to generate.</p>
              )}
            </div>
          </div>

          {/* GSC placeholder */}
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center">
            <p className="text-sm font-medium text-gray-500 mb-1">Google Search Console</p>
            <p className="text-xs text-gray-400">Connect your site to see impressions, clicks, and ranking data from Google.</p>
            <p className="text-xs text-gray-300 mt-2">Coming soon — connect your domain in Google Search Console to enable this</p>
          </div>
        </>
      ) : null}
    </div>
  )
}
