interface QualityGateProps {
  content: string
  footer: string
}

const MEDICAL_KEYWORDS = ['GABA', 'melatonina', 'cortisol', 'TDAH', 'depresión', 'ansiedad severa', 'trastorno', 'insomnio clínico', 'serotonina', 'dopamina']

const VERIFIED_SLUGS = new Set([
  // Single oils
  'arborvitae-oil', 'basil-oil', 'bergamot-oil', 'black-pepper-oil',
  'black-spruce-oil', 'blue-tansy-oil', 'cardamom-oil', 'cassia-oil',
  'cedarwood-oil', 'celery-seed-oil', 'cinnamon-bark-oil', 'clary-sage-oil',
  'clove-oil', 'copaiba-oil', 'cypress-oil', 'eucalyptus-oil',
  'frankincense-oil', 'geranium-oil', 'ginger-oil', 'grapefruit-oil',
  'helichrysum-oil', 'lavender-oil', 'lemon-oil', 'lemongrass-oil',
  'lime-oil', 'marjoram-oil', 'myrrh-oil', 'oregano-oil', 'patchouli-oil',
  'peppermint-oil', 'roman-chamomile-oil', 'rosemary-oil', 'sandalwood-oil',
  'spearmint-oil', 'tangerine-oil', 'thyme-oil', 'vetiver-oil',
  'wild-orange-oil', 'ylang-ylang-oil',
  // Blends with doterra- prefix
  'doterra-air-oil', 'doterra-balance-oil', 'doterra-brave-oil',
  'doterra-calmer-oil', 'doterra-cheer-oil', 'doterra-serenity-oil',
  // Blends without prefix
  'air-x-oil', 'aromatouch-oil', 'citrus-bliss-oil', 'ddr-prime-oil', 'deep-blue-oil',
  // One-word blends
  'clarycalm-oil', 'zengest-oil',
  // On Guard family
  'onguard-oil', 'onguard-touch-oil', 'onguard-softgels', 'onguard-toothpaste',
  'on-guard-drops', 'on-guard-brand',
  // Touch products
  'lavender-touch-oil', 'peppermint-touch-oil', 'frankincense-touch-oil',
  'deep-blue-touch-oil', 'blue-lotus-touch-oil',
  // Special forms
  'deep-blue-oil-roll-on', 'peppermint-oil-beadlet', 'ddr-prime-softgels',
  // Kits & categories
  'beginners-trio', 'essential-oils', 'single-oils', 'proprietary-blends',
  'roll-on-essentials', 'air-brand', 'deep-blue-brand', 'on-guard-brand',
  'foundational-wellness', 'daily-vitality', 'zengest-brand', 'metapwr-brand',
  'doterra-kids-brand', 'collections-kits', 'enrolment-kits', 'loyalty-reward-kits',
])

function hasBrokenProductUrl(content: string): boolean {
  const pattern = /shop\.doterra\.com\/ES\/es_ES\/shop\/([^/?]+)\//g
  let match
  while ((match = pattern.exec(content)) !== null) {
    if (!VERIFIED_SLUGS.has(match[1])) return true
  }
  return false
}

function check(label: string, pass: boolean) {
  return { label, pass }
}

export function QualityGate({ content, footer }: QualityGateProps) {
  const wordCount = content.split(/\s+/).length
  const footerPresent = footer ? content.includes(footer.substring(0, 40)) : true
  const hasFaq = /preguntas frecuentes|FAQ/i.test(content)
  const hasBrokenUrls = hasBrokenProductUrl(content)
  const medicalFound = MEDICAL_KEYWORDS.filter((k) => content.includes(k))

  const checks = [
    check(`Word count > 800 (${wordCount} words)`, wordCount > 800),
    check('Mandatory footer present', footerPresent),
    check('No broken product URLs', !hasBrokenUrls),
    check(
      medicalFound.length === 0 ? 'No medical claims' : `Medical claims found: ${medicalFound.join(', ')}`,
      medicalFound.length === 0
    ),
    check('FAQ section present', hasFaq),
  ]

  const allPass = checks.every((c) => c.pass)

  return (
    <div className={`border rounded-lg p-4 ${allPass ? 'border-gray-200 bg-gray-50' : 'border-amber-200 bg-amber-50'}`}>
      <p className="text-xs font-medium text-gray-700 mb-3">Quality Check</p>
      <div className="space-y-1.5">
        {checks.map((c) => (
          <div key={c.label} className="flex items-start gap-2">
            <span className={`text-xs mt-0.5 ${c.pass ? 'text-green-600' : 'text-red-500'}`}>
              {c.pass ? '✓' : '✗'}
            </span>
            <span className={`text-xs ${c.pass ? 'text-gray-600' : 'text-red-600'}`}>{c.label}</span>
          </div>
        ))}
      </div>
      {allPass && (
        <p className="mt-3 text-xs text-green-600 font-medium">Ready to publish</p>
      )}
    </div>
  )
}
