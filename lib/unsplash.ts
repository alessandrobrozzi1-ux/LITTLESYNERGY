const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

const FALLBACK_QUERIES = ['essential oils', 'aromatherapy', 'natural wellness', 'lavender oil']

export async function fetchFeaturedImage(keyword: string): Promise<string | null> {
  if (!UNSPLASH_ACCESS_KEY) return null

  const query = encodeURIComponent(keyword + ' essential oils')

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&per_page=5&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }, signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) throw new Error('unsplash error')
    const data = await res.json() as { results: Array<{ urls: { regular: string } }> }
    if (data.results.length > 0) return data.results[0].urls.regular
  } catch {
    // try fallback
  }

  // Try generic fallback query
  for (const q of FALLBACK_QUERIES) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=3&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }, signal: AbortSignal.timeout(5000) }
      )
      if (!res.ok) continue
      const data = await res.json() as { results: Array<{ urls: { regular: string } }> }
      if (data.results.length > 0) return data.results[0].urls.regular
    } catch {
      continue
    }
  }

  return null
}
