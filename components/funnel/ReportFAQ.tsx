'use client'

import { useState } from 'react'
import type { FunnelSegment } from '@/types/funnel'
import { FAQS, HNW_FAQS } from '@/lib/report-faqs'

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 rounded-lg"
      >
        <p className="font-sans text-sm text-white/80 leading-snug">{q}</p>
        <svg
          className={`w-4 h-4 flex-shrink-0 text-white/50 transition-[transform] duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <p className="px-5 pb-4 font-sans text-xs text-white/50 leading-relaxed">{a}</p>
      )}
    </div>
  )
}

export function ReportFAQ({ segment }: { segment?: FunnelSegment }) {
  const faqs = segment === 'hnw' ? HNW_FAQS : FAQS
  return (
    <div className="max-w-lg mx-auto w-full px-6">
      <div className="bg-navy-card border border-white/5 rounded-2xl divide-y divide-white/5">
        <div className="p-5 pb-3">
          <h2 className="font-sans text-xs text-white/50 uppercase tracking-widest">Questions, answered</h2>
        </div>
        {faqs.map((f) => (
          <FAQItem key={f.q} q={f.q} a={f.a} />
        ))}
      </div>
    </div>
  )
}
