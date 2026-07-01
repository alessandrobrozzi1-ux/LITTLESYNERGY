'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface RunResult {
  article: { id: string; title: string; slug: string }
  keyword: string
  word_count: number
  cost_usd: number
}

export function RunNowButton({ brandId }: { brandId: string }) {
  const [state, setState] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<RunResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function generate() {
    setState('running')
    setResult(null)
    setError(null)
    try {
      const res = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_id: brandId, length: 'medium' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      setResult(data)
      setState('done')
      router.refresh()
    } catch (e) {
      setError(String(e))
      setState('error')
    }
  }

  if (state === 'running') {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="w-4 h-4 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin inline-block" />
        Generating article… (up to 60s)
      </div>
    )
  }

  if (state === 'done' && result) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-green-600 font-medium flex items-center gap-1">
          <span>✓</span> Published
        </span>
        <span className="text-xs text-gray-400">
          &ldquo;{result.article.title.slice(0, 50)}{result.article.title.length > 50 ? '…' : ''}&rdquo;
          · {result.word_count} words · ${result.cost_usd?.toFixed(4) ?? '—'}
        </span>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
        >
          Run again
        </button>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="space-y-2">
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={generate}
      className="text-xs font-medium text-white bg-gray-900 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
    >
      <span>▶</span> Generate Article Now
    </button>
  )
}
