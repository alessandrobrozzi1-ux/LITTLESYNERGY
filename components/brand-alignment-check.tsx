'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Issue {
  pillar: string
  label: string
  type: 'wrong_place' | 'too_vague' | 'too_long' | 'contradiction' | 'missing' | 'good'
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  fix?: string
}

interface AlignmentResult {
  score: number
  summary: string
  issues: Issue[]
  proposed_changes: Record<string, string>
  cost_tokens: { input: number; output: number; cache_read: number }
}

const SEVERITY_STYLE: Record<string, string> = {
  critical: 'bg-red-50 text-red-800 border-red-200',
  high: 'bg-orange-50 text-orange-800 border-orange-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  low: 'bg-blue-50 text-blue-700 border-blue-100',
  good: 'bg-green-50 text-green-700 border-green-100',
}

const TYPE_ICON: Record<string, string> = {
  wrong_place: '📍',
  too_vague: '🌫️',
  too_long: '✂️',
  contradiction: '⚡',
  missing: '➕',
  good: '✓',
}

const PILLAR_LABELS: Record<string, string> = {
  brand_dna_business_type: 'Business Type',
  brand_dna_brand_voice: 'Brand Voice & Tone',
  brand_dna_key_themes: 'Key Themes',
  brand_dna_service_area: 'Service Area & Link Rules',
  brand_dna_topics_to_avoid: 'Topics to Avoid',
  brand_dna_mandatory_footer: 'Mandatory Footer',
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626'
  const r = 36
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      </svg>
      <div className="text-center z-10">
        <p className="text-2xl font-bold" style={{ color }}>{score}</p>
        <p className="text-[10px] text-gray-400 -mt-0.5">/ 100</p>
      </div>
    </div>
  )
}

export function BrandAlignmentCheck({ brandId, brandName }: { brandId: string; brandName: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AlignmentResult | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [expandedChanges, setExpandedChanges] = useState<Record<string, boolean>>({})
  const [fixingIndex, setFixingIndex] = useState<number | null>(null)
  const [fixedIndexes, setFixedIndexes] = useState<Set<number>>(new Set())
  const [editingFix, setEditingFix] = useState<Record<number, string>>({})
  const supabase = createClient()
  const router = useRouter()

  async function runCheck() {
    setLoading(true)
    setResult(null)
    setFetchError(null)
    setApplied(false)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 55000)
      const res = await fetch('/api/brand-alignment-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_id: brandId }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      setResult(data)
    } catch (e) {
      setFetchError(String(e))
    } finally {
      setLoading(false)
    }
  }

  async function applyFix(index: number, issue: Issue) {
    if (!issue.fix || !issue.pillar) return
    setFixingIndex(index)
    try {
      const res = await fetch('/api/brand-alignment-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_id: brandId, field_key: issue.pillar, fix_instruction: issue.fix }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFixedIndexes(prev => new Set([...prev, index]))
      router.refresh()
    } catch (e) {
      setFetchError(String(e))
    } finally {
      setFixingIndex(null)
    }
  }

  async function applyChanges() {
    if (!result?.proposed_changes) return
    setApplying(true)
    const { error } = await supabase.from('brands').update(result.proposed_changes).eq('id', brandId)
    if (error) { alert('Save failed: ' + error.message); setApplying(false); return }
    setApplied(true)
    setApplying(false)
    router.refresh()
  }

  const changeCount = Object.keys(result?.proposed_changes ?? {}).length
  const costUsd = result
    ? ((result.cost_tokens.input - result.cost_tokens.cache_read) * 3 / 1_000_000
      + result.cost_tokens.cache_read * 0.3 / 1_000_000
      + result.cost_tokens.output * 15 / 1_000_000)
    : 0

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); if (!result) runCheck() }}
        className="text-xs text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors font-medium flex items-center gap-1.5"
      >
        <span>🔍</span> Check Brand Alignment
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Brand Alignment Check</h2>
                <p className="text-xs text-gray-400 mt-0.5">{brandName}</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="px-6 py-5 space-y-6">

              {/* Error */}
              {fetchError && !loading && (
                <div className="space-y-3">
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <p className="text-sm font-medium text-red-700 mb-1">Check failed</p>
                    <p className="text-xs text-red-600 font-mono break-all">{fetchError}</p>
                  </div>
                  <button type="button" onClick={runCheck}
                    className="text-xs bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                    Try again
                  </button>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">Analyzing your brand pillars…</p>
                  <p className="text-xs text-gray-400">This takes 5-10 seconds</p>
                </div>
              )}

              {/* Result */}
              {result && !loading && (
                <>
                  {/* Score + Summary */}
                  <div className="flex items-start gap-5">
                    <ScoreRing score={result.score} />
                    <div className="flex-1 space-y-1.5">
                      <p className="text-sm font-medium text-gray-800">
                        {result.score >= 80 ? 'Strong alignment' : result.score >= 60 ? 'Good — some improvements available' : 'Needs attention'}
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed">{result.summary}</p>
                      <p className="text-[11px] text-gray-400">
                        Cost: ${costUsd.toFixed(4)} · {result.cost_tokens.input} in / {result.cost_tokens.output} out tokens
                        {result.cost_tokens.cache_read > 0 && ` · ${result.cost_tokens.cache_read} cached`}
                      </p>
                    </div>
                  </div>

                  {/* Issues */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Issues & Observations</p>
                    {result.issues.length === 0 && (
                      <p className="text-sm text-gray-400 italic">No issues found — all pillars look good.</p>
                    )}
                    {result.issues.map((issue, i) => (
                      <div key={i} className={`border rounded-xl overflow-hidden ${issue.type === 'good' ? SEVERITY_STYLE.good : SEVERITY_STYLE[issue.severity]}`}>
                        <div className="px-4 py-3 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span>{TYPE_ICON[issue.type]}</span>
                            <span className="text-xs font-semibold">{issue.label}</span>
                            {issue.type !== 'good' && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wide ${
                                issue.severity === 'critical' ? 'bg-red-200 text-red-800' :
                                issue.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                                issue.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>{issue.severity}</span>
                            )}
                          </div>
                          <p className="text-xs leading-relaxed">{issue.description}</p>
                        </div>
                        {issue.fix && (
                          <div className="border-t border-current/10 bg-white/60 px-4 py-2.5 space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="text-green-600 mt-0.5 shrink-0 text-sm">→</span>
                              {editingFix[i] !== undefined ? (
                                <textarea
                                  value={editingFix[i]}
                                  onChange={e => setEditingFix(p => ({ ...p, [i]: e.target.value }))}
                                  rows={3}
                                  className="flex-1 text-xs text-gray-700 border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none bg-white"
                                  autoFocus
                                />
                              ) : (
                                <p className="text-xs text-gray-700 leading-relaxed flex-1">
                                  {issue.fix}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              {fixedIndexes.has(i) ? (
                                <span className="text-green-600 font-bold text-sm flex items-center gap-1">
                                  <span className="text-base">✓</span> Applied
                                </span>
                              ) : (
                                <>
                                  {editingFix[i] !== undefined ? (
                                    <button
                                      type="button"
                                      onClick={() => setEditingFix(p => { const n = { ...p }; delete n[i]; return n })}
                                      className="text-[11px] text-gray-400 hover:text-gray-600 px-2 py-1"
                                    >cancel</button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setEditingFix(p => ({ ...p, [i]: issue.fix! }))}
                                      className="text-[11px] text-gray-400 hover:text-gray-700 border border-gray-200 bg-white px-2.5 py-1 rounded-lg transition-colors"
                                      title="Edit fix instruction"
                                    >✏️ Edit</button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const finalFix = editingFix[i] !== undefined ? editingFix[i] : issue.fix!
                                      applyFix(i, { ...issue, fix: finalFix })
                                    }}
                                    disabled={fixingIndex === i}
                                    className="text-[11px] font-medium text-white bg-gray-900 hover:bg-gray-700 disabled:opacity-50 px-3 py-1 rounded-lg transition-colors"
                                  >
                                    {fixingIndex === i ? (
                                      <span className="flex items-center gap-1">
                                        <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin inline-block" />
                                        Fixing…
                                      </span>
                                    ) : 'Fix →'}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-gray-400">
                    Click <strong>Fix →</strong> to apply the suggestion directly to the pillar. The ✓ means it&apos;s been saved.
                  </p>

                  {/* Re-run */}
                  <button type="button" onClick={runCheck}
                    className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">
                    Run again
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
