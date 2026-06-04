import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://safetymargin.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Safety Margin — Your Free Financial Protection Score',
    template: '%s · Safety Margin',
  },
  description:
    'Most Filipinos believe they are protected. Few actually know. Take the free 2-minute Financial Protection Check and see exactly where you and your family stand, at any stage of life.',
  applicationName: 'Safety Margin',
  keywords: [
    'financial protection Philippines',
    'insurance check Filipino',
    'protection score',
    'OFW financial planning',
    'family income protection',
    'estate planning Philippines',
    'financial advisor Philippines',
    'financial needs analysis',
  ],
  authors: [{ name: 'Jojo Cruzado' }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_PH',
    url: SITE_URL,
    siteName: 'Safety Margin',
    title: "What's Your Financial Protection Score?",
    description:
      'A free, 2-minute check that shows exactly where you and your family stand, tailored to your stage of life.',
  },
  twitter: {
    card: 'summary_large_image',
    title: "What's Your Financial Protection Score?",
    description:
      'Free 2-minute Financial Protection Check for Filipinos, at any stage of life.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Safety Margin — Financial Protection Check',
  url: SITE_URL,
  description:
    'A free, 2-minute financial protection quiz for Filipinos. Find out exactly where you and your family stand at any stage of life.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'PHP' },
  author: {
    '@type': 'Person',
    name: 'Jojo Cruzado',
    jobTitle: 'Licensed Financial Advisor',
    worksFor: { '@type': 'Organization', name: 'Safety Margin' },
  },
  inLanguage: 'en-PH',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-PH" className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd)
              .replace(/</g, '\\u003c')
              .replace(/>/g, '\\u003e'),
          }}
        />
      </head>
      <body className="min-h-screen bg-navy-dark antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
