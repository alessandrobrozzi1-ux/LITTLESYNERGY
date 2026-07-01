/**
 * Insert EN pillar article: How to Buy doTERRA Products
 * Slug: how-to-buy-doterra-products
 * Then calls generate-image API to attach featured_image.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')
readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('='); if (k && v.length) process.env[k.trim()] = v.join('=').trim()
})

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const EN_BRAND_ID = 'eceba851-228a-45cf-8775-b0f7fc9ae7de'
const SLUG = 'how-to-buy-doterra-products'

const FOUNDATIONAL_BUNDLE = 'https://www.doterra.com/US/en/p/foundational-wellness-bundle/?OwnerID=15957920'
const HOME_ESSENTIALS_KIT = 'https://www.doterra.com/US/en/p/home-essentials-enrollment-kit/?OwnerID=15957920'
const SHOP_URL = 'https://www.doterra.com/US/en/shop/?OwnerID=15957920'

const TITLE = 'How to Buy doTERRA Products: Save 25% With a Wholesale Account'

const CONTENT_MARKDOWN = `# How to Buy doTERRA Products: Save 25% With a Wholesale Account

If you've discovered doTERRA essential oils and want to make them part of your everyday wellness routine, you're probably wondering: *what's the best way to buy doTERRA products?* The answer depends on how often you plan to use them — and whether you'd like to save significantly on every order.

This guide walks you through every purchasing option, so you can choose the one that fits your lifestyle and budget.

---

## The Two Main Ways to Buy doTERRA Products

### Option 1: Buy Retail (Full Price)

Anyone can purchase doTERRA products at the standard retail price through a Wellness Advocate's personal website — no membership required. This is a good option if you just want to try one or two products without any commitment.

**Drawback:** Retail prices are typically 25% higher than wholesale prices.

### Option 2: Open a Wholesale Account (Save 25%)

The smarter way to shop doTERRA is to open a **Wholesale Membership** (also called a Loyalty Rewards membership). With a one-time enrollment, you unlock:

- **25% off all products**, every order, forever
- Access to the Loyalty Rewards Program (LRP) to earn free product credits
- Early access to new launches and limited editions
- No monthly minimums required

> Most customers who try doTERRA stick with it — so the wholesale price quickly pays for itself on the very first order.

---

## How to Open a doTERRA Wholesale Account

Opening your account takes just a few minutes:

1. **Choose an enrollment kit** — this is your starting order that also activates your membership
2. **Complete the enrollment form** with your basic information
3. **Place your first order** — your 25% discount applies immediately
4. **Start earning Loyalty Rewards points** on future monthly orders

You only need to place **one order per year** (minimum 50 PV) to keep your membership active. There are no sign-up fees and no monthly subscriptions.

---

## Best Enrollment Kits for New Members

doTERRA offers several enrollment kits at different price points. Here are two of the most popular options for new members:

### Foundational Wellness Bundle

The [Foundational Wellness Bundle](${FOUNDATIONAL_BUNDLE}) is one of doTERRA's most comprehensive starter options. It includes a carefully curated selection of essential oils and wellness supplements designed to support your daily health routines.

**Why it's popular:** It covers the core daily wellness needs — immune support, energy, digestive comfort, and restful sleep — all in one discounted bundle.

### Home Essentials Enrollment Kit

The [Home Essentials Enrollment Kit](${HOME_ESSENTIALS_KIT}) is the classic doTERRA starter kit and one of the best-selling enrollment options worldwide. It includes 10 of the most versatile essential oils along with a diffuser, giving you everything you need to start exploring aromatherapy at home.

**What's included:** Lavender, Lemon, Peppermint, Oregano, Frankincense, Deep Blue®, Breathe®, DigestZen®, On Guard®, Easy Air® — plus a Petal Diffuser.

**Why it's popular:** It's the perfect introduction to the doTERRA system. Most members who start with this kit find they use these oils every single day.

---

## Can You Buy doTERRA Without a Kit?

Yes! If you're not ready for an enrollment kit, you can:

- **Open a membership with just a small enrollment fee** and then place individual product orders at wholesale price
- **Buy retail** (no account needed) through [the doTERRA shop](${SHOP_URL})
- **Try one product first**, then open your wholesale account later

That said, enrollment kits are almost always the better value — the bundle discounts typically exceed the cost of enrollment several times over.

---

## What Is the Loyalty Rewards Program (LRP)?

Once you're a wholesale member, the **Loyalty Rewards Program (LRP)** lets you earn product credit on monthly orders:

| Order Month | Points Back |
|---|---|
| Month 1–3 | 10% in product credit |
| Month 4–6 | 15% in product credit |
| Month 7+ | 20–30% in product credit |

These points can be redeemed for free products on your next order. Many members effectively get one free order per year just through LRP points.

---

## Buying doTERRA Products: Frequently Asked Questions

**Is there a monthly fee for a wholesale account?**
No. There's a small annual membership renewal (~$25), but no monthly fees and no minimum purchase requirements.

**Do I have to sell doTERRA to get wholesale pricing?**
Absolutely not. Most doTERRA wholesale members are simply customers who want the best price on products they love. You never have to build a business or recruit anyone.

**Can I buy doTERRA products on Amazon?**
Technically yes, but it's not recommended. Products sold on Amazon are not verified by doTERRA, may be counterfeit, expired, or improperly stored, and are not eligible for product replacement guarantees. Always purchase through an authorized Wellness Advocate.

**How long does shipping take?**
Standard US orders typically arrive in 3–5 business days. Expedited shipping is available at checkout.

---

## Summary: The Best Way to Buy doTERRA

| Method | Price | Best For |
|---|---|---|
| Retail | Full price | One-time trial |
| Wholesale Account | 25% off | Regular users |
| Enrollment Kit | Best bundle value | New members |
| LRP Monthly Order | +10–30% back in credit | Loyal customers |

If you use essential oils more than once a month, opening a wholesale account is almost always the right choice. The 25% savings add up fast — and your very first enrolled order at bundle pricing often saves you more than the cost of membership.

Ready to get started? Browse the [doTERRA shop](${SHOP_URL}) or explore the [Home Essentials Enrollment Kit](${HOME_ESSENTIALS_KIT}) to find your perfect starting point.

---

*These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease. Individual results may vary.*`

const META_DESCRIPTION = 'Learn how to buy doTERRA products and save 25% with a wholesale account. Compare enrollment kits, understand the Loyalty Rewards Program, and find the best way to start.'

async function run() {
  console.log('Inserting pillar article EN...')

  const { data: article, error } = await sb
    .from('articles')
    .insert([{
      brand_id: EN_BRAND_ID,
      title: TITLE,
      slug: SLUG,
      content_markdown: CONTENT_MARKDOWN,
      meta_description: META_DESCRIPTION,
      keyword_source: 'how to buy doterra products',
      status: 'published',
      published_at: new Date().toISOString(),
      seo_score: 85,
    }])
    .select()
    .single()

  if (error || !article) {
    console.error('INSERT ERROR:', error?.message)
    process.exit(1)
  }

  console.log('✅ Article inserted:', article.id)
  console.log('   Slug:', article.slug)
  console.log('   Status:', article.status)
  console.log()
  console.log('Now calling generate-image API...')

  // Call production API to generate and attach featured image
  const API_URL = 'https://soloseo-alpha.vercel.app/api/generate-image'
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      article_id: article.id,
      title: TITLE,
      keyword_source: 'how to buy doterra products',
      image_style: 'lifestyle',
    }),
  })

  const json = await res.json()
  if (!res.ok) {
    console.error('Image generation failed:', json)
    console.log('Article is live WITHOUT image. You can regenerate manually from the dashboard.')
  } else {
    console.log('✅ Featured image generated:', json.image_url)
    console.log('   Prompt used:', json.prompt?.substring(0, 100) + '...')
  }

  console.log()
  console.log('='.repeat(60))
  console.log('PILLAR ARTICLE LIVE')
  console.log('='.repeat(60))
  console.log('Article ID:', article.id)
  console.log('Slug:      ', SLUG)
  console.log('URL:        https://essentialsynergybr.com/en/blog/' + SLUG)
  console.log('Dashboard:  https://soloseo-alpha.vercel.app/dashboard/articles/' + article.id)
}

run().catch(e => { console.error(e); process.exit(1) })
