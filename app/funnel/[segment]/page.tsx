import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import type { FunnelSegment } from '@/types/funnel'
import { SEGMENTS, VALID_SEGMENTS } from '@/lib/segments'
import { SegmentCTAButton } from './SegmentCTAButton'
import { AdvisorTrustStrip } from '@/components/funnel/AdvisorTrustStrip'
import { HnwLegacyComparison } from '@/components/funnel/HnwLegacyComparison'

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
    redirect('/')
  }

  const config = SEGMENTS[segment as FunnelSegment]

  return (
    <main className="relative min-h-screen flex flex-col bg-navy-gradient px-6 pt-24 pb-16 overflow-hidden">
      <div className="relative z-10 max-w-lg mx-auto space-y-8">
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

        {segment === 'hnw' && <HnwLegacyComparison />}

        <AdvisorTrustStrip interactive cta={config.cta} segment={segment} />

        <p className="text-xs text-white/25 leading-relaxed">
          Safety Margin
        </p>
      </div>
    </main>
  )
}
