'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const LANG_FLAGS: Record<string, string> = {
  en: '🇺🇸', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪',
  it: '🇮🇹', pt: '🇵🇹', nl: '🇳🇱', pl: '🇵🇱',
}

interface Brand {
  id: string
  brand_name: string
  language_code: string
  active: boolean
}

interface BrandSwitcherProps {
  brands: Brand[]
  selectedBrandId: string | null
  onSelect?: (brandId: string) => void
}

export function BrandSwitcher({ brands, selectedBrandId, onSelect }: BrandSwitcherProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selected = brands.find(b => b.id === selectedBrandId) ?? brands[0]
  if (!selected || brands.length <= 1) return null

  function handleSelect(id: string) {
    if (onSelect) {
      onSelect(id)
    } else {
      const params = new URLSearchParams(searchParams.toString())
      params.set('brand_id', id)
      router.push(`${pathname}?${params.toString()}`)
    }
    setOpen(false)
  }

  const flag = LANG_FLAGS[selected.language_code] ?? '🌐'

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-400 bg-white transition-colors"
      >
        <span>{flag}</span>
        <span>{selected.language_code.toUpperCase()}</span>
        <span className="text-gray-300">·</span>
        <span className="text-gray-600 max-w-[160px] truncate">{selected.brand_name}</span>
        <span className="text-gray-400 text-[10px] ml-0.5">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1.5 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[220px]">
            {brands.map(brand => (
              <button
                key={brand.id}
                onClick={() => handleSelect(brand.id)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span>{LANG_FLAGS[brand.language_code] ?? '🌐'}</span>
                  <span className="font-medium text-gray-800">{brand.language_code.toUpperCase()}</span>
                  <span className="text-gray-300 text-xs">·</span>
                  <span className="text-gray-600 truncate">{brand.brand_name}</span>
                  {!brand.active && (
                    <span className="text-[11px] text-gray-400 shrink-0">(paused)</span>
                  )}
                </div>
                {brand.id === selected.id && (
                  <span className="text-gray-900 text-xs shrink-0 ml-2">✓</span>
                )}
              </button>
            ))}
            <div className="border-t border-gray-100 mt-1 pt-1">
              <Link
                href="/dashboard/brands/new"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-400">+</span>
                <span>Add new brand</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
