/**
 * Pinterest auto-pin integration — SoloSEO doTERRA
 * Pinterest API v5. Token SEMPRE da process.env.PINTEREST_ACCESS_TOKEN (mai hardcoded).
 * Isolato dal resto del sistema: ogni errore Pinterest viene loggato, mai propagato.
 */
import Anthropic from '@anthropic-ai/sdk'
import type { SupabaseClient } from '@supabase/supabase-js'

const PINTEREST_API = 'https://api.pinterest.com/v5'

function token(): string {
  const t = process.env.PINTEREST_ACCESS_TOKEN
  if (!t) throw new Error('PINTEREST_ACCESS_TOKEN env var missing')
  return t
}

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' }
}

// ─── Raw API ──────────────────────────────────────────────────────────────────

export async function getPinterestUserAccount(): Promise<{ username?: string; id?: string; [k: string]: unknown }> {
  const res = await fetch(`${PINTEREST_API}/user_account`, { headers: authHeaders() })
  if (!res.ok) throw new Error(`user_account ${res.status}: ${await res.text()}`)
  return res.json()
}

export interface PinterestBoard { id: string; name: string; privacy?: string }

export async function getPinterestBoards(): Promise<PinterestBoard[]> {
  const out: PinterestBoard[] = []
  let bookmark = ''
  do {
    const u = new URL(`${PINTEREST_API}/boards`)
    u.searchParams.set('page_size', '100')
    if (bookmark) u.searchParams.set('bookmark', bookmark)
    const res = await fetch(u.toString(), { headers: authHeaders() })
    if (!res.ok) throw new Error(`boards ${res.status}: ${await res.text()}`)
    const data = await res.json()
    for (const b of data.items ?? []) out.push({ id: b.id, name: b.name, privacy: b.privacy })
    bookmark = data.bookmark ?? ''
  } while (bookmark)
  return out
}

export interface CreatePinArgs {
  boardId: string
  link: string
  title: string
  description: string
  imageUrl: string
}

export async function createPinterestPin(a: CreatePinArgs): Promise<{ id: string; [k: string]: unknown }> {
  const body = {
    board_id: a.boardId,
    title: a.title.slice(0, 100),
    description: a.description.slice(0, 800),
    link: a.link,
    media_source: { source_type: 'image_url', url: a.imageUrl },
  }
  const res = await fetch(`${PINTEREST_API}/pins`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`create pin ${res.status}: ${await res.text()}`)
  return res.json()
}

// ─── Vertical pin image (1024x1536) ─────────────────────────────────────────────

function baseUrl(): string {
  return process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000'
}

/**
 * Ensure a VERTICAL Pinterest image (1024x1536) exists for the article.
 * Reuses article.pinterest_image if already set. Otherwise calls /api/generate-image
 * with target='pinterest_image' → writes ONLY the pinterest_image column (featured_image untouched).
 * Returns the image URL, or null on failure.
 */
export async function generatePinImage(article: { id: string; title: string; keyword_source?: string | null; pinterest_image?: string | null }): Promise<string | null> {
  if (article.pinterest_image) return article.pinterest_image
  try {
    const res = await fetch(`${baseUrl()}/api/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        article_id: article.id,
        keyword: article.keyword_source ?? article.title,
        size: '1024x1536',
        target: 'pinterest_image',
      }),
    })
    if (!res.ok) return null
    const d = await res.json()
    return d.image_url ?? null
  } catch {
    return null
  }
}

// ─── Pin content generation (Claude) ────────────────────────────────────────────

export interface PinContent { title: string; description: string; hashtags: string[] }

interface ArticleForPin {
  title: string
  meta_description?: string | null
  content_markdown?: string | null
  keyword_source?: string | null
}

export async function generatePinContent(article: ArticleForPin, languageName: string): Promise<PinContent> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const system = `You are a Pinterest content strategist. Create pin content from a blog article that maximizes Pinterest SEO and engagement. Write in ${languageName}.

Title (100 chars MAX): hook + benefit + keyword, Title Case, no "The"/"A" at start. Example: "7 Essential Oils for Better Sleep Tonight".
Description (250-500 chars): first sentence = direct answer hook; include keyword naturally; conversational; end with a subtle CTA like "Tap for the full guide"; NO "click here" or spam phrases.
Hashtags (3-5): mix broad (#essentialoils) + niche (#doterralavender); match the article language; return as array WITHOUT the # symbol inside the description.

Return ONLY valid JSON, no markdown fences:
{"title": "...", "description": "...", "hashtags": ["essentialoils", "doterra", "..."]}`

  const user = `Article title: ${article.title}
Keyword: ${article.keyword_source ?? ''}
Meta: ${article.meta_description ?? ''}
Excerpt: ${(article.content_markdown ?? '').replace(/[#*_>[\]()]/g, ' ').slice(0, 600)}`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const message = await (client.messages.create as any)({
    model: 'claude-sonnet-4-5',
    max_tokens: 600,
    system,
    messages: [{ role: 'user', content: user }],
  })
  const text = message.content?.[0]?.type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('pin content: no JSON in response')
  const parsed = JSON.parse(jsonMatch[0]) as PinContent
  parsed.title = (parsed.title ?? article.title).slice(0, 100)
  parsed.description = parsed.description ?? (article.meta_description ?? article.title)
  parsed.hashtags = Array.isArray(parsed.hashtags) ? parsed.hashtags.map(h => h.replace(/^#/, '')).slice(0, 5) : []
  return parsed
}

// ─── Board routing (Task 4) ─────────────────────────────────────────────────────

export function matchTopicCategory(keyword: string): 'sleep' | 'lifestyle' | null {
  const k = (keyword ?? '').toLowerCase()
  if (/\b(sleep|sueño|sueno|dormir|relax|relaj)\b/.test(k)) return 'sleep'
  if (/\b(business|opportunity|work from home|trabajo|trabajar|negocio|oportunidad|lifestyle|estilo de vida)\b/.test(k)) return 'lifestyle'
  return null
}

// ─── Orchestrator ────────────────────────────────────────────────────────────────

const BLOG_PATH: Record<string, (slug: string) => string> = {
  en: (s) => `https://essentialsynergybr.com/blog/${s}`,
  es: (s) => `https://essentialsynergybr.com/es/blog/${s}`,
}

export interface PinArticleResult {
  article_id: string
  pins: { board_id: string; status: string; pin_id?: string; error?: string }[]
}

/**
 * Pin a single article to its main board (+ topic board if matched).
 * Logs each attempt to pinterest_pins. Never throws — returns a result summary.
 */
export async function pinArticle(
  supabase: SupabaseClient,
  article: { id: string; slug: string; title: string; meta_description?: string | null; content_markdown?: string | null; keyword_source?: string | null; brand_id: string; featured_image?: string | null; pinterest_image?: string | null; language_code: string },
): Promise<PinArticleResult> {
  const lang = article.language_code
  const result: PinArticleResult = { article_id: article.id, pins: [] }

  // v3.4: pins use a dedicated VERTICAL image (1024x1536). Generate if missing; reuse otherwise.
  // featured_image (horizontal, for the blog) is never touched.
  const pinImage = await generatePinImage(article)
  if (!pinImage) {
    result.pins.push({ board_id: '-', status: 'error', error: 'no pinterest_image (generation failed)' })
    return result
  }

  // Target boards: main (always) + topic (if matched)
  const { data: boards } = await supabase
    .from('pinterest_boards')
    .select('id, topic_category, is_main_board')
    .eq('language_code', lang)

  const mainBoard = boards?.find((b) => b.is_main_board)
  const topicCat = matchTopicCategory(article.keyword_source ?? article.title)
  const topicBoard = topicCat ? boards?.find((b) => b.topic_category === topicCat && !b.is_main_board) : undefined
  const targets = [mainBoard, topicBoard].filter(Boolean) as { id: string }[]

  if (!targets.length) {
    result.pins.push({ board_id: '-', status: 'error', error: `no board configured for lang=${lang}` })
    return result
  }

  // Generate content once
  const languageName = lang === 'es' ? 'Spanish' : 'English'
  let content: PinContent
  try {
    content = await generatePinContent(article, languageName)
  } catch (e) {
    result.pins.push({ board_id: '-', status: 'error', error: `content gen: ${(e as Error).message}` })
    return result
  }

  const slug = article.slug
  const link = `${(BLOG_PATH[lang] ?? BLOG_PATH.en)(slug)}?utm_source=pinterest&utm_medium=organic`
  const hashtagLine = content.hashtags.map((h) => `#${h}`).join(' ')
  const fullDescription = `${content.description}${hashtagLine ? `\n\n${hashtagLine}` : ''}`

  for (const board of targets) {
    let row: Record<string, unknown> = {
      article_id: article.id,
      brand_id: article.brand_id,
      board_id: board.id,
      pin_title: content.title,
      pin_description: fullDescription,
      hashtags: content.hashtags,
    }
    try {
      const pin = await createPinterestPin({
        boardId: board.id,
        link,
        title: content.title,
        description: fullDescription,
        imageUrl: pinImage,
      })
      row = { ...row, pinterest_pin_id: pin.id, pin_url: `https://www.pinterest.com/pin/${pin.id}/`, status: 'pinned_trial', pinned_at: new Date().toISOString() }
      result.pins.push({ board_id: board.id, status: 'pinned_trial', pin_id: pin.id })
    } catch (e) {
      row = { ...row, status: 'error', error_message: (e as Error).message.slice(0, 500) }
      result.pins.push({ board_id: board.id, status: 'error', error: (e as Error).message })
    }
    await supabase.from('pinterest_pins').insert([row])
  }

  return result
}
