'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FunnelSegment } from '@/types/funnel'
import type { IconProps } from '@/components/ui/icons'
import {
  BriefcaseIcon,
  FamilyIcon,
  PlaneIcon,
  LaptopIcon,
  BuildingIcon,
  GemIcon,
} from '@/components/ui/icons'

const SEGMENT_CHOICES: Array<{
  segment: FunnelSegment
  Icon: (p: IconProps) => React.ReactElement
  label: string
  sub: string
}> = [
  { segment: 'pro', Icon: BriefcaseIcon, label: 'Young Professional', sub: 'Building my career and savings' },
  { segment: 'family', Icon: FamilyIcon, label: 'Parent / Provider', sub: 'Supporting my family' },
  { segment: 'ofw', Icon: PlaneIcon, label: 'OFW', sub: 'Working abroad for my family' },
  { segment: 'entrepreneur', Icon: LaptopIcon, label: 'Self-Employed', sub: 'Freelancer or solo business' },
  { segment: 'business', Icon: BuildingIcon, label: 'Business Owner', sub: 'I run an established business' },
  { segment: 'hnw', Icon: GemIcon, label: 'Building a Legacy', sub: 'Focused on wealth & estate' },
]

export default function FunnelLandingPage() {
  const router = useRouter()
  const [selecting, setSelecting] = useState<FunnelSegment | null>(null)

  function choose(segment: FunnelSegment) {
    setSelecting(segment)
    try {
      sessionStorage.setItem('sma_funnel_answers', JSON.stringify({ segment }))
    } catch {
      // ignore
    }
    router.push('/funnel/step/1')
  }

  return (
    <main className="relative min-h-screen flex flex-col bg-navy-gradient px-6 pt-24 pb-16 overflow-hidden">
      <div className="relative z-10 max-w-lg w-full space-y-8">
        {/* Badge */}
        <div className="inline-block px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-sans uppercase tracking-widest">
          Free · 2 minutes · No commitment
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="font-serif text-3xl md:text-4xl text-white leading-tight">
            Which best describes <span className="text-gold">you?</span>
          </h1>
          <p className="font-sans text-sm text-white/50 leading-relaxed max-w-sm">
            We&apos;ll tailor your free Financial Protection Check to your situation.
          </p>
        </div>

        {/* Segment choices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SEGMENT_CHOICES.map(({ segment, Icon, label, sub }) => {
            const isLoading = selecting === segment
            return (
              <button
                key={segment}
                onClick={() => choose(segment)}
                disabled={selecting !== null}
                className="group flex items-center gap-3.5 text-left px-4 py-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-gold/40 hover:bg-white/[0.07] transition-[background-color,border-color,opacity] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:cursor-wait"
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-2 mb-0.5">
                    {isLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-gold/30 border-t-gold rounded-full animate-spin shrink-0" />
                    ) : (
                      <span className="text-gold/50 shrink-0 group-hover:text-gold/80 transition-[color] duration-200">
                        <Icon size={13} strokeWidth={1.75} />
                      </span>
                    )}
                    <span className="block font-sans text-sm font-semibold text-white group-hover:text-gold transition-[color] duration-200">
                      {label}
                    </span>
                  </span>
                  <span className="block font-sans text-xs text-white/40 leading-snug pl-[1.375rem]">{sub}</span>
                </span>
              </button>
            )
          })}
        </div>

        <p className="text-xs text-white/25 leading-relaxed">
          Safety Margin
        </p>
      </div>
    </main>
  )
}
