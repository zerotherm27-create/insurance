import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://insurance-ruby-delta.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Safety Margin Advisor — Your Free Financial Protection Score',
    template: '%s · Safety Margin Advisor',
  },
  description:
    'Most Filipinos believe they are protected. Few actually know. Take the free 2-minute Financial Protection Check and see exactly where you and your family stand — at any stage of life.',
  applicationName: 'Safety Margin Advisor',
  keywords: [
    'financial protection Philippines',
    'insurance check Filipino',
    'protection score',
    'OFW financial planning',
    'family income protection',
    'estate planning Philippines',
    'Sun Life advisor',
    'financial needs analysis',
  ],
  authors: [{ name: 'Jojo Cruzado — Sun Life, Neem Tree Branch' }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_PH',
    url: SITE_URL,
    siteName: 'Safety Margin Advisor',
    title: "What's Your Financial Protection Score?",
    description:
      'A free, 2-minute check that shows exactly where you and your family stand — tailored to your stage of life.',
  },
  twitter: {
    card: 'summary_large_image',
    title: "What's Your Financial Protection Score?",
    description:
      'Free 2-minute Financial Protection Check for Filipinos — at any stage of life.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-PH" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-navy-dark antialiased">
        {children}
      </body>
    </html>
  )
}
