import type { Metadata } from 'next'
import { DiscoveryClient } from './DiscoveryClient'

export const metadata: Metadata = {
  title: 'Financial Discovery',
  description: 'A short, personalized financial protection discovery quiz.',
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Your Financial Protection Profile — Safety Margin',
    description: 'A short, personalized discovery quiz to see where you stand.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Safety Margin' }],
  },
  twitter: {
    title: 'Your Financial Protection Profile — Safety Margin',
    description: 'A short, personalized discovery quiz to see where you stand.',
    images: ['/og-image.jpg'],
  },
}

export default function DiscoveryPage() {
  return <DiscoveryClient />
}
