'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FunnelSegment } from '@/types/funnel'
import { SEGMENTS } from '@/lib/segments'
import type { IconProps } from '@/components/ui/icons'
import {
  BriefcaseIcon,
  FamilyIcon,
  PlaneIcon,
  LaptopIcon,
  BuildingIcon,
  GemIcon,
} from '@/components/ui/icons'

const SEGMENT_ICONS: Record<FunnelSegment, (p: IconProps) => React.ReactElement> = {
  pro: BriefcaseIcon,
  family: FamilyIcon,
  ofw: PlaneIcon,
  entrepreneur: LaptopIcon,
  business: BuildingIcon,
  hnw: GemIcon,
}

const SEGMENT_LABELS: Record<FunnelSegment, string> = {
  pro: 'Young Professional',
  family: 'Parent / Provider',
  ofw: 'OFW',
  entrepreneur: 'Self-Employed',
  business: 'Business Owner',
  hnw: 'Building a Legacy',
}

export function SegmentGrid() {
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

  const segments = Object.keys(SEGMENTS) as FunnelSegment[]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl mx-auto">
      {segments.map((segment) => {
        const Icon = SEGMENT_ICONS[segment]
        const config = SEGMENTS[segment]
        const isLoading = selecting === segment

        return (
          <button
            key={segment}
            onClick={() => choose(segment)}
            disabled={selecting !== null}
            className="group flex flex-col gap-4 text-left px-5 py-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-gold/40 hover:bg-white/[0.07] transition-[background-color,border-color,opacity] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:cursor-wait"
          >
            {/* Label with inline icon — no boxed tile */}
            <div className="flex items-center gap-2">
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-gold/30 border-t-gold rounded-full animate-spin shrink-0" />
              ) : (
                <span className="text-gold/50 shrink-0 group-hover:text-gold/80 transition-[color] duration-200">
                  <Icon size={14} strokeWidth={1.75} />
                </span>
              )}
              <span className="font-sans text-xs text-white/50 uppercase tracking-wider group-hover:text-gold/70 transition-[color] duration-200">
                {SEGMENT_LABELS[segment]}
              </span>
            </div>

            {/* Headline */}
            <p className="font-serif text-base text-white leading-snug">
              {config.headline}{' '}
              <span className="text-gold">{config.accent}</span>
            </p>

            {/* Start CTA */}
            <span className="font-sans text-xs text-white/40 group-hover:text-gold/70 transition-[color] duration-200">
              Start Free Check →
            </span>
          </button>
        )
      })}
    </div>
  )
}
