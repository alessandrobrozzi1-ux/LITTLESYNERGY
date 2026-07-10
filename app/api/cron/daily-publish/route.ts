import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { bestKeywordForToday, hasNicheModifier } from '@/lib/keyword-scorer'
import { fetchTrendingKeywords } from '@/lib/trends'
import sharp from 'sharp'
import { buildImagePrompt } from '@/lib/image-prompt'
import { generateHeroImage } from '@/lib/hero-image'

export const maxDuration = 300

// ─── Topic helpers ───────────────────────────────────────────────────────────

const STOP_WORDS = new Set(['de','para','el','la','los','las','en','con','y','o','a','del','al','se','su','un','una','lo','le'])

function tokenize(s: string): Set<string> {
  return new Set(s.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w)))
}

function jaccard(a: string, b: string): number {
  const ta = tokenize(a); const tb = tokenize(b)
  const inter = [...ta].filter(w => tb.has(w)).length
  const union = new Set([...ta, ...tb]).size
  return union === 0 ? 0 : inter / union
}

function classifyMacroTheme(keyword: string): string {
  const k = keyword.toLowerCase()
  // ES + EN + FR + DE + IT + PT
  if (/lavand|lavender|lavendel/.test(k)) return 'lavender'
  if (/menta|peppermint|menthe|pfefferminz|menta piperita/.test(k)) return 'peppermint'
  if (/incienso|frankincense|encens|weihrauch|incenso/.test(k)) return 'frankincense'
  if (/negocio|business|trabajo|work|oficina|office|productiv|concentr|memoria|enfoque|creativ|cansancio|affaires|geschäft|lavoro|bureau|foco|produtiv/.test(k)) return 'business'
  if (/dormir|sueño|sleep|descanso|noche|insomnio|sommeil|schlaf|sonno|nuit|nacht|sono|dormir/.test(k)) return 'sleep'
  if (/niño|bebe|bebé|kids|child|infant|infantil|enfant|kind|bambini|criança|bébé/.test(k)) return 'kids'
  if (/piel|beauty|belleza|cosmetic|cabello|hair|facial|beauté|schönheit|bellezza|peau|haut|beleza|cabelo/.test(k)) return 'beauty'
  if (/limpi|clean|hogar|home|desinfect|nettoyer|reinig|pulire|maison|haushalt|limpez|casa/.test(k)) return 'cleaning'
  if (/digest|estomag|intestin|nausea|digestiv|digestif|verdauung|digestivo|estômag/.test(k)) return 'digestive'
  return 'other'
}

// ─── Theme picker ─────────────────────────────────────────────────────────────

async function pickThemeKeyword(
  supabase: ReturnType<typeof createAdminClient>,
  brandId: string,
  themeName: string,
  usedSet: Set<string>
): Promise<string | null> {
  const { data: themes } = await supabase
    .from('editorial_themes')
    .select('keywords')
    .eq('brand_id', brandId)
    .eq('active', true)
    .ilike('theme_name', `%${themeName}%`)
    .limit(1)
  if (!themes?.length) return null
  const available = (themes[0].keywords as string[]).filter(k => !usedSet.has(k.toLowerCase()))
  if (!available.length) return null
  return available[Math.floor(Math.random() * available.length)]
}

// ─── Main keyword selector ────────────────────────────────────────────────────

export async function getKeywordForBrand(
  supabase: ReturnType<typeof createAdminClient>,
  brandId: string,
  languageCode: string
): Promise<{ keyword: string; keywordId?: string; source: string }> {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const dayOfWeek = now.getUTCDay()   // 0=Sun 1=Mon … 6=Sat
  const dayOfMonth = now.getUTCDate()

  // ── 1. Explicitly scheduled keyword ─────────────────────────────────────────
  const { data: scheduled } = await supabase
    .from('keywords')
    .select('id, keyword')
    .eq('brand_id', brandId)
    .eq('status', 'scheduled')
    .eq('scheduled_date', today)
    .limit(1)
    .single()
  if (scheduled) return { keyword: scheduled.keyword, keywordId: scheduled.id, source: 'scheduled' }

  // ── Build shared context (used by all branches below) ────────────────────────
  const { data: histRows } = await supabase
    .from('keywords_history')
    .select('keyword, used_at')
    .eq('brand_id', brandId)
    .order('used_at', { ascending: false })
    .limit(60)
  const allHistory = histRows ?? []
  const usedSet = new Set(allHistory.map((r: { keyword: string }) => r.keyword.toLowerCase()))

  // Last 7 keywords for similarity check
  const last7 = allHistory.slice(0, 7).map((r: { keyword: string }) => r.keyword)

  // Macro-theme counts for last 14 days
  const cutoff14 = new Date(Date.now() - 14 * 864e5).toISOString()
  const recent14 = allHistory.filter((r: { used_at: string }) => r.used_at >= cutoff14)
  const themeCounts: Record<string, number> = {}
  for (const r of recent14) {
    const t = classifyMacroTheme(r.keyword)
    themeCounts[t] = (themeCounts[t] ?? 0) + 1
  }

  function isAllowed(kw: string): boolean {
    if (!hasNicheModifier(kw, languageCode)) return false                    // L3 guard: solo keyword nicchia bambini/mamme
    if (usedSet.has(kw.toLowerCase())) return false                          // exact duplicate
    if (last7.some(prev => jaccard(kw, prev) > 0.6)) return false           // >60% similar
    // Lavender capped at 2/14 days (~once per week); other themes 3/14 days
    const themeLimit = classifyMacroTheme(kw) === 'lavender' ? 2 : 3
    if ((themeCounts[classifyMacroTheme(kw)] ?? 0) >= themeLimit) return false
    return true
  }

  // ── 2. Day-based theme override ──────────────────────────────────────────────
  if (dayOfWeek === 1) {  // Monday → Lavanda (ES) / Lavender (EN) / Lavande (FR) …
    const kw = await pickThemeKeyword(supabase, brandId, 'Lavanda', usedSet)
      ?? await pickThemeKeyword(supabase, brandId, 'Lavender', usedSet)
      ?? await pickThemeKeyword(supabase, brandId, 'Lavande', usedSet)
      ?? await pickThemeKeyword(supabase, brandId, 'Lavendel', usedSet)
    // Respect diversity: if lavender already saturated, fall through to other sources
    if (kw && isAllowed(kw)) return { keyword: kw, source: 'theme:monday-lavender' }
  }
  if (dayOfMonth === 1 || dayOfMonth === 15) {  // 1st/15th → Smart Working
    const kw = await pickThemeKeyword(supabase, brandId, 'Smart Working', usedSet)
    if (kw) return { keyword: kw, source: 'theme:smart-working' }
  }

  // ── 3. Pytrends — with diversity + similarity filter ────────────────────────
  const { keywords: trending } = await fetchTrendingKeywords(languageCode)
  for (const kw of trending) {
    if (isAllowed(kw)) return { keyword: kw, source: 'pytrends' }
  }

  // ── 4. Editorial theme fallback (any theme, non-Monday) ──────────────────────
  const { data: themes } = await supabase
    .from('editorial_themes')
    .select('theme_name, keywords')
    .eq('brand_id', brandId)
    .eq('active', true)
    .limit(5)
  if (themes?.length) {
    // Alternate themes to avoid always picking the first
    const shuffled = themes.sort(() => Math.random() - 0.5)
    for (const theme of shuffled) {
      const available = (theme.keywords as string[]).filter(k => isAllowed(k))
      if (available.length > 0) {
        const kw = available[Math.floor(Math.random() * available.length)]
        return { keyword: kw, source: `theme:${theme.theme_name}` }
      }
    }
  }

  // ── 5. Best pending keyword from DB ─────────────────────────────────────────
  const { data: pending } = await supabase
    .from('keywords')
    .select('id, keyword, score')
    .eq('brand_id', brandId)
    .eq('status', 'pending')
    .order('score', { ascending: false })
    .limit(10)
    .single()
  if (pending) return { keyword: pending.keyword, keywordId: pending.id, source: 'pending' }

  // ── 6. AI fallback ──────────────────────────────────────────────────────────
  const keyword = await bestKeywordForToday(languageCode, usedSet)
  return { keyword, source: 'ai_fallback' }
}

async function run() {
  const t0 = Date.now()
  const supabase = createAdminClient()

  const { data: brands } = await supabase
    .from('brands')
    .select('id, language_code, brand_name, brand_dna_image_style')
    .eq('active', true)

  if (!brands?.length) {
    void supabase.from('cron_runs').insert([{ cron_name: 'daily-publish', status: 'ok', brands_processed: 0, articles_created: 0, duration_ms: Date.now() - t0 }])
    return { message: 'No active brands', processed: 0 }
  }

  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000'

  // CONCORRENZA — MISURATA su DeepSeek + Vercel Hobby (11 lingue, 2026-07-10):
  //   parallelo 11 → 0 kill, wall 54s  → sta SOTTO il cap 60s dell'orchestratore ✅
  //   pool 3       → 0 kill, wall 150s → l'orchestratore MUORE a 60s: solo ~4 lingue partono ❌
  // Su Hobby ogni /api/generate-article è una funzione a sé (60s suoi): il parallelo è corretto.
  // L'env è la valvola: abbassare SOLO se il provider inizia a killare. catchup-publish = rete.
  const CONCURRENCY = Math.max(1, Number(process.env.PUBLISH_CONCURRENCY ?? 11))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const publishBrand = async (brand: any) => {
      // Guard: skip if already published an article today for this brand
      const todayStart = new Date(); todayStart.setUTCHours(0,0,0,0)
      const { count } = await supabase
        .from('articles')
        .select('id', { count: 'exact', head: true })
        .eq('brand_id', brand.id)
        .eq('status', 'published')
        .gte('published_at', todayStart.toISOString())
      if ((count ?? 0) > 0) return { brand: brand.brand_name, skipped: true, reason: 'already_published_today' }

      const { keyword, keywordId, source } = await getKeywordForBrand(supabase, brand.id, brand.language_code)

      const res = await fetch(`${baseUrl}/api/generate-article`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_id: brand.id, keyword, length: 'medium' }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(`${brand.brand_name}: ${err.error}`)
      }

      const data = await res.json()

      if (keywordId) {
        await supabase
          .from('keywords')
          .update({ status: 'used', article_id: data.article.id })
          .eq('id', keywordId)
      }

      // Generate image with fal.ai FLUX.2 [turbo] (same prompt as manual flow)
      try {
        const imgPrompt = await buildImagePrompt(keyword, (brand as Record<string, string>).brand_dna_image_style, data.article?.content_markdown ?? undefined, brand.language_code)
        const pngBuffer = await generateHeroImage(imgPrompt)
        {
          let outBuffer: Buffer = pngBuffer, ext = 'png', contentType = 'image/png'
          try {
            outBuffer = await sharp(pngBuffer).webp({ quality: 85 }).toBuffer()
            ext = 'webp'; contentType = 'image/webp'
          } catch (e) {
            console.warn(`[daily-publish] WebP conversion failed, fallback PNG: ${(e as Error).message}`)
          }
          const filename = `${data.article.id}-${Date.now()}.${ext}`
          const { error: uploadError } = await supabase.storage.from('article-images').upload(filename, outBuffer, { contentType, upsert: true })
          if (!uploadError) {
            const { data: pub } = supabase.storage.from('article-images').getPublicUrl(filename)
            await supabase.from('articles').update({ featured_image: pub.publicUrl }).eq('id', data.article.id)
          }
        }
      } catch { /* image failure doesn't block publish */ }

      return { brand: brand.brand_name, articleId: data.article.id, keyword, source }
  }

  // worker pool: al più CONCURRENCY generazioni in volo insieme
  const queue = [...brands]
  const results: PromiseSettledResult<unknown>[] = []
  const worker = async () => {
    for (;;) {
      const brand = queue.shift()
      if (!brand) return
      try { results.push({ status: 'fulfilled', value: await publishBrand(brand) } as PromiseFulfilledResult<unknown>) }
      catch (e) { results.push({ status: 'rejected', reason: e } as PromiseRejectedResult) }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, brands.length) }, worker))

  const succeeded = results.filter((r) => r.status === 'fulfilled').map((r) => (r as PromiseFulfilledResult<unknown>).value)
  const failed = results.filter((r) => r.status === 'rejected').map((r) => (r as PromiseRejectedResult).reason?.message)

  void supabase.from('cron_runs').insert([{
    cron_name: 'daily-publish',
    status: failed.length > 0 ? 'partial' : 'ok',
    brands_processed: brands.length,
    articles_created: succeeded.length,
    errors: failed.length > 0 ? failed : null,
    duration_ms: Date.now() - t0,
  }])

  return { processed: brands.length, succeeded: succeeded.length, failed: failed.length, results: succeeded, errors: failed }
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await run()
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await run()
  return NextResponse.json(result)
}
