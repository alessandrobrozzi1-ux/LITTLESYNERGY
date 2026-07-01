import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const { error } = await sb.from('brands').update({
  brand_dna_brand_voice: [
    'Caloroso, educativo e voltado para o bem-estar.',
    'Escrever em português acessível para leitores de Portugal E do Brasil — nunca mencionar apenas um país.',
    'Linguagem cotidiana sem jargão. Inspirar os leitores a explorar o bem-estar natural com óleos essenciais.',
    'Tom: amigo experiente, não autoridade clínica.',
    'Evitar afirmações médicas.',
    'Usar expressões como "pode apoiar", "muitas pessoas relatam", "tradicionalmente usado para".',
  ].join(' '),
  brand_dna_service_area: 'Portugal, Brasil e todos os países lusófonos. Conteúdo relevante tanto para leitores europeus como brasileiros.',
}).eq('id', '8edf37b6-73c1-4742-862b-b4649bfa0f55')

if (error) { console.error('ERROR:', error.message); process.exit(1) }
console.log('✅ Brand DNA atualizado — voz agora inclui PT + BR explicitamente')
