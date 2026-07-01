'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import { BrandAlignmentCheck } from '@/components/brand-alignment-check'
import type { Brand } from '@/lib/types'

const LANGUAGE_OPTIONS = [
  { code: 'es', name: 'Spanish' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'it', name: 'Italian' },
  { code: 'de', name: 'German' },
]

const PILLARS = [
  {
    key: 'brand_dna_business_type' as const,
    label: 'Business Type',
    icon: '🏢',
    hint: 'What kind of business is this? Products, markets, certifications.',
    placeholder: 'doTERRA wellness affiliate brand. CPTG Certified Pure Tested Grade™. Essential oils, blends, supplements. Owner ID 15957920.',
    rows: 5,
  },
  {
    key: 'brand_dna_brand_voice' as const,
    label: 'Brand Voice & Tone',
    icon: '🎙️',
    hint: 'How should articles sound? Personality, style, what to avoid.',
    placeholder: 'Warm, confident, inspiring and care-oriented. Trusted friend who knows wellness deeply. Never clinical or preachy.',
    rows: 4,
  },
  {
    key: 'brand_dna_key_themes' as const,
    label: 'Key Themes',
    icon: '✨',
    hint: 'Recurring topics and angles the AI should lean into.',
    placeholder: 'Natural wellness routines, aromatherapy for everyday life, family self-care, clean living, emotional balance.',
    rows: 4,
  },
  {
    key: 'brand_dna_service_area' as const,
    label: 'Service Area & Link Rules',
    icon: '🌍',
    hint: 'Target markets, product slugs and linking conventions.',
    placeholder: 'Spain & Latin America. Shop: shop.doterra.com/ES/es_ES/shop/[slug]/?OwnerID=15957920',
    rows: 6,
  },
  {
    key: 'brand_dna_topics_to_avoid' as const,
    label: 'Topics to Avoid',
    icon: '🚫',
    hint: 'What the AI must never write about or claim.',
    placeholder: 'No medical/scientific claims (GABA, melatonin, cortisol). No competitors. No ADHD, depression, anxiety disorder diagnosis.',
    rows: 4,
  },
]

interface BrandFormProps {
  brand?: Brand
}

export function BrandForm({ brand }: BrandFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isNew = !brand

  const [saving, setSaving] = useState(false)
  const [savingField, setSavingField] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [editingPillar, setEditingPillar] = useState<string | null>(isNew ? 'basic' : null)
  const [showFooterInfo, setShowFooterInfo] = useState(false)
  const [footerPreview, setFooterPreview] = useState(false)
  const [editingFooter, setEditingFooter] = useState(false)

  const [form, setForm] = useState({
    language_code: brand?.language_code ?? 'es',
    language_name: brand?.language_name ?? 'Spanish',
    brand_name: brand?.brand_name ?? '',
    domain: brand?.domain ?? '',
    owner_id: brand?.owner_id ?? '',
    affiliate_base_url: brand?.affiliate_base_url ?? '',
    brand_dna_business_type: brand?.brand_dna_business_type ?? '',
    brand_dna_service_area: brand?.brand_dna_service_area ?? '',
    brand_dna_topics_to_avoid: brand?.brand_dna_topics_to_avoid ?? '',
    brand_dna_key_themes: brand?.brand_dna_key_themes ?? '',
    brand_dna_brand_voice: brand?.brand_dna_brand_voice ?? '',
    brand_dna_mandatory_footer: brand?.brand_dna_mandatory_footer ?? '',
    active: brand?.active ?? true,
  })

  function updateField(key: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleLanguageChange(code: string) {
    const lang = LANGUAGE_OPTIONS.find((l) => l.code === code)
    setForm((prev) => ({ ...prev, language_code: code, language_name: lang?.name ?? code }))
  }

  async function saveAll(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    if (isNew) {
      const { data, error: err } = await supabase.from('brands').insert([form]).select().single()
      if (err) { setError(err.message); setSaving(false); return }
      router.push(`/dashboard/brands/${data.id}`)
      router.refresh()
    } else {
      const { error: err } = await supabase.from('brands').update(form).eq('id', brand.id)
      if (err) { setError(err.message); setSaving(false); return }
      setSaving(false)
      router.refresh()
    }
  }

  async function savePillar(key: string) {
    if (!brand) return
    setSavingField(key)
    const patch = { [key]: form[key as keyof typeof form] }
    await supabase.from('brands').update(patch).eq('id', brand.id)
    setSavingField(null)
    setEditingPillar(null)
    router.refresh()
  }

  async function saveFooter() {
    if (!brand) return
    setSavingField('footer')
    await supabase.from('brands').update({ brand_dna_mandatory_footer: form.brand_dna_mandatory_footer }).eq('id', brand.id)
    setSavingField(null)
    setEditingFooter(false)
    router.refresh()
  }

  // ── NEW BRAND FORM ──────────────────────────────────────────
  if (isNew) {
    return (
      <form onSubmit={saveAll} className="space-y-6">
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-gray-900 border-b border-gray-100 pb-3">Basic Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Brand Name</label>
              <input value={form.brand_name} onChange={e => updateField('brand_name', e.target.value)} required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900" placeholder="My Brand" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Domain</label>
              <input value={form.domain} onChange={e => updateField('domain', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900" placeholder="mybrand.com" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Language</label>
              <select value={form.language_code} onChange={e => handleLanguageChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white">
                {LANGUAGE_OPTIONS.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </div>
            <div className="col-span-2 border-t border-gray-100 pt-4 mt-1">
              <p className="text-xs font-medium text-gray-500 mb-3">Affiliate Settings</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">doTERRA Owner ID</label>
                  <input value={form.owner_id} onChange={e => updateField('owner_id', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
                    placeholder="15957920" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Affiliate Base URL</label>
                  <input value={form.affiliate_base_url} onChange={e => updateField('affiliate_base_url', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
                    placeholder="https://shop.doterra.com/US/en_US/shop/essential-oils/?OwnerID=15957920" />
                  <p className="text-[10px] text-gray-400">Full fallback URL used when a product slug is not in Link Expert</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {PILLARS.map(({ key, label, placeholder, rows }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">{label}</label>
            <textarea value={form[key]} onChange={e => updateField(key, e.target.value)} placeholder={placeholder} rows={rows}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none" />
          </div>
        ))}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={saving} className="bg-gray-900 hover:bg-gray-800 text-white text-sm">
          {saving ? 'Creating...' : 'Create brand'}
        </Button>
      </form>
    )
  }

  // ── EXISTING BRAND — CARD LAYOUT ────────────────────────────
  return (
    <div className="space-y-10">

      {/* ── Basic Info card ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-sm font-medium text-gray-900">Basic Info</h2>
          {editingPillar === 'basic'
            ? <div className="flex gap-2">
                <button type="button" onClick={async () => { await saveAll({ preventDefault: () => {} } as React.FormEvent) }}
                  disabled={saving}
                  className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => setEditingPillar(null)} className="text-xs text-gray-400 hover:text-gray-600 px-2">Cancel</button>
              </div>
            : <button type="button" onClick={() => setEditingPillar('basic')}
                className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">Edit</button>
          }
        </div>
        {editingPillar === 'basic' ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Brand Name</label>
              <input value={form.brand_name} onChange={e => updateField('brand_name', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Domain</label>
              <input value={form.domain} onChange={e => updateField('domain', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900" />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={e => updateField('active', e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-700">Active (include in daily cron)</span>
              </label>
            </div>
            <div className="col-span-2 border-t border-gray-100 pt-3">
              <p className="text-xs font-medium text-gray-500 mb-3">Affiliate Settings</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">doTERRA Owner ID</label>
                  <input value={form.owner_id} onChange={e => updateField('owner_id', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
                    placeholder="15957920" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Affiliate Base URL</label>
                  <input value={form.affiliate_base_url} onChange={e => updateField('affiliate_base_url', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
                    placeholder="https://shop.doterra.com/US/en_US/shop/essential-oils/?OwnerID=15957920" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-xs text-gray-400 block">Brand</span><span className="font-medium text-gray-800">{form.brand_name}</span></div>
            <div><span className="text-xs text-gray-400 block">Domain</span><span className="text-gray-700">{form.domain || '—'}</span></div>
            <div><span className="text-xs text-gray-400 block">Language</span><span className="text-gray-700">{form.language_name} ({form.language_code})</span></div>
            <div><span className="text-xs text-gray-400 block">Status</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${form.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {form.active ? 'Active' : 'Paused'}
              </span>
            </div>
            {form.owner_id && (
              <div><span className="text-xs text-gray-400 block">Owner ID</span><span className="text-gray-700 font-mono text-xs">{form.owner_id}</span></div>
            )}
            {form.affiliate_base_url && (
              <div className="col-span-2"><span className="text-xs text-gray-400 block">Affiliate URL</span>
                <span className="text-gray-700 text-xs break-all">{form.affiliate_base_url}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Brand Pillars ── */}
      <section className="space-y-4">
        <div className="flex items-start justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-sm font-medium text-gray-900">Brand Pillars</h2>
            <p className="text-xs text-gray-400 mt-0.5">SoloSEO learns your brand from these. Click Edit on any pillar to update.</p>
          </div>
          <BrandAlignmentCheck brandId={brand.id} brandName={brand.brand_name} />
        </div>

        <div className="space-y-3">
          {PILLARS.map(({ key, label, icon, hint, placeholder, rows }) => (
            <div key={key} className="border border-gray-100 rounded-xl overflow-hidden">
              {/* Card header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50/60">
                <div className="flex items-center gap-2">
                  <span className="text-base">{icon}</span>
                  <div>
                    <p className="text-xs font-medium text-gray-800">{label}</p>
                    <p className="text-[11px] text-gray-400">{hint}</p>
                  </div>
                </div>
                {editingPillar === key
                  ? <div className="flex gap-2">
                      <button type="button" onClick={() => savePillar(key)} disabled={savingField === key}
                        className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 disabled:opacity-50">
                        {savingField === key ? 'Saving…' : 'Save'}
                      </button>
                      <button type="button" onClick={() => { setEditingPillar(null); setForm(prev => ({ ...prev, [key]: brand[key] ?? '' })) }}
                        className="text-xs text-gray-400 hover:text-gray-600 px-2">Cancel</button>
                    </div>
                  : <button type="button" onClick={() => setEditingPillar(key)}
                      className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-white transition-colors">Edit</button>
                }
              </div>

              {/* Card body */}
              <div className="px-4 py-3">
                {editingPillar === key ? (
                  <div className="space-y-1.5">
                    <textarea
                      value={form[key] as string}
                      onChange={e => updateField(key, e.target.value)}
                      placeholder={placeholder}
                      rows={rows}
                      autoFocus
                      maxLength={4000}
                      className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
                    />
                    <p className={`text-[11px] text-right ${(form[key] as string).length > 3800 ? 'text-amber-500' : 'text-gray-400'}`}>
                      {(form[key] as string).length} / 4000
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed line-clamp-4">
                    {(form[key] as string) || <span className="text-gray-300 italic">Not set yet — click Edit to configure</span>}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mandatory Footer ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-sm font-medium text-gray-900">📌 Mandatory Footer</h2>
            <p className="text-xs text-gray-400 mt-0.5">Appended to every article automatically. Your conversion CTA. Supports markdown.</p>
          </div>
          <div className="flex items-center gap-2">
            {editingFooter ? (
              <>
                <button type="button" onClick={() => setFooterPreview(!footerPreview)}
                  className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                  {footerPreview ? 'Edit' : '👁 Preview'}
                </button>
                <button type="button" onClick={saveFooter} disabled={savingField === 'footer'}
                  className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 disabled:opacity-50">
                  {savingField === 'footer' ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => { setEditingFooter(false); setFooterPreview(false); setForm(prev => ({ ...prev, brand_dna_mandatory_footer: brand.brand_dna_mandatory_footer ?? '' })) }}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2">Cancel</button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => setShowFooterInfo(true)}
                  className="w-6 h-6 rounded-full border border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600 text-xs font-medium flex items-center justify-center">?</button>
                <button type="button" onClick={() => setEditingFooter(true)}
                  className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">Edit</button>
              </>
            )}
          </div>
        </div>

        {editingFooter ? (
          footerPreview ? (
            <div className="border border-gray-200 rounded-xl p-5 min-h-[200px] prose prose-sm max-w-none prose-a:text-blue-600 prose-strong:text-gray-900 bg-gray-50">
              {form.brand_dna_mandatory_footer
                ? <ReactMarkdown>{form.brand_dna_mandatory_footer}</ReactMarkdown>
                : <p className="text-gray-400 text-sm italic">No footer set yet.</p>}
            </div>
          ) : (
            <textarea
              value={form.brand_dna_mandatory_footer}
              onChange={e => updateField('brand_dna_mandatory_footer', e.target.value)}
              placeholder={`¿Listo para empezar tu rutina de bienestar?\n\n🇪🇸 [Comprar doTERRA España — 25% de descuento](https://shop.doterra.com/...)\n\n💬 [WhatsApp](https://wa.me/...)`}
              rows={12}
              autoFocus
              className="w-full text-sm font-mono border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
            />
          )
        ) : (
          <div className="border border-gray-100 rounded-xl px-4 py-3 bg-gray-50/40">
            {form.brand_dna_mandatory_footer ? (
              <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed line-clamp-5 font-mono">
                {form.brand_dna_mandatory_footer}
              </p>
            ) : (
              <p className="text-sm text-gray-300 italic">No footer set yet — click Edit to configure</p>
            )}
          </div>
        )}

        {editingFooter && (
          <p className="text-xs text-gray-400">
            {form.brand_dna_mandatory_footer.length} characters · {form.brand_dna_mandatory_footer.split('\n').length} lines
          </p>
        )}
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Info modal */}
      {showFooterInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowFooterInfo(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">What is the Mandatory Footer?</h3>
              <button onClick={() => setShowFooterInfo(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <p>The Mandatory Footer is the <strong>conversion block</strong> appended to the end of every article SoloSEO generates — automatically, 100% of the time.</p>
              <p>Think of it as your <strong>universal CTA</strong>: affiliate links, country selectors, WhatsApp contact, disclaimer — whatever converts your reader into a customer.</p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="font-medium text-gray-700 text-xs uppercase tracking-wide">Best practices:</p>
                <ul className="space-y-1 text-xs list-disc list-inside text-gray-500">
                  <li>Use markdown for formatting and links</li>
                  <li>Include your main affiliate purchase link</li>
                  <li>Add country-specific links for your audience</li>
                  <li>Keep it under 200 words — readers see it on every article</li>
                  <li>Test links quarterly — broken links = €0 commissions</li>
                </ul>
              </div>
              <p className="text-xs text-gray-400">The AI is instructed to append this block exactly as-is. It is NOT part of the article content — it&apos;s injected programmatically after generation.</p>
            </div>
            <button onClick={() => setShowFooterInfo(false)} className="mt-5 w-full bg-gray-900 text-white text-sm py-2 rounded-lg hover:bg-gray-700 transition-colors">
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
