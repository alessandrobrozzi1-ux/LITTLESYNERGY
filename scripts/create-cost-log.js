require('fs').readFileSync(require('path').join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const serviceKey = process.env.SUPABASE_SERVICE_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }

// Run this SQL via Supabase dashboard > SQL Editor if RPC not available
const SQL = `
CREATE TABLE IF NOT EXISTS cost_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES brands(id) ON DELETE CASCADE,
  article_id uuid REFERENCES articles(id) ON DELETE SET NULL,
  model text NOT NULL,
  input_tokens int NOT NULL DEFAULT 0,
  output_tokens int NOT NULL DEFAULT 0,
  cache_read_tokens int NOT NULL DEFAULT 0,
  cost_usd numeric(10,6) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cron_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cron_name text NOT NULL,
  status text NOT NULL DEFAULT 'ok',
  brands_processed int NOT NULL DEFAULT 0,
  articles_created int NOT NULL DEFAULT 0,
  errors text[],
  duration_ms int,
  created_at timestamptz NOT NULL DEFAULT now()
);
`

async function run() {
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sql: SQL }),
  })
  if (!res.ok) {
    console.log('⚠️  RPC not available — paste the SQL below into Supabase SQL Editor:\n')
    console.log(SQL)
    return
  }
  console.log('✅ Tables created')
}

run()
