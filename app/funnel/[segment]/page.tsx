import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import type { FunnelSegment } from '@/types/funnel'
import { SEGMENTS, VALID_SEGMENTS } from '@/lib/segments'
import { SegmentCTAButton } from './SegmentCTAButton'
import { AdvisorTrustStrip } from '@/components/funnel/AdvisorTrustStrip'
import { HnwLegacyComparison } from '@/components/funnel/HnwLegacyComparison'
import { FunnelHowItWorks } from '@/components/funnel/FunnelHowItWorks'
import { ReportFAQ } from '@/components/funnel/ReportFAQ'
import { SocialProofSection } from '@/components/funnel/SocialProofSection'

type Props = { params: Promise<{ segment: string }> }

const CREDIBILITY: Record<'default' | 'hnw', { title: string; body: string }> = {
  default: {
    title: "I know exactly where a lot of you are right now. I've been there.",
    body: 'Earning good money, feeling behind, not knowing where to start. This check exists so you can see your real picture in 2 minutes, for free. No pressure. No sales pitch. Just clarity.',
  },
  hnw: {
    title: 'I work with families who have built something worth protecting.',
    body: 'You have spent years building this. This confidential assessment exists so you can see, in 2 minutes, exactly where your estate is exposed, before it becomes your family\'s problem. No pressure. Just clarity.',
  },
}

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

  const seg = segment as FunnelSegment
  const config = SEGMENTS[seg]
  const isHnw = seg === 'hnw'
  const credibility = isHnw ? CREDIBILITY.hnw : CREDIBILITY.default
  const closingLead = isHnw ? 'Begin your confidential assessment.' : 'Ready? It takes about 2 minutes.'

  return (
    <main className="relative min-h-screen flex flex-col bg-navy-gradient pt-24 pb-16 overflow-hidden">
      <div className="relative z-10 w-full space-y-12">
        {/* Hero */}
        <div className="max-w-lg mx-auto w-full px-6 space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-sans uppercase tracking-widest">
            {config.badge}
          </div>

          <div className="space-y-4">
            <h1 className="font-serif text-3xl md:text-4xl text-white leading-tight">
              {config.headline}{' '}
              <span className="text-gold">{config.accent}</span>
            </h1>
            <p className="font-sans text-base text-white/50 leading-relaxed">
              {config.sub}
            </p>
          </div>

          <SegmentCTAButton segment={segment} cta={config.cta} />
        </div>

        {/* How it works */}
        <div className="max-w-lg mx-auto w-full px-6 space-y-4">
          <p className="font-sans text-xs text-white/40 uppercase tracking-widest">What to expect</p>
          <FunnelHowItWorks segment={seg} />
        </div>

        {/* HNW comparison */}
        {isHnw && (
          <div className="max-w-lg mx-auto w-full px-6">
            <HnwLegacyComparison />
          </div>
        )}

        {/* Advisor credibility + trust strip */}
        <div className="max-w-lg mx-auto w-full px-6 space-y-5">
          <div className="bg-gold/5 border border-gold/20 rounded-2xl px-6 py-5 space-y-2.5">
            <p className="font-serif text-lg md:text-xl text-white leading-snug">
              {credibility.title}
            </p>
            <p className="font-sans text-sm text-white/60 leading-relaxed">
              {credibility.body}
            </p>
          </div>
          <AdvisorTrustStrip interactive cta={config.cta} segment={seg} />
        </div>

        {/* FAQ */}
        <ReportFAQ segment={seg} />

        {/* Social proof (renders nothing until testimonials exist) */}
        <SocialProofSection />

        {/* Closing CTA */}
        <div className="max-w-lg mx-auto w-full px-6 space-y-3">
          <p className="text-center font-sans text-sm text-white/50">{closingLead}</p>
          <SegmentCTAButton segment={segment} cta={config.cta} />
        </div>

        <p className="max-w-lg mx-auto w-full px-6 text-xs text-white/25 leading-relaxed">
          Safety Margin
        </p>
      </div>
    </main>
  )
}
