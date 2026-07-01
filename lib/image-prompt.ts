import OpenAI from 'openai'

// Translation cache — avoids re-translating identical keywords within the same serverless instance
const _translateCache = new Map<string, string>()

async function translateKeywordToEnglish(keyword: string, langCode: string): Promise<string> {
  if (langCode === 'en' || !keyword) return keyword
  const cacheKey = `${langCode}::${keyword}`
  if (_translateCache.has(cacheKey)) return _translateCache.get(cacheKey)!
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 50,
      messages: [{ role: 'user', content: `Translate this ${langCode} keyword to English. Keep doTERRA product names (Lavender, Peppermint, Frankincense, On Guard, Serenity, etc.) unchanged. Output ONLY the translation, no explanation.\nKeyword: ${keyword}` }],
    })
    const translated = res.choices[0]?.message?.content?.trim() ?? keyword
    _translateCache.set(cacheKey, translated)
    return translated
  } catch { return keyword }
}

/**
 * CONTENT-AWARE IMAGE PROMPT BUILDER — SoloSEO doTERRA
 *
 * Last locked: 2026-06-26 v1.5 (universal English keyword translation for gpt-image-2 quality)
 * Standard: 16:9 landscape, doTERRA bottle primary subject, BLACK matte cap.
 *
 * Flow:
 * 1. Extract linked products from article markdown (max 3)
 * 2. Normalize anchor text via PRODUCT_NAME_MAP (multi-language)
 * 3. Primary product = first linked. Fallback to keyword extraction.
 * 4. Secondary product (if exists) → background mention
 * 5. Botanical from BOTANICAL_MAP based on topic
 *
 * CRITICAL: Universal. No language branching. Works for any brand.
 *
 * Production call sites (ONLY these 2):
 *   app/api/cron/daily-publish/route.ts
 *   app/api/generate-image/route.ts
 *
 * If image quality regression:
 * 1. Check PRODUCT_NAME_MAP covers new language anchors (≥30 entries/lang)
 * 2. Check BOTANICAL_MAP covers topic keywords for new language
 * 3. Verify generate-image fetches column 'content' (NOT 'content_markdown')
 * 4. Verify DEFAULT_STYLE still has BLACK cap language
 */

// ─── BOTANICAL_MAP ────────────────────────────────────────────────────────────
const BOTANICAL_MAP: Record<string, string> = {
  // Single oils — EN + ES (shared keys)
  lavand:         'lavender sprigs and purple flowers',
  lavender:       'lavender sprigs and purple flowers',
  peppermint:     'fresh mint leaves and stems',
  frankincense:   'frankincense resin chunks',
  bergamot:       'bergamot citrus slices and zest',
  bergamota:      'bergamot citrus slices and green leaves',
  limon:          'lemon slices and citrus zest',
  lemon:          'lemon slices and citrus zest',
  naranja:        'orange blossom and citrus fruit',
  orange:         'orange blossom and citrus slices',
  romero:         'fresh rosemary sprigs',
  rosemary:       'fresh rosemary sprigs',
  eucalipto:      'eucalyptus leaves and branches',
  eucalyptus:     'eucalyptus leaves and branches',
  manzanilla:     'chamomile flowers and dried petals',
  chamomile:      'chamomile flowers',
  canela:         'cinnamon sticks and star anise',
  cinnamon:       'cinnamon sticks',
  ylang:          'ylang ylang flowers and tropical petals',
  geranio:        'pink geranium petals',
  geranium:       'pink geranium petals',
  cedro:          'cedar wood chips and bark',
  cedar:          'cedar wood chips and bark',
  vetiver:        'dried vetiver roots',
  ginger:         'fresh ginger root slices',
  jengibre:       'fresh ginger root slices',
  myrrh:          'myrrh resin and dried wood elements',
  oregano:        'fresh oregano sprigs and herbs',
  copaib:         'copaiba resin drops and dark wood',
  patchouli:      'patchouli leaves and earthy botanicals',
  helichr:        'helichrysum yellow flowers',
  // Blends
  serenity:       'lavender and roman chamomile flowers',
  onguard:        'wild orange slices, clove buds, and cinnamon sticks',
  'on guard':     'wild orange slices, clove buds, and cinnamon sticks',
  balance:        'spruce branch, rosewood shavings, and blue chamomile',
  deepblue:       'wintergreen leaves and peppermint sprigs',
  'deep blue':    'wintergreen leaves and peppermint sprigs',
  digestzen:      'fennel fronds and ginger root',
  breathe:        'eucalyptus leaves and peppermint sprigs',
  // Tea Tree / Melaleuca
  'tea tree':     'fresh green tea tree leaves and branches',
  teatree:        'fresh green tea tree leaves and branches',
  melaleuca:      'fresh green tea tree leaves and branches',
  arbol:          'fresh green tea tree leaves and branches',
  acne:           'fresh tea tree leaves and lavender sprigs',
  acnei:          'fresh tea tree leaves and lavender sprigs',
  // Topic — EN
  sleep:          'lavender sprigs and soft linen',
  stress:         'lavender sprigs and soft folded linen',
  relax:          'lavender sprigs and soft folded linen',
  skincare:       'rose petals and soft white towels on marble',
  beauty:         'rose petals and soft towels on marble',
  clean:          'lemon slices and eucalyptus leaves',
  cleaning:       'lemon slices and eucalyptus leaves',
  energi:         'sliced citrus fruits and fresh mint leaves',
  energy:         'sliced citrus fruits and fresh mint leaves',
  kids:           'chamomile flowers and soft pastel linen',
  baby:           'chamomile flowers and soft pastel linen',
  business:       'rosemary sprigs and a small potted plant',
  work:           'rosemary sprigs and a small green plant',
  focus:          'rosemary sprigs and clean minimal desk elements',
  concentr:       'rosemary sprigs and a small green plant',
  memo:           'rosemary sprigs and a small potted plant',
  buy:            'mixed botanicals and natural wellness elements on marble',
  guide:          'mixed botanicals and natural wellness elements on marble',
  wellness:       'fresh botanicals and natural spa elements on marble',
  // Topic — ES
  menta:          'fresh mint leaves and stems',
  incienso:       'frankincense resin chunks and dried botanicals',
  dormir:         'lavender sprigs and soft linen',
  sueño:          'lavender sprigs and soft linen',
  noche:          'lavender sprigs and a small white candle',
  insomnio:       'lavender sprigs and soft folded linen',
  estrés:         'lavender sprigs and soft folded linen',
  estres:         'lavender sprigs and soft folded linen',
  relajaci:       'lavender sprigs and soft folded linen',
  piel:           'rose petals and soft towels on marble',
  belleza:        'rose petals and a small ceramic dish on marble',
  limpi:          'lemon slices and eucalyptus leaves',
  hogar:          'lemon slices and eucalyptus branches',
  vitalid:        'sliced citrus fruits and fresh mint',
  niños:          'chamomile flowers and soft pastel linen',
  ninos:          'chamomile flowers and soft pastel linen',
  negocio:        'rosemary sprigs and a small potted green plant',
  trabajo:        'rosemary sprigs and a small green plant',
  bienestar:      'fresh botanicals and natural spa elements on marble',
  comprar:        'mixed botanicals and natural wellness elements on marble',
  // Topic — FR
  sommeil:        'lavender sprigs and soft linen',
  endormi:        'lavender sprigs and soft linen',
  insomni:        'lavender sprigs and soft folded linen',
  peau:           'rose petals and soft white towels on marble',
  nettoyage:      'lemon slices and eucalyptus leaves on a bright surface',
  détente:        'lavender sprigs and soft folded linen',
  ménage:         'lemon slices and eucalyptus branches',
  énergie:        'sliced citrus fruits and fresh mint leaves',
  concentration:  'rosemary sprigs and clean minimal desk elements',
  immunité:       'fresh citrus slices and eucalyptus leaves',
  'bien-être':    'fresh botanicals and natural spa elements on marble',
  lavande:        'lavender sprigs and purple flowers',
  menthe:         'fresh mint leaves and stems',
  encens:         'frankincense resin chunks and dried botanicals',
  bébé:           'chamomile flowers and soft pastel linen',
  enfants:        'chamomile flowers and soft pastel linen',
  bienfait:       'fresh botanicals and natural spa elements on marble',
  santé:          'fresh botanicals and natural spa elements on marble',
  acheter:        'mixed botanicals and natural wellness elements on marble',
  achat:          'mixed botanicals and natural wellness elements on marble',
  réduction:      'mixed botanicals and natural wellness elements on marble',
  réduire:        'mixed botanicals and natural wellness elements on marble',
  membre:         'mixed botanicals and natural wellness elements on marble',
  adhésion:       'mixed botanicals and natural wellness elements on marble',
  // Topic — DE
  schlaf:         'soft linen pillow, warm candlelight, calming bedroom elements',
  schlafen:       'soft linen pillow, warm candlelight, calming bedroom elements',
  haut:           'rose petals and soft white towels on marble',
  hautpflege:     'rose petals and soft white towels on marble',
  akne:           'fresh tea tree leaves and lavender sprigs',
  reinigung:      'lemon slices and eucalyptus leaves on a bright surface',
  energie:        'sliced citrus fruits and fresh mint leaves',
  fokus:          'rosemary sprigs and a small potted plant on a desk',
  arbeit:         'rosemary sprigs and a small potted plant on a desk',
  immunsystem:    'fresh citrus slices and eucalyptus leaves',
  entspannung:    'lavender sprigs and soft folded linen',
  wohlbefinden:   'fresh botanicals and natural spa elements on marble',
  kinder:         'chamomile flowers and soft pastel linen',
  kaufen:         'mixed botanicals and natural wellness elements on marble',
  kauf:           'mixed botanicals and natural wellness elements on marble',
  rabatt:         'mixed botanicals and natural wellness elements on marble',
  // Topic — PT
  sono:           'soft linen pillow and warm candlelight, calming bedroom elements',
  insônia:        'lavender sprigs and soft folded linen',
  pele:           'rose petals and soft white towels on marble',
  limpeza:        'lemon slices and eucalyptus leaves on a bright surface',
  foco:           'rosemary sprigs and clean minimal desk elements',
  imunidade:      'fresh citrus slices and eucalyptus leaves',
  'bem-estar':    'fresh botanicals and natural spa elements on marble',
  'crianças':     'chamomile flowers and soft pastel linen',
  'bebê':         'chamomile flowers and soft pastel linen',
  hortelã:        'fresh mint leaves and stems',
  incenso:        'frankincense resin chunks and dried botanicals',
  alfazema:       'lavender sprigs and purple flowers',
  guia:           'mixed botanicals and natural wellness elements on marble',
  // Topic — RO (energie skip: presente, valore identico)
  'somn':         'soft linen pillow and warm candlelight, calming bedroom elements',
  'dormi':        'soft linen pillow and warm candlelight',
  'insomnie':     'lavender sprigs and soft folded linen',
  'piele':        'rose petals and soft white towels on marble',
  'curățenie':    'lemon slices and eucalyptus leaves on a bright surface',
  'concentrare':  'rosemary sprigs and clean minimal desk elements',
  'imunitate':    'fresh citrus slices and eucalyptus leaves',
  'stres':        'lavender sprigs and soft folded linen',
  'relaxare':     'lavender sprigs and soft linen',
  'bunăstare':    'fresh botanicals and natural spa elements on marble',
  'copii':        'chamomile flowers and soft pastel linen',
  'bebeluș':      'chamomile flowers and soft pastel linen',
  'cumpără':      'mixed botanical arrangement on marble with multiple bottles',
  'ghid':         'mixed botanicals and natural wellness elements',
  'lavandă':      'lavender sprigs and purple flowers',
  'mentă':        'fresh mint leaves and stems',
  'tămâie':       'frankincense resin chunks and dried botanicals',
}

// ─── PRODUCT_MAP ─────────────────────────────────────────────────────────────
const PRODUCT_MAP: Record<string, string> = {
  lavand:         'Lavender',
  lavender:       'Lavender',
  peppermint:     'Peppermint',
  menta:          'Peppermint',
  incienso:       'Frankincense',
  frankincense:   'Frankincense',
  bergamot:       'Bergamot',
  bergamota:      'Bergamot',
  limon:          'Lemon',
  lemon:          'Lemon',
  naranja:        'Wild Orange',
  orange:         'Wild Orange',
  romero:         'Rosemary',
  rosemary:       'Rosemary',
  eucalipto:      'Eucalyptus',
  eucalyptus:     'Eucalyptus',
  manzanilla:     'Roman Chamomile',
  chamomile:      'Roman Chamomile',
  canela:         'Cinnamon',
  cinnamon:       'Cinnamon',
  ylang:          'Ylang Ylang',
  geranio:        'Geranium',
  geranium:       'Geranium',
  cedro:          'Cedarwood',
  cedar:          'Cedarwood',
  vetiver:        'Vetiver',
  ginger:         'Ginger',
  jengibre:       'Ginger',
  myrrh:          'Myrrh',
  oregano:        'Oregano',
  copaib:         'Copaiba',
  patchouli:      'Patchouli',
  // Blends
  serenity:       'Serenity',
  onguard:        'On Guard',
  'on guard':     'On Guard',
  balance:        'Balance',
  deepblue:       'Deep Blue',
  'deep blue':    'Deep Blue',
  digestzen:      'DigestZen',
  breathe:        'Breathe',
  intune:         'InTune',
  // Tea Tree
  'tea tree':     'Tea Tree',
  teatree:        'Tea Tree',
  melaleuca:      'Tea Tree',
  arbol:          'Tea Tree',
  acne:           'Tea Tree',
  // Topic fallbacks
  sleep:          'Serenity',
  dormir:         'Serenity',
  sueño:          'Serenity',
  insomnio:       'Serenity',
  sommeil:        'Serenity',
  schlaf:         'Serenity',
  schlafen:       'Serenity',
  skincare:       'Immortelle',
  piel:           'Immortelle',
  belleza:        'Immortelle',
  beauty:         'Immortelle',
  haut:           'Immortelle',
  peau:           'Immortelle',
  limpi:          'Lemon',
  clean:          'Lemon',
  hogar:          'Lemon',
  reinigung:      'Lemon',
  nettoyage:      'Lemon',
  energi:         'Citrus Bliss',
  energy:         'Citrus Bliss',
  vitalid:        'Citrus Bliss',
  energie:        'Citrus Bliss',
  énergie:        'Citrus Bliss',
  negocio:        'InTune',
  business:       'InTune',
  trabajo:        'InTune',
  work:           'InTune',
  concentr:       'InTune',
  focus:          'InTune',
  fokus:          'InTune',
  concentration:  'InTune',
  memo:           'InTune',
  stress:         'Lavender',
  entspannung:    'Lavender',
  relax:          'Lavender',
  détente:        'Lavender',
  wellness:       'Lavender',
  bienestar:      'Lavender',
  wohlbefinden:   'Lavender',
  'bien-être':    'Lavender',
  acheter:        'On Guard',
  achat:          'On Guard',
  réduction:      'On Guard',
  membre:         'On Guard',
  kaufen:         'On Guard',
  rabatt:         'On Guard',
  bienfait:       'Lavender',
  santé:          'On Guard',
  kids:           'Roman Chamomile',
  baby:           'Roman Chamomile',
  kinder:         'Roman Chamomile',
  bébé:           'Roman Chamomile',
  niños:          'Roman Chamomile',
}

// ─── PRODUCT_NAME_MAP ─────────────────────────────────────────────────────────
// Maps anchor text from article links → canonical EN product name.
// Active langs (EN/ES/DE/FR/PT): ≥30 entries each.
// Future langs (IT/NL): add section when launching.
const PRODUCT_NAME_MAP: Record<string, string> = {
  // ── EN + universal blend names (used in all languages) ──────────────────
  'lavender':           'Lavender',
  'peppermint':         'Peppermint',
  'frankincense':       'Frankincense',
  'lemon':              'Lemon',
  'wild orange':        'Wild Orange',
  'tea tree':           'Tea Tree',
  'eucalyptus':         'Eucalyptus',
  'rosemary':           'Rosemary',
  'bergamot':           'Bergamot',
  'cinnamon':           'Cinnamon',
  'ylang ylang':        'Ylang Ylang',
  'geranium':           'Geranium',
  'cedar':              'Cedarwood',
  'vetiver':            'Vetiver',
  'ginger':             'Ginger',
  'myrrh':              'Myrrh',
  'oregano':            'Oregano',
  'copaiba':            'Copaiba',
  'patchouli':          'Patchouli',
  'helichrysum':        'Helichrysum',
  'clary sage':         'Clary Sage',
  'roman chamomile':    'Roman Chamomile',
  'chamomile':          'Roman Chamomile',
  'melaleuca':          'Tea Tree',
  'teatree':            'Tea Tree',
  // Blends — universal brand names
  'on guard':           'On Guard',
  'serenity':           'Serenity',
  'balance':            'Balance',
  'deep blue':          'Deep Blue',
  'digestzen':          'DigestZen',
  'breathe':            'Breathe',
  'intune':             'InTune',
  'citrus bliss':       'Citrus Bliss',
  'immortelle':         'Immortelle',
  'aromatouch':         'AromaTouch',
  'adaptiv':            'Adaptiv',
  'zengest':            'ZenGest',

  // ── ES (Español) — 31 entries ────────────────────────────────────────────
  'lavanda':            'Lavender',
  'menta piperita':     'Peppermint',
  'menta':              'Peppermint',
  'hierba buena':       'Peppermint',
  'incienso':           'Frankincense',
  'olíbano':            'Frankincense',
  'olibano':            'Frankincense',
  'limón':              'Lemon',
  'limon':              'Lemon',
  'naranja silvestre':  'Wild Orange',
  'naranja':            'Wild Orange',
  'árbol de té':        'Tea Tree',
  'arbol de te':        'Tea Tree',
  'árbol de te':        'Tea Tree',
  'eucalipto':          'Eucalyptus',
  'romero':             'Rosemary',
  'bergamota':          'Bergamot',
  'canela':             'Cinnamon',
  'ylang-ylang':        'Ylang Ylang',
  'geranio':            'Geranium',
  'cedro':              'Cedarwood',
  'jengibre':           'Ginger',
  'mirra':              'Myrrh',
  'orégano':            'Oregano',
  'pachulí':            'Patchouli',
  'helicriso':          'Helichrysum',
  'manzanilla romana':  'Roman Chamomile',
  'manzanilla':         'Roman Chamomile',
  'salvia romana':      'Clary Sage',
  'albahaca':           'Basil',
  'enebro':             'Juniper Berry',

  // ── FR (Français) — 31 entries ───────────────────────────────────────────
  'lavande':            'Lavender',
  'menthe poivrée':     'Peppermint',
  'menthe':             'Peppermint',
  'encens':             'Frankincense',
  'oliban':             'Frankincense',
  'citron':             'Lemon',
  'orange sauvage':     'Wild Orange',
  'arbre à thé':        'Tea Tree',
  'romarin':            'Rosemary',
  'camomille romaine':  'Roman Chamomile',
  'camomille':          'Roman Chamomile',
  'géranium':           'Geranium',
  'cèdre':              'Cedarwood',
  'vétiver':            'Vetiver',
  'bergamote':          'Bergamot',
  'cannelle':           'Cinnamon',
  'gingembre':          'Ginger',
  'myrrhe':             'Myrrh',
  'origan':             'Oregano',
  'copaïba':            'Copaiba',
  'hélichryse':         'Helichrysum',
  'basilic':            'Basil',
  'genévrier':          'Juniper Berry',
  'coriandre':          'Coriander',
  'menthe verte':       'Spearmint',
  'petitgrain':         'Petitgrain',
  'néroli':             'Neroli',
  'thym':               'Thyme',
  'cyprès':             'Cypress',
  'sauge sclarée':      'Clary Sage',

  // ── DE (Deutsch) — 35 entries ────────────────────────────────────────────
  'lavendelöl':         'Lavender',
  'lavendel':           'Lavender',
  'pfefferminzöl':      'Peppermint',
  'pfefferminze':       'Peppermint',
  'weihrauchöl':        'Frankincense',
  'weihrauch':          'Frankincense',
  'zitronenöl':         'Lemon',
  'zitrone':            'Lemon',
  'wilde orange':       'Wild Orange',
  'wildoberane':        'Wild Orange',
  'teebaumöl':          'Tea Tree',
  'teebaum':            'Tea Tree',
  'eukalyptusöl':       'Eucalyptus',
  'eukalyptus':         'Eucalyptus',
  'rosmarinöl':         'Rosemary',
  'rosmarin':           'Rosemary',
  'bergamotte':         'Bergamot',
  'zimtöl':             'Cinnamon',
  'zimt':               'Cinnamon',
  'ingwer':             'Ginger',
  'geranie':            'Geranium',
  'geranienöl':         'Geranium',
  'zedernholz':         'Cedarwood',
  'zeder':              'Cedarwood',
  'römische kamille':   'Roman Chamomile',
  'kamille':            'Roman Chamomile',
  'auf der hut':        'On Guard',
  'tiefblau':           'Deep Blue',
  'gelassenheit':       'Serenity',
  'atemwege':           'Breathe',
  'verdauung':          'DigestZen',
  'patschuli':          'Patchouli',

  // ── PT (Português) — 32 entries ────────────────────────────────────────────
  'alfazema':           'Lavender',
  'hortelã-pimenta':    'Peppermint',
  'hortelã pimenta':    'Peppermint',
  'hortelã':            'Peppermint',
  'incenso':            'Frankincense',
  'limão':              'Lemon',
  'laranja silvestre':  'Wild Orange',
  'laranja-silvestre':  'Wild Orange',
  'laranja':            'Wild Orange',
  'alecrim':            'Rosemary',
  'camomila romana':    'Roman Chamomile',
  'camomila':           'Roman Chamomile',
  'gerânio':            'Geranium',
  'gengibre':           'Ginger',
  'cravo':              'Clove',
  'cravo-da-índia':     'Clove',
  'manjericão':         'Basil',
  'tomilho':            'Thyme',
  'sálvia esclareia':   'Clary Sage',
  'sálvia':             'Clary Sage',
  'rosa':               'Rose',
  'coentro':            'Coriander',
  'copaíba':            'Copaiba',
  'orégão':             'Oregano',
  'cipreste':           'Cypress',
  'zimbro':             'Juniper Berry',
  'manjerona':          'Marjoram',
  'cardamomo':          'Cardamom',
  'pimenta-preta':      'Black Pepper',
  'pimenta preta':      'Black Pepper',
  'helicrísio':         'Helichrysum',
  'vetivéria':          'Vetiver',
  // ── RO (Română) — 29 entries (skip 5 condivise: vetiver/oregano/copaiba/bergamota/ylang-ylang) ──
  'lavandă':             'Lavender',
  'mentă-piperată':      'Peppermint',
  'mentă':               'Peppermint',
  'tămâie':              'Frankincense',
  'lămâie':              'Lemon',
  'portocală sălbatică': 'Wild Orange',
  'portocală':           'Wild Orange',
  'arbore de ceai':      'Tea Tree',
  'eucalipt':            'Eucalyptus',
  'rozmarin':            'Rosemary',
  'mușețel roman':       'Roman Chamomile',
  'mușețel':             'Roman Chamomile',
  'mușcată':             'Geranium',
  'cedru':               'Cedarwood',
  'scorțișoară':         'Cinnamon',
  'ghimbir':             'Ginger',
  'cuișoare':            'Clove',
  'busuioc':             'Basil',
  'cimbru':              'Thyme',
  'salvie':              'Sage',
  'smirnă':              'Myrrh',
  'trandafir':           'Rose',
  'coriandru':           'Coriander',
  'chiparos':            'Cypress',
  'ienupăr':             'Juniper Berry',
  'maghiran':            'Marjoram',
  'cardamom':            'Cardamom',
  'piper negru':         'Black Pepper',
  'helicriz':            'Helichrysum',
}

// ─── extractLinkedProducts ────────────────────────────────────────────────────
function extractLinkedProducts(contentMarkdown: string): string[] {
  const pattern = /\[([^\]]+)\]\(https?:\/\/[^)]*doterra\.com[^)]+\)/g
  const found: string[] = []
  const seen = new Set<string>()
  let match
  while ((match = pattern.exec(contentMarkdown)) !== null) {
    const anchor = match[1].trim()
    if (/^doTERRA$/i.test(anchor) || anchor.length > 50) continue
    const k = anchor.toLowerCase()
    let canonical: string | null = null
    for (const [key, val] of Object.entries(PRODUCT_NAME_MAP)) {
      if (k.includes(key)) { canonical = val; break }
    }
    if (canonical && !seen.has(canonical)) {
      seen.add(canonical)
      found.push(canonical)
    }
    if (found.length >= 3) break
  }
  return found
}

function extractBotanical(keyword: string): string {
  const k = keyword.toLowerCase()
  for (const [key, plant] of Object.entries(BOTANICAL_MAP)) {
    if (k.includes(key)) return plant
  }
  return 'fresh botanicals and natural wellness elements on marble'
}

function extractProduct(keyword: string): string {
  const k = keyword.toLowerCase()
  for (const [key, product] of Object.entries(PRODUCT_MAP)) {
    if (k.includes(key)) return product
  }
  return 'Lavender'
}

// ─── DEFAULT_STYLE v1.4 ───────────────────────────────────────────────────────
// BRAND-LOCKED June 25 2026: BLACK cap, minimal label, no ribbons/ornaments.
const DEFAULT_STYLE = `Editorial wellness photography for premium essential oils brand.

PRIMARY SUBJECT: {doterra_product} doTERRA essential oil bottle.

DOTERRA BOTTLE CHARACTERISTICS (replicate accurately):
- Amber/brown glass — signature dark glass that protects oils
- BLACK matte cap (CRITICAL: NEVER white, NEVER gold, NEVER silver)
- Minimal white or cream rectangular label, centered on bottle
- "doTERRA" brand name in clean minimal font on label (must be legible)
- Product name "{doterra_product}" in clean sans-serif below brand name
- NO ribbons, NO decorative bows, NO ornate borders, NO fancy patterns
- Clean, scientific, premium, understated doTERRA aesthetic
- Standard 15ml bottle format

Topic context: {article_topic}

Style: premium lifestyle aesthetic, soft natural lighting, shallow depth of field, magazine-quality composition.

Bottle placed as clear hero of the shot, sharp focus in foreground.

Secondary elements softly arranged: {relevant_plant}.

Supporting materials: linen, light wood, marble, ceramic, soft cotton.

Color palette: warm cream, sage green, soft beige, gentle amber tones. Avoid saturated colors.

Composition: bottle sharp foreground, secondary elements softly blurred, generous negative space, natural daylight from side or above.

AVOID ABSOLUTELY:
- White cap, gold cap, or silver cap — doTERRA bottles have BLACK matte cap
- Decorative labels with ornate fonts or flourishes
- Ribbons, bows, or ties around bottle neck
- Cluttered composition or busy background
- Competitor brand bottles (Young Living, Plant Therapy, etc.)
- Text or words floating in image (only on bottle label)
- Cartoon or illustrated style
- Faces or hands holding bottle prominently
- Generic stock photo aesthetic
- Hiding or minimizing the doTERRA bottle

Mood: serene, premium, lifestyle aspirational, aligned with doTERRA wellness identity.
Aspect ratio: 16:9 landscape.
Photorealistic quality.`

// ─── COLLAGE_STYLE v1.4 ──────────────────────────────────────────────────────
const COLLAGE_STYLE = `Editorial wellness photography for premium essential oils brand.

FEATURED: three doTERRA essential oil bottles — {product1}, {product2}, and {product3}.

DOTERRA BOTTLE CHARACTERISTICS (replicate accurately for ALL three):
- Amber/brown glass
- BLACK matte cap (CRITICAL: NEVER white, NEVER gold, NEVER silver)
- Minimal white or cream rectangular label on each bottle
- "doTERRA" brand name legible on each label
- Respective product name on each label
- NO ribbons, NO decorative bows, NO ornate labels

Arrangement: premium triangular composition — foreground bottle sharp and centered, two flanking bottles slightly behind.

Topic context: {article_topic}

Style: premium lifestyle aesthetic, soft natural lighting, shallow depth of field, magazine-quality composition.

Background softly shows: {relevant_plant}, natural materials such as linen, light wood, marble, or ceramic.

Color palette: warm cream, sage green, soft beige, gentle amber tones.

AVOID ABSOLUTELY:
- White cap, gold cap, or silver cap on any bottle
- Ribbons or bows on any bottle
- Ornate or decorative label design
- Competitor brand bottles
- Text floating in image (only on bottle labels)
- Faces or hands holding bottles prominently
- Cluttered composition

Mood: serene, premium, lifestyle aspirational.
Aspect ratio: 16:9 landscape.
Photorealistic quality.`

// ─── MULTI_PRODUCT_SCENES ─────────────────────────────────────────────────────
const MULTI_PRODUCT_SCENES: Record<string, { products: [string, string, string]; botanical: string }> = {
  // EN
  sleep:          { products: ['Lavender', 'Serenity', 'Roman Chamomile'], botanical: 'lavender sprigs and soft linen on a bedside surface' },
  stress:         { products: ['Lavender', 'Balance', 'Serenity'],         botanical: 'lavender sprigs and soft folded linen' },
  relax:          { products: ['Lavender', 'Balance', 'Serenity'],         botanical: 'lavender sprigs and soft folded linen' },
  energy:         { products: ['Peppermint', 'Citrus Bliss', 'Wild Orange'], botanical: 'sliced citrus fruits and fresh mint leaves' },
  immune:         { products: ['On Guard', 'Frankincense', 'Lemon'],       botanical: 'citrus slices and eucalyptus leaves on a bright surface' },
  wellness:       { products: ['Lavender', 'On Guard', 'Peppermint'],      botanical: 'mixed botanical arrangement on marble' },
  focus:          { products: ['InTune', 'Peppermint', 'Rosemary'],        botanical: 'rosemary sprigs on a clean minimal desk surface' },
  business:       { products: ['Lavender', 'On Guard', 'Frankincense'],    botanical: 'mixed botanicals and natural wellness elements on marble' },
  buy:            { products: ['Lavender', 'On Guard', 'Frankincense'],    botanical: 'mixed botanicals and natural wellness elements on marble' },
  guide:          { products: ['Lavender', 'On Guard', 'Frankincense'],    botanical: 'mixed botanicals and natural wellness elements on marble' },
  // ES
  dormir:         { products: ['Lavender', 'Serenity', 'Roman Chamomile'], botanical: 'lavender sprigs and soft linen' },
  sueño:          { products: ['Lavender', 'Serenity', 'Roman Chamomile'], botanical: 'lavender sprigs and soft linen' },
  insomnio:       { products: ['Lavender', 'Serenity', 'Roman Chamomile'], botanical: 'lavender sprigs and soft folded linen' },
  estrés:         { products: ['Lavender', 'Balance', 'Serenity'],         botanical: 'lavender sprigs and soft folded linen' },
  estres:         { products: ['Lavender', 'Balance', 'Serenity'],         botanical: 'lavender sprigs and soft folded linen' },
  bienestar:      { products: ['Lavender', 'On Guard', 'Peppermint'],      botanical: 'mixed botanical arrangement on marble' },
  comprar:        { products: ['Lavender', 'On Guard', 'Frankincense'],    botanical: 'mixed botanicals and natural wellness elements on marble' },
  // FR
  sommeil:        { products: ['Lavender', 'Serenity', 'Roman Chamomile'], botanical: 'lavender sprigs and soft linen on a bedside surface' },
  insomni:        { products: ['Lavender', 'Serenity', 'Roman Chamomile'], botanical: 'lavender sprigs and soft folded linen' },
  détente:        { products: ['Lavender', 'Balance', 'Serenity'],         botanical: 'lavender sprigs and soft folded linen' },
  énergie:        { products: ['Peppermint', 'Citrus Bliss', 'Wild Orange'], botanical: 'sliced citrus fruits and fresh mint leaves' },
  'bien-être':    { products: ['Lavender', 'On Guard', 'Peppermint'],      botanical: 'mixed botanical arrangement on marble' },
  immunité:       { products: ['On Guard', 'Frankincense', 'Lemon'],       botanical: 'fresh citrus slices and eucalyptus leaves on a bright surface' },
  concentration:  { products: ['InTune', 'Peppermint', 'Rosemary'],        botanical: 'rosemary sprigs on a clean minimal desk surface' },
  acheter:        { products: ['Lavender', 'On Guard', 'Frankincense'],    botanical: 'mixed botanicals and natural wellness elements on marble' },
  achat:          { products: ['Lavender', 'On Guard', 'Frankincense'],    botanical: 'mixed botanicals and natural wellness elements on marble' },
  réduction:      { products: ['Lavender', 'On Guard', 'Frankincense'],    botanical: 'mixed botanicals and natural wellness elements on marble' },
  // DE
  schlaf:         { products: ['Lavender', 'Serenity', 'Roman Chamomile'], botanical: 'soft linen pillow and warm candlelight in a calming bedroom setting' },
  schlafen:       { products: ['Lavender', 'Serenity', 'Roman Chamomile'], botanical: 'soft linen pillow and warm candlelight in a calming bedroom setting' },
  entspannung:    { products: ['Lavender', 'Balance', 'Serenity'],         botanical: 'lavender sprigs and soft folded linen' },
  immunsystem:    { products: ['On Guard', 'Frankincense', 'Lemon'],       botanical: 'fresh citrus slices and eucalyptus leaves' },
  wohlbefinden:   { products: ['Lavender', 'On Guard', 'Peppermint'],      botanical: 'fresh botanicals and natural spa elements on marble' },
  energie:        { products: ['Peppermint', 'Citrus Bliss', 'Wild Orange'], botanical: 'sliced citrus fruits and fresh mint leaves' },
  kaufen:         { products: ['Lavender', 'On Guard', 'Frankincense'],    botanical: 'mixed botanicals and natural wellness elements on marble' },
  rabatt:         { products: ['Lavender', 'On Guard', 'Frankincense'],    botanical: 'mixed botanicals and natural wellness elements on marble' },
  // PT
  sono:           { products: ['Lavender', 'Serenity', 'Roman Chamomile'], botanical: 'soft linen pillow and warm candlelight in a calming bedroom setting' },
  insônia:        { products: ['Lavender', 'Serenity', 'Roman Chamomile'], botanical: 'lavender sprigs and soft folded linen' },
  imunidade:      { products: ['On Guard', 'Frankincense', 'Lemon'],       botanical: 'fresh citrus slices and eucalyptus leaves' },
  foco:           { products: ['InTune', 'Peppermint', 'Rosemary'],        botanical: 'rosemary sprigs on a clean minimal desk surface' },
  'bem-estar':    { products: ['Lavender', 'On Guard', 'Peppermint'],      botanical: 'mixed botanical arrangement on marble' },
  guia:           { products: ['Lavender', 'On Guard', 'Frankincense'],    botanical: 'mixed botanicals and natural wellness elements on marble' },
  // RO (energie skip: presente)
  'somn':         { products: ['Lavender', 'Serenity', 'Roman Chamomile'], botanical: 'soft linen pillow and warm candlelight' },
  'imunitate':    { products: ['On Guard', 'Frankincense', 'Lemon'],       botanical: 'fresh citrus and eucalyptus' },
  'concentrare':  { products: ['InTune', 'Peppermint', 'Rosemary'],        botanical: 'rosemary on clean minimal desk' },
  'bunăstare':    { products: ['Lavender', 'On Guard', 'Peppermint'],      botanical: 'mixed botanicals on marble' },
  'cumpără':      { products: ['Lavender', 'On Guard', 'Frankincense'],    botanical: 'flagship doTERRA bottles arranged premium' },
}

function matchMultiProductScene(keyword: string): { products: [string, string, string]; botanical: string } | null {
  const k = keyword.toLowerCase()
  for (const [key, scene] of Object.entries(MULTI_PRODUCT_SCENES)) {
    if (k.includes(key)) return scene
  }
  return null
}

export async function buildImagePrompt(keyword: string, imageStyle?: string | null, contentMarkdown?: string, langCode?: string): Promise<string> {
  // Translate keyword to English for consistent gpt-image-2 quality across all languages
  const kw = await translateKeywordToEnglish(keyword, langCode ?? 'en')

  if (imageStyle) {
    const linkedProducts = contentMarkdown ? extractLinkedProducts(contentMarkdown) : []
    const botanical = extractBotanical(kw)
    const primaryProduct = linkedProducts[0] ?? extractProduct(kw)
    let prompt = imageStyle
      .replace(/\{article_topic\}/g, kw)
      .replace(/\{relevant_plant\}/g, botanical)
      .replace(/\{doterra_product\}/g, primaryProduct)
    if (linkedProducts.length >= 2) {
      const secondary = linkedProducts[1]
      prompt = prompt.replace(
        '\nAVOID ABSOLUTELY:',
        `\nAdditional context: ${secondary} essential oil bottle softly placed in background.\n\nAVOID ABSOLUTELY:`
      )
    }
    return prompt
  }

  const linkedProducts = contentMarkdown ? extractLinkedProducts(contentMarkdown) : []

  const scene = matchMultiProductScene(kw)
  if (scene && linkedProducts.length === 0) {
    return COLLAGE_STYLE
      .replace(/\{article_topic\}/g, kw)
      .replace(/\{relevant_plant\}/g, scene.botanical)
      .replace(/\{product1\}/g, scene.products[0])
      .replace(/\{product2\}/g, scene.products[1])
      .replace(/\{product3\}/g, scene.products[2])
  }

  const botanical = extractBotanical(kw)
  const primaryProduct = linkedProducts[0] ?? extractProduct(kw)
  let prompt = DEFAULT_STYLE
    .replace(/\{article_topic\}/g, kw)
    .replace(/\{relevant_plant\}/g, botanical)
    .replace(/\{doterra_product\}/g, primaryProduct)
  if (linkedProducts.length >= 2) {
    const secondary = linkedProducts[1]
    prompt = prompt.replace(
      '\nAVOID ABSOLUTELY:',
      `\nAdditional context: ${secondary} essential oil bottle softly placed in background.\n\nAVOID ABSOLUTELY:`
    )
  }
  return prompt
}
