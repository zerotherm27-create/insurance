import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import type { FunnelSegment } from '@/types/funnel'
import { SegmentCTAButton } from './SegmentCTAButton'

interface SegmentConfig {
  badge: string
  headline: string
  accent: string
  sub: string
  cta: string
  metaTitle: string
  metaDescription: string
}

const SEGMENTS: Record<FunnelSegment, SegmentConfig> = {
  pro: {
    badge: 'Para sa Young Professionals · 2 minutes · Free',
    headline: 'May emergency fund ka na. May investments ka na.',
    accent: "But who covers your family's expenses kung may mangyari sa'yo?",
    sub: 'A free 2-minute Protection Check — find out the one gap most young professionals miss.',
    cta: 'Check My Protection →',
    metaTitle: 'Financial Protection Check for Young Professionals',
    metaDescription: 'Find out if your income and family are protected — even with investments in place. Free 2-minute check for Filipino professionals.',
  },
  family: {
    badge: 'Para sa mga Magulang · 2 minutes · Free',
    headline: 'Your kids trust you completely.',
    accent: "They don't know what you're building for them yet. One day, they will.",
    sub: 'Find out in 2 minutes if your family is truly protected — or just covered on paper.',
    cta: "Check My Family's Protection →",
    metaTitle: 'Financial Protection Check for Parents & Providers',
    metaDescription: 'Is your family truly protected — or just covered on paper? Free 2-minute financial check for Filipino parents and providers.',
  },
  ofw: {
    badge: 'Para sa mga OFW · 2 minutes · Free',
    headline: 'You left home because you love them.',
    accent: 'Make sure that love has a plan — even from 8,000 miles away.',
    sub: 'A free 2-minute check to find out if your family is fully covered, not just financially supported.',
    cta: 'Check My Protection →',
    metaTitle: 'Financial Protection Check for OFWs',
    metaDescription: 'Working abroad and want to make sure your family is fully protected? Free 2-minute financial check for Overseas Filipino Workers.',
  },
  entrepreneur: {
    badge: 'Para sa mga Negosyante · 2 minutes · Free',
    headline: 'You built the business. You ARE the business.',
    accent: "Who protects everything you've built if you can't show up?",
    sub: 'Most entrepreneurs insure their assets. Almost none insure their most important one. Find out where you stand.',
    cta: 'Check My Protection →',
    metaTitle: 'Financial Protection Check for Self-Employed Filipinos',
    metaDescription: 'Freelancer or solo business owner? Find out if you and your livelihood are truly protected. Free 2-minute check.',
  },
  business: {
    badge: 'Para sa Business Owners · 2 minutes · Free',
    headline: 'The businesses that survive their founders',
    accent: 'have one thing in common. It starts long before anything happens.',
    sub: 'A free 2-minute check to see if your personal financial protection matches what you have built.',
    cta: 'Check My Business Protection →',
    metaTitle: 'Financial Protection Check for Business Owners in the Philippines',
    metaDescription: 'Does your personal financial protection match what you have built? Free 2-minute check for Filipino business owners.',
  },
  hnw: {
    badge: 'For Established Families · Private · 2 minutes',
    headline: 'What you leave behind is not just wealth.',
    accent: 'It is a direction for everyone who comes after you.',
    sub: 'A confidential 2-minute assessment to identify gaps in your legacy and protection planning.',
    cta: 'Start My Assessment →',
    metaTitle: 'Legacy & Protection Assessment for Established Filipino Families',
    metaDescription: 'Identify gaps in your estate and legacy planning. A confidential 2-minute assessment for established families and high-net-worth individuals in the Philippines.',
  },
}

const VALID_SEGMENTS = new Set<string>(Object.keys(SEGMENTS))

type Props = { params: Promise<{ segment: string }> }

export function generateStaticParams() {
  return Object.keys(SEGMENTS).map((segment) => ({ segment }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segment } = await params
  const config = SEGMENTS[segment as FunnelSegment]
  if (!config) return {}
  return {
    title: config.metaTitle,
    description: config.metaDescription,
    openGraph: {
      title: config.metaTitle,
      description: config.metaDescription,
    },
    twitter: {
      title: config.metaTitle,
      description: config.metaDescription,
    },
    alternates: {
      canonical: `/funnel/${segment}`,
    },
  }
}

export default async function SegmentFunnelPage({ params }: Props) {
  const { segment } = await params

  if (!VALID_SEGMENTS.has(segment)) {
    redirect('/funnel')
  }

  const config = SEGMENTS[segment as FunnelSegment]

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-navy-gradient px-6 py-16 text-center overflow-hidden">
      <div className="relative z-10 max-w-md mx-auto space-y-8">
        {/* Badge */}
        <div className="inline-block px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-sans uppercase tracking-widest">
          {config.badge}
        </div>

        {/* Headline */}
        <div className="space-y-4">
          <h1 className="font-serif text-3xl md:text-4xl text-white leading-tight">
            {config.headline}{' '}
            <span className="text-gold">{config.accent}</span>
          </h1>
          <p className="font-sans text-base text-white/50 leading-relaxed">
            {config.sub}
          </p>
        </div>

        {/* CTA — client island for loading state */}
        <SegmentCTAButton segment={segment} cta={config.cta} />

        <p className="text-xs text-white/25 leading-relaxed">
          Powered by Sun Life of Canada Philippines, Inc. — Neem Tree Branch
        </p>
      </div>
    </main>
  )
}
