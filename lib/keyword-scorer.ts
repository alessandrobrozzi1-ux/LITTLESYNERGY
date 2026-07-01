import Anthropic from '@anthropic-ai/sdk'

export interface ScoredKeyword {
  keyword: string
  score: number        // 0-100 composite score
  volume: 'low' | 'medium' | 'high'
  difficulty: 'easy' | 'medium' | 'hard'
  relevance: number    // 1-10
}

export const NICHE_CONTEXT: Record<string, string> = {
  es: `doTERRA España, aceites esenciales, aromaterapia, bienestar natural, aceites esenciales doTERRA,
       negocio doTERRA España, comprar aceites esenciales, lavanda aceite, aceites esenciales usos,
       doTERRA precio España, kit inicio doTERRA, aceites para dormir, aceites para ansiedad natural`,
  en: `doTERRA essential oils, aromatherapy, natural wellness, essential oil uses, doTERRA starter kit,
       lavender oil benefits, peppermint oil, frankincense oil, doTERRA business, buy essential oils`,
  fr: `huiles essentielles doTERRA, aromathérapie, bien-être naturel, lavande huile essentielle,
       menthe poivrée, encens doTERRA, acheter huiles essentielles, huiles essentielles bienfaits`,
  de: `doTERRA ätherische Öle, Aromatherapie, natürliches Wohlbefinden, Lavendelöl, Pfefferminzöl,
       Weihrauch doTERRA, ätherische Öle kaufen, Wellness Öle Deutschland`,
  it: `oli essenziali doTERRA, aromaterapia, benessere naturale, lavanda olio essenziale,
       menta piperita, incenso doTERRA, comprare oli essenziali, oli essenziali benefici`,
  pt: `óleos essenciais doTERRA, aromaterapia, bem-estar natural, lavanda óleo essencial,
       hortelã-pimenta, incenso doTERRA, comprar óleos essenciais, óleos essenciais benefícios`,
}

const NICHE_CONTEXT_DEFAULT = `doTERRA essential oils, aromatherapy, natural wellness, essential oil uses,
  lavender oil benefits, peppermint oil, frankincense oil, buy essential oils`

export async function scoredKeywords(languageCode: string, usedKeywords: Set<string>, nicheContext?: string): Promise<ScoredKeyword[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const niche = nicheContext ?? NICHE_CONTEXT[languageCode] ?? NICHE_CONTEXT_DEFAULT
  const langLabel = languageCode
  const usedList = Array.from(usedKeywords).slice(0, 20).join(', ')

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `You are an SEO keyword research expert for a doTERRA essential oils affiliate blog targeting speakers of language code "${langLabel}".

Niche context: ${niche}

Recently used keywords (avoid these): ${usedList || 'none'}

Generate 6 SEO keyword ideas. For each keyword provide:
- keyword: the search term (write in the language matching code "${langLabel}")
- volume: estimated monthly searches category ("low" <500, "medium" 500-5000, "high" >5000)
- difficulty: competition level ("easy" = few competing articles, "medium", "hard" = very competitive)
- relevance: relevance to doTERRA/essential oils niche 1-10

Prioritize: high relevance (8-10) + medium/high volume + easy/medium difficulty = best opportunity.
Focus on informational and commercial intent keywords.

Return ONLY valid JSON array, no explanation:
[{"keyword":"...","volume":"medium","difficulty":"easy","relevance":9}, ...]`,
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) return []

  const raw = JSON.parse(match[0]) as Array<{
    keyword: string
    volume: 'low' | 'medium' | 'high'
    difficulty: 'easy' | 'medium' | 'hard'
    relevance: number
  }>

  const volumeScore = { low: 10, medium: 30, high: 50 }
  const difficultyScore = { easy: 30, medium: 15, hard: 0 }

  return raw
    .filter((k) => k.keyword && !usedKeywords.has(k.keyword.toLowerCase()))
    .map((k) => ({
      ...k,
      score: (k.relevance * 2) + volumeScore[k.volume] + difficultyScore[k.difficulty],
    }))
    .sort((a, b) => b.score - a.score)
}

export async function bestKeywordForToday(languageCode: string, usedKeywords: Set<string>, nicheContext?: string): Promise<string> {
  const keywords = await scoredKeywords(languageCode, usedKeywords, nicheContext)
  return keywords[0]?.keyword ?? (NICHE_CONTEXT[languageCode]?.split(',')[0]?.trim() ?? 'doTERRA essential oils')
}
