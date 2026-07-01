import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BrandForm } from '@/components/brand-form'
import { LinkExpert } from '@/components/link-expert'
import { RunNowButton } from '@/components/run-now-button'
import type { Brand } from '@/lib/types'

export default async function BrandPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient()
  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!brand) notFound()

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{brand.brand_name}</h1>
          <p className="mt-1 text-sm text-gray-500">{brand.language_name} · {brand.domain}</p>
        </div>
        <RunNowButton brandId={brand.id} />
      </div>

      <BrandForm brand={brand as Brand} />

      {/* Link Expert */}
      <div className="mt-12 space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-sm font-medium text-gray-900">🔗 Link Expert</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Pre-verified affiliate links the AI is forced to use. Never invented URLs.
          </p>
        </div>
        <LinkExpert brandId={brand.id} />
      </div>
    </div>
  )
}
