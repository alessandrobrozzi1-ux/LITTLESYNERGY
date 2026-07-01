'use client'

import { useState, useEffect, useRef } from 'react'

interface LinkEntry {
  id: string
  anchor_text: string
  full_url: string
  category: 'product' | 'category' | 'cta' | 'external'
  priority: number
  notes: string
  verified: boolean
  verified_at: string | null
  active: boolean
}

const CATEGORY_COLORS = {
  product: 'bg-blue-50 text-blue-700',
  category: 'bg-purple-50 text-purple-700',
  cta: 'bg-green-50 text-green-700',
  external: 'bg-gray-100 text-gray-600',
}

interface ScraperResult {
  slug: string
  anchor_text: string
  full_url: string
  already_exists: boolean
}

interface ScraperState {
  open: boolean
  marketUrl: string
  ownerId: string
  pastedUrls: string
  loading: boolean
  fetched: boolean | null
  method: string | null
  note: string | null
  results: ScraperResult[]
  selected: Set<string>
  saved: number | null
}

export function LinkExpert({ brandId }: { brandId: string }) {
  const [links, setLinks] = useState<LinkEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [searchQ, setSearchQ] = useState('')
  const [filterCat, setFilterCat] = useState<string>('all')
  const csvRef = useRef<HTMLInputElement>(null)
  const [scraper, setScraper] = useState<ScraperState>({
    open: false, marketUrl: '', ownerId: '', pastedUrls: '', loading: false,
    fetched: null, method: null, note: null, results: [], selected: new Set(), saved: null,
  })

  const [form, setForm] = useState({ anchor_text: '', full_url: '', category: 'product', priority: 0, notes: '' })

  useEffect(() => { loadLinks() }, [brandId])

  async function loadLinks() {
    setLoading(true)
    const res = await fetch(`/api/link-expert?brand_id=${brandId}`)
    const data = await res.json()
    setLinks(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function handleAdd() {
    if (!form.anchor_text.trim() || !form.full_url.trim()) return
    await fetch('/api/link-expert', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand_id: brandId, ...form }),
    })
    setForm({ anchor_text: '', full_url: '', category: 'product', priority: 0, notes: '' })
    setShowAdd(false)
    await loadLinks()
  }

  async function handleEdit(id: string, patch: Partial<LinkEntry>) {
    await fetch(`/api/link-expert/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    setEditId(null)
    await loadLinks()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/link-expert/${id}`, { method: 'DELETE' })
    setLinks(prev => prev.filter(l => l.id !== id))
  }

  async function handleVerify(id: string, full_url: string) {
    setVerifyingId(id)
    const res = await fetch('/api/link-expert/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, full_url }),
    })
    const data = await res.json()
    setLinks(prev => prev.map(l => l.id === id ? { ...l, verified: data.verified, verified_at: data.verified ? new Date().toISOString() : null } : l))
    setVerifyingId(null)
  }

  async function handleScrape() {
    setScraper(s => ({ ...s, loading: true, results: [], fetched: null, method: null, note: null, saved: null }))
    const body: Record<string, unknown> = { brand_id: brandId, owner_id: scraper.ownerId, dry_run: true }
    if (scraper.pastedUrls.trim()) {
      body.pasted_urls = scraper.pastedUrls
      body.market_url = scraper.marketUrl
    } else {
      body.market_url = scraper.marketUrl
    }
    const res = await fetch('/api/scrape-slugs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    const results: ScraperResult[] = data.results ?? []
    setScraper(s => ({
      ...s,
      loading: false,
      fetched: results.length > 0,
      method: data.method ?? null,
      note: data.note ?? data.error ?? null,
      results,
      selected: new Set(results.filter(r => !r.already_exists).map(r => r.slug)),
    }))
  }

  async function handleScraperSave() {
    const toSave = scraper.results.filter(r => scraper.selected.has(r.slug) && !r.already_exists)
    for (const r of toSave) {
      await fetch('/api/link-expert', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_id: brandId, anchor_text: r.anchor_text, full_url: r.full_url, category: 'product', priority: 5, notes: 'auto-scraped' }),
      })
    }
    setScraper(s => ({ ...s, saved: toSave.length }))
    await loadLinks()
  }

  async function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const lines = text.trim().split('\n').slice(1) // skip header
    const rows = lines.map(l => {
      const [anchor_text, full_url, category, priority] = l.split(',').map(s => s.trim().replace(/^"|"$/g, ''))
      return { brand_id: brandId, anchor_text, full_url, category: category || 'product', priority: parseInt(priority) || 0, notes: '' }
    }).filter(r => r.anchor_text && r.full_url)

    for (const row of rows) {
      await fetch('/api/link-expert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(row) })
    }
    await loadLinks()
    e.target.value = ''
  }

  const filtered = links.filter(l => {
    const matchQ = !searchQ || l.anchor_text.toLowerCase().includes(searchQ.toLowerCase()) || l.full_url.toLowerCase().includes(searchQ.toLowerCase())
    const matchCat = filterCat === 'all' || l.category === filterCat
    return matchQ && matchCat
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">{links.length} links · {links.filter(l => l.verified).length} verified</p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={csvRef} type="file" accept=".csv" onChange={handleCSV} className="hidden" />
          <button
            onClick={() => setScraper(s => ({ ...s, open: !s.open }))}
            className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ⟳ Slug Scraper
          </button>
          <button
            onClick={() => csvRef.current?.click()}
            className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ↑ Import CSV
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="text-xs text-white bg-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
          >
            + Add Link
          </button>
        </div>
      </div>

      {/* Slug Scraper panel */}
      {scraper.open && (
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
          <p className="text-xs font-medium text-gray-700">Slug Scraper — auto-import product links from doTERRA shop</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Market Shop URL</label>
              <input
                placeholder="https://www.doterra.com/US/en/shop"
                value={scraper.marketUrl}
                onChange={e => setScraper(s => ({ ...s, marketUrl: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Owner ID</label>
              <input
                placeholder="15957920"
                value={scraper.ownerId}
                onChange={e => setScraper(s => ({ ...s, ownerId: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-gray-500 mb-1">
              Paste URLs (optional) — open doTERRA shop in browser, select all text on page, paste here
            </label>
            <textarea
              rows={4}
              placeholder={`Paste any text containing doTERRA product URLs, e.g.:\nhttps://www.doterra.com/US/en/shop/p/lavender-15ml\nhttps://www.doterra.com/US/en/shop/p/peppermint-15ml\n\nSlugs are extracted automatically.`}
              value={scraper.pastedUrls}
              onChange={e => setScraper(s => ({ ...s, pastedUrls: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
            />
            <p className="text-[10px] text-gray-400 mt-1">If left empty, tries sitemap.xml auto-detection first.</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleScrape}
              disabled={scraper.loading || !scraper.ownerId || (!scraper.marketUrl && !scraper.pastedUrls.trim())}
              className="text-xs bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              {scraper.loading ? '⟳ Extracting...' : scraper.pastedUrls.trim() ? 'Extract from pasted URLs' : 'Scan shop (sitemap)'}
            </button>
            {scraper.results.length > 0 && (
              <button
                onClick={handleScraperSave}
                disabled={scraper.selected.size === 0}
                className="text-xs bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50"
              >
                Import selected ({scraper.selected.size})
              </button>
            )}
          </div>

          {scraper.fetched === false && scraper.method && (
            <p className="text-[10px] text-amber-600">
              {scraper.note ?? `0 products found via ${scraper.method}.`}
            </p>
          )}
          {scraper.saved !== null && (
            <p className="text-[10px] text-green-600">{scraper.saved} links imported successfully.</p>
          )}

          {scraper.results.length > 0 && (
            <div className="border border-gray-100 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 w-6">
                      <input type="checkbox"
                        checked={scraper.selected.size === scraper.results.filter(r => !r.already_exists).length}
                        onChange={e => setScraper(s => ({
                          ...s,
                          selected: e.target.checked
                            ? new Set(s.results.filter(r => !r.already_exists).map(r => r.slug))
                            : new Set(),
                        }))}
                      />
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Slug</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Anchor</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {scraper.results.map(r => (
                    <tr key={r.slug} className={r.already_exists ? 'opacity-40' : ''}>
                      <td className="px-3 py-2">
                        {!r.already_exists && (
                          <input type="checkbox"
                            checked={scraper.selected.has(r.slug)}
                            onChange={e => setScraper(s => {
                              const sel = new Set(s.selected)
                              e.target.checked ? sel.add(r.slug) : sel.delete(r.slug)
                              return { ...s, selected: sel }
                            })}
                          />
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-gray-700">{r.slug}</td>
                      <td className="px-3 py-2 text-gray-600">{r.anchor_text}</td>
                      <td className="px-3 py-2">
                        {r.already_exists
                          ? <span className="text-green-600 text-[10px]">already in DB</span>
                          : <span className="text-blue-600 text-[10px]">new</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search links..."
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
        {(['all', 'product', 'category', 'cta', 'external'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`text-xs px-2.5 py-1 rounded-full capitalize transition-colors ${filterCat === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
          <p className="text-xs font-medium text-gray-700">New Link</p>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Anchor text (e.g. Lavanda)" value={form.anchor_text} onChange={e => setForm(p => ({ ...p, anchor_text: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900" />
            <input placeholder="Full URL (with ?OwnerID=...)" value={form.full_url} onChange={e => setForm(p => ({ ...p, full_url: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900" />
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-gray-900">
              <option value="product">Product</option>
              <option value="category">Category</option>
              <option value="cta">CTA</option>
              <option value="external">External</option>
            </select>
            <input type="number" placeholder="Priority (0-10)" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: parseInt(e.target.value) || 0 }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900" />
            <input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="text-xs bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700">Save</button>
            <button onClick={() => setShowAdd(false)} className="text-xs text-gray-500 px-3 py-2 hover:text-gray-700">Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-gray-50 rounded-lg animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">No links yet.</p>
          <p className="text-xs mt-1">Add links manually or import a CSV.</p>
        </div>
      ) : (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Anchor</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">URL</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Category</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Pri</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(link => (
                <tr key={link.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{link.anchor_text}</td>
                  <td className="px-4 py-2.5 max-w-[200px]">
                    <a href={link.full_url} target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate block" title={link.full_url}>
                      {link.full_url.replace('https://shop.doterra.com/ES/es_ES/shop/', '').replace('/?OwnerID=15957920', '')}
                    </a>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${CATEGORY_COLORS[link.category]}`}>
                      {link.category}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{link.priority}</td>
                  <td className="px-4 py-2.5">
                    {link.verified ? (
                      <span className="text-green-600 font-medium">✓ verified</span>
                    ) : (
                      <button onClick={() => handleVerify(link.id, link.full_url)} disabled={verifyingId === link.id}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50">
                        {verifyingId === link.id ? '⟳' : 'verify'}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => handleDelete(link.id)} className="text-gray-300 hover:text-red-400 transition-colors" title="Remove">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400">
        CSV format: <code className="bg-gray-100 px-1 rounded">anchor_text,full_url,category,priority</code>
      </p>
    </div>
  )
}
