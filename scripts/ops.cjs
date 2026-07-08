// LittleSynergy ops — toolkit diagnosi + fix d'emergenza. Legge .env.local. Nessun secret hardcoded.
// Uso: node scripts/ops.cjs <comando> [args]   (senza args = lista comandi)
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs'), path = require('path')
fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const ORDER = ['en', 'es', 'pt', 'fr', 'it']
const N = ORDER.length
// ⚠️ FASE 3: aggiornare con il production URL reale del progetto Vercel Davidino dopo il primo deploy.
const API = 'https://littlesynergy.vercel.app'
const cmd = (process.argv[2] || '').toLowerCase()
const bm = {} // brand_id -> language_code

async function loadBrands() { const { data } = await sb.from('brands').select('id,language_code,active'); data.forEach(b => bm[b.id] = b.language_code); return data }
async function trigger(endpoint) {
  const r = await fetch(API + endpoint, { headers: { authorization: 'Bearer ' + process.env.CRON_SECRET }, signal: AbortSignal.timeout(95000) })
  let body = {}; try { body = await r.json() } catch {}
  return { status: r.status, body }
}
function todayStart() { const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d.toISOString() }

;(async () => {
  if (cmd === 'health') {
    const brands = await loadBrands()
    const active = brands.filter(b => b.active).length
    const { data: today } = await sb.from('articles').select('featured_image,slug').eq('status', 'published').gte('published_at', todayStart())
    const noimg = (today || []).filter(a => !a.featured_image)
    let site = 0; try { site = (await fetch(API + '/api/public/articles/en', { signal: AbortSignal.timeout(15000) })).status } catch {}
    console.log('① brand attivi : ' + active + '/' + N + ' ' + (active === N ? '✅' : '⚠️'))
    console.log('② articoli oggi: ' + (today ? today.length : 0) + '/' + N + ', senza foto: ' + noimg.length + (noimg.length ? (' ⚠️ ' + noimg.map(a => a.slug.slice(0, 24)).join(',')) : ' ✅'))
    console.log('③ sito (API)   : HTTP ' + site + (site === 200 ? ' ✅' : ' ⚠️'))
  }
  else if (cmd === 'today') {
    await loadBrands()
    const { data } = await sb.from('articles').select('brand_id,slug,featured_image').eq('status', 'published').gte('published_at', todayStart()).order('published_at')
    const seen = new Set()
    for (const a of (data || [])) { seen.add(bm[a.brand_id]); console.log('  ' + (bm[a.brand_id] || '?').padEnd(3) + ' ' + (a.featured_image ? 'IMG✅' : 'IMG❌') + ' ' + a.slug) }
    const miss = ORDER.filter(l => !seen.has(l))
    console.log('\nbrand SENZA articolo oggi: ' + (miss.length ? ('⚠️ ' + miss.join(',')) : 'nessuno ✅'))
  }
  else if (cmd === 'nullimg') {
    await loadBrands()
    const { data } = await sb.from('articles').select('brand_id,slug').eq('status', 'published').is('featured_image', null)
    if (!data || !data.length) return console.log('✅ 0 articoli published senza foto')
    data.forEach(a => console.log('  ' + (bm[a.brand_id] || '?') + ' ' + a.slug)); console.log('totale: ' + data.length)
  }
  else if (cmd === 'site') {
    for (const l of ORDER) { let s = 0; try { s = (await fetch(API + '/api/public/articles/' + l, { signal: AbortSignal.timeout(15000) })).status } catch {} console.log('  ' + l.padEnd(3) + ' HTTP ' + s + (s === 200 ? ' ✅' : ' ⚠️')) }
  }
  else if (cmd === 'backfill') {
    for (let i = 1; i <= 15; i++) {
      const { status, body } = await trigger('/api/cron/backfill-images')
      console.log('  call ' + i + ': HTTP ' + status + ' → ' + JSON.stringify(body))
      if (status !== 200) { console.log('  ⚠️ stop (non-200, controlla auth/endpoint)'); break }
      if ((body.remaining ?? 0) === 0) { console.log('  ✅ remaining=0 — finito'); break }
    }
  }
  else if (cmd === 'publish') {
    console.log('trigger daily-publish (la guard salta i brand già pubblicati oggi)...')
    const { status, body } = await trigger('/api/cron/daily-publish')
    console.log('HTTP ' + status + ' → ' + JSON.stringify(body).slice(0, 400))
  }
  else if (cmd === 'keywords') {
    const { status, body } = await trigger('/api/cron/daily-keywords')
    console.log('HTTP ' + status + ' → ' + JSON.stringify(body).slice(0, 400))
  }
  else if (cmd === 'find') {
    await loadBrands()
    const term = process.argv[3]; if (!term) return console.log('uso: node scripts/ops.cjs find "<testo>"')
    const { data } = await sb.from('articles').select('brand_id,slug,content_markdown').eq('status', 'published')
    let n = 0
    for (const a of data) { const c = a.content_markdown || ''; let i = c.indexOf(term); while (i >= 0) { n++; console.log('  [' + bm[a.brand_id] + '] ' + a.slug + ' → …' + c.slice(Math.max(0, i - 35), i + term.length + 35).replace(/\n/g, ' ').trim() + '…'); i = c.indexOf(term, i + term.length) } }
    console.log(n ? ('\n' + n + ' occorrenze') : ('✅ nessuna occorrenza di "' + term + '"'))
  }
  else if (cmd === 'fix') {
    const OpenAI = require('openai')
    const [slug, oldT, newT] = process.argv.slice(3)
    if (!slug || oldT === undefined || newT === undefined) return console.log('uso: node scripts/ops.cjs fix <slug> "<vecchio ESATTO>" "<nuovo>"')
    const { data } = await sb.from('articles').select('id,brand_id,title,meta_description,content_markdown').eq('slug', slug)
    if (!data || !data.length) return console.log('❌ slug non trovato: ' + slug)
    if (data.length > 1) return console.log('⚠️ ' + data.length + ' articoli con questo slug — raro, stop per sicurezza.')
    const a = data[0], c = a.content_markdown || ''
    const count = c.split(oldT).length - 1
    if (count === 0) return console.log('❌ testo non trovato (deve essere ESATTO, copia-incollalo da `find`):\n   "' + oldT + '"')
    const nc = c.split(oldT).join(newT)
    await sb.from('articles').update({ content_markdown: nc }).eq('id', a.id)
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const res = await openai.embeddings.create({ model: 'text-embedding-3-small', input: [a.title, a.meta_description, nc.slice(0, 2000)].join('\n') })
    await sb.from('article_embeddings').upsert({ article_id: a.id, brand_id: a.brand_id, embedding: '[' + res.data[0].embedding.join(',') + ']', generated_at: new Date().toISOString() }, { onConflict: 'article_id' })
    console.log('✅ ' + slug + ': sostituito ' + count + '× + re-embedded\n   "' + oldT + '" → "' + newT + '"')
  }
  else {
    console.log('SoloSEO ops — comandi:')
    console.log('  health                         stato 30s (brand / articoli-oggi+foto / sito)')
    console.log('  today                          articoli di oggi per brand + stato foto')
    console.log('  nullimg                        published senza foto')
    console.log('  backfill                       drena le foto mancanti (loop fino a 0)')
    console.log('  publish                        ri-triggera daily-publish (riempie i gap)')
    console.log('  keywords                       ri-triggera daily-keywords')
    console.log('  site                           public API lingue attive EN/ES (HTTP)')
    console.log('  find "<testo>"                 cerca testo nei published (prezzi/claim)')
    console.log('  fix <slug> "<old>" "<new>"     sostituisci testo esatto + re-embed')
  }
})().catch(e => console.error('ERRORE: ' + e.message))
