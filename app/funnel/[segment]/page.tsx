import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import type { FunnelSegment } from '@/types/funnel'
import { SEGMENTS, VALID_SEGMENTS } from '@/lib/segments'
import { SegmentCTAButton } from './SegmentCTAButton'
import { HnwLegacyComparison } from '@/components/funnel/HnwLegacyComparison'
import { FunnelHowItWorks } from '@/components/funnel/FunnelHowItWorks'
import { ReportFAQ } from '@/components/funnel/ReportFAQ'
import { FAQS, HNW_FAQS } from '@/lib/report-faqs'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { AdvisorStory } from '@/components/landing/AdvisorStory'
import { GridOverlay } from '@/components/landing/GridOverlay'

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
      images: [{ url: `/og-${segment}.jpg`, width: 1200, height: 630, alt: config.metaTitle }],
    },
    twitter: {
      title: config.metaTitle,
      description: config.metaDescription,
      images: [`/og-${segment}.jpg`],
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
  const closingLead = isHnw ? 'Begin your confidential assessment.' : 'Ready? It takes about 2 minutes.'

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (isHnw ? HNW_FAQS : FAQS).map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <main className="relative min-h-screen flex flex-col bg-navy-gradient">
      <GridOverlay />

      <SiteHeader />

      {/* Hero — segment hook in place of the landing chooser */}
      <section className="relative z-10 px-6 pt-12 pb-10 md:px-12 text-center">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="inline-block px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-sans uppercase tracking-widest">
            {config.badge}
          </div>
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight tracking-tight">
            {config.headline}{' '}
            <span className="text-gold">{config.accent}</span>
          </h1>
          <p className="font-sans text-lg text-white/50 leading-relaxed">
            {config.sub}
          </p>
          <div className="max-w-md mx-auto pt-2">
            <SegmentCTAButton segment={segment} cta={config.cta} />
          </div>
          <p className="font-sans text-xs text-white/50 pt-1">
            This tool is for educational guidance only. Results must be validated through an official proposal and consultation with a licensed advisor.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 border-t border-white/5 px-6 py-12 md:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="md:ml-[12%]">
            <FunnelHowItWorks segment={seg} />
          </div>
        </div>
      </section>

      {/* HNW comparison */}
      {isHnw && (
        <section className="relative z-10 border-t border-white/5 px-6 py-12 md:px-12">
          <div className="max-w-3xl mx-auto md:ml-[12%]">
            <HnwLegacyComparison />
          </div>
        </section>
      )}

      {/* Who is Jojo — full story + callout */}
      <AdvisorStory segment={seg} />

      {/* FAQ */}
      <section className="relative z-10 border-t border-white/5 px-6 py-12 md:px-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd)
              .replace(/</g, '\\u003c')
              .replace(/>/g, '\\u003e'),
          }}
        />
        <ReportFAQ segment={seg} />
      </section>

      {/* Closing CTA */}
      <section className="relative z-10 border-t border-white/5 px-6 py-14 md:px-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <p className="font-serif text-xl md:text-2xl text-white leading-snug">{closingLead}</p>
          <SegmentCTAButton segment={segment} cta={config.cta} />
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
