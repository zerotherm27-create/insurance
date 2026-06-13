'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Beat 5 — Frame + Fit. Protect the engine before building higher. Coverage TYPES
// only; tapping a row future-paces a business that survives a year you cannot work.
const FITS = [
  {
    goal: 'Keep paying myself if I cannot work',
    type: 'Income and life protection',
    does: 'Pays you a benefit when illness or injury stops you, so the bills, and the people who rely on you, are covered while you recover.',
  },
  {
    goal: 'Survive a major illness',
    type: 'A health and critical illness plan',
    does: 'A lump-sum cash fund on diagnosis, so a hospital stay does not become a business shutdown.',
  },
  {
    goal: 'Build my own retirement',
    type: 'A plan that pairs protection with growth',
    does: 'No employer is funding your retirement. This protects you now and builds a fund only you are responsible for.',
  },
  {
    goal: 'Start lean while cash flow is tight',
    type: 'An affordable starter protection plan',
    does: 'Essential cover at a low entry cost, locked in while you are insurable, with room to scale as the business grows.',
  },
]

export function Slide5Fit() {
  const [open, setOpen] = useState(0)

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          Protect the engine
          <br />
          <span className="text-gold">before you build higher.</span>
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
        Picture it: a year you cannot work, and the business, and your family, carry on without missing a beat.
      </p>
    </div>
  )
}
