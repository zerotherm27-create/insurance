import type { Metadata } from 'next'
import { ProtectionGapClient } from './ProtectionGapClient'

export const metadata: Metadata = {
  title: 'Protection Gap Calculator — DIME Method',
  description:
    'Calculate your life insurance, critical illness, education, retirement, and estate protection gaps using the DIME method. Free, no sign-up.',
  alternates: { canonical: '/protection-gap' },
  openGraph: {
    title: 'Protection Gap Calculator — Safety Margin',
    description: 'Calculate your full financial protection gap across life, health, education, retirement, and estate — free.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Safety Margin — Protection Gap Calculator' }],
  },
  twitter: {
    title: 'Protection Gap Calculator — Safety Margin',
    description: 'Calculate your full financial protection gap — free, no sign-up.',
    images: ['/og-image.jpg'],
  },
}

export default function ProtectionGapPage() {
  return <ProtectionGapClient />
}
