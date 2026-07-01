import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { NavLinks } from '@/components/nav-links'
import { LogoutButton } from '@/components/logout-button'
import { MobileNav } from '@/components/mobile-nav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-base font-semibold text-gray-900">🌿 SoloSEO</span>
            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <Suspense fallback={null}>
                <NavLinks />
              </Suspense>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LogoutButton />
            {/* Mobile hamburger */}
            <div className="md:hidden">
              <Suspense fallback={null}>
                <MobileNav />
              </Suspense>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  )
}
