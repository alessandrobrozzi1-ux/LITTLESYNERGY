import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

export async function GET() {
  return NextResponse.json({ ok: true, env: { anthropic: !!process.env.ANTHROPIC_API_KEY, supabase: !!process.env.SUPABASE_SERVICE_KEY } })
}

interface AlignmentIssue {
  pillar: string
  label: string
  type: 'wrong_place' | 'too_vague' | 'too_long' | 'contradiction' | 'missing' | 'good'
  description: string
  severity: 'low' | 'medium' | 'high'
}

interface AlignmentResult {
  score: number
  summary: string
  issues: AlignmentIssue[]
  proposed_changes: Record<string, string>
  cost_tokens: { input: number; output: number; cache_read: number }
}

const PILLAR_LABELS: Record<string, string> = {
  brand_dna_business_type: 'Business Type',
  brand_dna_brand_voice: 'Brand Voice & Tone',
  brand_dna_key_themes: 'Key Themes',
  brand_dna_service_area: 'Service Area & Link Rules',
  brand_dna_topics_to_avoid: 'Topics to Avoid',
  brand_dna_mandatory_footer: 'Mandatory Footer',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const brand_id = body?.brand_id
    if (!brand_id) return NextResponse.json({ error: 'brand_id required' }, { status: 400 })

    // Step 1: check Supabase
    const supabase = createAdminClient()
    const { data: brand, error } = await supabase.from('brands').select('*').eq('id', brand_id).single()
    if (error || !brand) return NextResponse.json({ error: `Brand not found: ${error?.message}` }, { status: 404 })

    // Step 2: test mode — skip Anthropic call
    if (body?.test) {
      return NextResponse.json({ ok: true, brand_name: brand.brand_name, step: 'supabase_ok' })
    }

    // Step 3: Anthropic call — truncate fields to keep prompt under 1500 tokens
    const truncate = (s: string, n = 250) => s?.length > n ? s.slice(0, n) + '…' : (s || '(empty)')

    const pillarsText = Object.entries(PILLAR_LABELS)
      .map(([key, label]) => `[${label}]: ${truncate((brand as Record<string, string>)[key])}`)
      .join('\n')

    const prompt = `Review this brand config for an AI SEO article generator. Return TOP 3 issues max.

Brand: ${brand.brand_name} | ${brand.language_name}
${pillarsText}

IMPORTANT: "pillar" must be EXACTLY one of these field keys:
brand_dna_business_type | brand_dna_brand_voice | brand_dna_key_themes | brand_dna_service_area | brand_dna_topics_to_avoid | brand_dna_mandatory_footer

Respond with ONLY this JSON, keep each string under 120 chars:
{"score":75,"summary":"One sentence max 100 chars.","issues":[{"pillar":"brand_dna_service_area","label":"Short Label","type":"too_vague","description":"Under 100 chars.","severity":"high","fix":"Under 120 chars — describe exactly what text to add or change in that field."}]}`

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    // Strip markdown fences if present
    const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
    const jsonMatch = stripped.match(/\{[\s\S]*/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI returned no JSON', raw: raw.slice(0, 200) }, { status: 500 })
    }

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      // Try to recover truncated JSON by closing open arrays/objects
      let partial = jsonMatch[0]
      const openBrackets = (partial.match(/\[/g) || []).length - (partial.match(/\]/g) || []).length
      const openBraces = (partial.match(/\{/g) || []).length - (partial.match(/\}/g) || []).length
      // Remove trailing incomplete entry
      partial = partial.replace(/,\s*\{[^}]*$/, '')
      partial += ']'.repeat(Math.max(0, openBrackets)) + '}'.repeat(Math.max(0, openBraces))
      try {
        parsed = JSON.parse(partial)
      } catch {
        return NextResponse.json({ error: 'AI returned unparseable JSON', raw: raw.slice(0, 300) }, { status: 500 })
      }
    }
    const result: AlignmentResult = {
      score: 0, summary: '', issues: [], proposed_changes: {},
      ...parsed,
      cost_tokens: {
        input: message.usage.input_tokens,
        output: message.usage.output_tokens,
        cache_read: (message.usage as unknown as Record<string, number>).cache_read_input_tokens ?? 0,
      },
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[brand-alignment-check]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
