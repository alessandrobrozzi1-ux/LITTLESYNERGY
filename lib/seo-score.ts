export interface SeoMetrics {
  wordCount: number
  headings: number
  links: number
  metaDescriptionLength: number
  titleLength: number
  hasFeaturedImage: boolean
  hasKeywordInTitle: boolean
  hasFaq: boolean
  readability: 'Good' | 'Fair' | 'Poor'
}

export interface SeoScore {
  score: number      // 0-100
  label: string      // "Excellent" | "Good" | "Fair" | "Needs Work"
  metrics: SeoMetrics
}

export function calculateSeoScore(
  content: string,
  title: string,
  metaDescription: string,
  keyword: string,
  hasFeaturedImage: boolean
): SeoScore {
  const wordCount = content.split(/\s+/).filter(Boolean).length
  const headings = (content.match(/^#{1,3} .+/gm) ?? []).length
  const links = (content.match(/\[([^\]]+)\]\(([^)]+)\)/g) ?? []).length
  const metaLen = metaDescription.length
  const titleLen = title.length
  const hasKeywordInTitle = title.toLowerCase().includes(keyword.toLowerCase().split(' ')[0])
  const hasFaq = /^##\s+(FAQ|Frequently Asked Questions|Preguntas Frecuentes|Häufige Fragen|Foire aux Questions|Domande Frequenti)/im.test(content)
    || /^\*\*[A-ZÀ-Ÿ][^*\n]{10,200}\?\*\*\s*$/m.test(content)

  // Readability: avg sentence length heuristic
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10)
  const avgWords = sentences.length > 0
    ? sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length
    : 20
  const readability: SeoMetrics['readability'] = avgWords < 18 ? 'Good' : avgWords < 25 ? 'Fair' : 'Poor'

  const metrics: SeoMetrics = {
    wordCount, headings, links, metaDescriptionLength: metaLen,
    titleLength: titleLen, hasFeaturedImage, hasKeywordInTitle, hasFaq, readability,
  }

  // Scoring
  let score = 0
  score += Math.min(wordCount >= 900 ? 20 : wordCount >= 500 ? 12 : 6, 20)
  score += headings >= 4 ? 15 : headings >= 2 ? 10 : 5
  score += links >= 5 ? 15 : links >= 2 ? 8 : 2
  score += metaLen >= 140 && metaLen <= 160 ? 10 : metaLen > 100 ? 6 : 2
  score += titleLen >= 30 && titleLen <= 65 ? 10 : titleLen > 20 ? 6 : 2
  score += hasFeaturedImage ? 10 : 0
  score += hasKeywordInTitle ? 10 : 0
  score += hasFaq ? 5 : 0
  score += readability === 'Good' ? 5 : readability === 'Fair' ? 3 : 0

  const label = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Needs Work'

  return { score, label, metrics }
}
