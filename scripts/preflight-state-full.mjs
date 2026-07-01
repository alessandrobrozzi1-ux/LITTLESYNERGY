import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const IT = 2 * 3600 * 1000
const itStr = (s) => s ? new Date(new Date(s).getTime() + IT).toISOString().slice(0,16).replace('T',' ') + ' IT' : '-'

// 1) Ultimo published_at per brand attivo
const { data: brands } = await sb.from('brands')
  .select('id, language_code, active').eq('active', true).order('language_code')
console.log('1) ULTIMO PUBLISHED PER BRAND ATTIVO')
console.log('─'.repeat(60))
for (const b of brands ?? []) {
  const { data: last } = await sb.from('articles')
    .select('slug, published_at').eq('brand_id', b.id).eq('status', 'published')
    .order('published_at', { ascending: false }).limit(1)
  const a = last?.[0]
  const ageH = a?.published_at ? ((Date.now() - new Date(a.published_at).getTime())/3600000).toFixed(1) : '-'
  console.log(`  ${b.language_code.toUpperCase()}: ${itStr(a?.published_at)} (${ageH}h fa) — ${a?.slug ?? 'NESSUNO'}`)
}

// 3) Cron last execution log
console.log('\n3) CRON LAST EXECUTION (cron_runs, ultimi 8)')
console.log('─'.repeat(60))
const { data: runs, error: cerr } = await sb.from('cron_runs')
  .select('cron_name, status, articles_created, brands_processed, created_at, errors')
  .order('created_at', { ascending: false }).limit(8)
if (cerr) console.log('  (cron_runs:', cerr.message, ')')
for (const r of runs ?? []) {
  console.log(`  ${itStr(r.created_at)} | ${(r.cron_name||'').padEnd(15)} | ${r.status} | art:${r.articles_created ?? '-'} brands:${r.brands_processed ?? '-'}${r.errors ? ' ⚠️ERR' : ''}`)
}

// 4) Segnali bug: articoli error / draft anomali recenti (proxy P1)
console.log('\n4) SEGNALI BUG (proxy P1)')
console.log('─'.repeat(60))
const { count: cronErr } = await sb.from('cron_runs')
  .select('*', { count: 'exact', head: true }).eq('status', 'error')
console.log(`  cron_runs con status='error' (totali): ${cronErr ?? 0}`)
