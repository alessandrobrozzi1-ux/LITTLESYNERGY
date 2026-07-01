require('fs').readFileSync(require('path').join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const serviceKey = process.env.SUPABASE_SERVICE_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }

const THEMES = [
  {
    theme_name: 'Lavanda & Bienestar',
    description: 'Artículos sobre lavanda doTERRA: usos, beneficios, recetas y combinaciones para el bienestar cotidiano.',
    active: true,
    keywords: [
      'aceite esencial de lavanda para dormir',
      'lavanda doTERRA usos y beneficios',
      'aceite de lavanda para el estrés',
      'lavanda esencial para masajes relajantes',
      'cómo usar lavanda en difusor',
      'lavanda doTERRA para la piel',
      'mezclas con lavanda y bergamota',
      'lavanda para niños y bebés',
      'aceite de lavanda para dolores de cabeza',
      'lavanda roll-on usos cotidianos',
      'lavanda y manzanilla para la ansiedad',
      'lavanda doTERRA España comprar',
    ],
  },
  {
    theme_name: 'Productividad & Smart Working',
    description: 'Aceites esenciales para concentración, energía y rendimiento en el trabajo desde casa o en oficina.',
    active: true,
    keywords: [
      'aceites esenciales para concentrarse estudiando',
      'difusor aromas para trabajar desde casa',
      'aceite de romero para la memoria',
      'menta doTERRA para la energía mental',
      'aromas para aumentar la productividad',
      'aceites esenciales para el home office',
      'incienso frankincense para la meditación y el trabajo',
      'limón doTERRA para el enfoque mental',
      'naranja salvaje para el buen humor en el trabajo',
      'rutina de aromaterapia para la mañana productiva',
      'aceites esenciales para combatir el cansancio mental',
      'mezclas aromaterapia para la creatividad',
    ],
  },
]

async function run() {
  const res = await fetch(`${supabaseUrl}/rest/v1/brands?language_code=eq.es&select=id`, { headers })
  const brands = await res.json()
  if (!brands.length) { console.log('❌ No ES brand'); return }
  const brand_id = brands[0].id

  // Clear existing themes for this brand to avoid dupes
  await fetch(`${supabaseUrl}/rest/v1/editorial_themes?brand_id=eq.${brand_id}`, { method: 'DELETE', headers })

  const rows = THEMES.map(t => ({ brand_id, ...t }))
  const insertRes = await fetch(`${supabaseUrl}/rest/v1/editorial_themes`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify(rows),
  })

  console.log(insertRes.ok
    ? `✅ Seeded ${rows.length} editorial themes for brand ${brand_id}`
    : `❌ ${await insertRes.text()}`)
}

run()
