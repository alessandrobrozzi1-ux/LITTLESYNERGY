import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const RO = '97933a00-3604-464a-92d6-e6ea8175cbc1'
const { data: b } = await sb.from('brands').select('*').eq('id', RO).single()
const { data: themes } = await sb.from('editorial_themes').select('theme_name, keywords').eq('brand_id', RO)

const chk = (label, ok, extra='') => console.log(`  ${ok ? '✅' : '❌'} ${label}${extra ? ' — ' + extra : ''}`)
console.log('CHECKPOINT 1a — VERIFICA POST-CREATE brand RO')
console.log('─'.repeat(64))
chk('Brand UUID presente', !!b?.id, b?.id)
chk('language_code = ro', b?.language_code === 'ro', b?.language_code)
chk('active = FALSE', b?.active === false, `active=${b?.active}`)
chk('owner_id = 15957920', String(b?.owner_id) === '15957920', String(b?.owner_id))
chk('domain = essentialsynergybr.com/ro', b?.domain === 'essentialsynergybr.com/ro', b?.domain)
chk('DNA rumeno nativo (voice)', /wellness|uleiuri|rumeno|Cald/i.test(b?.brand_dna_brand_voice || ''), (b?.brand_dna_brand_voice||'').slice(0,50)+'…')
const aff = b?.affiliate_base_url || ''
chk('affiliate_base_url SANITIZED (no //essential-oils)', aff.includes('/shop/essential-oils/?OwnerID=') && !aff.includes('//essential-oils'), aff)
const img = b?.brand_dna_image_style || ''
chk('brand_dna_image_style v3.2 (doTERRA-branded)', img.includes('doTERRA-branded') && img.length >= 280, `${img.length} chars`)
chk('5 editorial themes RO', (themes?.length ?? 0) === 5, `${themes?.length ?? 0} temi`)
console.log('\n  Temi RO:')
for (const t of themes ?? []) console.log(`    • ${t.theme_name}: ${(t.keywords||[]).slice(0,2).join(' / ')}…`)

const allOk = b?.active === false && img.includes('doTERRA-branded') && (themes?.length ?? 0) === 5 &&
  aff.includes('/shop/essential-oils/?OwnerID=') && !aff.includes('//essential-oils')
console.log(`\n  ${allOk ? '🟢 CHECKPOINT 1a PASS' : '🔴 CHECK FALLITO'}`)
