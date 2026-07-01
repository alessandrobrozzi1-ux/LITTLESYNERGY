import { createClient } from '@/lib/supabase/server'
import { GenerateButton } from '@/components/generate-button'
import type { Brand } from '@/lib/types'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: brands } = await supabase
    .from('brands')
    .select('id, brand_name, language_code, domain, active')
    .order('created_at')

  const appUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">RSS feeds, manual generation, and API info</p>
      </div>

      {/* RSS Feeds */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-gray-900 border-b border-gray-100 pb-3">
          RSS Feed URLs
        </h2>
        <p className="text-sm text-gray-500">
          Connect these URLs to Lovable or any CMS to auto-import published articles.
        </p>
        <div className="space-y-3">
          {brands?.map((brand: Pick<Brand, 'id' | 'brand_name' | 'language_code' | 'domain' | 'active'>) => (
            <div key={brand.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-md">
              <div>
                <span className="text-sm font-medium text-gray-900">{brand.brand_name}</span>
                <span className="mx-1.5 text-gray-300">·</span>
                <span className="text-xs text-gray-400">{brand.language_code.toUpperCase()}</span>
                {!brand.active && (
                  <span className="ml-2 text-xs text-gray-300">(inactive)</span>
                )}
              </div>
              <code className="text-xs text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded font-mono">
                {appUrl}/api/rss/{brand.language_code}
              </code>
            </div>
          ))}
        </div>
      </section>

      {/* Manual generation */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-gray-900 border-b border-gray-100 pb-3">
          Manual Generation
        </h2>
        <p className="text-sm text-gray-500">
          Generate an article now without waiting for the daily cron (9 AM UTC).
        </p>
        <div className="space-y-3">
          {brands?.filter((b: Pick<Brand, 'id' | 'brand_name' | 'language_code' | 'domain' | 'active'>) => b.active).map((brand: Pick<Brand, 'id' | 'brand_name' | 'language_code' | 'domain' | 'active'>) => (
            <div key={brand.id} className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-md">
              <div>
                <span className="text-sm text-gray-900">{brand.brand_name}</span>
                <span className="mx-1.5 text-gray-300">·</span>
                <span className="text-xs text-gray-400">{brand.language_code.toUpperCase()}</span>
              </div>
              <GenerateButton brandId={brand.id} brandName={brand.language_code.toUpperCase()} />
            </div>
          ))}
        </div>
      </section>

      {/* Cron info */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-gray-900 border-b border-gray-100 pb-3">
          Automation
        </h2>
        <div className="px-4 py-3 bg-gray-50 rounded-md space-y-2">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Daily cron:</span> runs every day at 09:00 Italy time (07:00 UTC)
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Endpoint:</span>{' '}
            <code className="text-xs font-mono bg-white border border-gray-200 px-2 py-0.5 rounded">
              POST {appUrl}/api/cron/daily-publish
            </code>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Configured via <code className="font-mono">vercel.json</code> — deploys automatically on Vercel.
          </p>
        </div>
      </section>
    </div>
  )
}
