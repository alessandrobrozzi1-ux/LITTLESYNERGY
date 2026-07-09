// Healthcheck qualità contenuti — LittleSynergy (EN/ES) × 6 problemi
// meccanismo-kit-obbligatorio / a-vita / cifre-valuta / therapeutic (CPTG mis-naming) / income / KIDS
// KIDS (doppia difesa vs prompt): diluizione numerica presso bambino, "safe for babies", olio high-risk
// presso neonato, cura+condizione pediatrica → SEMPRE verifica manuale (può avere falsi positivi voluti).
// Uso: node scripts/healthcheck-quality.cjs
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs'), path = require('path')
fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim() })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// valuta: numero adiacente a simbolo/parola valuta (multi-lingua)
const CUR = /[0-9][0-9.,\-–\s]*\s?(€|\$|£|¥|zł|R\$|CHF|EUR|USD|euros?|d[oó]lar\w*|dollars?|z[łl]ot\w*|\blei\b|reais|dirham\w*|درهم|ريال|francs?|円|yen)|(€|\$|£|¥|zł|R\$)\s?[0-9]/gi

// income claims (5° problema): cifra+keyword-income sulla stessa riga, OPPURE frase "earning potential", OPPURE income-word amounts
const INC_KW = { en: /earn|income|salary|commission/i, es: /gana|ingreso|ganancia|comisi/i, de: /verdien|Einkommen|Gehalt|Provision/i, fr: /gagn|revenu|gain|commission|salaire/i, it: /guadagn|reddito|entrate|provvigion/i, pt: /ganh|renda|rendimento|comiss|sal[áa]rio/i, ro: /c[âa]știg|venit|comision|salariu/i, nl: /verdien|inkomen|salaris|commissie/i, pl: /zarob|doch[óo]d|prowizj|pensja/i, ja: /収入|月収|稼|報酬|給料/, ar: /دخل|راتب|أرباح|عمول/ }
const FIG_INC = /[0-9][0-9.,]*\s?(€|\$|£|¥|zł|EUR|USD|euros?|dollars?|درهم|円|lei|reais)|(€|\$|¥)\s?[0-9]|[a-z]-figure|hundred dollars|thousand dollars|[0-9]{2,}\s?(\/|per |al |por |pe |pro |im |par )\s?(month|mois|mes|lun|Monat|mese|mês|maand)/i
const POT = /earning potential|income potential|potenziale di guadagno|potencial de (ingreso|ganho)|potentiel de (gain|revenu)|Einkommenspotenzial|potențial de c[âa]știg|potencjał zarobk|収入の可能性/i

const LANG = {
  en: { aVita: /\b(lifetime|for life|forever|permanent(ly)?|life-?long)\b/gi, ther: /therapeutic[- ]?(grade|quality|properties|benefits)?/gi, mecc: /(must|have to|need to|required to)\s+(buy|purchase)\s+(a |an )?(starter |enrollment )?kit|kit is (required|mandatory|necessary)|required to (join|become)/gi },
  es: { aVita: /de por vida|para siempre|de forma permanente|\bpermanente\b/gi, ther: /terap[eé]utic[oa]s?/gi, mecc: /(debes|tienes que|hay que|necesitas)\s+comprar\s+(un )?kit|kit\s+(es\s+)?(obligatori|necesari|requerid)/gi },
  de: { aVita: /lebenslang|für immer|auf Lebenszeit|\bdauerhaft\b|\bpermanent\b/gi, ther: /therapeutische?[rsn]?\b/gi, mecc: /Kit\s+(ist\s+)?(erforderlich|verpflichtend|Pflicht|notwendig)|müssen\s+ein\s+Kit\s+kaufen/gi },
  fr: { aVita: /à vie|pour toujours|permanent(e)?|définiti(f|ve)/gi, ther: /th[ée]rapeutiques?/gi, mecc: /(devez|faut)\s+acheter\s+(un )?kit|kit\s+(est\s+)?obligatoire/gi },
  it: { aVita: /\ba vita\b|per sempre|\bpermanente\b|definitiv[oa]/gi, ther: /terapeutic[oaie]/gi, mecc: /(devi|bisogna)\s+(acquistare|comprare)\s+(un )?kit|kit\s+(è\s+)?(obbligatori|necessari|richiest)/gi },
  pt: { aVita: /para sempre|vital[ií]ci[oa]|\bpermanente\b|por toda a vida/gi, ther: /terap[êe]utic[oa]s?/gi, mecc: /(deve|tem que|precisa)\s+comprar\s+(um )?kit|kit\s+(é\s+)?obrigat[óo]ri/gi },
  ro: { aVita: /pe viață|pentru totdeauna|\bpermanent\b|definitiv/gi, ther: /terapeutic[ăaei]?/gi, mecc: /trebuie să\s+(cumperi|achiziționezi)\s+(un )?kit|kit\w*\s+(este\s+)?obligatori/gi },
  nl: { aVita: /voor het leven|levenslang|voor altijd|\bpermanent\b/gi, ther: /therapeutische?/gi, mecc: /moet\s+een\s+kit\s+kopen|kit\s+(is\s+)?(verplicht|vereist|noodzakelijk)/gi },
  pl: { aVita: /na zawsze|dożywotni\w*|na całe życie|na stałe/gi, ther: /terapeutyczn\w*/gi, mecc: /musisz\s+kupić\s+(zestaw|kit)|zestaw\s+(jest\s+)?(obowiązkowy|wymagany)/gi },
  ja: { aVita: /永久|生涯|一生|永続/g, ther: /治療(グレード|効果|目的)|セラピューティック/g, mecc: /キット\w*(購入|必須|必要)/g },
  ar: { aVita: /مدى الحياة|للأبد|دائم/g, ther: /علاجي|طبية الدرجة/g, mecc: /يجب شراء.*مجموعة|شراء.*مجموعة.*إلزامي/g },
}

// KIDS (6° problema, LittleSynergy) — per lingua. Flag = verifica manuale.
// Policy: gocce nel DIFFUSORE permesse (non flaggate). Flag = età numeriche + numeri in contesto
// TOPICO (pelle/bagno/portante) + "safe for babies" + olio high-risk presso neonato + cura+condizione.
const KIDS = {
  en: /\b(under|over|below|above|from)\s+\d+\s+(year|month|week)s?\b|\b\d+\s+(years?|months?)\s+(old|of age)\b|(\b\d+\s?(drops?|ml)\b|\b\d+\s?%)[^.\n]{0,40}\b(skin|carrier oil|bath|topical|apply|applied|massage)\b|\b(skin|carrier oil|bath|topical|apply|applied|massage)\b[^.\n]{0,40}(\b\d+\s?(drops?|ml)\b|\b\d+\s?%)|safe for (babies|newborns|infants)|\b(cinnamon|clove|oregano|thyme|peppermint|eucalyptus|rosemary|wintergreen)\b[^.\n]{0,40}\b(baby|babies|newborn|infant)\b|(treat|cure|heal|cures|treats)[^.\n]{0,30}(colic|teething|fever|eczema|croup|reflux)|\b(peppermint|eucalyptus|rosemary|wintergreen)\b[^.\n]{0,80}diffus\w*[^.\n]{0,60}\b(baby|babies|newborn|infant|toddler|nursery)\b|\b(baby|babies|newborn|infant|toddler|nursery)\b[^.\n]{0,60}diffus\w*[^.\n]{0,80}\b(peppermint|eucalyptus|rosemary|wintergreen)\b|\b(your own|for yourself|for mom|parents?'? diffuser)\b[^.\n]{0,70}(\b\d+\s?(drops?|ml)\b|\b\d+\s?%)|\b(peppermint|eucalyptus|rosemary|wintergreen)\b[^.\n]{0,70}\b(your own|for yourself|for mom)\b/gi,
  es: /\b(menores?|mayores?)\s+de\s+\d+\s+(años|meses)\b|a partir de (los\s+)?\d+\s+(años|meses)|\b\d+\s+(años|meses)\s+de edad\b|(\b\d+\s?(gotas?|ml)\b|\b\d+\s?%)[^.\n]{0,40}\b(piel|aceite portador|portador|baño|tópic\w*|aplica\w*|masaje)\b|\b(piel|aceite portador|portador|baño|tópic\w*|aplica\w*|masaje)\b[^.\n]{0,40}(\b\d+\s?(gotas?|ml)\b|\b\d+\s?%)|segur[oa]s? para (beb[eé]s|recién nacidos|lactantes)|\b(canela|clavo|orégano|tomillo|menta|eucalipto|romero|gaulteria)\b[^.\n]{0,40}\b(beb[eé]s?|lactante|recién nacido)\b|(trata|cura|curan|tratan)[^.\n]{0,30}(cólico|dentición|fiebre|eccema|reflujo)|\b(menta|eucalipto|romero|gaulteria)\b[^.\n]{0,80}(difund\w*|difus\w*)[^.\n]{0,60}\b(beb[eé]s?|lactante|recién nacido|cuna)\b|\b(beb[eé]s?|lactante|recién nacido|cuna)\b[^.\n]{0,60}(difund\w*|difus\w*)[^.\n]{0,80}\b(menta|eucalipto|romero|gaulteria)\b|\b(para ti|para una misma|uso personal|difusor de mam[áa])\b[^.\n]{0,70}(\b\d+\s?(gotas?|ml)\b|\b\d+\s?%)|\b(menta|eucalipto|romero|gaulteria)\b[^.\n]{0,70}\b(para ti|uso personal)\b/gi,
  it: /\b(sotto|oltre|dopo)\s+(i|le)?\s*\d+\s+(anni|mesi|settimane)\b|\b\d+\s+(anni|mesi)\s+(di età|d'età)\b|(\b\d+\s?(gocce?|ml)\b|\b\d+\s?%)[^.\n]{0,40}\b(pelle|olio vettore|vettore|bagno|topic\w*|applica\w*|massaggio)\b|\b(pelle|vettore|bagno|topic\w*|applica\w*|massaggio)\b[^.\n]{0,40}(\b\d+\s?(gocce?|ml)\b|\b\d+\s?%)|sicur[oi] per (neonat[oi]|lattant[ei])|\b(cannella|chiodi di garofano|origano|timo|menta|eucalipto|rosmarino)\b[^.\n]{0,40}\b(neonat[oi]|lattante)\b|(cura|curano|trattano|guarisce)[^.\n]{0,30}(coliche|dentizione|febbre|eczema|tosse)|\b(menta|eucalipto|rosmarino)\b[^.\n]{0,80}diffus\w*[^.\n]{0,60}\b(neonat[oi]|lattante|cameretta)\b/gi,
  fr: /\b(moins|plus|à partir)\s+de\s+\d+\s+(ans|mois|semaines)\b|(\b\d+\s?(gouttes?|ml)\b|\b\d+\s?%)[^.\n]{0,40}\b(peau|huile végétale|végétale|bain|topi\w*|appli\w*|massage)\b|\b(peau|végétale|bain|topi\w*|appli\w*|massage)\b[^.\n]{0,40}(\b\d+\s?(gouttes?|ml)\b|\b\d+\s?%)|sans danger pour (les b[ée]b[ée]s|les nourrissons|les nouveau-n[ée]s)|\b(cannelle|clou de girofle|origan|thym|menthe|eucalyptus|romarin)\b[^.\n]{0,40}\b(b[ée]b[ée]s?|nourrisson|nouveau-n[ée])\b|(soigne|traite|guérit)[^.\n]{0,30}(coliques|poussées dentaires|fièvre|eczéma|toux)|\b(menthe|eucalyptus|romarin)\b[^.\n]{0,80}diffus\w*[^.\n]{0,60}\b(b[ée]b[ée]s?|nourrisson|nouveau-n[ée])\b/gi,
  pt: /\b(menores?|maiores?|abaixo|acima|a partir)\s+de\s+\d+\s+(anos|meses)\b|\b\d+\s+(anos|meses)\s+de idade\b|(\b\d+\s?(gotas?|ml)\b|\b\d+\s?%)[^.\n]{0,40}\b(pele|óleo carreador|carreador|banho|tópic\w*|aplica\w*|massagem)\b|\b(pele|carreador|banho|tópic\w*|aplica\w*|massagem)\b[^.\n]{0,40}(\b\d+\s?(gotas?|ml)\b|\b\d+\s?%)|segur[oa]s? para (beb[êé]s|recém-nascidos)|\b(canela|cravo|orégano|tomilho|hortelã|eucalipto|alecrim)\b[^.\n]{0,40}\b(beb[êé]s?|recém-nascido)\b|(cura|curam|tratam|trata)[^.\n]{0,30}(cólica|dentição|febre|eczema|tosse)|\b(hortelã|eucalipto|alecrim)\b[^.\n]{0,80}difus\w*[^.\n]{0,60}\b(beb[êé]s?|recém-nascido|berço)\b/gi,
  de: /\b(unter|über|ab)\s+\d+\s+(Jahr|Monat|Woche)\w*\b|\b\d+\s+(Jahre?|Monate?)\s+alt\b|(\b\d+\s?(Tropfen|ml)\b|\b\d+\s?%)[^.\n]{0,40}\b(Haut|Trägeröl|Bad|topisch|auftrag\w*|Massage)\b|\b(Haut|Trägeröl|Bad|topisch|auftrag\w*|Massage)\b[^.\n]{0,40}(\b\d+\s?(Tropfen|ml)\b|\b\d+\s?%)|sicher für (Babys|Neugeborene|Säuglinge)|\b(Zimt|Nelke|Oregano|Thymian|Pfefferminze|Eukalyptus|Rosmarin|Wintergrün)\b[^.\n]{0,40}\b(Baby|Babys|Neugeboren\w*|Säugling\w*)\b|(heilt|behandelt|kuriert)[^.\n]{0,30}(Koliken|Zahnen|Fieber|Ekzem|Husten)|\b(Pfefferminze|Eukalyptus|Rosmarin|Wintergrün)\b[^.\n]{0,80}(diffundier\w*|Diffus\w*)[^.\n]{0,60}\b(Baby|Babys|Säugling\w*|Kinderzimmer)\b/gi,
  nl: /\b(onder|boven|vanaf)\s+\d+\s+(jaar|maand|week)\w*\b|\b\d+\s+(jaar|maanden?)\s+oud\b|(\b\d+\s?(druppels?|ml)\b|\b\d+\s?%)[^.\n]{0,40}\b(huid|draagolie|bad|topisch|aanbreng\w*|massage)\b|\b(huid|draagolie|bad|topisch|aanbreng\w*|massage)\b[^.\n]{0,40}(\b\d+\s?(druppels?|ml)\b|\b\d+\s?%)|veilig voor (baby'?s|pasgeborenen|zuigelingen)|\b(kaneel|kruidnagel|oregano|tijm|pepermunt|eucalyptus|rozemarijn|wintergreen)\b[^.\n]{0,40}\b(baby'?s?|pasgeboren\w*|zuigeling\w*)\b|(geneest|behandelt|cureert)[^.\n]{0,30}(krampjes|tandjes|koorts|eczeem|hoest)|\b(pepermunt|eucalyptus|rozemarijn|wintergreen)\b[^.\n]{0,80}(diffus\w*|verstuiv\w*)[^.\n]{0,60}\b(baby'?s?|zuigeling\w*|kinderkamer)\b/gi,
  ro: /\b(sub|peste|de la|până la)\s+\d+\s+(ani?|luni?|săptăm\w*)\b|(\b\d+\s?(pic[ăa]tur\w*|ml)\b|\b\d+\s?%)[^.\n]{0,40}\b(piele|ulei purtător|purtător|baie|topic\w*|aplic\w*|masaj)\b|\b(piele|purtător|baie|topic\w*|aplic\w*|masaj)\b[^.\n]{0,40}(\b\d+\s?(pic[ăa]tur\w*|ml)\b|\b\d+\s?%)|sigur\w* pentru (bebeluși|nou-născuți|sugari)|\b(scorțișoară|cuișoare|oregano|cimbru|mentă|eucalipt|rozmarin)\b[^.\n]{0,40}\b(bebeluș\w*|nou-născut\w*|sugar\w*)\b|(vindecă|tratează)[^.\n]{0,30}(colici|dentiție|febră|eczemă|tuse)|\b(mentă|eucalipt|rozmarin)\b[^.\n]{0,80}difuz\w*[^.\n]{0,60}\b(bebeluș\w*|sugar\w*|camera copilului)\b/gi,
  pl: /\b(poniżej|powyżej|od)\s+\d+\s+(rok\w*|mies\w*|tygod\w*)\b|(\b\d+\s?(kropl\w*|ml)\b|\b\d+\s?%)[^.\n]{0,40}\b(skór\w*|olej nośny|nośnik|kąpiel|miejscowo|nakład\w*|masaż)\b|\b(skór\w*|nośnik|kąpiel|miejscowo|nakład\w*|masaż)\b[^.\n]{0,40}(\b\d+\s?(kropl\w*|ml)\b|\b\d+\s?%)|bezpieczn\w* dla (niemowląt|noworodków)|\b(cynamon|goździk|oregano|tymianek|mięta|eukaliptus|rozmaryn)\b[^.\n]{0,40}\b(niemowl\w*|noworod\w*)\b|(leczy|wspomaga leczenie)[^.\n]{0,30}(kolki|ząbkowanie|gorączk|egzem|kaszel)|\b(mięta|eukaliptus|rozmaryn)\b[^.\n]{0,80}dyfuz\w*[^.\n]{0,60}\b(niemowl\w*|noworod\w*|pokój dziecięc\w*)\b/gi,
  ja: /[\d０-９]+\s*(歳|才|ヶ月|か月|カ月|ヵ月)|[\d０-９]+\s*滴[^\n]{0,15}(肌|皮膚|お肌)|(赤ちゃん|新生児)[^\n]{0,6}安全|(ペパーミント|ユーカリ|ローズマリー|ウィンターグリーン)[^\n]{0,20}(赤ちゃん|乳児|新生児)|(治す|治療|予防)[^\n]{0,12}(疝痛|発熱|湿疹|咳)/g,
  ar: /[\d٠-٩]+\s*(شهر|أشهر|سنة|سنوات|أسبوع)|[\d٠-٩]+\s*(قطرة|قطرات)[^\n]{0,25}(بشرة|جلد)|آمن[^\n]{0,12}(للرضّع|للرضع|لحديثي الولادة)|(النعناع|الأوكالبتوس|إكليل الجبل|وينترغرين|القرفة|القرنفل)[^\n]{0,25}(رضيع|رضّع|رضع|حديثي الولادة|مولود)/g,
}

;(async () => {
  const { data: brands } = await sb.from('brands').select('id,language_code,active')
  const ORDER = ['en', 'es', 'pt', 'fr', 'it', 'de', 'nl', 'ro', 'pl', 'ja', 'ar']
  brands.sort((a, b) => ORDER.indexOf(a.language_code) - ORDER.indexOf(b.language_code))
  console.log('LANG  ON  ART | mecc a-vita cifre therap income kids | STATO')
  console.log('─'.repeat(72))
  const issues = []
  for (const b of brands) {
    const L = LANG[b.language_code]; if (!L) continue
    const kw = INC_KW[b.language_code]
    const kids = KIDS[b.language_code]
    const { data: arts } = await sb.from('articles').select('slug,content_markdown').eq('brand_id', b.id).eq('status', 'published')
    let mecc = 0, av = 0, cur = 0, ther = 0, inc = 0, kid = 0
    for (const a of arts) {
      const c = a.content_markdown || ''
      const m1 = (c.match(L.mecc) || []).length, m2 = (c.match(L.aVita) || []).length, m3 = (c.match(CUR) || []).length, m4 = (c.match(L.ther) || []).length
      let m5 = 0
      for (const line of c.split('\n')) { if ((kw && kw.test(line) && FIG_INC.test(line)) || POT.test(line)) m5++ }
      const m6 = kids ? (c.match(kids) || []).length : 0
      mecc += m1; av += m2; cur += m3; ther += m4; inc += m5; kid += m6
      if (m1 + m2 + m3 + m4 + m5 + m6) issues.push(b.language_code + '/' + a.slug + ' [mecc' + m1 + ' av' + m2 + ' €' + m3 + ' ther' + m4 + ' inc' + m5 + ' kids' + m6 + ']')
    }
    const tot = mecc + av + cur + ther + inc + kid
    console.log(b.language_code.padEnd(5) + ' ' + (b.active ? 'ON ' : 'off') + ' ' + String(arts.length).padStart(3) + ' | ' + String(mecc).padStart(4) + ' ' + String(av).padStart(6) + ' ' + String(cur).padStart(5) + ' ' + String(ther).padStart(6) + ' ' + String(inc).padStart(6) + ' ' + String(kid).padStart(4) + ' | ' + (tot === 0 ? '✅ PULITO' : '⚠️ ' + tot))
  }
  if (issues.length) { console.log('\n─── ARTICOLI CON HIT (da verificare, kids = SEMPRE a mano) ───'); issues.forEach(i => console.log('  ' + i)) }
  else console.log('\n✅✅ TUTTI I BRAND (EN/ES) PULITI sui 6 problemi')
})()
