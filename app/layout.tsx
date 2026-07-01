import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const geist = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'SoloSEO',
  description: 'Automated multilingual SEO content publishing',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
