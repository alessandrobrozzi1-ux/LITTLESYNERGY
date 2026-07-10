import { NextRequest, NextResponse } from 'next/server'
import { llmText } from '@/lib/llm'

const COUNTRY_MAP: Record<string, string> = {
  es: 'ES',
  en: 'US',
  fr: 'FR',
  pt: 'BR',
  it: 'IT',
  de: 'DE',
}

const LANGUAGE_MAP: Record<string, string> = {
  es: 'Spanish',
  en: 'English',
  fr: 'French',
  pt: 'Portuguese',
  it: 'Italian',
  de: 'German',
}

async function fetchFromPytrends(languageCode: string): Promise<string[] | null> {
  const country = COUNTRY_MAP[languageCode]
  if (!country) return null

  try {
    const url = `https://trends.google.com/trending/rss?geo=${country}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) return null

    const text = await res.text()
    const matches = text.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g) ?? []

    const keywords = matches
      .map((m) => m.replace(/<title><!\[CDATA\[/, '').replace(/\]\]><\/title>/, '').trim())
      .filter((k) => k && !k.toLowerCase().includes('google trend'))
      .slice(0, 10)

    return keywords.length >= 3 ? keywords : null
  } catch {
    return null
  }
}

async function fetchFromClaude(languageCode: string): Promise<string[]> {
  const language = LANGUAGE_MAP[languageCode] ?? languageCode

  const text = await llmText({
    size: 'small',
    maxTokens: 512,
    user: `Give me 10 trending search keywords in ${language} for the wellness and essential oils niche.
Focus on topics people are actively searching right now: natural remedies, aromatherapy, doTERRA, essential oil uses, health benefits.
Return ONLY a JSON array of strings, no explanation. Example: ["keyword 1", "keyword 2", ...]`,
  })

  const match = text.match(/\[[\s\S]*?\]/)
  if (!match) throw new Error('LLM did not return valid JSON array')

  return JSON.parse(match[0]) as string[]
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { language_code: string } }
) {
  const { language_code } = params

  const pytrends = await fetchFromPytrends(language_code)

  if (pytrends) {
    return NextResponse.json({ keywords: pytrends, source: 'google_trends' })
  }

  try {
    const keywords = await fetchFromClaude(language_code)
    return NextResponse.json({ keywords, source: 'claude_fallback' })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch keywords', details: String(err) },
      { status: 500 }
    )
  }
}
