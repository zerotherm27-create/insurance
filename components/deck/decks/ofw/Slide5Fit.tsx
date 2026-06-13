'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Beat 5 — Frame + Fit. Protection back home is the foundation of the whole dream.
// Coverage TYPES only; tapping a row future-paces coming home on their terms.
const FITS = [
  {
    goal: 'Protect the people I send money to',
    type: 'Income and life protection',
    does: 'If anything happens to you abroad, this replaces the support you send, so the people at home keep going.',
  },
  {
    goal: 'Guard against a serious illness',
    type: 'A health and critical illness plan',
    does: 'A cash fund the moment a major illness is diagnosed, so a hospital bill abroad never drains what you saved for home.',
  },
  {
    goal: 'Build my comeback fund',
    type: 'A plan that pairs protection with growth',
    does: 'Protection now and a growing fund for later, so coming home for good is a plan, not just a wish.',
  },
  {
    goal: 'Start with something affordable',
    type: 'An affordable starter protection plan',
    does: 'Essential cover at a low entry cost while you are working and insurable, with room to grow each contract.',
  },
]

export function Slide5Fit() {
  const [open, setOpen] = useState(0)

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          Protection back home is the
          <br />
          <span className="text-gold">foundation of the dream.</span>
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
        Picture it: you come home for good, on your own terms, with the people you left for waiting and well.
      </p>
    </div>
  )
}
