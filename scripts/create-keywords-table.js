require('fs').readFileSync(require('path').join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const serviceKey = process.env.SUPABASE_SERVICE_KEY
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const h = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }

// Create table via Supabase management API
async function run() {
  // Try using the SQL execution endpoint
  const res = await fetch(`${url}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      sql: `CREATE TABLE IF NOT EXISTS keywords (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
        keyword TEXT NOT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        volume TEXT DEFAULT 'medium',
        difficulty TEXT DEFAULT 'medium',
        relevance INTEGER DEFAULT 7,
        status TEXT DEFAULT 'pending',
        scheduled_date DATE,
        article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`
    })
  })
  const t = await res.text()
  console.log('RPC result:', t)

  // Verify by trying to select from keywords
  const check = await fetch(`${url}/rest/v1/keywords?limit=1`, { headers: h })
  console.log('Table check status:', check.status, check.status === 200 ? '✅ Table exists' : '❌ Table missing')
}

run()
