import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { brand_id, field_key, fix_instruction } = await req.json()
    if (!brand_id || !field_key || !fix_instruction) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: brand, error } = await supabase.from('brands').select('*').eq('id', brand_id).single()
    if (error || !brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

    const currentValue = (brand as Record<string, string>)[field_key] || ''

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `You are editing a brand configuration field for an AI SEO article generator.

FIELD: ${field_key}
CURRENT VALUE:
${currentValue}

FIX INSTRUCTION: ${fix_instruction}

Rewrite the field incorporating the fix. Keep the same language and style. Do not add explanations or markdown — output ONLY the new field text.`,
      }],
    })

    const newValue = message.content[0].type === 'text' ? message.content[0].text.trim() : currentValue

    const { error: updateError } = await supabase
      .from('brands')
      .update({ [field_key]: newValue })
      .eq('id', brand_id)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    return NextResponse.json({ ok: true, field_key, new_value: newValue })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
