import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')
readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim()
})

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const EN = 'eceba851-228a-45cf-8775-b0f7fc9ae7de'
const ES = 'a20e4f07-e572-4605-acfc-5c53355f2ada'

const d7 = new Date(Date.now() - 7 * 864e5).toISOString()
const d30 = new Date(Date.now() - 30 * 864e5).toISOString()
const d48h = new Date(Date.now() - 48 * 3600e3).toISOString()

async function run() {
  // A1-A3, A6: brand data
  const { data: brands } = await sb.from('brands')
    .select('id,active,language_code,brand_dna_business_type,brand_dna_service_area,brand_dna_topics_to_avoid,brand_dna_key_themes,brand_dna_brand_voice,brand_dna_mandatory_footer,owner_id,affiliate_base_url')
    .in('id', [EN, ES])

  // A4: link expert
  const { count: leEN } = await sb.from('link_expert').select('*', { count: 'exact', head: true }).eq('brand_id', EN).eq('active', true)
  const { count: leES } = await sb.from('link_expert').select('*', { count: 'exact', head: true }).eq('brand_id', ES).eq('active', true)

  // A5: themes
  const { count: thEN } = await sb.from('editorial_themes').select('*', { count: 'exact', head: true }).eq('brand_id', EN).eq('active', true)
  const { count: thES } = await sb.from('editorial_themes').select('*', { count: 'exact', head: true }).eq('brand_id', ES).eq('active', true)

  // B1: last article
  const { data: laEN } = await sb.from('articles').select('title,published_at').eq('brand_id', EN).eq('status', 'published').order('published_at', { ascending: false }).limit(1)
  const { data: laES } = await sb.from('articles').select('title,published_at').eq('brand_id', ES).eq('status', 'published').order('published_at', { ascending: false }).limit(1)

  // B2: cron_runs last 7d
  const { data: cronRuns } = await sb.from('cron_runs').select('cron_name,status,created_at,brands_processed,articles_created').gte('created_at', d7).order('created_at', { ascending: false })

  // B3: cost_log
  const { data: clEN } = await sb.from('cost_log').select('cost_usd').eq('brand_id', EN).gte('created_at', d30)
  const { data: clES } = await sb.from('cost_log').select('cost_usd').eq('brand_id', ES).gte('created_at', d30)

  // B4: title lengths
  const { data: tlEN } = await sb.from('articles').select('title').eq('brand_id', EN).eq('status', 'published').order('published_at', { ascending: false }).limit(10)
  const { data: tlES } = await sb.from('articles').select('title').eq('brand_id', ES).eq('status', 'published').order('published_at', { ascending: false }).limit(10)

  // B5+B6: images + doterra link spot-check
  const { count: imgEN } = await sb.from('articles').select('*', { count: 'exact', head: true }).eq('brand_id', EN).eq('status', 'published').not('featured_image', 'is', null)
  const { count: totEN } = await sb.from('articles').select('*', { count: 'exact', head: true }).eq('brand_id', EN).eq('status', 'published')
  const { count: imgES } = await sb.from('articles').select('*', { count: 'exact', head: true }).eq('brand_id', ES).eq('status', 'published').not('featured_image', 'is', null)
  const { count: totES } = await sb.from('articles').select('*', { count: 'exact', head: true }).eq('brand_id', ES).eq('status', 'published')

  const { data: artEN } = await sb.from('articles').select('content_markdown,slug,title').eq('brand_id', EN).eq('status', 'published').order('published_at', { ascending: false }).limit(1)
  const { data: artES } = await sb.from('articles').select('content_markdown,slug,title').eq('brand_id', ES).eq('status', 'published').order('published_at', { ascending: false }).limit(1)

  // Output raw for parsing
  console.log(JSON.stringify({
    brands, leEN, leES, thEN, thES,
    laEN, laES, cronRuns,
    clEN, clES, tlEN, tlES,
    imgEN, totEN, imgES, totES,
    artEN: artEN?.map(a => ({
      title: a.title,
      slug: a.slug,
      hasDoterra: a.content_markdown?.includes('doterra.com') ?? false,
      doterraLinks: (a.content_markdown?.match(/https?:\/\/[^\s)">]+doterra\.com[^\s)">]*/g) ?? []).slice(0, 5),
    })),
    artES: artES?.map(a => ({
      title: a.title,
      slug: a.slug,
      hasDoterra: a.content_markdown?.includes('doterra.com') ?? false,
      doterraLinks: (a.content_markdown?.match(/https?:\/\/[^\s)">]+doterra\.com[^\s)">]*/g) ?? []).slice(0, 5),
    })),
  }, null, 2))
}

run().catch(e => { console.error(e); process.exit(1) })
