import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { Brand } from '@/lib/types'

async function getBrandsWithStats() {
  const supabase = createClient()
  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .order('created_at', { ascending: true })

  if (!brands) return []

  const brandsWithStats = await Promise.all(
    brands.map(async (brand: Brand) => {
      const { count } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', brand.id)
        .eq('status', 'published')

      const { data: lastArticle } = await supabase
        .from('articles')
        .select('created_at')
        .eq('brand_id', brand.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      return { ...brand, articleCount: count ?? 0, lastRun: lastArticle?.created_at ?? null }
    })
  )

  return brandsWithStats
}

export default async function DashboardPage() {
  const brands = await getBrandsWithStats()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Brands</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your multilingual blog brands</p>
        </div>
        <Link
          href="/dashboard/brands/new"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors"
        >
          Add brand
        </Link>
      </div>

      {brands.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-200 rounded-lg">
          <p className="text-sm text-gray-500">No brands yet.</p>
          <Link
            href="/dashboard/brands/new"
            className="mt-3 inline-block text-sm text-gray-900 underline underline-offset-2"
          >
            Create your first brand
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/dashboard/brands/${brand.id}`}
              className="flex items-center justify-between px-5 py-4 border border-gray-100 rounded-lg hover:border-gray-300 hover:bg-gray-50/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{brand.brand_name}</span>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {brand.language_code.toUpperCase()}
                    </Badge>
                    {!brand.active && (
                      <Badge variant="outline" className="text-xs font-normal text-gray-400">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">{brand.domain}</p>
                </div>
              </div>
              <div className="flex items-center gap-8 text-right">
                <div>
                  <p className="text-sm font-medium text-gray-900">{brand.articleCount}</p>
                  <p className="text-xs text-gray-400">articles</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {brand.lastRun
                      ? new Date(brand.lastRun).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'}
                  </p>
                  <p className="text-xs text-gray-400">last run</p>
                </div>
                <span className="text-gray-300 group-hover:text-gray-400 transition-colors">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
