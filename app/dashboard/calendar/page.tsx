import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { GenerateButton } from '@/components/generate-button'
import { BrandSwitcher } from '@/components/brand-switcher'
import type { Brand } from '@/lib/types'

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = firstDay === 0 ? 6 : firstDay - 1 // Monday start
  const cells: (number | null)[] = Array(offset).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { brand_id?: string; year?: string; month?: string }
}) {
  const admin = createAdminClient()

  const { data: brands } = await admin
    .from('brands')
    .select('id, brand_name, language_code, active')
    .order('created_at')

  const selectedBrandId = searchParams.brand_id ?? brands?.[0]?.id ?? null
  const selectedBrand = brands?.find((b: Pick<Brand, 'id' | 'brand_name' | 'language_code'>) => b.id === selectedBrandId)

  const now = new Date()
  const year = parseInt(searchParams.year ?? String(now.getFullYear()))
  const month = parseInt(searchParams.month ?? String(now.getMonth())) // 0-indexed

  const firstOfMonth = new Date(year, month, 1).toISOString()
  const lastOfMonth = new Date(year, month + 1, 0, 23, 59, 59).toISOString()

  const { data: articles } = await admin
    .from('articles')
    .select('id, title, slug, published_at, featured_image, seo_score, keyword_source')
    .eq('brand_id', selectedBrandId)
    .gte('published_at', firstOfMonth)
    .lte('published_at', lastOfMonth)
    .order('published_at')

  // Map day → articles
  const byDay: Record<number, typeof articles> = {}
  for (const a of articles ?? []) {
    const d = new Date(a.published_at).getDate()
    if (!byDay[d]) byDay[d] = []
    byDay[d]!.push(a)
  }

  const cells = getCalendarDays(year, month)
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const prevMonth = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 }
  const nextMonth = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 }
  const monthLabel = new Date(year, month, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const todayDay = now.getFullYear() === year && now.getMonth() === month ? now.getDate() : null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Content Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">SoloSEO is taking care of your SEO content</p>
        </div>
        {selectedBrand && (
          <GenerateButton brandId={selectedBrand.id} brandName={selectedBrand.brand_name} />
        )}
      </div>

      {brands && brands.length > 1 && (
        <div className="mb-4">
          <BrandSwitcher
            brands={brands as (Pick<Brand, 'id' | 'brand_name' | 'language_code' | 'active'>)[]}
            selectedBrandId={selectedBrandId}
          />
        </div>
      )}

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium text-gray-900">{monthLabel}</h2>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/calendar?brand_id=${selectedBrandId}&year=${prevMonth.y}&month=${prevMonth.m}`}
            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 rounded hover:border-gray-400 transition-colors"
          >
            ←
          </Link>
          <Link
            href={`/dashboard/calendar?brand_id=${selectedBrandId}&year=${now.getFullYear()}&month=${now.getMonth()}`}
            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 rounded hover:border-gray-400 transition-colors"
          >
            Today
          </Link>
          <Link
            href={`/dashboard/calendar?brand_id=${selectedBrandId}&year=${nextMonth.y}&month=${nextMonth.m}`}
            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 rounded hover:border-gray-400 transition-colors"
          >
            →
          </Link>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="border border-gray-100 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-500">{d}</div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const isToday = day === todayDay
            const dayArticles = day ? (byDay[day] ?? []) : []

            return (
              <div
                key={i}
                className={`min-h-[110px] p-2 border-b border-r border-gray-100 last:border-r-0 ${
                  !day ? 'bg-gray-50/50' : ''
                } ${i % 7 === 6 ? 'border-r-0' : ''}`}
              >
                {day && (
                  <>
                    <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full mb-1 ${
                      isToday ? 'bg-gray-900 text-white' : 'text-gray-500'
                    }`}>
                      {day}
                    </span>

                    <div className="space-y-1">
                      {dayArticles.map((a) => (
                        <Link
                          key={a.id}
                          href={`/dashboard/articles/${a.id}`}
                          className="block group"
                        >
                          {a.featured_image ? (
                            <img
                              src={a.featured_image}
                              alt={a.title}
                              className="w-full h-14 object-cover rounded mb-1"
                            />
                          ) : null}
                          <p className="text-xs text-gray-600 leading-tight truncate group-hover:text-gray-900 transition-colors">
                            {a.title}
                          </p>
                          {a.seo_score && (
                            <span className={`text-[10px] font-medium ${
                              a.seo_score >= 80 ? 'text-green-600' : a.seo_score >= 60 ? 'text-amber-500' : 'text-red-500'
                            }`}>
                              SEO {a.seo_score}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
