import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const BRAND_ID = '1314a2d9-9ed6-475e-9235-8dffebb9384b'

const content = `# doTERRA kaufen: 25% Rabatt mit Großkundenkonto sichern

Sie haben doTERRA ätherische Öle entdeckt und fragen sich: *Was ist der beste Weg, doTERRA in Deutschland zu kaufen?* Die Antwort hängt davon ab, wie regelmäßig Sie die Öle nutzen möchten — und ob Sie dauerhaft sparen wollen.

Diese Anleitung erklärt alle Kaufoptionen übersichtlich, damit Sie die richtige Wahl für Ihren Lifestyle treffen.

---

## Die drei Wege, doTERRA zu kaufen

### Option 1: Einzelkauf zum Endverbraucherpreis

Sie können doTERRA-Produkte jederzeit zum regulären Endverbraucherpreis kaufen — ohne Mitgliedschaft und ohne Verpflichtung. Ideal, wenn Sie einfach ein Produkt ausprobieren möchten.

**Nachteil:** Der Endverbraucherpreis liegt rund 25% über dem Großkundenpreis.

### Option 2: Großkundenkonto eröffnen (25% Rabatt)

Der klügere Weg ist ein **doTERRA Großkundenkonto** (Wholesale Membership). Mit einer einmaligen Registrierung erhalten Sie:

- **25% Rabatt auf alle Produkte** — dauerhaft, bei jeder Bestellung
- Zugang zum Loyalty Rewards Program (LRP) für kostenlose Produktguthaben
- Frühzeitigen Zugang zu Neuheiten und limitierten Editionen
- Kein monatliches Minimum, keine versteckten Gebühren

> Die meisten Kunden, die doTERRA einmal ausprobiert haben, bleiben dabei — der Großkundenpreis amortisiert sich schon bei der ersten Bestellung.

### Option 3: Wellness Advocate werden (Empfehlen + Verdienen)

Als Wellness Advocate empfehlen Sie doTERRA weiter und erhalten zusätzliche Vergütungen. Das ist optional — die meisten Mitglieder sind einfach begeisterte Kunden ohne Geschäftsinteresse.

---

## Schritt-für-Schritt: Großkundenkonto in 5 Minuten

Ein doTERRA Großkundenkonto einzurichten geht schnell:

1. **Starter Kit wählen** — Ihre Erstbestellung aktiviert gleichzeitig die Mitgliedschaft
2. **Registrierungsformular ausfüllen** — Name, Adresse, E-Mail
3. **Erste Bestellung aufgeben** — der 25% Rabatt gilt sofort
4. **Loyalty Rewards aktivieren** — ab der ersten Monatsbestellung Punkte sammeln
5. **Fertig** — Sie haben dauerhaft Zugang zum Großkundenpreis

Sie benötigen nur **eine Bestellung pro Jahr** (mindestens 50 PV), um die Mitgliedschaft aktiv zu halten.

---

## Die beliebtesten Starter Kits für Deutschland, Österreich und die Schweiz

doTERRA bietet verschiedene Einsteigerpakete zu unterschiedlichen Preispunkten. Die zwei beliebtesten Optionen:

### Foundational Wellness Bundle

Das [Foundational Wellness Bundle](https://shop.doterra.com/DE/de_DE/shop/essential-oils/?OwnerID=15957920) ist eine der umfassendsten Einsteiger-Optionen. Es enthält eine kuratierte Auswahl ätherischer Öle und Nahrungsergänzungsmittel für das tägliche Wohlbefinden.

**Warum es beliebt ist:** Es deckt die wichtigsten Alltagsbedürfnisse ab — Immununterstützung, Energie, Verdauungskomfort und erholsamer Schlaf — alles in einem vergünstigten Paket.

### Home Essentials Enrollment Kit

Das [Home Essentials Enrollment Kit](https://shop.doterra.com/DE/de_DE/shop/essential-oils/?OwnerID=15957920) ist das klassische doTERRA Einsteiger-Set und weltweit eines der meistverkauften Registrierungspakete. Es enthält 10 der vielseitigsten ätherischen Öle sowie einen Diffuser.

**Enthaltene Öle:** Lavendel, Zitrone, Pfefferminze, Oregano, Weihrauch, Deep Blue®, Breathe®, DigestZen®, On Guard®, Easy Air® — plus Petal Diffuser.

**Warum es beliebt ist:** Das perfekte Einführungsset. Die meisten Mitglieder, die mit diesem Kit starten, nutzen diese Öle täglich.

---

## Kann man doTERRA ohne Kit kaufen?

Ja! Wenn Sie noch nicht bereit für ein Einsteiger-Kit sind, können Sie:

- **Die Mitgliedschaft mit einer kleinen Einschreibegebühr eröffnen** und dann einzelne Produkte zum Großkundenpreis bestellen
- **Als Endverbraucher kaufen** (ohne Konto) über den [doTERRA Shop DE](https://shop.doterra.com/DE/de_DE/shop/essential-oils/?OwnerID=15957920)
- **Erst ein Produkt testen**, dann das Großkundenkonto eröffnen

Starter Kits sind jedoch fast immer die bessere Wahl — der Bündelrabatt übersteigt die Registrierungskosten in der Regel bereits bei der ersten Bestellung.

---

## Das Loyalty Rewards Program (LRP)

Als Großkunde können Sie mit dem **Loyalty Rewards Program (LRP)** Produktguthaben auf monatliche Bestellungen verdienen:

| Bestellmonat | Punkte-Rückerstattung |
|---|---|
| Monat 1–3 | 10% als Produktguthaben |
| Monat 4–6 | 15% als Produktguthaben |
| Monat 7+ | 20–30% als Produktguthaben |

Die Punkte können bei der nächsten Bestellung für kostenlose Produkte eingelöst werden. Viele Mitglieder erhalten so effektiv eine Gratis-Bestellung pro Jahr.

---

## Häufige Fragen zum doTERRA Kauf in Deutschland

**Gibt es monatliche Gebühren für das Großkundenkonto?**
Nein. Es gibt eine kleine jährliche Mitgliedschaftserneuerung (ca. 25 EUR), aber keine monatlichen Gebühren und kein Mindestbestellwert.

**Muss ich doTERRA weiterempfehlen, um den Rabatt zu erhalten?**
Absolut nicht. Die meisten doTERRA-Mitglieder sind einfach Kunden, die den besten Preis auf Produkte erhalten möchten, die sie lieben. Sie müssen kein Geschäft aufbauen oder andere rekrutieren.

**Kann man doTERRA auf Amazon kaufen?**
Technisch ja — aber nicht empfohlen. Auf Amazon verkaufte Produkte werden von doTERRA nicht verifiziert, können gefälscht, abgelaufen oder unsachgemäß gelagert sein und haben keinen Anspruch auf Produktgarantien. Kaufen Sie immer über einen autorisierten Wellness Advocate.

**Wie lange dauert die Lieferung nach Deutschland, Österreich und in die Schweiz?**
Standardbestellungen werden in der Regel innerhalb von 3–7 Werktagen geliefert. Expresslieferung ist beim Checkout verfügbar.

**Funktioniert das Großkundenkonto für Österreich und die Schweiz?**
Ja. doTERRA hat eigene Marktportale für DE, AT und CH. Die Preise sind in Euro bzw. Schweizer Franken, die Lieferung erfolgt aus lokalen Lagern.

---

## Zusammenfassung: Der beste Weg doTERRA zu kaufen

| Kaufmethode | Preis | Ideal für |
|---|---|---|
| Endverbraucherpreis | Vollpreis | Einmaliger Test |
| Großkundenkonto | 25% Rabatt | Regelmäßige Nutzer |
| Starter Kit | Bestes Preis-Leistungs-Verhältnis | Neue Mitglieder |
| LRP-Monatsbestellung | +10–30% zurück als Guthaben | Treue Kunden |

Wer ätherische Öle regelmäßig verwendet, sollte fast immer ein Großkundenkonto eröffnen. Die 25% Ersparnis summieren sich schnell — und die erste Kit-Bestellung spart oft mehr, als die Mitgliedschaft kostet.

Bereit anzufangen? Stöbern Sie im [doTERRA Shop für Deutschland](https://shop.doterra.com/DE/de_DE/shop/essential-oils/?OwnerID=15957920) oder entdecken Sie das [Home Essentials Enrollment Kit](https://shop.doterra.com/DE/de_DE/shop/essential-oils/?OwnerID=15957920) als idealen Einstieg.

---

*Diese Aussagen wurden von den zuständigen Behörden nicht bewertet. Dieses Produkt ist nicht zur Diagnose, Behandlung, Heilung oder Vorbeugung von Krankheiten bestimmt. Die Ergebnisse können individuell variieren.*`

const { data, error } = await supabase.from('articles').insert({
  brand_id: BRAND_ID,
  title: 'doTERRA kaufen: 25% Rabatt mit Großkundenkonto sichern',
  slug: 'wie-doterra-kaufen',
  meta_description: 'Erfahren Sie, wie Sie doTERRA in Deutschland kaufen und 25% sparen. Vergleich: Retail, Großkonto, Starter Kits, LRP-Programm. Schritt-für-Schritt-Anleitung.',
  content_markdown: content,
  keyword_source: 'wie doterra kaufen',
  status: 'published',
  published_at: new Date().toISOString(),
}).select('id, slug').single()

if (error) { console.error('INSERT ERROR:', JSON.stringify(error)); process.exit(1) }
console.log('INSERTED:', data.id, data.slug)
