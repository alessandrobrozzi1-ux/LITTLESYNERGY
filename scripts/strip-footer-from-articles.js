require('fs').readFileSync(require('path').join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const serviceKey = process.env.SUPABASE_SERVICE_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' }

// Strip footer from content_markdown — keep article body + final ---
// Footer always starts with one of these markers after a --- divider
const FOOTER_MARKERS = [
  '¿Listo para empezar',
  'Listo para empezar',
]

function stripFooter(content) {
  for (const marker of FOOTER_MARKERS) {
    const idx = content.indexOf(marker)
    if (idx === -1) continue

    // Walk back to find the --- before the footer
    const before = content.lastIndexOf('---', idx)
    if (before === -1) continue

    // Keep everything up to and including that ---
    const trimmed = content.slice(0, before + 3).trimEnd()
    return trimmed
  }
  return null // no footer found — nothing to strip
}

async function run() {
  // Fetch all articles
  const res = await fetch(`${supabaseUrl}/rest/v1/articles?select=id,slug,content_markdown&limit=100`, { headers })
  const articles = await res.json()
  console.log(`Found ${articles.length} articles`)

  let updated = 0
  let skipped = 0

  for (const article of articles) {
    const stripped = stripFooter(article.content_markdown)
    if (!stripped) {
      console.log(`  SKIP (no footer): ${article.slug}`)
      skipped++
      continue
    }

    const patchRes = await fetch(`${supabaseUrl}/rest/v1/articles?id=eq.${article.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ content_markdown: stripped }),
    })

    if (patchRes.ok) {
      console.log(`  ✅ Stripped: ${article.slug}`)
      updated++
    } else {
      console.log(`  ❌ Error: ${article.slug} — ${await patchRes.text()}`)
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped (already clean)`)
}

run()
