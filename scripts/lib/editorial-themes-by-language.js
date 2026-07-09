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
    { theme_name: 'Schlaf & Ruhe Kinder — DE', description: 'Sanfte Öle und Diffusionsroutinen für das Einschlafen und die Ruhe der Kinder', keywords: ['ätherische Öle für den Schlaf von Kindern', 'beruhigende Öle für Kleinkinder', 'Diffuser zum Einschlafen für Kinder', 'Lavendel für den Kinderschlaf', 'entspannende Öle für Kinder'] },
    { theme_name: 'Sanfte Öle für die Kleinen — DE', description: 'Umsichtiger Einsteiger-Gebrauch rund um Babys und Kinder (immer zuerst der Kinderarzt)', keywords: ['ätherische Öle sicher für Kinder', 'sanfte ätherische Öle für Kinder', 'doTERRA Öle für Kinder', 'ätherische Öle bei Kindern vermeiden', 'ätherische Öle für Babys'] },
    { theme_name: 'Selbstfürsorge Mama — DE', description: 'Ätherische Öle für Mamas: Wochenbett, Energie, Schwangerschaft, Selbstfürsorge', keywords: ['ätherische Öle für Mamas', 'ätherische Öle Wochenbett', 'Öle für müde Mamas', 'ätherische Öle sicher in der Schwangerschaft', 'Selbstfürsorge mit Ölen für frischgebackene Mamas'] },
    { theme_name: 'Diffusion in der Familie — DE', description: 'Sichere Diffusionsgewohnheiten und angenehme Düfte fürs Kinderzimmer', keywords: ['Diffuser ätherische Öle Kinderzimmer', 'Öle sicher diffundieren mit Kindern', 'Aromatherapie Babyzimmer', 'ätherische Öle für Kinder zu Hause', 'Diffuser Rezepte für Kinder'] },
    { theme_name: 'doTERRA kaufen — DE', description: 'Pillar: wie man mit doTERRA startet (kostenlose Anmeldung, Mitgliedschaft, Öle zum Anfangen)', keywords: ['doTERRA kaufen', 'doTERRA für Anfänger', 'doTERRA Mitgliedschaft wie funktioniert', 'beste doTERRA Öle zum Anfangen', 'mit doTERRA anfangen'] },
  ],

  it: [
    { theme_name: 'Sonno e Calma Bambini — IT', description: 'Oli delicati e routine di diffusione per la nanna e la calma dei bambini', keywords: ['oli essenziali per il sonno dei bambini', 'oli calmanti per bambini piccoli', 'diffusore per far dormire i bambini', 'lavanda per il sonno dei bambini', 'oli rilassanti per bambini'] },
    { theme_name: 'Oli Delicati per i Piccoli — IT', description: 'Uso prudente e per principianti intorno a neonati e bambini (sempre pediatra prima)', keywords: ['oli essenziali sicuri per bambini', 'oli essenziali delicati per bambini', 'oli doTERRA per bambini', 'oli essenziali da evitare con i bambini', 'oli essenziali per neonati'] },
    { theme_name: 'Cura di Sé Mamma — IT', description: 'Oli essenziali per le mamme: post parto, energia, gravidanza, autocura', keywords: ['oli essenziali per mamme', 'oli essenziali post parto', 'oli per mamme stanche', 'oli essenziali sicuri in gravidanza', 'autocura con oli per neomamme'] },
    { theme_name: 'Diffusione in Casa Famiglia — IT', description: 'Abitudini di diffusione sicure e aromi piacevoli per la cameretta dei bambini', keywords: ['diffusore oli essenziali cameretta bambini', 'diffondere oli in sicurezza con bambini', 'aromaterapia cameretta neonato', 'oli essenziali per bambini in casa', 'ricette diffusore per bambini'] },
    { theme_name: 'Come Comprare doTERRA — IT', description: 'Pillar: come iniziare con doTERRA (registrazione gratuita, membership, oli per iniziare)', keywords: ['come comprare doTERRA', 'doTERRA per principianti', 'membership doTERRA come funziona', 'migliori oli doTERRA per iniziare', 'iniziare con doTERRA'] },
  ],

  fr: [
    { theme_name: 'Sommeil et Calme Enfants — FR', description: 'Huiles douces et routines de diffusion pour le coucher et le calme des enfants', keywords: ['huiles essentielles pour le sommeil des enfants', 'huiles calmantes pour tout-petits', 'diffuseur pour endormir les enfants', 'lavande pour le sommeil des enfants', 'huiles relaxantes pour enfants'] },
    { theme_name: 'Huiles Douces pour les Petits — FR', description: 'Usage prudent et pour débuter autour des bébés et enfants (toujours le pédiatre d\'abord)', keywords: ['huiles essentielles sans danger pour les enfants', 'huiles essentielles douces pour enfants', 'huiles doTERRA pour enfants', 'huiles essentielles à éviter avec les enfants', 'huiles essentielles pour bébé'] },
    { theme_name: 'Prendre Soin de Soi Maman — FR', description: 'Huiles essentielles pour les mamans: post-partum, énergie, grossesse, soin de soi', keywords: ['huiles essentielles pour mamans', 'huiles essentielles post-partum', 'huiles pour mamans fatiguées', 'huiles essentielles sûres pendant la grossesse', 'soin de soi aux huiles pour jeunes mamans'] },
    { theme_name: 'Diffusion en Famille — FR', description: 'Habitudes de diffusion sûres et senteurs agréables pour la chambre des enfants', keywords: ['diffuseur huiles essentielles chambre enfant', 'diffuser des huiles en sécurité avec des enfants', 'aromathérapie chambre de bébé', 'huiles essentielles pour enfants à la maison', 'recettes de diffuseur pour enfants'] },
    { theme_name: 'Comment Acheter doTERRA — FR', description: 'Pilier: comment débuter avec doTERRA (inscription gratuite, adhésion, huiles pour débuter)', keywords: ['comment acheter doTERRA', 'doTERRA pour débutants', 'adhésion doTERRA comment ça marche', 'meilleures huiles doTERRA pour débuter', 'débuter avec doTERRA'] },
  ],

  pt: [
    { theme_name: 'Sono e Calma Crianças — PT', description: 'Óleos suaves e rotinas de difusão para a hora de dormir e a calma das crianças', keywords: ['óleos essenciais para o sono das crianças', 'óleos calmantes para crianças pequenas', 'difusor para fazer as crianças dormirem', 'lavanda para o sono das crianças', 'óleos relaxantes para crianças'] },
    { theme_name: 'Óleos Suaves para os Pequenos — PT', description: 'Uso prudente e para iniciantes ao redor de bebês e crianças (sempre pediatra primeiro)', keywords: ['óleos essenciais seguros para crianças', 'óleos essenciais suaves para crianças', 'óleos doTERRA para crianças', 'óleos essenciais a evitar com crianças', 'óleos essenciais para bebês'] },
    { theme_name: 'Autocuidado Mãe — PT', description: 'Óleos essenciais para as mães: pós-parto, energia, gravidez, autocuidado', keywords: ['óleos essenciais para mães', 'óleos essenciais pós-parto', 'óleos para mães cansadas', 'óleos essenciais seguros na gravidez', 'autocuidado com óleos para mães de primeira viagem'] },
    { theme_name: 'Difusão em Casa Família — PT', description: 'Hábitos de difusão seguros e aromas agradáveis para o quarto das crianças', keywords: ['difusor óleos essenciais quarto de bebê', 'difundir óleos com segurança com crianças', 'aromaterapia quarto do bebê', 'óleos essenciais para crianças em casa', 'receitas de difusor para crianças'] },
    { theme_name: 'Como Comprar doTERRA — PT', description: 'Pilar: como começar com doTERRA (registro gratuito, associação, óleos para começar)', keywords: ['como comprar doTERRA', 'doTERRA para iniciantes', 'associação doTERRA como funciona', 'melhores óleos doTERRA para começar', 'começar com doTERRA'] },
  ],

  ro: [
    { theme_name: 'Somn și Calm Copii — RO', description: 'Uleiuri blânde și rutine de difuzare pentru somnul și liniștea copiilor', keywords: ['uleiuri esențiale pentru somnul copiilor', 'uleiuri calmante pentru copii mici', 'difuzor pentru a adormi copiii', 'lavandă pentru somnul copiilor', 'uleiuri relaxante pentru copii'] },
    { theme_name: 'Uleiuri Blânde pentru Cei Mici — RO', description: 'Folosire prudentă și pentru începători în preajma bebelușilor și copiilor (mereu întâi pediatrul)', keywords: ['uleiuri esențiale sigure pentru copii', 'uleiuri esențiale blânde pentru copii', 'uleiuri doTERRA pentru copii', 'uleiuri esențiale de evitat la copii', 'uleiuri esențiale pentru bebeluși'] },
    { theme_name: 'Îngrijirea de Sine a Mamei — RO', description: 'Uleiuri esențiale pentru mame: post-partum, energie, sarcină, îngrijire de sine', keywords: ['uleiuri esențiale pentru mame', 'uleiuri esențiale post-partum', 'uleiuri pentru mame obosite', 'uleiuri esențiale sigure în sarcină', 'îngrijire de sine cu uleiuri pentru proaspete mămici'] },
    { theme_name: 'Difuzare în Familie — RO', description: 'Obiceiuri de difuzare sigure și arome plăcute pentru camera copiilor', keywords: ['difuzor uleiuri esențiale camera copilului', 'difuzarea uleiurilor în siguranță cu copiii', 'aromaterapie camera bebelușului', 'uleiuri esențiale pentru copii acasă', 'rețete de difuzor pentru copii'] },
    { theme_name: 'Cum Cumperi doTERRA — RO', description: 'Pilon: cum începi cu doTERRA (înregistrare gratuită, membru, uleiuri pentru început)', keywords: ['cum cumperi doTERRA', 'doTERRA pentru începători', 'membru doTERRA cum funcționează', 'cele mai bune uleiuri doTERRA pentru început', 'a începe cu doTERRA'] },
  ],

  nl: [
    { theme_name: 'Slaap & Rust Kinderen — NL', description: 'Zachte oliën en diffusieroutines voor het slapengaan en de rust van kinderen', keywords: ['etherische oliën voor de slaap van kinderen', 'kalmerende oliën voor peuters', 'diffuser om kinderen te laten slapen', 'lavendel voor kinderslaap', 'ontspannende oliën voor kinderen'] },
    { theme_name: 'Zachte Oliën voor de Kleintjes — NL', description: 'Voorzichtig beginnersgebruik rond baby\'s en kinderen (altijd eerst de kinderarts)', keywords: ['etherische oliën veilig voor kinderen', 'zachte etherische oliën voor kinderen', 'doTERRA oliën voor kinderen', 'etherische oliën vermijden bij kinderen', 'etherische oliën voor baby\'s'] },
    { theme_name: 'Zelfzorg Mama — NL', description: 'Etherische oliën voor mama\'s: kraamtijd, energie, zwangerschap, zelfzorg', keywords: ['etherische oliën voor mama\'s', 'etherische oliën kraamtijd', 'oliën voor moe mama\'s', 'etherische oliën veilig tijdens zwangerschap', 'zelfzorg met oliën voor kersverse mama\'s'] },
    { theme_name: 'Diffusie in het Gezin — NL', description: 'Veilige diffusiegewoonten en aangename geuren voor de kinderkamer', keywords: ['diffuser etherische oliën kinderkamer', 'oliën veilig diffunderen met kinderen', 'aromatherapie babykamer', 'etherische oliën voor kinderen thuis', 'diffuser recepten voor kinderen'] },
    { theme_name: 'doTERRA kopen — NL', description: 'Pillar: hoe begin je met doTERRA (gratis inschrijving, lidmaatschap, oliën om te starten)', keywords: ['doTERRA kopen', 'doTERRA voor beginners', 'doTERRA lidmaatschap hoe werkt het', 'beste doTERRA oliën om te starten', 'beginnen met doTERRA'] },
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
    { theme_name: 'Sen i Spokój Dzieci — PL', description: 'Łagodne olejki i rytuały dyfuzji dla snu i spokoju dzieci', keywords: ['olejki eteryczne na sen dzieci', 'olejki uspokajające dla maluchów', 'dyfuzor do usypiania dzieci', 'lawenda na sen dziecka', 'olejki relaksujące dla dzieci'] },
    { theme_name: 'Łagodne Olejki dla Maluchów — PL', description: 'Ostrożne, początkujące użycie przy niemowlętach i dzieciach (zawsze najpierw pediatra)', keywords: ['olejki eteryczne bezpieczne dla dzieci', 'łagodne olejki eteryczne dla dzieci', 'olejki doTERRA dla dzieci', 'olejki eteryczne do unikania u dzieci', 'olejki eteryczne dla niemowląt'] },
    { theme_name: 'Dbanie o Siebie Mama — PL', description: 'Olejki eteryczne dla mam: połóg, energia, ciąża, dbanie o siebie', keywords: ['olejki eteryczne dla mam', 'olejki eteryczne połóg', 'olejki dla zmęczonych mam', 'olejki eteryczne bezpieczne w ciąży', 'dbanie o siebie z olejkami dla świeżo upieczonych mam'] },
    { theme_name: 'Dyfuzja w Rodzinie — PL', description: 'Bezpieczne nawyki dyfuzji i przyjemne zapachy do pokoju dziecięcego', keywords: ['dyfuzor olejki eteryczne pokój dziecięcy', 'bezpieczna dyfuzja olejków z dziećmi', 'aromaterapia pokój niemowlęcy', 'olejki eteryczne dla dzieci w domu', 'przepisy do dyfuzora dla dzieci'] },
    { theme_name: 'Jak Kupić doTERRA — PL', description: 'Filar: jak zacząć z doTERRA (bezpłatna rejestracja, członkostwo, olejki na start)', keywords: ['jak kupić doTERRA', 'doTERRA dla początkujących', 'członkostwo doTERRA jak działa', 'najlepsze olejki doTERRA na start', 'zaczynać z doTERRA'] },
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
