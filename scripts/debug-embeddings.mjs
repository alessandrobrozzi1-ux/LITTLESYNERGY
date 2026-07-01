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

// 1. Check row count
const { data: rows, error: countErr } = await supabase
  .from('article_embeddings')
  .select('id, article_id, brand_id, generated_at')
console.log(`\n1. Rows in article_embeddings: ${rows?.length ?? 'error'} ${countErr ? '— '+countErr.message : ''}`)
if (rows?.length > 0) {
  console.log(`   Sample: ${rows[0].id} / article: ${rows[0].article_id} / ${rows[0].generated_at}`)
}

// 2. Generate a test embedding
console.log('\n2. Generating embedding for "essential oils for headache"...')
const res = await openai.embeddings.create({ model: 'text-embedding-3-small', input: 'essential oils for headache' })
const embedding = res.data[0].embedding
console.log(`   Dims: ${embedding.length}, first value: ${embedding[0]}`)

// 3. Try RPC with raw array
console.log('\n3. Calling find_related_articles RPC (raw array, threshold 0.3)...')
const { data: rpcData, error: rpcErr } = await supabase.rpc('find_related_articles', {
  query_embedding: embedding,
  target_brand_id: 'eceba851-228a-45cf-8775-b0f7fc9ae7de',
  exclude_article_id: null,
  match_threshold: 0.3,
  match_count: 5,
})
console.log(`   Result: ${JSON.stringify(rpcData)} | Error: ${rpcErr?.message ?? 'none'}`)

// 4. Try RPC with string format
console.log('\n4. Calling find_related_articles RPC (string format, threshold 0.3)...')
const { data: rpcData2, error: rpcErr2 } = await supabase.rpc('find_related_articles', {
  query_embedding: `[${embedding.join(',')}]`,
  target_brand_id: 'eceba851-228a-45cf-8775-b0f7fc9ae7de',
  exclude_article_id: null,
  match_threshold: 0.3,
  match_count: 5,
})
console.log(`   Result: ${JSON.stringify(rpcData2)} | Error: ${rpcErr2?.message ?? 'none'}`)

// 5. Check what the stored embedding looks like (first 50 chars)
if (rows?.length > 0) {
  const { data: sample } = await supabase
    .from('article_embeddings')
    .select('embedding')
    .eq('id', rows[0].id)
    .single()
  const embStr = String(sample?.embedding ?? '')
  console.log(`\n5. Stored embedding format (first 80 chars): ${embStr.slice(0, 80)}...`)
  console.log(`   Total length: ${embStr.length}`)
}
