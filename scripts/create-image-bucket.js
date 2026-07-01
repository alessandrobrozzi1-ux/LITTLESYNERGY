require('fs').readFileSync(require('path').join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const sk = process.env.SUPABASE_SERVICE_KEY
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const h = { apikey: sk, Authorization: `Bearer ${sk}`, 'Content-Type': 'application/json' }

async function run() {
  // Create public bucket
  const res = await fetch(`${url}/storage/v1/bucket`, {
    method: 'POST', headers: h,
    body: JSON.stringify({ id: 'article-images', name: 'article-images', public: true, file_size_limit: 5242880 })
  })
  const data = await res.json()
  if (res.ok || data.error === 'Bucket already exists') {
    console.log('✅ Bucket article-images ready')
  } else {
    console.log('❌', data)
  }
}
run()
