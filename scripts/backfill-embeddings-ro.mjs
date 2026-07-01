import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY,
  { global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) } })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const RO = '97933a00-3604-464a-92d6-e6ea8175cbc1'
const { data: articles } = await supabase.from('articles')
  .select('id, brand_id, title, meta_description, content_markdown')
  .eq('brand_id', RO).eq('status', 'published').order('published_at', { ascending: true })

console.log(`Backfill embeddings RO — ${articles?.length ?? 0} articoli published\n`)
let ok = 0
for (const a of articles ?? []) {
  const text = [a.title, a.meta_description, (a.content_markdown ?? '').slice(0, 2000)].filter(Boolean).join('\n')
  const res = await openai.embeddings.create({ model: 'text-embedding-3-small', input: text })
  const { error } = await supabase.from('article_embeddings').upsert({
    article_id: a.id, brand_id: a.brand_id, embedding: `[${res.data[0].embedding.join(',')}]`, generated_at: new Date().toISOString(),
  }, { onConflict: 'article_id' })
  if (error) { console.log(`❌ ${a.title}: ${error.message}`); continue }
  ok++; console.log(`✅ ${a.title} (${res.usage.total_tokens}t)`)
}
// verifica
const { count } = await supabase.from('article_embeddings').select('*', { count: 'exact', head: true }).eq('brand_id', RO)
console.log(`\n✅ Embeddings RO: ${count} (${ok} processati ora)`)
