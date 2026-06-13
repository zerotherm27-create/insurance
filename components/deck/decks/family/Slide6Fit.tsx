'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Beat 6 — The Fit. Coverage TYPES, never product names. Foundation (income/life)
// first. Tapping a row future-paces the protected outcome.
const FITS = [
  {
    goal: 'Replace your income',
    type: 'Income and life protection',
    does: 'The foundation for a family. If your income stops, this keeps the household running for years, not months.',
  },
  {
    goal: 'Guard against major illness',
    type: 'A health and critical illness plan',
    does: 'A cash fund the moment a serious illness is diagnosed, so treatment never competes with the grocery budget.',
  },
  {
    goal: 'Build their education fund',
    type: 'A plan that pairs protection with growth',
    does: 'Protection today, a growing fund for tomorrow, so their schooling is covered whether or not you are there to pay for it.',
  },
  {
    goal: 'Lock in affordable cover now',
    type: 'An affordable starter protection plan',
    does: 'Essential cover at a low entry cost while you are young and insurable, with room to grow as the family does.',
  },
]

export function Slide6Fit() {
  const [open, setOpen] = useState(0)

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          The right plan protects
          <br />
          <span className="text-gold">the right thing.</span>
        </h2>
        <p className="font-sans text-xs text-white/30">Tap each to see what it does.</p>
      </div>

      <div className="space-y-2.5">
        {FITS.map((f, i) => {
          const isOpen = open === i
          return (
            <div key={f.goal} className={`rounded-xl border transition-[border-color] ${isOpen ? 'border-gold/30' : 'border-white/10'}`}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-4 px-5 py-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 rounded-xl"
              >
                <span className="font-sans text-sm text-white/50 flex-1">{f.goal}</span>
                <span aria-hidden="true" className="text-gold/60 text-sm">→</span>
                <span className="font-sans text-sm font-medium text-white">{f.type}</span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="font-sans text-sm text-white/55 leading-relaxed px-5 pb-4">{f.does}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      <p className="font-sans text-sm text-white/50 leading-relaxed border-l-2 border-gold/40 pl-4">
        Picture it: their schooling finished, the home still theirs, life carrying on, even on a day you are not there to provide it.
      </p>
    </div>
  )
}
