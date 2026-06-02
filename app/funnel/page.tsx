'use client'

import { useRouter } from 'next/navigation'
import type { FunnelSegment } from '@/types/funnel'

const SEGMENT_CHOICES: Array<{ segment: FunnelSegment; emoji: string; label: string; sub: string }> = [
  { segment: 'pro', emoji: '👔', label: 'Young Professional', sub: 'Building my career and savings' },
  { segment: 'family', emoji: '👨‍👩‍👧', label: 'Parent / Provider', sub: 'Supporting my family' },
  { segment: 'ofw', emoji: '✈️', label: 'OFW', sub: 'Working abroad for my family' },
  { segment: 'entrepreneur', emoji: '💼', label: 'Self-Employed', sub: 'Freelancer or solo business' },
  { segment: 'business', emoji: '🏢', label: 'Business Owner', sub: 'I run an established business' },
  { segment: 'hnw', emoji: '💎', label: 'Building a Legacy', sub: 'Focused on wealth & estate' },
]

export default function FunnelLandingPage() {
  const router = useRouter()

  function choose(segment: FunnelSegment) {
    try {
      sessionStorage.setItem('sma_funnel_answers', JSON.stringify({ segment }))
    } catch {
      // ignore
    }
    router.push('/funnel/step/1')
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-navy-gradient px-6 py-16 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md mx-auto w-full space-y-8 text-center">
        {/* Badge */}
        <div className="inline-block px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-sans uppercase tracking-widest">
          Free · 2 minutes · No commitment
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="font-serif text-3xl md:text-4xl text-white leading-tight">
            Which best describes <span className="text-gold">you?</span>
          </h1>
          <p className="font-sans text-sm text-white/50 leading-relaxed">
            We&apos;ll tailor your free Financial Protection Check to your situation.
          </p>
        </div>

        {/* Segment choices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SEGMENT_CHOICES.map((c) => (
            <button
              key={c.segment}
              onClick={() => choose(c.segment)}
              className="group flex items-center gap-3 text-left px-4 py-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-gold/40 hover:bg-white/[0.07] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            >
              <span className="text-2xl shrink-0">{c.emoji}</span>
              <span className="min-w-0">
                <span className="block font-sans text-sm font-semibold text-white group-hover:text-gold transition-colors">
                  {c.label}
                </span>
                <span className="block font-sans text-xs text-white/40 leading-snug">{c.sub}</span>
              </span>
            </button>
          ))}
        </div>

        <p className="text-xs text-white/25 leading-relaxed">
          Powered by Sun Life of Canada Philippines, Inc. — Neem Tree Branch
        </p>
      </div>
    </main>
  )
}
