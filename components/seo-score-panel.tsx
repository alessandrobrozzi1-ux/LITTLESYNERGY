'use client'

import { calculateSeoScore } from '@/lib/seo-score'

interface SeoScorePanelProps {
  content: string
  title: string
  metaDescription: string
  keyword: string
  hasFeaturedImage: boolean
  savedScore?: number | null
}

export function SeoScorePanel({ content, title, metaDescription, keyword, hasFeaturedImage, savedScore }: SeoScorePanelProps) {
  const { score, label, metrics } = calculateSeoScore(content, title, metaDescription, keyword, hasFeaturedImage)
  const displayScore = savedScore ?? score

  const arc = Math.round((displayScore / 100) * 251)
  const color = displayScore >= 80 ? '#16a34a' : displayScore >= 60 ? '#ca8a04' : '#dc2626'

  const rows = [
    { label: 'Word Count', value: metrics.wordCount.toLocaleString(), ok: metrics.wordCount >= 500 },
    { label: 'Readability', value: metrics.readability, ok: metrics.readability !== 'Poor' },
    { label: 'Headings', value: String(metrics.headings), ok: metrics.headings >= 2 },
    { label: 'Meta Description', value: `${metrics.metaDescriptionLength} chars`, ok: metrics.metaDescriptionLength >= 140 && metrics.metaDescriptionLength <= 165 },
    { label: 'Title', value: `${metrics.titleLength} chars`, ok: metrics.titleLength >= 30 && metrics.titleLength <= 65 },
    { label: 'Featured Image', value: hasFeaturedImage ? 'Yes' : 'No', ok: hasFeaturedImage },
    { label: 'Links', value: String(metrics.links), ok: metrics.links >= 3 },
  ]

  return (
    <div className="border border-gray-100 rounded-lg p-4">
      <p className="text-xs font-medium text-gray-700 mb-4">SEO Score</p>

      {/* Gauge */}
      <div className="flex flex-col items-center mb-4">
        <svg width="100" height="60" viewBox="0 0 100 60">
          <path d="M10 55 A45 45 0 0 1 90 55" fill="none" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" />
          <path
            d="M10 55 A45 45 0 0 1 90 55"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(displayScore / 100) * 141} 141`}
          />
        </svg>
        <div className="-mt-3 text-center">
          <span className="text-2xl font-bold text-gray-900">{displayScore}</span>
        </div>
        <span className="text-xs text-gray-500 mt-1">{label}</span>
      </div>

      {/* Metrics */}
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{row.label}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-700">{row.value}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${row.ok ? 'bg-green-500' : 'bg-amber-400'}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
