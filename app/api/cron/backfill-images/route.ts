import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import sharp from 'sharp'
import { buildImagePrompt, NICHE } from '@/lib/image-prompt'
import { generateHeroImage, heroModelForLang } from '@/lib/hero-image'
import { runWeave } from '@/lib/weave-links'

export const maxDuration = 60 // Hobby cap — lavoriamo DENTRO i 60s (~1 img/call)

type PendingArticle = {
  id: string
  slug: string
  title: string
  keyword_source: string | null
  content_markdown: string | null
  brands: { language_code?: string; brand_dna_image_style?: string } | null
}

async function generateOneImage(
  supabase: ReturnType<typeof createAdminClient>,
  a: PendingArticle
): Promise<boolean> {
  const brand = a.brands
  const langCode = brand?.language_code ?? 'en'
  const prompt = await buildImagePrompt(
    a.keyword_source || a.title,
    brand?.brand_dna_image_style ?? undefined,
    NICHE,
    a.content_markdown ?? undefined,
    langCode,
    a.slug,
  )
  // 1 automatic retry (come generate-image)
  let png: Buffer
  try { png = await generateHeroImage(prompt, undefined, undefined, heroModelForLang(langCode)) }
  catch { await new Promise(r => setTimeout(r, 3000)); try { png = await generateHeroImage(prompt) } catch { return false } }
  let out: Buffer = png, ext = 'png', ct = 'image/png'
  try { out = await sharp(png).webp({ quality: 85 }).toBuffer(); ext = 'webp'; ct = 'image/webp' } catch { /* fallback PNG */ }

  const filename = `${a.id}-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('article-images').upload(filename, out, { contentType: ct, upsert: true })
  if (error) return false
  const { data: pub } = supabase.storage.from('article-images').getPublicUrl(filename)
  await supabase.from('articles').update({ featured_image: pub.publicUrl }).eq('id', a.id)
  return true
}

async function run() {
  const t0 = Date.now()
  const supabase = createAdminClient()

  // IDEMPOTENTE: i published più vecchi senza immagine, in coda
  const { data: pending } = await supabase
    .from('articles')
    .select('id, slug, title, keyword_source, content_markdown, brands(language_code, brand_dna_image_style)')
    .eq('status', 'published')
    .is('featured_image', null)
    .order('published_at', { ascending: true })
    .limit(5)

  if (!pending?.length) return { done: 0, remaining: 0, message: 'no null-image articles' }

  let done = 0
  for (const a of pending as unknown as PendingArticle[]) {
    if (Date.now() - t0 > 50000) break // guard: resta sotto i 60s → ~1 img/call su Hobby
    if (await generateOneImage(supabase, a)) done++
  }

  const { count: remaining } = await supabase
    .from('articles')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published')
    .is('featured_image', null)

  await supabase.from('cron_runs').insert([{ cron_name: 'backfill-images', status: 'ok', articles_created: done, brands_processed: 0, duration_ms: Date.now() - t0 }])
  return { done, remaining }
}


/**
 * 🕸️ MAGLIA INTERNA agganciata a questo cron (17 ago 2026). Gli articoli nuovi restano ORFANI
 * finché qualcuno non li linka, ed è la causa numero uno delle pagine "unknown to Google"
 * (misurato con l'URL Inspection API su tutto l'impero). Questo cron gira già ogni giorno su OGNI
 * brand: agganciandola qui la maglia si mantiene da sola, senza dipendere da pg_cron o
 * cron-job.org (dashboard sparse su account diversi, ognuno con la sua sessione).
 * Finestra 7 giorni = pochi innesti per volta; idempotente (i marker sostituiscono il blocco, mai
 * accumulano). Sempre in try/catch e DOPO il lavoro sulle immagini: se fallisce o rallenta, le
 * immagini sono già salvate. ⚠️ Deve stare fuori da run(): quella esce presto quando non ci sono
 * immagini da generare — che è il caso normale — e la maglia non partirebbe mai.
 */
async function runWithWeave() {
  const images = await run()
  let weave: Record<string, unknown> = {}
  try {
    const r = await runWeave(createAdminClient(), { dry: false, windowDays: 7 })
    weave = { links_grafted: r.links_grafted, old_touched: r.old_touched }
  } catch (e) {
    weave = { error: e instanceof Error ? e.message.slice(0, 120) : 'weave failed' }
  }
  return { ...images, weave }
}

// 🔒 GATED da CRON_SECRET (come daily-publish / daily-keywords)
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await runWithWeave())
}
export async function POST(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await runWithWeave())
}
