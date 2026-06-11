'use client'

import { useState } from 'react'
import type { CoverageBenefit } from '@/types/funnel'
import { SnapshotIcon } from '@/components/ui/icons'
import { STATUS_CHIP, STATUS_ICON } from '@/components/funnel/BenefitRow'

function AccordionItem({ benefit }: { benefit: CoverageBenefit }) {
  const [open, setOpen] = useState(false)
  const chip = STATUS_CHIP[benefit.status]

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full p-5 flex items-start justify-between gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 rounded-lg"
      >
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <span className="mt-0.5 flex-shrink-0">
            <SnapshotIcon icon={STATUS_ICON[benefit.status]} />
          </span>
          <p className="font-sans text-sm font-medium text-white/90 leading-snug">{benefit.name}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`px-2.5 py-0.5 rounded-full border text-[11px] font-sans font-medium whitespace-nowrap ${chip.className}`}
          >
            {chip.label}
          </span>
          <svg
            className={`w-4 h-4 text-white/30 transition-[transform] duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 pl-12 space-y-1">
          <p className="font-sans text-xs text-white/45 leading-relaxed">
            <span className="text-gold/80">{benefit.idealLabel ?? 'Ideal coverage'}:</span>{' '}
            {benefit.idealAmount}
          </p>
          {benefit.starterAmount && (
            <p className="font-sans text-xs text-white/45 leading-relaxed">
              <span className="text-gold/50">{benefit.starterLabel ?? 'Starter coverage'}:</span>{' '}
              {benefit.starterAmount}
            </p>
          )}
          {benefit.whyItMatters && (
            <p className="font-sans text-xs text-white/55 leading-relaxed pt-1">{benefit.whyItMatters}</p>
          )}
        </div>
      )}
    </div>
  )
}

export function BenefitAccordion({ benefits }: { benefits: CoverageBenefit[] }) {
  return (
    <div className="bg-navy-card border border-white/5 rounded-2xl divide-y divide-white/5">
      <div className="p-5 pb-0 space-y-1">
        <p className="font-sans text-xs text-white/40 uppercase tracking-widest">Your Coverage Benefits</p>
        <p className="font-sans text-[11px] text-gold/60">Tap each benefit to see your recommended amounts</p>
      </div>
      {benefits.map((b) => (
        <AccordionItem key={b.id} benefit={b} />
      ))}
    </div>
  )
}
