'use client'

import { useState } from 'react'

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: 'Is the consultation free?',
    a: 'Yes, completely free. It is a 30-minute conversation, and there is no fee at any point.',
  },
  {
    q: 'What actually happens inside the session?',
    a: 'Jojo walks you through your report, answers your questions, and shows you which coverage types fit your situation and budget. You will leave with a clear picture of your options, whether or not you do anything next.',
  },
  {
    q: 'Am I required to purchase a plan after the session?',
    a: 'No. There is no obligation to buy anything. Many people use the session simply to understand where they stand.',
  },
  {
    q: 'Who am I going to speak with?',
    a: 'Jojo Cruzado, a licensed insurance advisor. He personally handles every consultation, no handoffs.',
  },
  {
    q: 'Is this an official insurance proposal?',
    a: 'No. Your report is educational. Exact coverage amounts and premiums must be validated through an official proposal and consultation with a licensed advisor, which is what the free session is for.',
  },
]

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
          className={`w-4 h-4 flex-shrink-0 text-white/30 transition-[transform] duration-200 ${open ? 'rotate-180' : ''}`}
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

export function ReportFAQ() {
  return (
    <div className="max-w-lg mx-auto w-full px-6">
      <div className="bg-navy-card border border-white/5 rounded-2xl divide-y divide-white/5">
        <div className="p-5 pb-3">
          <p className="font-sans text-xs text-white/40 uppercase tracking-widest">Questions, answered</p>
        </div>
        {FAQS.map((f) => (
          <FAQItem key={f.q} q={f.q} a={f.a} />
        ))}
      </div>
    </div>
  )
}
