import type { Metadata } from 'next'
import { FunnelSelectorClient } from './FunnelSelectorClient'

export const metadata: Metadata = {
  title: 'Which best describes you?',
  description: "We'll tailor your free Financial Protection Check to your situation. Free, 2-minute, no commitment.",
  alternates: { canonical: '/funnel' },
  openGraph: {
    title: 'Which best describes you? — Safety Margin',
    description: "We'll tailor your free Financial Protection Check to your situation.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Safety Margin — Financial Protection Check' }],
  },
  twitter: {
    title: 'Which best describes you? — Safety Margin',
    description: "We'll tailor your free Financial Protection Check to your situation.",
    images: ['/og-image.jpg'],
  },
}

export default function FunnelPage() {
  return <FunnelSelectorClient />
}
