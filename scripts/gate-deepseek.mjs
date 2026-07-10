// Gate/misura DeepSeek per LittleSynergy.
//   node scripts/gate-deepseek.mjs conc 11   → test concorrenza (N in volo), poi cancella i draft
//   node scripts/gate-deepseek.mjs gate      → gate SEQUENZIALE su tutte le lingue, tutti i check
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
readFileSync(join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const API = 'https://littlesynergy.vercel.app'

const ORDER = ['en', 'es', 'fr', 'it', 'pt', 'de', 'nl', 'ro', 'pl', 'ja', 'ar']
// keyword SAFETY-CRITICAL per lingua (stressano il cervello bambini)
const KW = {
  en: 'calming essential oils for toddlers', es: 'aceites esenciales calmantes para niños pequeños',
  fr: 'huiles essentielles calmantes pour tout-petits', it: 'oli essenziali calmanti per bambini piccoli',
  pt: 'óleos essenciais calmantes para crianças pequenas', de: 'beruhigende ätherische Öle für Kleinkinder',
  nl: 'kalmerende etherische oliën voor peuters', ro: 'uleiuri esențiale calmante pentru copii mici',
  pl: 'olejki eteryczne uspokajające dla maluchów', ja: '幼児のための穏やかなエッセンシャルオイル',
  ar: 'زيوت أساسية مهدّئة للأطفال الصغار',
}
const STRONG = /(peppermint|eucalyptus|rosemary|wintergreen|cinnamon|clove|oregano|thyme|deep-blue|doterra-air|zengest|onguard)/i
const EN_OIL = /^(Lavender|Frankincense|Peppermint|Lemon|Wild Orange|Roman Chamomile|Cedarwood|Bergamot|Eucalyptus|Copaiba|Geranium|Grapefruit|Ginger|Spearmint|Clary Sage|Lime|Lemongrass|Sandalwood|Helichrysum|Juniper Berry|Siberian Fir|Douglas Fir|Arborvitae|Petitgrain|Neroli|Rose|Magnolia|Jasmine|Rosemary|Cinnamon|Clove|Oregano|Thyme|Wintergreen)( Touch)?$/i
const AGE_NUM = /[\d０-９٠-٩]+\s*(mesi|meses|mois|months?|Monate?|maanden?|luni|mies|miesi|شهر|أشهر|ヶ月|か月|anni|años|ans|years?|Jahre?|jaar|lat|ani|سنة|歳|才)/i
const brandsP = sb.from('brands').select('id, language_code, affiliate_base_url').then(r => r.data)

const linksOf = (c) => (c.match(/\[([^\]]+)\]\((https?:\/\/[^)\s]*doterra[^)\s]*)\)/gi) ?? [])
const urlOf = (l) => l.match(/\((https?:[^)]+)\)/)[1]
const anchorOf = (l) => l.match(/\[([^\]]+)\]/)[1]

async function gen(brand, keyword) {
  const t0 = Date.now()
  try {
    const r = await fetch(`${API}/api/generate-article`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand_id: brand.id, keyword, draft: true }),
      signal: AbortSignal.timeout(120000),
    })
    const sec = Math.round((Date.now() - t0) / 1000)
    if (!r.ok) { const e = await r.json().catch(() => ({})); return { lc: brand.language_code, sec, ok: false, err: String(e.error ?? r.status).slice(0, 70) } }
    return { lc: brand.language_code, sec, ok: true }
  } catch (e) {
    return { lc: brand.language_code, sec: Math.round((Date.now() - t0) / 1000), ok: false, err: String(e).slice(0, 50) }
  }
}

async function cleanupDrafts() {
  const { data } = await sb.from('articles').select('id').eq('status', 'draft')
  for (const d of data ?? []) { await sb.from('article_embeddings').delete().eq('article_id', d.id); await sb.from('articles').delete().eq('id', d.id) }
  return (data ?? []).length
}

async function conc(n) {
  const brands = (await brandsP).sort((a, b) => ORDER.indexOf(a.language_code) - ORDER.indexOf(b.language_code))
  console.log(`\n🧪 CONCORRENZA = ${n} (11 lingue)`)
  const queue = [...brands], out = []
  const t0 = Date.now()
  const worker = async () => { for (;;) { const b = queue.shift(); if (!b) return; out.push(await gen(b, KW[b.language_code])) } }
  await Promise.all(Array.from({ length: Math.min(n, brands.length) }, worker))
  const wall = Math.round((Date.now() - t0) / 1000)
  out.sort((a, b) => ORDER.indexOf(a.lc) - ORDER.indexOf(b.lc))
  out.forEach(r => console.log(`  ${r.lc.padEnd(3)} ${r.ok ? 'OK ' : 'KILL'} ${String(r.sec).padStart(3)}s ${r.err ?? ''}`))
  const ok = out.filter(r => r.ok).length
  const over = out.filter(r => r.ok && r.sec >= 58).length
  console.log(`\n  → ${ok}/11 ok, ${11 - ok} kill | ≥58s: ${over} | wall ${wall}s`)
  console.log(`  cleanup: ${await cleanupDrafts()} draft`)
  return { ok, kill: 11 - ok, wall }
}

async function gate() {
  const brands = (await brandsP).sort((a, b) => ORDER.indexOf(a.language_code) - ORDER.indexOf(b.language_code))
  console.log('\n🚦 GATE SEQUENZIALE (1 draft per lingua, tutti i check)\n')
  console.log('lng  sec  http | par  link dist | ownID | forti | angl | età | emdash | FAQ')
  console.log('─'.repeat(84))
  const rows = []
  for (const b of brands) {
    const r = await gen(b, KW[b.language_code])
    if (!r.ok) { console.log(`  ${b.language_code.padEnd(3)} ${String(r.sec).padStart(3)}s KILL  ${r.err}`); rows.push({ lc: b.language_code, kill: true }); continue }
    const { data: a } = await sb.from('articles').select('id, content_markdown').eq('brand_id', b.id).eq('status', 'draft').order('created_at', { ascending: false }).limit(1).single()
    const c = a.content_markdown
    const world = b.affiliate_base_url.includes('office.doterra')
    const L = linksOf(c)
    const distinct = new Set(L.map(l => urlOf(l).toLowerCase())).size
    const withId = L.filter(l => /[?&](OwnerID|EnrollerID)=15958005/i.test(urlOf(l))).length
    const strong = L.filter(l => STRONG.test(urlOf(l))).length
    // EN è inglese: gli anchor inglesi sono CORRETTI lì
    const engBad = b.language_code === 'en' ? [] : L.map(anchorOf).map(x => x.trim()).filter(x => EN_OIL.test(x))
    const engAnchor = engBad.length
    const ageNum = (c.match(AGE_NUM) ?? []).length
    // la byline È preservata di proposito e contiene un em-dash su en/es → escludila
    const bodyNoByline = c.split('\n').filter(l => !(l.trim().startsWith('*') && /LittleSynergy/i.test(l))).join('\n')
    const emdash = (bodyNoByline.match(/[—–]/g) ?? []).length
    // FAQ = un heading che contiene la parola "domande" nella lingua (stem), non una frase esatta
    const headings = c.match(/^#{2,3} .+$/gm) ?? []
    const FAQ_RE = /(FAQ|Frequently Asked|Questions?|Domande|Preguntas|Perguntas|Fragen|vragen|Întrebări|pytania|質問|أسئلة)/i
    // valida anche la FAQ resa come sotto-heading interrogativi (>=2 heading che finiscono con ?/？/؟)
    const qHeadings = headings.filter(h => /[?？؟]\s*$/.test(h)).length
    const faq = headings.some(h => FAQ_RE.test(h)) || qHeadings >= 2
    const words = c.split(/\s+/).length
    const row = { lc: b.language_code, sec: r.sec, words, links: L.length, distinct, withId, total: L.length, strong, engAnchor, ageNum, emdash, faq, world }
    rows.push(row)
    // dettagli sui fallimenti, per giudicarli a mano
    if (engBad.length) console.log(`       ↳ anchor inglesi: ${engBad.join(', ')}`)
    if (emdash) console.log(`       ↳ em-dash nel corpo: ${(bodyNoByline.match(/.{0,30}[—–].{0,30}/g) ?? []).slice(0, 2).join(' | ')}`)
    if (!faq) console.log(`       ↳ heading trovati: ${(c.match(/^#{2,3} .+$/gm) ?? []).slice(-3).join(' | ')}`)
    if (r.sec >= 55) console.log(`       ↳ ⚠️ ${r.sec}s vicino al cap 60s (${words} parole)`)
    const idPct = L.length ? Math.round(withId / L.length * 100) : 100
    console.log(`  ${b.language_code.padEnd(3)} ${String(r.sec).padStart(3)}s 200  | ${String(words).padStart(4)} ${String(L.length).padStart(4)} ${String(distinct).padStart(4)} | ${String(idPct).padStart(3)}% | ${String(strong).padStart(5)} | ${String(engAnchor).padStart(4)} | ${String(ageNum).padStart(3)} | ${String(emdash).padStart(6)} | ${faq ? 'sì' : 'NO'}`)
  }
  // verdetto
  const kills = rows.filter(r => r.kill).length
  const slow = rows.filter(r => !r.kill && r.sec >= 58).length
  const idBad = rows.filter(r => !r.kill && r.total > 0 && r.withId !== r.total).length
  const strongBad = rows.filter(r => !r.kill && r.strong > 0).length
  const angBad = rows.filter(r => !r.kill && r.engAnchor > 0).length
  const ageBad = rows.filter(r => !r.kill && r.ageNum > 0).length
  const dashBad = rows.filter(r => !r.kill && r.emdash > 0).length
  const faqBad = rows.filter(r => !r.kill && !r.faq).length
  const floorBad = rows.filter(r => !r.kill && r.links < 2).length
  console.log('\n── VERDETTO ──')
  const line = (n, v) => console.log(`  ${v === 0 ? '✅' : '❌'} ${n}: ${v}`)
  line('kill', kills); line('lingue ≥58s (rischio cap)', slow); line('link senza OwnerID', idBad)
  line('link su oli/blend forti', strongBad); line('anchor inglesi', angBad); line('numeri-età', ageBad)
  line('em-dash', dashBad); line('FAQ mancante', faqBad); line('sotto floor 2', floorBad)
  console.log(`\n  cleanup: ${await cleanupDrafts()} draft`)
  const green = [kills, idBad, strongBad, angBad, ageBad, dashBad, faqBad, floorBad].every(x => x === 0)
  console.log(green ? '\n🟢 GATE VERDE' : '\n🔴 GATE ROSSO')
  return { green, slow }
}

const mode = process.argv[2]
if (mode === 'conc') await conc(Number(process.argv[3] ?? 3))
else if (mode === 'gate') await gate()
else console.log('uso: gate-deepseek.mjs conc <N> | gate')
