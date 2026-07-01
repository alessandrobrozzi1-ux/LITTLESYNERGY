/**
 * TEST SISTEMICO IMAGE GENERATION — 5 lingue post-fix content_markdown
 * NON pubblica. Genera draft, chiama generate-image, logga prompt.
 */

const TESTS = [
  { lang: 'EN', brand_id: 'eceba851-228a-45cf-8775-b0f7fc9ae7de', keyword: 'best essential oils for evening relaxation' },
  { lang: 'ES', brand_id: 'a20e4f07-e572-4605-acfc-5c53355f2ada', keyword: 'aceites esenciales para dormir profundo' },
  { lang: 'DE', brand_id: '1314a2d9-9ed6-475e-9235-8dffebb9384b', keyword: 'essential oils for better sleep' },
  { lang: 'FR', brand_id: '82dee695-83be-4e96-94ea-05078dea3681', keyword: 'essential oils for deep sleep' },
  { lang: 'PT', brand_id: '8edf37b6-73c1-4742-862b-b4649bfa0f55', keyword: 'essential oils for better sleep quality' },
]

const API = 'https://soloseo-alpha.vercel.app'
const results = []

async function fetchRetry(url, opts, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(120000) })
      return res
    } catch (e) {
      if (i === attempts - 1) throw e
      const wait = (i + 1) * 5000
      process.stdout.write(` [retry ${i+1} in ${wait/1000}s]`)
      await new Promise(r => setTimeout(r, wait))
    }
  }
}

for (const t of TESTS) {
  process.stdout.write(`\n[${t.lang}] Generating article...`)

  const artRes = await fetchRetry(`${API}/api/generate-article`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brand_id: t.brand_id, keyword: t.keyword, status: 'draft' }),
  })
  const art = await artRes.json()
  const articleId = art.article?.id
  const content = art.article?.content_markdown ?? ''

  process.stdout.write(` ✅ "${art.article?.title?.slice(0, 50)}"\n`)

  // Extract doTERRA links from content
  const linkPattern = /\[([^\]]+)\]\(https?:\/\/[^)]*doterra[^)]+\)/g
  const anchors = []
  let m
  while ((m = linkPattern.exec(content)) !== null) {
    const anchor = m[1].trim()
    if (!/^doTERRA$/i.test(anchor) && anchor.length <= 50) anchors.push(anchor)
    if (anchors.length >= 5) break
  }

  process.stdout.write(`[${t.lang}] Generating image...`)

  const imgRes = await fetchRetry(`${API}/api/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ article_id: articleId, keyword: t.keyword, title: art.article?.title }),
  })
  const img = await imgRes.json()

  if (img.error) {
    process.stdout.write(` ❌ ${img.error}\n`)
    results.push({ lang: t.lang, error: img.error, articleId })
    continue
  }

  process.stdout.write(` ✅\n`)

  const prompt = img.prompt ?? ''
  const isCollage = prompt.includes('FEATURED: three doTERRA')
  const primaryMatch = prompt.match(/PRIMARY SUBJECT[:\s]+([\w][\w\s-]+)\s+doTERRA/)
  const secondaryMatch = prompt.match(/Additional context[:\s]+([\w][\w\s-]+)\s+essential oil/)
  const sleepKeys = { EN:'sleep/relax', ES:'dormir/sueño', DE:'schlaf/schlafen', FR:'sommeil', PT:'sono' }

  results.push({
    lang: t.lang,
    keyword: t.keyword,
    articleId,
    title: art.article?.title,
    anchorsInContent: anchors,
    isCollage,
    sceneKey: isCollage ? sleepKeys[t.lang] : null,
    primaryProduct: isCollage ? null : primaryMatch?.[1]?.trim(),
    secondaryProduct: secondaryMatch?.[1]?.trim(),
    imageUrl: img.image_url,
    promptSnippet: prompt.slice(0, 200),
    blackCap: prompt.includes('BLACK matte cap'),
    brandVisible: prompt.includes('"doTERRA" brand name'),
  })
}

// ── OUTPUT ────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(70))
console.log('RISULTATI TEST SISTEMICO IMAGE GENERATION')
console.log('═'.repeat(70))

for (const r of results) {
  if (r.error) {
    console.log(`\n── ${r.lang} ── ❌ ERROR: ${r.error}`)
    continue
  }
  console.log(`\n── ${r.lang} ── ${r.keyword}`)
  console.log(`   Article ID:      ${r.articleId}`)
  console.log(`   Title:           ${r.title}`)
  console.log(`   Links in article: ${r.anchorsInContent.length > 0 ? r.anchorsInContent.join(' | ') : 'NESSUNO'}`)
  console.log(`   extractLinked:   ${r.anchorsInContent.length > 0 ? `✅ ${r.anchorsInContent.length} prodotti trovati` : '⚠️ 0 link — fallback a MULTI_PRODUCT_SCENES'}`)
  console.log(`   MULTI_PRODUCT:   ${r.isCollage ? `✅ match "${r.sceneKey}" → COLLAGE` : `❌ no keyword match → DEFAULT_STYLE`}`)
  console.log(`   Primary:         ${r.primaryProduct ?? (r.isCollage ? '3-bottle collage' : 'N/A')}`)
  console.log(`   Secondary:       ${r.secondaryProduct ?? 'none'}`)
  console.log(`   BLACK cap lock:  ${r.blackCap ? '✅' : '❌'}`)
  console.log(`   doTERRA brand:   ${r.brandVisible ? '✅' : '❌'}`)
  console.log(`   Prompt snippet:  ${r.promptSnippet}`)
  console.log(`   Image URL:       ${r.imageUrl}`)
}

console.log('\n' + '═'.repeat(70))
console.log('TABELLA RIASSUNTIVA')
console.log('═'.repeat(70))
console.log('| Lang | Mode    | Products                | MULTI match | BLACK | Brand |')
console.log('|------|---------|-------------------------|-------------|-------|-------|')
for (const r of results) {
  if (r.error) {
    console.log(`| ${r.lang.padEnd(4)} | ❌ ERROR | ${r.error.slice(0,23).padEnd(23)} | — | — | — |`)
    continue
  }
  const products = r.isCollage ? '3-bottle collage       ' : `${(r.primaryProduct ?? 'N/A').padEnd(14)} + ${(r.secondaryProduct ?? 'none').padEnd(4)}`
  const scene = r.isCollage ? `✅ ${r.sceneKey?.padEnd(9) ?? ''.padEnd(9)}` : '❌ DEFAULT   '
  console.log(`| ${r.lang.padEnd(4)} | ${r.isCollage ? 'COLLAGE' : 'SINGLE '} | ${products} | ${scene} | ${r.blackCap ? '✅    ' : '❌    '} | ${r.brandVisible ? '✅    ' : '❌    '} |`)
}

console.log('\nDraft article IDs (da cancellare post-verifica):')
results.forEach(r => console.log(`  ${r.lang}: ${r.articleId ?? 'N/A'}`))
