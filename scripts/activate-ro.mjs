import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const RO = '97933a00-3604-464a-92d6-e6ea8175cbc1'
const { data: upd, error } = await sb.from('brands').update({ active: true }).eq('id', RO).select('language_code, active').single()
if (error) { console.log('❌', error.message); process.exit(1) }
console.log(`✅ RO attivato: language_code=${upd.language_code} active=${upd.active}`)

const { data: actives } = await sb.from('brands').select('language_code, active').eq('active', true).order('language_code')
const langs = (actives ?? []).map(b => b.language_code).sort()
const expected = ['de','en','es','fr','pt','ro']
const ok = JSON.stringify(langs) === JSON.stringify(expected)
console.log(`\nBrand attivi (${langs.length}): ${langs.join(', ')}`)
console.log(ok ? '🟢 6 brand attivi corretti (en, es, de, fr, pt, ro)' : `⚠️ atteso ${expected.join(',')}`)
