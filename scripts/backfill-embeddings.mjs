import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) } }
)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const { data: articles, error } = await supabase
  .from('articles')
  .select('id, brand_id, title, meta_description, content_markdown')
  .eq('status', 'published')
  .order('published_at', { ascending: true })

if (error) { console.error('DB error:', error.message); process.exit(1) }

console.log(`\nBackfill embeddings — ${articles.length} articles\n`)

let ok = 0, fail = 0, totalTokens = 0, totalCost = 0

for (const article of articles) {
  const text = [
    article.title,
    article.meta_description,
    (article.content_markdown ?? '').slice(0, 2000),
  ].filter(Boolean).join('\n')

  try {
    const res = await openai.embeddings.create({ model: 'text-embedding-3-small', input: text })
    const embedding = res.data[0].embedding
    const tokens = res.usage.total_tokens
    totalTokens += tokens
    totalCost += tokens * 0.00000002  // $0.02 per 1M tokens

    const { error: upsertErr } = await supabase
      .from('article_embeddings')
      .upsert(
        {
          article_id: article.id,
          brand_id: article.brand_id,
          embedding: `[${embedding.join(',')}]`,  // pgvector text format
          generated_at: new Date().toISOString(),
        },
        { onConflict: 'article_id' }
      )

    if (upsertErr) throw new Error(upsertErr.message)

    ok++
    console.log(`✅  ${article.title.slice(0, 55).padEnd(55)} (${tokens}t)`)
  } catch (err) {
    fail++
    console.error(`❌  ${article.title?.slice(0, 55).padEnd(55)} — ${err.message}`)
  }
}

console.log(`\n─────────────────────────────────────────────────────`)
console.log(`Done: ${ok} ok | ${fail} failed`)
console.log(`Total tokens: ${totalTokens.toLocaleString()}`)
console.log(`Total cost:   $${totalCost.toFixed(6)}`)
console.log(`─────────────────────────────────────────────────────`)
