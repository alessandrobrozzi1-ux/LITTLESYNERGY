import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const BRANDS = {
  EN: 'eceba851-228a-45cf-8775-b0f7fc9ae7de',
  ES: 'a20e4f07-e572-4605-acfc-5c53355f2ada',
  DE: '1314a2d9-9ed6-475e-9235-8dffebb9384b',
  RO: '97933a00-3604-464a-92d6-e6ea8175cbc1',
}

for (const [lang, bid] of Object.entries(BRANDS)) {
  const { data } = await sb.from('articles')
    .select('slug, content_markdown').eq('brand_id', bid).eq('status','published')
    .order('published_at',{ascending:false}).limit(1)
  const a = data?.[0]
  if (!a) { console.log(`\n[${lang}] nessun articolo`); continue }
  const md = a.content_markdown || ''
  // estrai il primo blocco con righe pipe consecutive
  const lines = md.split('\n')
  let block = [], inBlock = false, captured = null
  for (const ln of lines) {
    if (ln.trim().startsWith('|') || /^\s*\|/.test(ln)) { block.push(ln); inBlock = true }
    else if (inBlock) { captured = block.slice(); break }
  }
  // anche eventuali tabelle HTML
  const hasHtmlTable = /<table/i.test(md)
  // separator row presente?
  const sepRow = (captured || []).find(l => /^\s*\|?[\s:]*-{2,}[\s:|-]*\|?\s*$/.test(l))
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`[${lang}] ${a.slug}`)
  console.log(`  HTML <table>: ${hasHtmlTable ? 'SÌ' : 'no'} | pipe-block trovato: ${captured ? 'SÌ ('+captured.length+' righe)' : 'no'}`)
  console.log(`  separator row (|---|): ${sepRow ? '✅ presente' : '❌ ASSENTE'}`)
  if (captured) {
    console.log('  ─── markdown grezzo (escaped) ───')
    captured.slice(0,6).forEach((l,i)=>console.log(`  ${String(i+1).padStart(2)}| ${JSON.stringify(l)}`))
  }
}
