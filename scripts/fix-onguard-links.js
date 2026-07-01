require('fs').readFileSync(require('path').join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const serviceKey = process.env.SUPABASE_SERVICE_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }

const WRONG = 'https://shop.doterra.com/ES/es_ES/shop/essential-oils/?OwnerID=15957920'
const RIGHT_ONGUARD = 'https://shop.doterra.com/ES/es_ES/shop/doterra-on-guard-oil/?OwnerID=15957920'

async function run() {
  // Get all ES articles
  const res = await fetch(`${supabaseUrl}/rest/v1/articles?select=id,title,content_markdown&brand_id=eq.(select id from brands where language_code=eq.es)`, { headers })
  const articles = await res.json()

  // Actually just fetch all and filter by content having on guard wrong link
  const res2 = await fetch(`${supabaseUrl}/rest/v1/articles?select=id,title,content_markdown`, { headers })
  const all = await res2.json()

  let fixed = 0
  for (const a of all) {
    if (!a.content_markdown) continue

    // Fix [doTERRA On Guard](...essential-oils...) → doterra-on-guard-oil
    const updated = a.content_markdown.replace(
      /\[doTERRA On Guard\]\(https:\/\/shop\.doterra\.com\/ES\/es_ES\/shop\/essential-oils\/\?OwnerID=15957920\)/g,
      `[doTERRA On Guard](${RIGHT_ONGUARD})`
    ).replace(
      /\[On Guard\]\(https:\/\/shop\.doterra\.com\/ES\/es_ES\/shop\/essential-oils\/\?OwnerID=15957920\)/g,
      `[On Guard](${RIGHT_ONGUARD})`
    )

    if (updated !== a.content_markdown) {
      await fetch(`${supabaseUrl}/rest/v1/articles?id=eq.${a.id}`, {
        method: 'PATCH',
        headers: { ...headers, Prefer: 'return=minimal' },
        body: JSON.stringify({ content_markdown: updated })
      })
      console.log(`✅ Fixed: ${a.title}`)
      fixed++
    }
  }

  console.log(`Done. Fixed ${fixed} articles.`)
}

run()
