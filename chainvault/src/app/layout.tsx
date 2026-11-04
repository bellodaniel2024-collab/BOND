import type { Metadata } from 'next'
import { Inter, Manrope } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { ThemeScript } from '@/components/providers/ThemeScript'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'BOND — Secure Non-Custodial Cryptocurrency Transactions',
    template: '%s | BOND',
  },
  description:
    'Send and receive cryptocurrency directly from your own wallet. Non-custodial, transparent, and secure. You control your keys.',
  keywords: [
    'cryptocurrency',
    'non-custodial',
    'blockchain',
    'ethereum',
    'wallet',
    'secure transactions',
    'defi',
  ],
  authors: [{ name: 'BOND' }],
  creator: 'BOND',
  metadataBase: new URL(process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'BOND — Secure Non-Custodial Cryptocurrency Transactions',
    description: 'You control your keys. We never touch your funds.',
    siteName: 'BOND',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BOND',
    description: 'Secure non-custodial cryptocurrency transactions.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script to set dark/light class before first render — prevents flash */}
        <ThemeScript />
      </head>
      <body
        className={`${inter.variable} ${manrope.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
