import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const maxDuration = 30

interface SlugResult {
  slug: string
  anchor_text: string
  full_url: string
  already_exists: boolean
}

function buildResults(
  slugMap: Map<string, string>,
  base: string,
  isNewFormat: boolean,
  ownerId: string,
  existingUrls: Set<string>
): SlugResult[] {
  return Array.from(slugMap.entries()).map(([slug, anchor_text]) => {
    // Preserve the original prefix (pl/, p/, c/) captured from pasted URLs if available
    // For www.doterra.com the affiliate link keeps the /pl/ prefix
    const full_url = isNewFormat
      ? `${base}/pl/${slug}/?OwnerID=${ownerId}`
      : `${base}/${slug}/?OwnerID=${ownerId}`
    return { slug, anchor_text, full_url, already_exists: existingUrls.has(full_url) }
  })
}

export async function POST(req: NextRequest) {
  try {
    const { brand_id, market_url, owner_id, pasted_urls, dry_run = true } = await req.json()

    if (!brand_id || !owner_id) {
      return NextResponse.json({ error: 'brand_id, owner_id required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: existing } = await supabase
      .from('link_expert')
      .select('full_url')
      .eq('brand_id', brand_id)
    const existingUrls = new Set((existing ?? []).map((r: { full_url: string }) => r.full_url))

    const isNewFormat = (market_url ?? '').includes('www.doterra.com')
    const isPlFormat = isNewFormat  // www.doterra.com uses /pl/ for product lines
    const base = (market_url ?? '').replace(/\/$/, '')

    // ── Mode A: pasted URLs from user ────────────────────────────────────────
    if (pasted_urls) {
      // Map: full_path (e.g. "pl/lavender") → anchor_text
      const pathMap = new Map<string, string>()
      // Capture optional prefix (pl/, p/, c/) + slug
      const urlRe = /https?:\/\/[^\s"'<>]+\/shop\/((?:p\/|pl\/|c\/)?([a-z0-9][a-z0-9-]{2,60}))(?:\/|\?|$)/gi
      for (const m of pasted_urls.matchAll(urlRe)) {
        const fullPath = m[1].toLowerCase()  // e.g. "pl/lavender" or "lavender"
        const slug = m[2].toLowerCase()       // e.g. "lavender"
        if (slug && slug !== 'shop' && slug !== 'essential-oils' && !pathMap.has(fullPath)) {
          pathMap.set(fullPath, slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
        }
      }
      // Build results preserving original path structure
      const results: SlugResult[] = Array.from(pathMap.entries()).map(([fullPath, anchor_text]) => {
        const slug = fullPath.split('/').pop()!
        const full_url = `${base}/${fullPath}/?OwnerID=${owner_id}`
        return { slug, anchor_text, full_url, already_exists: existingUrls.has(full_url) }
      })
      if (!dry_run) await insertNew(supabase, brand_id, results, 'paste')
      return NextResponse.json({ method: 'paste', found: results.length, new: results.filter(r => !r.already_exists).length, results })
    }

    if (!market_url) {
      return NextResponse.json({ error: 'market_url required when not using pasted_urls' }, { status: 400 })
    }

    // ── Mode B: try sitemap.xml ───────────────────────────────────────────────
    const sitemapUrls = [
      `${base}/sitemap.xml`,
      base.replace('/shop', '') + '/sitemap.xml',
      base.replace('/US/en/shop', '/sitemap.xml'),
    ]

    let sitemapXml = ''
    let sitemapUrl = ''
    for (const url of sitemapUrls) {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SoloSEO/1.0)', 'Accept': 'text/xml,application/xml,*/*' },
          signal: AbortSignal.timeout(8_000),
        })
        if (res.ok) {
          const text = await res.text()
          if (text.includes('<loc>') || text.includes('<sitemap>')) {
            sitemapXml = text
            sitemapUrl = url
            break
          }
        }
      } catch { /* try next */ }
    }

    if (sitemapXml) {
      // If it's a sitemap index, find product sitemaps
      if (sitemapXml.includes('<sitemapindex')) {
        const subUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/gi)]
          .map(m => m[1])
          .filter(u => u.includes('product') || u.includes('shop'))
        // Try fetching the first product sitemap
        for (const subUrl of subUrls.slice(0, 3)) {
          try {
            const res = await fetch(subUrl, { signal: AbortSignal.timeout(8_000) })
            if (res.ok) sitemapXml += await res.text()
          } catch { /* skip */ }
        }
      }

      const slugMap = new Map<string, string>()
      const locRe = /<loc>(.*?)<\/loc>/gi
      for (const m of sitemapXml.matchAll(locRe)) {
        const loc = m[1]
        const slug = loc.match(/\/shop\/(?:p\/)?([a-z0-9][a-z0-9-]{2,60})(?:\/|\?|$)/i)?.[1]?.toLowerCase()
        if (slug && slug !== 'shop' && slug !== 'essential-oils' && !slugMap.has(slug)) {
          slugMap.set(slug, slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
        }
      }

      if (slugMap.size > 0) {
        const results = buildResults(slugMap, base, isNewFormat, owner_id, existingUrls)
        if (!dry_run) await insertNew(supabase, brand_id, results, 'sitemap')
        return NextResponse.json({ method: 'sitemap', sitemap_url: sitemapUrl, found: results.length, new: results.filter(r => !r.already_exists).length, results })
      }

      return NextResponse.json({ method: 'sitemap', found: 0, new: 0, results: [], sitemap_url: sitemapUrl, note: 'Sitemap found but no /shop/ product URLs inside. Use Paste URLs mode.' })
    }

    // ── Mode C: static HTML parse (last resort) ───────────────────────────────
    try {
      const res = await fetch(`${base}/essential-oils/?OwnerID=${owner_id}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SoloSEO/1.0)' },
        signal: AbortSignal.timeout(8_000),
      })
      if (res.ok) {
        const html = await res.text()
        const slugMap = new Map<string, string>()
        const escapedBase = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const re = new RegExp(`${escapedBase}/(?:p/)?([a-z0-9][a-z0-9-]+)(?:/|\\?|$)`, 'gi')
        for (const m of html.matchAll(re)) {
          const slug = m[1].toLowerCase()
          if (slug && slug !== 'essential-oils' && !slugMap.has(slug)) {
            slugMap.set(slug, slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
          }
        }
        if (slugMap.size > 0) {
          const results = buildResults(slugMap, base, isNewFormat, owner_id, existingUrls)
          if (!dry_run) await insertNew(supabase, brand_id, results, 'static')
          return NextResponse.json({ method: 'static', found: results.length, new: results.filter(r => !r.already_exists).length, results })
        }
      }
    } catch { /* fall through */ }

    return NextResponse.json({
      method: 'none',
      found: 0,
      new: 0,
      results: [],
      note: 'No sitemap found and page is JS-rendered. Use Paste URLs mode: copy product URLs from the doTERRA shop page in your browser and paste them in the text box.',
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

async function insertNew(
  supabase: ReturnType<typeof import('@/lib/supabase/server').createAdminClient>,
  brand_id: string,
  results: SlugResult[],
  method: string
) {
  const toInsert = results
    .filter(r => !r.already_exists)
    .map(r => ({ brand_id, anchor_text: r.anchor_text, full_url: r.full_url, category: 'product', priority: 5, notes: `auto-scraped:${method}`, active: true }))
  if (toInsert.length > 0) await supabase.from('link_expert').insert(toInsert)
}
