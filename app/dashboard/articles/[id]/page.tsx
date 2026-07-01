import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ArticleEditor } from '@/components/article-editor'

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: article } = await supabase
    .from('articles')
    .select('*, brands(brand_name, language_code, language_name, domain)')
    .eq('id', params.id)
    .single()

  if (!article) notFound()

  const admin = createAdminClient()
  const { data: brand } = await admin
    .from('brands')
    .select('brand_dna_mandatory_footer')
    .eq('id', article.brand_id)
    .single()

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
        <Link href="/dashboard/articles" className="hover:text-gray-600 transition-colors">Articles</Link>
        <span>/</span>
        <span className="text-gray-600 truncate max-w-md">{article.title}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs font-normal">
            {article.brands?.language_code?.toUpperCase()}
          </Badge>
          {article.seo_score != null && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              article.seo_score >= 80 ? 'bg-green-100 text-green-700' :
              article.seo_score >= 60 ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-600'
            }`}>
              SEO {article.seo_score}
            </span>
          )}
          {article.keyword_source && (
            <>
              <span className="text-xs text-gray-300">·</span>
              <span className="text-xs text-gray-400">{article.keyword_source}</span>
            </>
          )}
          <span className="text-xs text-gray-300">·</span>
          <span className="text-xs text-gray-400">
            {article.published_at
              ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'unpublished'}
          </span>
        </div>
        {article.brands?.domain && (
          <a
            href={`https://${article.brands.domain.replace(/^https?:\/\//, '')}/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors shrink-0 ml-4"
          >
            View live →
          </a>
        )}
      </div>

      <ArticleEditor
        articleId={article.id}
        initialTitle={article.title}
        initialContent={article.content_markdown}
        initialMeta={article.meta_description ?? ''}
        initialSlug={article.slug ?? ''}
        initialKeyword={article.keyword_source ?? ''}
        initialFeaturedImage={article.featured_image ?? null}
        hasFeaturedImage={!!article.featured_image}
        mandatoryFooter={brand?.brand_dna_mandatory_footer ?? ''}
        initialStatus={article.status ?? 'published'}
      />
    </div>
  )
}
