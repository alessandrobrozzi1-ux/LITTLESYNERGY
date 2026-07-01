'use client'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

const NAV = [
  { href: '/dashboard', label: 'Brands', exact: true },
  { href: '/dashboard/articles', label: 'Articles' },
  { href: '/dashboard/keywords', label: 'Keywords' },
  { href: '/dashboard/calendar', label: 'Calendar' },
  { href: '/dashboard/analytics', label: 'Analytics' },
  { href: '/dashboard/health', label: '🩺 Health' },
  { href: '/dashboard/settings', label: 'Settings' },
]

export function NavLinks() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Brand context: from URL path (/brands/[id]) or from ?brand_id= param
  const brandFromPath = pathname.match(/\/dashboard\/brands\/([^/]+)/)?.[1]
  const brandFromSearch = searchParams.get('brand_id')
  const brandId = brandFromSearch ?? brandFromPath ?? null

  return (
    <>
      {NAV.map(({ href, label, exact }) => {
        const dest = brandId && href !== '/dashboard/settings' && href !== '/dashboard/health'
          ? `${href}?brand_id=${brandId}`
          : href
        const isActive = exact ? pathname === '/dashboard' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={dest}
            className={`text-sm transition-colors ${
              isActive ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </>
  )
}
