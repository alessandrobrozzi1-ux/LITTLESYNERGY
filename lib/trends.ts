export async function fetchTrendingKeywords(
  languageCode: string,
  options?: { nicheContext?: string; fallbackKeywords?: string[] }
): Promise<{ keywords: string[]; source: 'scored' | 'claude_fallback' }> {
  // Delegate entirely to keyword scorer — more relevant than Google Trends RSS
  // which returns news/sports topics unrelated to our niche
  const { scoredKeywords, NICHE_CONTEXT } = await import('./keyword-scorer') as {
    scoredKeywords: (lang: string, used: Set<string>, niche?: string) => Promise<{ keyword: string }[]>
    NICHE_CONTEXT: Record<string, string>
  }
  const scored = await scoredKeywords(languageCode, new Set(), options?.nicheContext)
  const keywords = scored.map((k) => k.keyword)

  if (keywords.length >= 3) {
    return { keywords, source: 'scored' }
  }

  const fallback = options?.fallbackKeywords ?? (
    NICHE_CONTEXT[languageCode]
      ? NICHE_CONTEXT[languageCode].split(',').slice(0, 3).map((s: string) => s.trim())
      : ['doTERRA essential oils', 'lavender oil benefits', 'aromatherapy at home']
  )
  return { keywords: fallback, source: 'claude_fallback' }
}
