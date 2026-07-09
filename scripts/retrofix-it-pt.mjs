// Retro-fix iniezione (NO rigenerazione) dei 2 articoli della prima notte:
//  IT: rimuove la tabella età×dose (viola "no self-authored age×dose") + fix referenza.
//  PT: corregge i brasilianismi → português europeu (pt_PT).
// Re-embed. Report per-voce (0 hit = stringa non trovata, da rivedere).
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
readFileSync(join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function reembed(a, nc) {
  await sb.from('articles').update({ content_markdown: nc }).eq('id', a.id)
  const res = await openai.embeddings.create({ model: 'text-embedding-3-small', input: [a.title, a.meta_description, nc.slice(0, 2000)].join('\n') })
  await sb.from('article_embeddings').upsert({ article_id: a.id, brand_id: a.brand_id, embedding: '[' + res.data[0].embedding.join(',') + ']', generated_at: new Date().toISOString() }, { onConflict: 'article_id' })
}

// ---------- IT ----------
async function fixIT() {
  const slug = 'oli-essenziali-per-far-dormire-i-bambini'
  const { data } = await sb.from('articles').select('id,brand_id,title,meta_description,content_markdown').eq('slug', slug).single()
  let c = data.content_markdown
  // 1. rimuovi la tabella età×dose (header "Età del Bambino" + righe |...| contigue)
  const safePara = 'Come regola generale, i bambini hanno bisogno di MOLTE meno gocce di un adulto, e per i neonati non si mette alcun numero. La quantità giusta e l\'età minima dipendono dallo specifico olio: vanno sempre lette sull\'etichetta doTERRA e concordate con il pediatra, non decise a tavolino. Meno è meglio, e con i più piccoli si diffonde solo in spazi condivisi e ben ventilati, mai in una cameretta chiusa, e mai tutta la notte.'
  const tableRe = /(?:^\|.*\n)*^\|[^\n]*Età del Bambino[^\n]*\n(?:^\|[^\n]*\n?)*/mi
  const beforeTable = c
  c = c.replace(tableRe, safePara + '\n')
  const tableRemoved = beforeTable !== c
  // 2. fix referenza "vedi tabella sopra" nello step 3
  const step3old = '**Aggiungi 1-3 gocce totali** dell\'olio scelto (dipende dall\'età, vedi tabella sopra).'
  const step3new = '**Aggiungi poche gocce** dell\'olio scelto, molte meno che per un adulto (segui l\'etichetta doTERRA e il parere del pediatra).'
  const step3hit = c.includes(step3old)
  c = c.split(step3old).join(step3new)
  await reembed(data, c)
  console.log('IT: tabella età×dose rimossa=' + tableRemoved + ' | step3 fix=' + step3hit)
  const leftover = /Età del Bambino|\banni\b\s*\|\s*\d|vedi tabella sopra/i.test(c)
  console.log('   residuo tabella/età×dose: ' + (leftover ? '⚠️ SÌ' : '✅ NO'))
}

// ---------- PT (BR → pt_PT europeu) ----------
const PT_MAP = [
  ['Mães Cansadas e Estresse', 'Mães Cansadas e Stress'],           // titolo + H1
  ['alívio do estresse', 'alívio do stress'],                        // meta
  ['Descubra óleos essenciais', 'Descobre óleos essenciais'],        // meta
  ['você finalmente senta no sofá, mas a cabeça ainda está a mil por hora', 'sentas-te finalmente no sofá, mas a cabeça ainda está a mil à hora'],
  ['Se você está lendo isto, provavelmente conhece aquela', 'Se estás a ler isto, provavelmente conheces aquela'],
  ['quando tudo parece urgente e você está sempre em último lugar', 'quando tudo parece urgente e estás sempre em último lugar'],
  ['não vão fazer o jantar nem dar banho nas crianças', 'não vão fazer o jantar nem dar banho às crianças'],
  ['quando você inala algo que acalma, o corpo responde', 'quando inalas algo que acalma, o corpo responde'],
  ['O que eu acabei entendendo é que o alívio vem', 'O que acabei por perceber é que o alívio vem'],
  ['Misture 5-6 gotas do seu óleo favorito', 'Mistura 5-6 gotas do teu óleo favorito'],
  ['Aplique nos pulsos quando precisar de um momento de calma', 'Aplica nos pulsos quando precisares de um momento de calma'],
  ['Coloque 1-2 gotas nas palmas das mãos, esfregue e inale profundamente', 'Coloca 1-2 gotas nas palmas das mãos, esfrega e inala profundamente'],
  ['Adicione 2-3 gotas de Lavanda misturadas', 'Adiciona 2-3 gotas de Lavanda misturadas'],
  ['Dilua sempre antes de aplicar na pele. Mantenha os óleos fora do alcance das crianças e, se estiver grávida ou a amamentar, consulte o seu médico ou obstetra', 'Dilui sempre antes de aplicar na pele. Mantém os óleos fora do alcance das crianças e, se estiveres grávida ou a amamentar, consulta o teu médico ou obstetra'],
  ['Consulte o seu médico ou obstetra antes de usar qualquer óleo essencial durante a amamentação.', 'Consulta o teu médico ou obstetra antes de usar qualquer óleo essencial durante a amamentação.'],
  ['Sim, mas use menos gotas do que usaria só para si (2-3 gotas), difunda em espaços partilhados bem ventilados e consulte o pediatra se tiver dúvidas sobre óleos específicos. Evite difundir', 'Sim, mas usa menos gotas do que usarias só para ti (2-3 gotas), difunde em espaços partilhados bem ventilados e consulta o pediatra se tiveres dúvidas sobre óleos específicos. Evita difundir'],
  ['Pode encomendar diretamente à doTERRA', 'Podes encomendar diretamente à doTERRA'],
  ['Com uma conta de membro, tem 25% de desconto no preço de retalho e acesso a todos os produtos.', 'Com uma conta de membro, tens 25% de desconto no preço de retalho e acesso a todos os produtos.'],
]
async function fixPT() {
  const slug = 'oleos-essenciais-para-maes-cansadas-e-estresse'
  const { data } = await sb.from('articles').select('id,brand_id,title,meta_description,content_markdown').eq('slug', slug).single()
  let c = data.content_markdown
  let title = data.title, meta = data.meta_description
  let miss = 0
  for (const [o, n] of PT_MAP) {
    const inBody = c.includes(o), inTitle = title.includes(o), inMeta = meta.includes(o)
    if (!inBody && !inTitle && !inMeta) { console.log('   ⚠️ NON TROVATO: "' + o.slice(0, 45) + '..."'); miss++; continue }
    if (inBody) c = c.split(o).join(n)
    if (inTitle) title = title.split(o).join(n)
    if (inMeta) meta = meta.split(o).join(n)
  }
  await sb.from('articles').update({ title, meta_description: meta, content_markdown: c }).eq('id', data.id)
  await reembed({ ...data, title, meta_description: meta }, c)
  // scan residui BR
  const br = []
  if (/\bvocê\b/i.test(c) || /\bvocê\b/i.test(title)) br.push('você')
  if (/estresse/i.test(c) || /estresse/i.test(title) || /estresse/i.test(meta)) br.push('estresse')
  if (/\b(lendo|entendendo|fazendo|perguntando)\b/i.test(c)) br.push('gerúndio-BR')
  if (/banho nas crianças/i.test(c)) br.push('banho nas')
  console.log('PT: sostituzioni mancate=' + miss + ' | residui BR: ' + (br.length ? '⚠️ ' + br.join(', ') : '✅ nessuno'))
  console.log('   nuovo titolo: ' + title)
}

await fixIT()
await fixPT()
