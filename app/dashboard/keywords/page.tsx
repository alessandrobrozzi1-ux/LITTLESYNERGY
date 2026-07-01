'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BrandSwitcher } from '@/components/brand-switcher'

interface Keyword {
  id: string
  keyword: string
  score: number
  volume: 'low' | 'medium' | 'high'
  difficulty: 'easy' | 'medium' | 'hard'
  relevance: number
  status: 'pending' | 'scheduled' | 'used' | 'rejected'
  scheduled_date: string | null
  created_at: string
}

interface Brand {
  id: string
  brand_name: string
  language_code: string
}

const VOLUME_LABEL: Record<string, string> = { low: '<500/mo', medium: '~1600/mo', high: '>5000/mo' }
const DIFF_COLOR: Record<string, string> = {
  easy: 'text-green-600 bg-green-50',
  medium: 'text-yellow-600 bg-yellow-50',
  hard: 'text-red-600 bg-red-50',
}

export default function KeywordsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [manualKeyword, setManualKeyword] = useState('')
  const [addingManual, setAddingManual] = useState(false)
  const [schedulingId, setSchedulingId] = useState<string | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [showSchedulePicker, setShowSchedulePicker] = useState<string | null>(null)

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
    if (selectedBrand) loadKeywords()
  }, [selectedBrand])

  async function loadKeywords() {
    if (!selectedBrand) return
    setLoading(true)
    const res = await fetch(`/api/keywords?brand_id=${selectedBrand.id}&status=pending`)
    const data = await res.json()
    setKeywords(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function handleRefresh() {
    if (!selectedBrand) return
    setRefreshing(true)
    await fetch('/api/keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand_id: selectedBrand.id, refresh: true }),
    })
    await loadKeywords()
    setRefreshing(false)
  }

  async function handleAddManual() {
    if (!manualKeyword.trim() || !selectedBrand) return
    setAddingManual(true)
    await fetch('/api/keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand_id: selectedBrand.id, keyword: manualKeyword.trim() }),
    })
    setManualKeyword('')
    await loadKeywords()
    setAddingManual(false)
  }

  async function handleReject(id: string) {
    await fetch(`/api/keywords/${id}`, { method: 'DELETE' })
    setKeywords((prev) => prev.filter((k) => k.id !== id))
  }

  async function handleSchedule(id: string) {
    if (!scheduleDate) return
    setSchedulingId(id)
    await fetch(`/api/keywords/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'scheduled', scheduled_date: scheduleDate }),
    })
    setKeywords((prev) => prev.map((k) => k.id === id ? { ...k, status: 'scheduled', scheduled_date: scheduleDate } : k))
    setShowSchedulePicker(null)
    setScheduleDate('')
    setSchedulingId(null)
  }

  const todayKeywords = keywords.filter((k) => {
    const d = new Date(k.created_at)
    const today = new Date()
    return d.toDateString() === today.toDateString()
  })

  const todayTop4 = todayKeywords.slice(0, 4)
  const allPending = keywords.filter((k) => k.status === 'pending')

  return (
    <div className="space-y-8">
      {brands.length > 1 && (
        <BrandSwitcher
          brands={brands.map(b => ({ ...b, active: true }))}
          selectedBrandId={selectedBrand?.id ?? null}
          onSelect={(id) => { const b = brands.find(x => x.id === id); if (b) setSelectedBrand(b) }}
        />
      )}

      {/* Keyword Ideas header card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center relative overflow-hidden">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-2xl font-semibold text-gray-900">Keyword ideas</h1>
          <span className="text-xs font-medium text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">● Active</span>
        </div>
        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
          SoloSEO scans daily to discover the best keywords for your niche. New keywords appear here automatically.
        </p>

        {todayTop4.length > 0 ? (
          <>
            <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">New keywords found today</p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {todayTop4.map((k) => (
                <span key={k.id} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-700">
                  <span className="text-green-500">✓</span>
                  {k.keyword}
                </span>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400 mb-6">No keywords generated yet today.</p>
        )}

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {refreshing ? (
            <><span className="animate-spin">⟳</span> Generating...</>
          ) : (
            '⟳ Refresh Keywords'
          )}
        </button>
      </div>

      {/* Keyword library */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            {allPending.length} keywords ready to use
          </h2>
          {/* Manual add */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={manualKeyword}
              onChange={(e) => setManualKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddManual()}
              placeholder="Add keyword..."
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              onClick={handleAddManual}
              disabled={addingManual || !manualKeyword.trim()}
              className="bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              + Add
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : allPending.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No keywords yet.</p>
            <p className="text-xs mt-1">Click "Refresh Keywords" to generate ideas.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allPending.map((k) => (
              <div key={k.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-3.5 hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-800 truncate">{k.keyword}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFF_COLOR[k.difficulty]}`}>
                    {k.difficulty}
                  </span>
                  <span className="text-xs text-gray-400">{VOLUME_LABEL[k.volume]}</span>

                  {showSchedulePicker === k.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 text-xs"
                      />
                      <button
                        onClick={() => handleSchedule(k.id)}
                        disabled={schedulingId === k.id || !scheduleDate}
                        className="text-xs bg-gray-900 text-white px-2 py-1 rounded hover:bg-gray-700 disabled:opacity-40"
                      >
                        OK
                      </button>
                      <button
                        onClick={() => setShowSchedulePicker(null)}
                        className="text-xs text-gray-400 hover:text-gray-600 px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowSchedulePicker(k.id)}
                      className="text-xs text-gray-500 border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      + Add to Calendar
                    </button>
                  )}

                  <button
                    onClick={() => handleReject(k.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors text-sm leading-none"
                    title="Dismiss"
                  >
                    −
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
