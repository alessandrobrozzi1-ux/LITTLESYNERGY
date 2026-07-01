#!/usr/bin/env node
/**
 * SoloSEO — Create Brand Script v3
 * Usage (interactive):  node scripts/create-brand.js
 *
 * v3 CHANGE: auto-sets brand_dna_image_style = GOLD_STANDARD lifestyle prompt.
 * Prevents NULL fallback to DEFAULT_STYLE hardcoded (produces 3D fake bottles).
 * See IMAGE GENERATION ARCHITECTURE in skill v3.0 for full rationale.
 * Usage (CLI args):     node scripts/create-brand.js \
 *   --language=de \
 *   --ownerID=15957920 \
 *   --marketUrl=https://shop.doterra.com/DE/de_DE/shop \
 *   --domain=essentialsynergybr.com/de \
 *   --brandName="Essential Synergy DE"
 *
 * Creates a new brand + localized editorial themes in Supabase.
 * Brand is created with active=false — activate manually after verification.
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local
 */

const { createClient } = require('@supabase/supabase-js')
const readline = require('readline')
const path = require('path')
const fs = require('fs')

const { getDnaTemplate } = require('./lib/brand-dna-templates')

// v3: Gold standard image style — always set on brand creation.
// Vague lifestyle prompt = gpt-image-2 generates photorealistic doTERRA scenes.
// NULL fallback would trigger DEFAULT_STYLE (hardcoded, produces fake 3D bottles).
const DEFAULT_IMAGE_STYLE = 'Bright, clean lifestyle photography. Natural light, botanical elements, and doTERRA-branded essential oil bottles (amber glass, black cap, minimal white label clearly reading "doTERRA" above the oil name) arranged with diffusers in cozy home settings. Warm earth tones with pops of lavender, green, and soft amber.'
const { getThemes } = require('./lib/editorial-themes-by-language')
const { getMarket } = require('./lib/doterra-markets')

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k && v.length) process.env[k.trim()] = v.join('=').trim()
  })
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Parse CLI args: --key=value or --key value
function parseArgs() {
  const args = process.argv.slice(2)
  const result = {}
  for (let i = 0; i < args.length; i++) {
    const match = args[i].match(/^--(\w+)=(.+)$/)
    if (match) {
      result[match[1]] = match[2]
    } else if (args[i].startsWith('--') && args[i + 1] && !args[i + 1].startsWith('--')) {
      result[args[i].slice(2)] = args[i + 1]
      i++
    }
  }
  return result
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise(resolve => rl.question(q, resolve))

async function getInputs(cliArgs) {
  if (Object.keys(cliArgs).length > 0) {
    // Non-interactive mode
    const required = ['language', 'ownerID', 'marketUrl', 'domain', 'brandName']
    const missing = required.filter(k => !cliArgs[k])
    if (missing.length) {
      console.error(`Missing required args: ${missing.map(k => `--${k}`).join(', ')}`)
      process.exit(1)
    }
    rl.close()
    return {
      languageCode: cliArgs.language.toLowerCase(),
      ownerID: cliArgs.ownerID,
      marketUrl: cliArgs.marketUrl.replace(/\/$/, ''),
      domain: cliArgs.domain,
      brandName: cliArgs.brandName,
    }
  }

  // Interactive mode
  console.log('\n=== SoloSEO — Create New Brand v3 ===\n')
  const languageCode = (await ask('Language code (e.g. en, fr, de, it, pt): ')).trim().toLowerCase()
  const brandName = (await ask('Brand display name (e.g. Essential Synergy DE): ')).trim()
  const domain = (await ask('Domain (e.g. essentialsynergybr.com/de): ')).trim()
  const ownerID = (await ask('doTERRA Owner ID (e.g. 15957920): ')).trim()
  const marketUrl = (await ask('doTERRA Market Shop base URL (e.g. https://shop.doterra.com/DE/de_DE/shop): ')).trim().replace(/\/$/, '')
  rl.close()
  return { languageCode, ownerID, marketUrl, domain, brandName }
}

async function main() {
  const cliArgs = parseArgs()
  const { languageCode, ownerID, marketUrl, domain, brandName } = await getInputs(cliArgs)

  // Derive language name from code
  const LANG_NAMES = {
    en: 'English', es: 'Spanish', de: 'German', it: 'Italian',
    fr: 'French', pt: 'Portuguese', nl: 'Dutch', pl: 'Polish',
    ja: 'Japanese', // v3.9 — Japan launch
    ar: 'Arabic', // v3.11 — UAE/Gulf launch
  }
  const languageName = LANG_NAMES[languageCode] ?? languageCode.toUpperCase()

  // Market info (warns if not verified)
  const market = getMarket(languageCode)

  // DNA — localized
  const dna = getDnaTemplate(languageCode)

  // Affiliate base URL: <shopBase>/essential-oils/?OwnerID=<id>
  // Sanitize: strip trailing /essential-oils (with or without slash) if user passed full path
  const baseShopUrl = marketUrl.replace(/\/essential-oils\/?$/, '')
  const affiliateBaseUrl = `${baseShopUrl}/essential-oils/?OwnerID=${ownerID}`

  console.log('\n--- Preview ---')
  console.log(`Language:      ${languageCode} (${languageName})`)
  console.log(`Brand name:    ${brandName}`)
  console.log(`Domain:        ${domain}`)
  console.log(`Affiliate URL: ${affiliateBaseUrl}`)
  console.log(`DNA voice:     ${dna.brand_dna_brand_voice.substring(0, 80)}...`)
  if (market && !market.verified) {
    console.log(`\n⚠️  Market URL pattern for ${languageCode.toUpperCase()} is NOT yet verified.`)
    console.log(`   Expected product URL: ${market.productPattern}`)
    console.log(`   Open that URL in a browser and confirm a real product loads before launch.\n`)
  }

  const brandData = {
    language_code: languageCode,
    language_name: languageName,
    brand_name: brandName,
    domain,
    owner_id: ownerID,
    affiliate_base_url: affiliateBaseUrl,
    brand_dna_business_type: dna.brand_dna_business_type,
    brand_dna_service_area: dna.brand_dna_service_area,
    brand_dna_topics_to_avoid: dna.brand_dna_topics_to_avoid,
    brand_dna_key_themes: dna.brand_dna_key_themes,
    brand_dna_brand_voice: dna.brand_dna_brand_voice,
    brand_dna_mandatory_footer: dna.brand_dna_mandatory_footer,
    brand_dna_image_style: DEFAULT_IMAGE_STYLE, // v3: gold standard — prevents NULL→DEFAULT_STYLE fallback
    active: false, // always false — activate manually after verification
  }

  console.log('\nCreating brand...')
  const { data: brand, error: brandError } = await supabase
    .from('brands')
    .insert([brandData])
    .select()
    .single()

  if (brandError || !brand) {
    console.error('ERROR creating brand:', brandError?.message)
    process.exit(1)
  }

  console.log(`✅ Brand created: ${brand.id}`)
  console.log(`⚠️  Brand created with active=false. Activate manually after verification:`)
  console.log(`   SQL: UPDATE brands SET active = true WHERE id = '${brand.id}';`)
  console.log(`   or:  Dashboard → Brands → ${brandName} → toggle Active\n`)

  // Themes — localized keywords
  console.log('Creating editorial themes (localized keywords)...')
  const themes = getThemes(languageCode, brand.id)
  const { error: themeError } = await supabase.from('editorial_themes').insert(themes)
  if (themeError) {
    console.warn('⚠️  Warning creating themes:', themeError.message)
  } else {
    console.log(`✅ ${themes.length} editorial themes created with ${languageName} keywords`)
  }

  // Output
  console.log('\n' + '='.repeat(62))
  console.log('BRAND CREATED SUCCESSFULLY')
  console.log('='.repeat(62))
  console.log(`Brand ID:      ${brand.id}`)
  console.log(`Language:      ${languageCode} — ${languageName}`)
  console.log(`Domain:        ${domain}`)
  console.log(`Affiliate URL: ${affiliateBaseUrl}`)
  console.log(`Active:        FALSE ← activate after full verification`)
  console.log()
  console.log('NEXT STEPS (in order):')
  console.log('-'.repeat(62))
  console.log(`1. Populate Link Expert:`)
  console.log(`   Chrome DevTools → navigate to doTERRA ${languageName} shop`)
  console.log(`   Run scraper script → node scripts/seed-${languageCode}-links.mjs`)
  console.log(`   Verify 10 priority products + Touch variants + Kits`)
  console.log(`2. Customize Brand DNA in dashboard (review auto-generated)`)
  console.log(`3. Set up Lovable routes for /${languageCode}/blog/[slug]`)
  console.log(`4. Verify URL pattern: ${market ? market.productPattern : 'UNKNOWN — check manually'}`)
  console.log(`5. Test: generate 1 article via Run Now → verify content + links`)
  console.log(`6. Activate brand:`)
  console.log(`   UPDATE brands SET active = true WHERE id = '${brand.id}';`)
  console.log(`7. Wait for 9 AM Italy cron → verify cron_runs + cost_log populated`)
  console.log()
  console.log('SoloSEO API endpoint for Lovable:')
  console.log(`   https://soloseo-alpha.vercel.app/api/public/articles/${languageCode}`)
  console.log('='.repeat(62))
}

main().catch(e => { console.error(e); process.exit(1) })
