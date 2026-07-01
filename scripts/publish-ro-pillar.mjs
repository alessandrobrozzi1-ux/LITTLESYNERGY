import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const ID = '06fff908-d37b-4d73-a00e-0f831700173c'
const NEW_TITLE = 'Cum Cumperi doTERRA: Ghid 25% Reducere'

const { data: a } = await sb.from('articles').select('content_markdown, slug, status').eq('id', ID).single()
if (a.status === 'published') { console.log('⚠️ già published'); }

// Allinea l'H1 al titolo
const newContent = (a.content_markdown || '').replace(/^#\s+.*$/m, `# ${NEW_TITLE}`)

const { data: upd, error } = await sb.from('articles')
  .update({ title: NEW_TITLE, content_markdown: newContent, status: 'published', published_at: new Date().toISOString() })
  .eq('id', ID)
  .select('id, slug, title, status, published_at')
  .single()

if (error) { console.log('❌', error.message); process.exit(1) }
console.log('✅ PILLAR PUBBLICATO')
console.log(`  title : ${upd.title}`)
console.log(`  slug  : ${upd.slug}`)
console.log(`  status: ${upd.status}`)
console.log(`  pub_at: ${upd.published_at}`)
console.log(`  H1 nel content allineato: ${/^# Cum Cumperi doTERRA: Ghid 25% Reducere/m.test(newContent) ? '✅' : '❌'}`)
console.log(`\n  LIVE: https://essentialsynergybr.com/ro/blog/${upd.slug}`)
