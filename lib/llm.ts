// Helper LLM unico. DeepSeek è il provider di default quando DEEPSEEK_API_KEY è presente
// (API Anthropic-compatibile via baseURL). Anthropic resta il fallback SOLO se la key DeepSeek
// manca — ma i crediti Anthropic sono a zero, quindi:
//
// 🚨 KILL-SWITCH: NON rimuovere MAI DEEPSEEK_API_KEY (fermerebbe tutto).
//    Piano B = DEEPSEEK_MODEL=deepseek-v4-flash (declassa il modello, non il provider).
//
//   size 'small'  → DEEPSEEK_MODEL_SMALL (keyword research, trends, pin copy)
//   size 'large'  → DEEPSEEK_MODEL       (articoli)
import Anthropic from '@anthropic-ai/sdk'

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/anthropic'

export type LlmSize = 'small' | 'large'

function pickClient(size: LlmSize) {
  const dsKey = process.env.DEEPSEEK_API_KEY
  if (dsKey) {
    const model = size === 'small'
      ? (process.env.DEEPSEEK_MODEL_SMALL || 'deepseek-v4-flash')
      : (process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash')
    return { client: new Anthropic({ apiKey: dsKey, baseURL: DEEPSEEK_BASE_URL }), model, deepseek: true }
  }
  const model = size === 'small' ? 'claude-haiku-4-5-20251001' : 'claude-sonnet-4-5'
  return { client: new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }), model, deepseek: false }
}

/** Single-turn text completion. Reasoning models emit a 'thinking' block before the text,
 *  so we pick the first block of type 'text' instead of content[0]. */
export async function llmText(opts: { size: LlmSize; user: string; system?: string; maxTokens: number }): Promise<string> {
  const { client, model, deepseek } = pickClient(opts.size)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const message = await (client.messages.create as any)({
    model,
    max_tokens: opts.maxTokens,
    ...(opts.system ? { system: opts.system } : {}),
    messages: [{ role: 'user', content: opts.user }],
    ...(deepseek ? { thinking: { type: 'disabled' } } : {}),
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((message.content as any[]).find((b) => b.type === 'text')?.text as string | undefined) ?? ''
}
