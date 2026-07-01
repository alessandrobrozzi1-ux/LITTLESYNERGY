import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// Active brands (conferma 5 brand intoccati + nessun RO ancora)
const { data: brands } = await sb.from('brands')
  .select('language_code, active').order('language_code')
console.log('Brand attivi:')
for (const b of brands ?? []) console.log(`  ${b.language_code.toUpperCase()}: active=${b.active}`)

// ES publishing health — ultimo articolo published (non-distruttivo)
const ES = 'a20e4f07-e572-4605-acfc-5c53355f2ada'
const { data: esLast } = await sb.from('articles')
  .select('slug, published_at')
  .eq('brand_id', ES).eq('status', 'published')
  .order('published_at', { ascending: false }).limit(1)
const last = esLast?.[0]
console.log(`\nES ultimo published: ${last?.published_at ?? 'NESSUNO'} (${last?.slug ?? '-'})`)
if (last?.published_at) {
  const ageH = ((Date.now() - new Date(last.published_at).getTime()) / 3600000).toFixed(1)
  console.log(`  → ${ageH}h fa ${ageH < 48 ? '✅ pipeline ES attiva' : '⚠️ nessun publish recente'}`)
}

// RO non deve esistere ancora
const hasRO = (brands ?? []).some(b => b.language_code === 'ro')
console.log(`\nRO già esistente nel DB? ${hasRO ? '⚠️ SÌ' : '✅ NO (corretto, da creare)'}`)
