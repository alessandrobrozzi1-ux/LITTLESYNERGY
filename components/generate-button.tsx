'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface GenerateButtonProps {
  brandId: string
  brandName: string
}

type Length = 'short' | 'medium' | 'long'

interface KeywordSuggestion {
  keyword: string
  volume: 'low' | 'medium' | 'high'
  difficulty: 'easy' | 'medium' | 'hard'
}

const STEPS = [
  'Understanding your brand voice',
  'Finding best keyword opportunity',
  'Writing SEO-optimized content',
  'Optimizing for search engines',
  'Saving your article',
]

const LENGTH_OPTIONS: { value: Length; label: string; words: string }[] = [
  { value: 'short', label: 'Short', words: '~500 words' },
  { value: 'medium', label: 'Medium', words: '~1000 words' },
  { value: 'long', label: 'Long', words: '~1500 words' },
]

const VOLUME_COLOR = { low: 'text-gray-400', medium: 'text-amber-500', high: 'text-green-600' }
const DIFF_COLOR = { easy: 'text-green-600', medium: 'text-amber-500', hard: 'text-red-500' }

export function GenerateButton({ brandId, brandName }: GenerateButtonProps) {
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [length, setLength] = useState<Length>('medium')
  const [generating, setGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [suggestions, setSuggestions] = useState<KeywordSuggestion[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    setLoadingSuggestions(true)
    fetch(`/api/keyword-suggestions?brand_id=${brandId}`)
      .then((r) => r.json())
      .then((d) => setSuggestions(d.keywords ?? []))
      .catch(() => setSuggestions([]))
      .finally(() => setLoadingSuggestions(false))
  }, [open, brandId])

  function getSteps() {
    return STEPS.map((label, i) => ({
      label,
      done: i < currentStep,
      active: i === currentStep,
    }))
  }

  async function handleGenerate() {
    setGenerating(true)
    setError(null)
    setDone(false)
    setCurrentStep(0)

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 2 ? prev + 1 : prev))
    }, 4000)

    let articleId: string | null = null

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 180000) // 3 min client timeout

      const res = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_id: brandId,
          keyword: keyword.trim() || undefined,
          length,
          draft: true,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)
      const data = await res.json()
      clearInterval(stepInterval)

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        setGenerating(false)
        setCurrentStep(-1)
        return
      }

      articleId = data.article?.id ?? null
    } catch {
      clearInterval(stepInterval)
      // Fetch timed out or network error — article may still have been saved
      // Try to find the latest article for this brand
    }

    // If we got the article id directly, go there
    if (articleId) {
      setCurrentStep(STEPS.length - 1)
      setTimeout(() => {
        router.push(`/dashboard/articles/${articleId}`)
      }, 600)
      return
    }

    // Fallback: fetch latest article for this brand from DB
    try {
      const latest = await fetch(`/api/articles/latest?brand_id=${brandId}`)
      const data = await latest.json()
      if (data?.id) {
        setCurrentStep(STEPS.length - 1)
        setTimeout(() => {
          router.push(`/dashboard/articles/${data.id}`)
        }, 600)
        return
      }
    } catch {
      // ignore
    }

    setError('Article may have been created — check Articles list')
    setGenerating(false)
    setCurrentStep(-1)
  }

  function handleClose() {
    if (generating) return
    setOpen(false)
    setKeyword('')
    setLength('medium')
    setCurrentStep(-1)
    setError(null)
    setDone(false)
    setSuggestions([])
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="text-sm bg-gray-900 hover:bg-gray-700 text-white">
        + New Article
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">

            {/* Form */}
            {!generating && !done && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-semibold text-gray-900">Generate New Article</h2>
                  <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                </div>
                <p className="text-xs text-gray-500 mb-5">Create an SEO-optimized article for <strong>{brandName}</strong></p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Target Keyword <span className="text-gray-400 font-normal">(optional — AI picks best if empty)</span>
                    </label>
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="e.g., aceites esenciales para dormir"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />

                    {/* Keyword suggestions */}
                    <div className="mt-2">
                      {loadingSuggestions ? (
                        <p className="text-xs text-gray-400">Finding today&apos;s best keywords...</p>
                      ) : suggestions.length > 0 ? (
                        <div>
                          <p className="text-xs text-gray-400 mb-1.5">Today&apos;s top opportunities:</p>
                          <div className="space-y-1">
                            {suggestions.map((s) => (
                              <button
                                key={s.keyword}
                                onClick={() => setKeyword(s.keyword)}
                                className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-all ${
                                  keyword === s.keyword
                                    ? 'border-gray-900 bg-gray-50'
                                    : 'border-gray-100 hover:border-gray-300 bg-gray-50/50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-800">{s.keyword}</span>
                                  <div className="flex items-center gap-2 shrink-0 ml-2">
                                    <span className={`capitalize ${VOLUME_COLOR[s.volume]}`}>
                                      {s.volume} vol
                                    </span>
                                    <span className="text-gray-300">·</span>
                                    <span className={`capitalize ${DIFF_COLOR[s.difficulty]}`}>
                                      {s.difficulty}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Article Length</label>
                    <div className="grid grid-cols-3 gap-2">
                      {LENGTH_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setLength(opt.value)}
                          className={`py-2.5 px-3 rounded-lg border text-center transition-all ${
                            length === opt.value
                              ? 'border-gray-900 bg-gray-900 text-white'
                              : 'border-gray-200 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-sm font-medium">{opt.label}</div>
                          <div className={`text-xs mt-0.5 ${length === opt.value ? 'text-gray-300' : 'text-gray-400'}`}>
                            {opt.words}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && <p className="text-xs text-red-500">{error}</p>}

                  <Button
                    onClick={handleGenerate}
                    className="w-full bg-gray-900 hover:bg-gray-700 text-white text-sm py-2.5 mt-2"
                  >
                    ✦ Generate Article
                  </Button>
                </div>
              </div>
            )}

            {/* Progress */}
            {generating && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-semibold text-gray-900">Generating Your Article</h2>
                </div>
                <p className="text-xs text-gray-500 mb-6">
                  Creating a {LENGTH_OPTIONS.find((l) => l.value === length)?.words} SEO-optimized article
                </p>

                <div className="space-y-3">
                  {getSteps().map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs transition-all ${
                        step.done ? 'bg-green-500 text-white' : step.active ? 'border-2 border-gray-900 bg-white' : 'border border-gray-200 bg-white'
                      }`}>
                        {step.done ? '✓' : step.active ? <span className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" /> : null}
                      </div>
                      <span className={`text-sm transition-all ${
                        step.done ? 'text-gray-400 line-through' : step.active ? 'text-gray-900 font-medium' : 'text-gray-300'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-6 text-xs text-gray-400 text-center">This usually takes 20-40 seconds</p>
              </div>
            )}

            {/* Done */}
            {done && (
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-xl">✓</span>
                </div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">Article Created!</h2>
                <p className="text-sm text-gray-500 mb-5">Your article is ready and published.</p>
                <Button onClick={handleClose} className="bg-gray-900 hover:bg-gray-700 text-white text-sm">
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
