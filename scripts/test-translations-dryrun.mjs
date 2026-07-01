/**
 * Task B — DRY RUN traduzioni keyword
 * Prende 1 keyword dalla tabella keywords per ogni lingua e mostra la traduzione.
 * Nessuna modifica al DB o alle immagini.
 */
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

async function translate(keyword, langCode) {
  if (langCode === 'en') return keyword
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 50,
    messages: [{
      role: 'user',
      content: `Translate this ${langCode} keyword to English. Keep doTERRA product names (Lavender, Peppermint, Frankincense, On Guard, Serenity, etc.) unchanged. Output ONLY the translation, no explanation.\nKeyword: ${keyword}`
    }],
  })
  return res.choices[0]?.message?.content?.trim() ?? keyword
}

console.log('═'.repeat(70))
console.log('TASK B — DRY RUN TRADUZIONI (no image generation, no DB changes)')
console.log('═'.repeat(70))

// Fetch brands to get brand_id per language
const { data: brands } = await sb.from('brands')
  .select('id, language_code, brand_name')
  .eq('active', true)

console.log('\nBrands trovati:')
for (const b of brands ?? []) {
  console.log(`  [${b.language_code.toUpperCase()}] ${b.id} — ${b.brand_name}`)
}

// For each brand, pick the most recent used keyword from keywords_history
for (const lang of ['en', 'es', 'de', 'fr', 'pt']) {
  const brand = brands?.find(b => b.language_code === lang)
  if (!brand) { console.log(`\n[${lang.toUpperCase()}] ❌ Brand not found`); continue }

  const { data: history, error: hErr } = await sb.from('keywords_history')
    .select('keyword')
    .eq('brand_id', brand.id)
    .order('used_at', { ascending: false })
    .limit(1)

  if (hErr || !history?.length) {
    // Fallback: pick from keywords table
    const { data: kws, error: kErr } = await sb.from('keywords')
      .select('keyword')
      .eq('brand_id', brand.id)
      .limit(1)

    if (kErr || !kws?.length) {
      console.log(`\n[${lang.toUpperCase()}] ❌ No keyword found — ${kErr?.message ?? 'empty'}`)
      continue
    }

    const keyword = kws[0].keyword
    let translated = keyword
    try { translated = await translate(keyword, lang) } catch (e) { translated = `ERROR: ${e.message}` }

    const changed = translated !== keyword
    console.log(`\n[${lang.toUpperCase()}] ${lang === 'en' ? '⏭️ skip' : (changed ? '✅' : '⚠️ unchanged')} (from keywords table)`)
    console.log(`  keyword   : "${keyword}"`)
    console.log(`  translated: "${translated}"`)
    continue
  }

  const keyword = history[0].keyword
  let translated = keyword
  try { translated = await translate(keyword, lang) } catch (e) { translated = `ERROR: ${e.message}` }

  const changed = translated !== keyword
  console.log(`\n[${lang.toUpperCase()}] ${lang === 'en' ? '⏭️ skip' : (changed ? '✅' : '⚠️ unchanged')} (most recent used)`)
  console.log(`  keyword   : "${keyword}"`)
  console.log(`  translated: "${translated}"`)
}

console.log('\n' + '═'.repeat(70))
console.log('DRY RUN DONE — nessuna modifica al DB o alle immagini.')
console.log('═'.repeat(70))
