/**
 * Editorial themes con keywords localizzate per lingua — SoloSEO doTERRA
 *
 * 5 temi per lingua, ognuno con 5 keyword nella lingua target.
 * Questi temi vengono inseriti in editorial_themes al momento della creazione brand.
 *
 * Ogni tema ha:
 *   theme_name    — nome del tema (in inglese, visibile solo nel dashboard interno)
 *   description   — descrizione per il sistema AI (in inglese)
 *   keywords      — 5 keyword di ricerca nella LINGUA TARGET (critiche per SEO)
 */

const THEMES_BY_LANGUAGE = {

  en: [
    {
      theme_name: 'Kids Sleep & Calm — EN',
      description: 'Gentle essential oils and diffuser routines for children\'s bedtime and calm',
      keywords: ['essential oils for kids sleep', 'calming essential oils for toddlers', 'bedtime diffuser blend for kids', 'lavender for children sleep', 'relaxing oils for kids'],
    },
    {
      theme_name: 'Gentle Oils for Little Ones — EN',
      description: 'Beginner-friendly, cautious use of oils around babies and young children (always pediatrician-first)',
      keywords: ['essential oils safe for kids', 'gentle essential oils for children', 'doTERRA oils for kids', 'essential oils to avoid around children', 'kid-friendly essential oils'],
    },
    {
      theme_name: 'Mom Self-Care — EN',
      description: 'Essential oils for mothers: postpartum, energy, stress relief, everyday self-care',
      keywords: ['essential oils for moms', 'essential oils for postpartum moms', 'essential oils for tired moms', 'safe essential oils during pregnancy', 'self-care essential oils for new moms'],
    },
    {
      theme_name: 'Family Home Diffusing — EN',
      description: 'Safe diffusing habits and pleasant aromas for shared family spaces and kids\' rooms',
      keywords: ['diffuser blends for kids room', 'safe diffusing around children', 'essential oil diffuser for a baby room', 'kids room aromatherapy', 'diffuser recipes for kids'],
    },
    {
      theme_name: 'How to Buy doTERRA — EN',
      description: 'Pillar: how to get started with doTERRA (free registration, membership, beginner oils)',
      keywords: ['how to buy doTERRA', 'doTERRA for beginners', 'doTERRA membership explained', 'best doTERRA oils to start', 'getting started with doTERRA'],
    },
  ],

  es: [
    {
      theme_name: 'Sueño y Calma Niños — ES',
      description: 'Aceites suaves y rutinas de difusión para la hora de dormir y la calma de los niños',
      keywords: ['aceites esenciales para dormir niños', 'aceites relajantes para niños pequeños', 'mezcla difusor para dormir niños', 'lavanda para el sueño infantil', 'aceites para calmar a los niños'],
    },
    {
      theme_name: 'Aceites Suaves para los Pequeños — ES',
      description: 'Uso prudente y para principiantes alrededor de bebés y niños (siempre pediatra primero)',
      keywords: ['aceites esenciales seguros para niños', 'aceites esenciales suaves para niños', 'aceites doTERRA para niños', 'aceites esenciales a evitar con niños', 'aceites esenciales aptos para niños'],
    },
    {
      theme_name: 'Autocuidado Mamá — ES',
      description: 'Aceites esenciales para mamás: posparto, energía, alivio del estrés, autocuidado diario',
      keywords: ['aceites esenciales para mamás', 'aceites esenciales para mamás en posparto', 'aceites para mamás cansadas', 'aceites seguros en el embarazo', 'aceites de autocuidado para mamás nuevas'],
    },
    {
      theme_name: 'Difusión en Casa Familiar — ES',
      description: 'Hábitos de difusión seguros y aromas agradables para espacios familiares y cuartos infantiles',
      keywords: ['mezclas de difusor para cuarto de niños', 'difundir aceites de forma segura con niños', 'difusor de aceites para el cuarto del bebé', 'aromaterapia cuarto infantil', 'recetas de difusor para niños'],
    },
    {
      theme_name: 'Cómo Comprar doTERRA — ES',
      description: 'Pilar: cómo empezar con doTERRA (registro gratuito, membresía, aceites para principiantes)',
      keywords: ['cómo comprar doTERRA', 'doTERRA para principiantes', 'membresía doTERRA explicada', 'mejores aceites doTERRA para empezar', 'empezar con doTERRA'],
    },
  ],

  de: [
    {
      theme_name: 'Lavendel — DE',
      description: 'Artikel über Lavendelöl: Entspannung, Schlaf, Hautpflege',
      keywords: ['Lavendelöl ätherisches Öl', 'Lavendelöl Wirkung', 'Lavendel für den Schlaf', 'Lavendel Aromatherapie', 'Lavendelöl Anwendung'],
    },
    {
      theme_name: 'Wohlbefinden — DE',
      description: 'Allgemeines Wohlbefinden, natürliche Gesundheit, ätherische Öle Lebensstil',
      keywords: ['natürliches Wohlbefinden', 'ätherische Öle Alltag', 'ganzheitliche Gesundheit', 'Aromatherapie Vorteile', 'natürliche Heilmittel'],
    },
    {
      theme_name: 'doTERRA Business — DE',
      description: 'doTERRA Geschäftsmöglichkeit, Starter Kits, Anmeldung',
      keywords: ['doTERRA Starter Kit', 'doTERRA Anmeldung', 'ätherische Öle Business', 'doTERRA Großhandel', 'doTERRA Mitgliedschaft'],
    },
    {
      theme_name: 'Pfefferminze — DE',
      description: 'Pfefferminzöl: Energie, Fokus, Verdauung',
      keywords: ['Pfefferminzöl ätherisches Öl', 'Pfefferminzöl Wirkung', 'Pfefferminze für Energie', 'Pfefferminze Verdauung', 'Pfefferminze Aromatherapie'],
    },
    {
      theme_name: 'Weihrauch — DE',
      description: 'Weihrauchöl: Haut, Immunsystem, Meditation',
      keywords: ['Weihrauchöl ätherisches Öl', 'Weihrauch Wirkung', 'Weihrauch für die Haut', 'Weihrauch Meditation', 'Weihrauch Immunsystem'],
    },
  ],

  it: [
    {
      theme_name: 'Lavanda — IT',
      description: 'Articoli sull\'olio essenziale di lavanda: relax, sonno, cura della pelle',
      keywords: ['olio essenziale di lavanda', 'benefici olio di lavanda', 'lavanda per dormire', 'lavanda aromaterapia', 'utilizzi olio di lavanda'],
    },
    {
      theme_name: 'Benessere — IT',
      description: 'Benessere generale, salute naturale, stile di vita con oli essenziali',
      keywords: ['benessere naturale', 'oli essenziali routine quotidiana', 'salute olistica', 'benefici aromaterapia', 'rimedi naturali'],
    },
    {
      theme_name: 'Business doTERRA — IT',
      description: 'Opportunità di business doTERRA, kit iniziali, iscrizione',
      keywords: ['kit iniziale doTERRA', 'iscrizione doTERRA', 'business oli essenziali', 'doTERRA all\'ingrosso', 'tessera doTERRA'],
    },
    {
      theme_name: 'Menta Piperita — IT',
      description: 'Olio di menta piperita: energia, concentrazione, digestione',
      keywords: ['olio essenziale menta piperita', 'benefici olio di menta', 'menta per energia', 'menta per digestione', 'menta aromaterapia'],
    },
    {
      theme_name: 'Incenso — IT',
      description: 'Olio di incenso: pelle, immunità, meditazione',
      keywords: ['olio essenziale di incenso', 'benefici olibano', 'incenso per la pelle', 'incenso meditazione', 'incenso sistema immunitario'],
    },
  ],

  fr: [
    {
      theme_name: 'Lavande — FR',
      description: 'Articles sur l\'huile essentielle de lavande : relaxation, sommeil, soin de la peau',
      keywords: ['huile essentielle lavande', 'bienfaits huile de lavande', 'lavande pour dormir', 'lavande aromathérapie', 'utilisations huile de lavande'],
    },
    {
      theme_name: 'Bien-être — FR',
      description: 'Bien-être général, santé naturelle, style de vie aux huiles essentielles',
      keywords: ['bien-être naturel', 'huiles essentielles routine quotidienne', 'santé holistique', 'bienfaits aromathérapie', 'remèdes naturels'],
    },
    {
      theme_name: 'Business doTERRA — FR',
      description: 'Opportunité d\'affaires doTERRA, kits de démarrage, inscription',
      keywords: ['kit de démarrage doTERRA', 'inscription doTERRA', 'business huiles essentielles', 'doTERRA grossiste', 'adhésion doTERRA'],
    },
    {
      theme_name: 'Menthe Poivrée — FR',
      description: 'Huile de menthe poivrée : énergie, concentration, digestion',
      keywords: ['huile essentielle menthe poivrée', 'bienfaits huile de menthe', 'menthe pour l\'énergie', 'menthe digestion', 'menthe aromathérapie'],
    },
    {
      theme_name: 'Encens — FR',
      description: 'Huile d\'encens : peau, immunité, méditation',
      keywords: ['huile essentielle encens', 'bienfaits oliban', 'encens pour la peau', 'encens méditation', 'encens immunité'],
    },
  ],

  pt: [
    {
      theme_name: 'Lavanda — PT',
      description: 'Artigos sobre óleo essencial de lavanda: relaxamento, sono, cuidado da pele',
      keywords: ['óleo essencial de lavanda', 'benefícios óleo de lavanda', 'lavanda para dormir', 'lavanda aromaterapia', 'usos óleo de lavanda'],
    },
    {
      theme_name: 'Bem-estar — PT',
      description: 'Bem-estar geral, saúde natural, estilo de vida com óleos essenciais',
      keywords: ['bem-estar natural', 'óleos essenciais rotina diária', 'saúde holística', 'benefícios aromaterapia', 'remédios naturais'],
    },
    {
      theme_name: 'Negócio doTERRA — PT',
      description: 'Oportunidade de negócio doTERRA, kits iniciais, inscrição',
      keywords: ['kit inicial doTERRA', 'inscrição doTERRA', 'negócio óleos essenciais', 'doTERRA atacado', 'associação doTERRA'],
    },
    {
      theme_name: 'Hortelã-Pimenta — PT',
      description: 'Óleo de hortelã-pimenta: energia, foco, digestão',
      keywords: ['óleo essencial hortelã-pimenta', 'benefícios óleo de hortelã', 'hortelã para energia', 'hortelã digestão', 'hortelã aromaterapia'],
    },
    {
      theme_name: 'Incenso — PT',
      description: 'Óleo de incenso: pele, imunidade, meditação',
      keywords: ['óleo essencial de incenso', 'benefícios olíbano', 'incenso para a pele', 'incenso meditação', 'incenso imunidade'],
    },
  ],

  ro: [
    {
      theme_name: 'Lavandă — RO',
      description: 'Articles about lavender essential oil: relaxation, sleep, skincare',
      keywords: ['ulei esențial de lavandă', 'beneficii ulei de lavandă', 'lavandă pentru somn', 'lavandă aromaterapie', 'utilizări ulei de lavandă'],
    },
    {
      theme_name: 'Wellness — RO',
      description: 'General wellness, natural health, essential oil lifestyle',
      keywords: ['wellness natural', 'uleiuri esențiale rutină zilnică', 'sănătate holistică', 'beneficii aromaterapie', 'remedii naturale'],
    },
    {
      theme_name: 'doTERRA Business — RO',
      description: 'doTERRA business opportunity, starter kits, enrollment',
      keywords: ['kit de început doTERRA', 'înscriere doTERRA', 'afacere uleiuri esențiale', 'doTERRA en-gros', 'membru doTERRA'],
    },
    {
      theme_name: 'Mentă — RO',
      description: 'Peppermint oil: energy, focus, digestion, cooling',
      keywords: ['ulei esențial de mentă', 'beneficii ulei de mentă', 'mentă pentru energie', 'mentă pentru digestie', 'mentă aromaterapie'],
    },
    {
      theme_name: 'Tămâie — RO',
      description: 'Frankincense oil: skin, meditation, immune support',
      keywords: ['ulei esențial de tămâie', 'beneficii ulei de tămâie', 'tămâie pentru piele', 'tămâie meditație', 'tămâie sistem imunitar'],
    },
  ],

  nl: [
    {
      theme_name: 'Lavendel — NL',
      description: 'Artikelen over lavendelolie: ontspanning, slaap, huidverzorging',
      keywords: ['lavendelolie etherische olie', 'lavendelolie voordelen', 'lavendel voor slaap', 'lavendel aromatherapie', 'lavendelolie toepassingen'],
    },
    {
      theme_name: 'Welzijn — NL',
      description: 'Algemeen welzijn, natuurlijke gezondheid, etherische oliën levensstijl',
      keywords: ['natuurlijk welzijn', 'etherische oliën dagelijks', 'holistische gezondheid', 'aromatherapie voordelen', 'natuurlijke remedies'],
    },
    {
      theme_name: 'doTERRA Business — NL',
      description: 'doTERRA zakelijke kans, starter kits, inschrijving',
      keywords: ['doTERRA starterskit', 'doTERRA inschrijving', 'etherische oliën business', 'doTERRA groothandel', 'doTERRA lidmaatschap'],
    },
    {
      theme_name: 'Pepermunt — NL',
      description: 'Pepermuntolie: energie, focus, spijsvertering',
      keywords: ['pepermuntolie etherische olie', 'pepermuntolie voordelen', 'pepermunt voor energie', 'pepermunt spijsvertering', 'pepermunt aromatherapie'],
    },
    {
      theme_name: 'Wierook — NL',
      description: 'Wierookolie: huid, immuunsysteem, meditatie',
      keywords: ['wierookolie etherische olie', 'wierook voordelen', 'wierook voor huid', 'wierook meditatie', 'wierook immuunsysteem'],
    },
  ],

  // v3.9 — Japanese (world-link only launch). New entry, additive. Japanese-script keywords (critical for SEO).
  ja: [
    {
      theme_name: 'Lavender — JA',
      description: 'Articles about lavender essential oil: relaxation, sleep, skincare',
      keywords: ['ラベンダー エッセンシャルオイル', 'ラベンダーオイル 効果', 'ラベンダー 睡眠', 'ラベンダー アロマセラピー', 'ラベンダーオイル 使い方'],
    },
    {
      theme_name: 'Wellness — JA',
      description: 'General wellness, natural health, essential oil lifestyle',
      keywords: ['ナチュラル ウェルネス', 'エッセンシャルオイル 毎日', 'ホリスティック 健康', 'アロマセラピー 効果', '自然療法'],
    },
    {
      theme_name: 'doTERRA Business — JA',
      description: 'doTERRA business opportunity, starter kits, enrollment',
      keywords: ['doTERRA スターターキット', 'doTERRA 登録方法', 'エッセンシャルオイル ビジネス', 'doTERRA 会員', 'doTERRA 始め方'],
    },
    {
      theme_name: 'Peppermint — JA',
      description: 'Peppermint oil: energy, focus, digestion, cooling',
      keywords: ['ペパーミント エッセンシャルオイル', 'ペパーミントオイル 効果', 'ペパーミント エネルギー', 'ペパーミント 消化', 'ペパーミント アロマ'],
    },
    {
      theme_name: 'Frankincense — JA',
      description: 'Frankincense oil: skin, immunity, meditation',
      keywords: ['フランキンセンス エッセンシャルオイル', 'フランキンセンス 効果', 'フランキンセンス 肌', 'フランキンセンス 瞑想', 'フランキンセンス 免疫'],
    },
  ],

  // v3.11 — Arabic (UAE/Gulf, world-link, RTL). New entry, additive. Arabic-script keywords (critical for SEO).
  ar: [
    {
      theme_name: 'Lavender — AR',
      description: 'Articles about lavender essential oil: relaxation, sleep, skincare',
      keywords: ['زيت اللافندر العطري', 'فوائد زيت اللافندر', 'اللافندر للنوم', 'العلاج العطري باللافندر', 'استخدامات زيت اللافندر'],
    },
    {
      theme_name: 'Wellness — AR',
      description: 'General wellness, natural health, essential oil lifestyle',
      keywords: ['العافية الطبيعية', 'الزيوت الأساسية يوميًا', 'الصحة الشاملة', 'فوائد العلاج العطري', 'العلاجات الطبيعية'],
    },
    {
      theme_name: 'doTERRA Business — AR',
      description: 'doTERRA business opportunity, starter kits, enrollment',
      keywords: ['مجموعة بداية doTERRA', 'التسجيل في doTERRA', 'أعمال الزيوت الأساسية', 'عضوية doTERRA', 'كيفية البدء مع doTERRA'],
    },
    {
      theme_name: 'Peppermint — AR',
      description: 'Peppermint oil: energy, focus, digestion, cooling',
      keywords: ['زيت النعناع العطري', 'فوائد زيت النعناع', 'النعناع للطاقة', 'النعناع للانتعاش', 'العلاج العطري بالنعناع'],
    },
    {
      theme_name: 'Frankincense — AR',
      description: 'Frankincense oil: skin, meditation, wellness',
      keywords: ['زيت اللبان العطري', 'فوائد زيت اللبان', 'اللبان للبشرة', 'اللبان للتأمل', 'استخدامات زيت اللبان'],
    },
  ],

  // v3.12 — Polish (product pattern, EU). New entry, additive. Polish keywords.
  pl: [
    {
      theme_name: 'Lavender — PL',
      description: 'Articles about lavender essential oil: relaxation, sleep, skincare',
      keywords: ['olejek eteryczny lawendowy', 'olejek lawendowy właściwości', 'lawenda na sen', 'aromaterapia lawenda', 'zastosowanie olejku lawendowego'],
    },
    {
      theme_name: 'Wellness — PL',
      description: 'General wellness, natural health, essential oil lifestyle',
      keywords: ['naturalny dobrostan', 'olejki eteryczne na co dzień', 'zdrowie holistyczne', 'korzyści aromaterapii', 'naturalne metody'],
    },
    {
      theme_name: 'doTERRA Business — PL',
      description: 'doTERRA business opportunity, starter kits, enrollment',
      keywords: ['zestaw startowy doTERRA', 'rejestracja doTERRA', 'biznes olejki eteryczne', 'członkostwo doTERRA', 'jak zacząć z doTERRA'],
    },
    {
      theme_name: 'Peppermint — PL',
      description: 'Peppermint oil: energy, focus, digestion, cooling',
      keywords: ['olejek eteryczny miętowy', 'olejek z mięty pieprzowej właściwości', 'mięta na energię', 'mięta na trawienie', 'aromaterapia mięta'],
    },
    {
      theme_name: 'Frankincense — PL',
      description: 'Frankincense oil: skin, meditation, immune support',
      keywords: ['olejek eteryczny z kadzidłowca', 'kadzidłowiec właściwości', 'kadzidłowiec na skórę', 'kadzidłowiec medytacja', 'zastosowanie olejku z kadzidłowca'],
    },
  ],

}

/**
 * Returns themes array for the given language code, ready for DB insert.
 * Falls back to English with a warning if language not found.
 */
function getThemes(languageCode, brandId) {
  const code = languageCode.toLowerCase()
  const themes = THEMES_BY_LANGUAGE[code] || (() => {
    console.warn(`⚠️  No themes for '${languageCode}'. Using English fallback. Add proper themes to editorial-themes-by-language.js.`)
    return THEMES_BY_LANGUAGE.en
  })()

  return themes.map(t => ({
    brand_id: brandId,
    theme_name: t.theme_name,
    description: t.description,
    keywords: t.keywords,
    active: true,
  }))
}

module.exports = { THEMES_BY_LANGUAGE, getThemes }
