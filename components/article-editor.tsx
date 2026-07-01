'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { calculateSeoScore } from '@/lib/seo-score'

interface ArticleEditorProps {
  articleId: string
  initialTitle: string
  initialContent: string
  initialMeta: string
  initialSlug: string
  initialKeyword: string
  initialFeaturedImage?: string | null
  hasFeaturedImage: boolean
  mandatoryFooter: string
  initialStatus?: string
}

const MEDICAL_KEYWORDS = ['GABA', 'melatonina', 'cortisol', 'TDAH', 'depresión clínica', 'ansiedad severa', 'trastorno', 'insomnio clínico', 'serotonina', 'dopamina']

export function ArticleEditor({
  articleId,
  initialTitle,
  initialContent,
  initialMeta,
  initialSlug,
  initialKeyword,
  initialFeaturedImage,
  hasFeaturedImage: initialHasFeaturedImage,
  mandatoryFooter,
  initialStatus = 'published',
}: ArticleEditorProps) {
  const [mode, setMode] = useState<'preview' | 'edit'>('preview')
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [meta, setMeta] = useState(initialMeta)
  const [slug, setSlug] = useState(initialSlug)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [status, setStatus] = useState(initialStatus)
  const [publishing, setPublishing] = useState(false)
  const [featuredImage, setFeaturedImage] = useState<string | null>(initialFeaturedImage ?? null)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [imagePrompt, setImagePrompt] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)

  const hasFeaturedImage = !!featuredImage
  const seo = calculateSeoScore(content, title, meta, initialKeyword, hasFeaturedImage)
  const wordCount = content.split(/\s+/).filter(Boolean).length
  const headings = (content.match(/^#{1,3} .+/gm) ?? []).length
  const links = (content.match(/\[([^\]]+)\]\(([^)]+)\)/g) ?? []).length
  const medicalFound = MEDICAL_KEYWORDS.filter((k) => content.includes(k))
  const footerPresent = mandatoryFooter ? content.includes(mandatoryFooter.substring(0, 40)) : true
  const hasFaq = /preguntas frecuentes|FAQ/i.test(content)

  const arcColor = seo.score >= 80 ? '#16a34a' : seo.score >= 60 ? '#ca8a04' : '#dc2626'

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    await fetch(`/api/articles/${articleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content_markdown: content, meta_description: meta, slug }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handlePublish() {
    setPublishing(true)
    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, content_markdown: content, meta_description: meta, slug,
          status: 'published',
          published_at: new Date().toISOString(),
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(`Publish failed: ${err.error || res.status}`)
        setPublishing(false)
        return
      }
      // Reload from server to confirm DB was updated
      window.location.reload()
    } catch (e) {
      alert(`Publish error: ${e}`)
      setPublishing(false)
    }
  }

  async function doGenerateImage(): Promise<{ image_url?: string; prompt?: string; error?: string }> {
    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ article_id: articleId, title, keyword: initialKeyword }),
    })
    const text = await res.text()
    try {
      return JSON.parse(text)
    } catch {
      // Server returned non-JSON (timeout HTML, gateway error, etc.)
      // The image may still have been saved server-side — caller will surface a friendly message
      return { error: res.ok ? 'Image generated but response unreadable — reload to see it' : `Server error (${res.status}) — reload page to check if image was saved` }
    }
  }

  async function handleGenerateImage() {
    setGeneratingImage(true)
    setImagePrompt(null)
    setImageError(null)
    try {
      let data = await doGenerateImage()

      // 1 automatic retry after 3s for transient timeouts
      if (data.error && !data.image_url) {
        await new Promise(r => setTimeout(r, 3000))
        data = await doGenerateImage()
      }

      if (data.image_url) {
        setFeaturedImage(data.image_url)
        setImagePrompt(data.prompt ?? null)
      } else {
        setImageError(data.error ?? 'Unknown error — reload the page to check if the image was saved')
      }
    } catch (e) {
      setImageError('Network error — reload the page to check if the image was saved')
    } finally {
      setGeneratingImage(false)
    }
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* LEFT: title + preview/edit + content + save */}
      <div className="col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 mr-4">
            <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          {status === 'draft' ? (
            <div className="flex items-center gap-2 mt-5 flex-shrink-0">
              <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                Draft
              </span>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors"
              >
                {publishing ? 'Publishing...' : '↑ Publish'}
              </button>
            </div>
          ) : (
            <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full mt-5 flex-shrink-0">
              ● Published
            </span>
          )}
        </div>

        <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-4 text-sm">
          <button
            onClick={() => setMode('preview')}
            className={`flex-1 py-2 font-medium transition-colors ${mode === 'preview' ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}`}
          >
            Preview
          </button>
          <button
            onClick={() => setMode('edit')}
            className={`flex-1 py-2 font-medium transition-colors border-l border-gray-200 ${mode === 'edit' ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}`}
          >
            Edit
          </button>
        </div>

        <div className="border border-gray-100 rounded-lg overflow-hidden">
          {mode === 'preview' ? (
            <div className="p-6 prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-strong:text-gray-900 prose-li:text-gray-700 prose-hr:border-gray-200">
              <ReactMarkdown
                components={{
                  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[600px] p-6 text-sm text-gray-700 font-mono leading-relaxed resize-none focus:outline-none"
            />
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* RIGHT: SEO score + image + quality + settings */}
      <div className="col-span-1 space-y-4">

        {/* SEO Score */}
        <div className="border border-gray-100 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-700 mb-4">SEO Score</p>
          <div className="flex flex-col items-center mb-4">
            <svg width="100" height="60" viewBox="0 0 100 60">
              <path d="M10 55 A45 45 0 0 1 90 55" fill="none" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" />
              <path d="M10 55 A45 45 0 0 1 90 55" fill="none" stroke={arcColor} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(seo.score / 100) * 141} 141`} />
            </svg>
            <div className="-mt-3 text-center">
              <span className="text-2xl font-bold text-gray-900">{seo.score}</span>
            </div>
            <span className="text-xs text-gray-500 mt-1">{seo.label}</span>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Word Count', value: wordCount.toLocaleString(), ok: wordCount >= 500 },
              { label: 'Readability', value: seo.metrics.readability, ok: seo.metrics.readability !== 'Poor' },
              { label: 'Headings', value: String(headings), ok: headings >= 2 },
              { label: 'Meta Description', value: `${meta.length} chars`, ok: meta.length >= 140 && meta.length <= 165 },
              { label: 'Title', value: `${title.length} chars`, ok: title.length >= 30 && title.length <= 65 },
              { label: 'Featured Image', value: hasFeaturedImage ? 'Yes ✓' : 'No', ok: hasFeaturedImage },
              { label: 'Links', value: String(links), ok: links >= 3 },
            ].map((row) => (
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

        {/* Featured Image */}
        <div className="border border-gray-100 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-700 mb-3">Featured Image</p>

          {featuredImage ? (
            <div className="space-y-2">
              <img
                src={featuredImage}
                alt="Featured"
                className="w-full rounded-lg object-cover aspect-video"
              />
              {imagePrompt && (
                <p className="text-[10px] text-gray-400 italic leading-relaxed">{imagePrompt}</p>
              )}
              <button
                onClick={handleGenerateImage}
                disabled={generatingImage}
                className="w-full py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {generatingImage ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <span className="animate-spin">⟳</span> Generating...
                  </span>
                ) : '↺ Regenerate Image'}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-full aspect-video bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-400">No image yet</span>
              </div>
              <button
                onClick={handleGenerateImage}
                disabled={generatingImage}
                className="w-full py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {generatingImage ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⟳</span> Generating with DALL·E 3...
                  </span>
                ) : '✦ Generate Image'}
              </button>
              <p className="text-[10px] text-gray-400 text-center">AI generates a relevant wellness image • +10 SEO pts</p>
              {imageError && (
                <p className="text-[10px] text-red-500 text-center break-all">{imageError}</p>
              )}
            </div>
          )}
        </div>

        {/* Quality check */}
        <div className={`border rounded-lg p-4 ${[wordCount > 800, footerPresent, medicalFound.length === 0, hasFaq].every(Boolean) ? 'border-gray-200 bg-gray-50' : 'border-amber-200 bg-amber-50'}`}>
          <p className="text-xs font-medium text-gray-700 mb-3">Quality Check</p>
          <div className="space-y-1.5">
            {[
              { label: `Word count > 800 (${wordCount} words)`, pass: wordCount > 800 },
              { label: 'Mandatory footer present', pass: footerPresent },
              { label: 'No medical claims', pass: medicalFound.length === 0 },
              { label: 'FAQ section present', pass: hasFaq },
            ].map((c) => (
              <div key={c.label} className="flex items-start gap-2">
                <span className={`text-xs mt-0.5 ${c.pass ? 'text-green-600' : 'text-red-500'}`}>{c.pass ? '✓' : '✗'}</span>
                <span className={`text-xs ${c.pass ? 'text-gray-600' : 'text-red-600'}`}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SEO settings */}
        <div className="border border-gray-100 rounded-lg p-4 space-y-4">
          <p className="text-xs font-medium text-gray-700">SEO Settings</p>
          <div>
            <label className="block text-xs text-gray-500 mb-1">URL Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Meta Description</label>
            <textarea
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
              rows={4}
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-700 resize-none focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
            <p className="text-[10px] text-gray-400 mt-1">{meta.length}/155 characters</p>
          </div>
        </div>

      </div>
    </div>
  )
}
