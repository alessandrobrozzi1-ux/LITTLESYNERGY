import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export async function GET() {
  const results: Record<string, string> = {}

  // Check env vars
  results.supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.slice(0, 30) + '...' : 'MISSING'
  results.supabase_key = process.env.SUPABASE_SERVICE_KEY ? 'SET (' + process.env.SUPABASE_SERVICE_KEY.slice(0, 10) + '...)' : 'MISSING'
  results.anthropic_key = process.env.ANTHROPIC_API_KEY ? 'SET (' + process.env.ANTHROPIC_API_KEY.slice(0, 10) + '...)' : 'MISSING'
  results.cron_secret = process.env.CRON_SECRET ? 'SET' : 'MISSING'

  // Test Supabase
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('brands').select('id').limit(1)
    results.supabase_query = error ? `ERROR: ${error.message}` : `OK (${data?.length ?? 0} brands)`
  } catch (e) {
    results.supabase_query = `EXCEPTION: ${String(e)}`
  }

  // Test Anthropic
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Say OK' }],
    })
    results.anthropic = `OK: ${msg.content[0].type === 'text' ? msg.content[0].text : 'no text'}`
  } catch (e) {
    results.anthropic = `ERROR: ${String(e)}`
  }

  return NextResponse.json(results)
}
