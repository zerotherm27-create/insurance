import type { Metadata } from 'next'
import { ResultsClient } from './ResultsClient'

export const metadata: Metadata = {
  title: 'Your Financial Protection Analysis',
  description: 'Your personalized financial protection analysis and recommendations.',
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Financial Protection Analysis — Safety Margin',
    description: 'Your personalized financial protection score and recommendations.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Safety Margin' }],
  },
  twitter: {
    title: 'Financial Protection Analysis — Safety Margin',
    description: 'Your personalized financial protection score and recommendations.',
    images: ['/og-image.jpg'],
  },
}

export default function ResultsPage() {
  return <ResultsClient />
}
