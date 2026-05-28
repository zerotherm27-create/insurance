'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { FunnelSegment } from '@/types/funnel'

interface SegmentConfig {
  badge: string
  headline: string
  accent: string
  sub: string
  cta: string
}

const SEGMENTS: Record<FunnelSegment, SegmentConfig> = {
  pro: {
    badge: 'Para sa Young Professionals · 2 minutes · Free',
    headline: 'May emergency fund ka na. May investments ka na.',
    accent: "But who covers your family's expenses kung may mangyari sa'yo?",
    sub: 'A free 2-minute Protection Check — find out the one gap most young professionals miss.',
    cta: 'CHECK MY PROTECTION →',
  },
  family: {
    badge: 'Para sa mga Magulang · 2 minutes · Free',
    headline: 'Your kids trust you completely.',
    accent: "They don't know what you're building for them yet. One day, they will.",
    sub: 'Find out in 2 minutes if your family is truly protected — or just covered on paper.',
    cta: "CHECK MY FAMILY'S PROTECTION →",
  },
  ofw: {
    badge: 'Para sa mga OFW · 2 minutes · Free',
    headline: 'You left home because you love them.',
    accent: 'Make sure that love has a plan — even from 8,000 miles away.',
    sub: 'A free 2-minute check to find out if your family is fully covered, not just financially supported.',
    cta: 'CHECK MY PROTECTION →',
  },
  entrepreneur: {
    badge: 'Para sa mga Negosyante · 2 minutes · Free',
    headline: 'You built the business. You ARE the business.',
    accent: "Who protects everything you've built if you can't show up?",
    sub: 'Most entrepreneurs insure their assets. Almost none insure their most important one. Find out where you stand.',
    cta: 'CHECK MY PROTECTION →',
  },
  business: {
    badge: 'Para sa Business Owners · 2 minutes · Free',
    headline: 'The businesses that survive their founders',
    accent: 'have one thing in common. It starts long before anything happens.',
    sub: 'A free 2-minute check to see if your personal financial protection matches what you have built.',
    cta: 'CHECK MY BUSINESS PROTECTION →',
  },
  hnw: {
    badge: 'For Established Families · Private · 2 minutes',
    headline: 'What you leave behind is not just wealth.',
    accent: 'It is a direction for everyone who comes after you.',
    sub: 'A confidential 2-minute assessment to identify gaps in your legacy and protection planning.',
    cta: 'START MY ASSESSMENT →',
  },
}

const VALID_SEGMENTS = new Set<string>(Object.keys(SEGMENTS))

export default function SegmentFunnelPage() {
  const params = useParams()
  const router = useRouter()
  const segment = params.segment as string

  const config = VALID_SEGMENTS.has(segment) ? SEGMENTS[segment as FunnelSegment] : null

  useEffect(() => {
    if (!config) {
      router.replace('/funnel')
    }
  }, [config, router])

  if (!config) return null

  function handleStart() {
    try {
      sessionStorage.setItem('sma_funnel_answers', JSON.stringify({ segment }))
    } catch {
      // ignore storage errors
    }
    router.push('/funnel/step/1')
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-navy-gradient px-6 py-16 text-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-3xl" />
      </div>

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

        {/* CTA */}
        <button
          onClick={handleStart}
          className="inline-flex items-center justify-center w-full px-8 py-4 text-lg rounded-xl font-sans font-semibold tracking-wide bg-gold text-navy-dark hover:bg-gold-soft shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          {config.cta}
        </button>

        <p className="text-xs text-white/25 leading-relaxed">
          Powered by Sun Life of Canada Philippines, Inc. — Neem Tree Branch
        </p>
      </div>
    </main>
  )
}
