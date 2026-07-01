import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { GenerateButton } from '@/components/generate-button'
import { BrandSwitcher } from '@/components/brand-switcher'
import type { Article, Brand } from '@/lib/types'

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { brand_id?: string }
}) {
  const supabase = createClient()

  const { data: brands } = await supabase
    .from('brands')
    .select('id, brand_name, language_code, language_name, active')
    .order('created_at')

  const selectedBrandId = searchParams.brand_id ?? brands?.[0]?.id ?? null

  const articlesQuery = supabase
    .from('articles')
    .select('*, brands(brand_name, language_code, language_name)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (selectedBrandId) {
    articlesQuery.eq('brand_id', selectedBrandId)
  }

  const { data: articles } = await articlesQuery

  const selectedBrand = brands?.find((b: Pick<Brand, 'id' | 'brand_name' | 'language_code' | 'language_name'>) => b.id === selectedBrandId)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Articles</h1>
          <p className="mt-1 text-sm text-gray-500">Published content across all brands</p>
        </div>
        {selectedBrand && (
          <GenerateButton brandId={selectedBrand.id} brandName={selectedBrand.brand_name} />
        )}
      </div>

      {brands && brands.length > 1 && (
        <div className="mb-6">
          <BrandSwitcher
            brands={brands as (Pick<Brand, 'id' | 'brand_name' | 'language_code' | 'language_name'> & { active: boolean })[]}
            selectedBrandId={selectedBrandId}
          />
        </div>
      )}

      {!articles?.length ? (
        <div className="text-center py-20 border border-dashed border-gray-200 rounded-lg">
          <p className="text-sm text-gray-500">No articles yet.</p>
          {selectedBrand && (
            <p className="mt-2 text-sm text-gray-400">
              Use &quot;Generate now&quot; to create your first article.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {articles.map((article: Article) => (
            <div
              key={article.id}
              className="flex items-start justify-between px-5 py-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-all"
            >
              <div className="flex-1 min-w-0 pr-8">
                <p className="text-sm font-medium text-gray-900 truncate">{article.title}</p>
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {article.keyword_source ?? '—'}
                  </span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {article.status === 'draft' && (
                  <Badge variant="outline" className="text-xs font-normal text-amber-600 border-amber-300">
                    draft
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs font-normal">
                  {article.brands?.language_code?.toUpperCase()}
                </Badge>
                <Link
                  href={`/dashboard/articles/${article.id}`}
                  className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
