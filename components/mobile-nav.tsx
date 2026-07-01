'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

const NAV = [
  { href: '/dashboard', label: 'Brands', exact: true, noBrand: true },
  { href: '/dashboard/articles', label: 'Articles' },
  { href: '/dashboard/keywords', label: 'Keywords' },
  { href: '/dashboard/calendar', label: 'Calendar' },
  { href: '/dashboard/analytics', label: 'Analytics' },
  { href: '/dashboard/health', label: '🩺 Health', noBrand: true },
  { href: '/dashboard/settings', label: 'Settings', noBrand: true },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const brandId = searchParams.get('brand_id')

  return (
    <>
      <button
        onClick={() => setOpen(v => !v)}
        className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
        aria-label="Toggle menu"
      >
        {open ? '✕' : '☰'}
      </button>

      {open && (
        <div className="absolute top-[57px] left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 py-3 flex flex-col gap-1">
            {NAV.map(({ href, label, exact, noBrand }) => {
              const dest = brandId && !noBrand ? `${href}?brand_id=${brandId}` : href
              const isActive = exact ? pathname === '/dashboard' : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={dest}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
