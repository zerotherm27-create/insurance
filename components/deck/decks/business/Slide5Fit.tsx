'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Beat 5 — Frame + Fit. Continuity is the foundation under the business. Coverage
// TYPES only (key-person and buy-sell described, never named as products). Tapping
// a row future-paces a business that keeps running and a family kept out of it.
const FITS = [
  {
    goal: 'Keep the business running without me',
    type: 'Key-person protection',
    does: 'Pays the business cash when an owner or key person is lost, covering the gap while it stabilises or transitions.',
  },
  {
    goal: 'Let partners take over cleanly',
    type: 'A funded buy-sell arrangement',
    does: 'Puts cash in the right hands so partners can buy out your share at a fair, pre-agreed value, with no dispute.',
  },
  {
    goal: 'Keep business debt off my family',
    type: 'Loan and income protection',
    does: 'Clears personally guaranteed debt at the source, so the bank is settled and your family is never the fallback.',
  },
  {
    goal: 'Protect my own family and legacy',
    type: 'Income and life protection',
    does: 'Separate from the business entirely, so the people you love are provided for no matter what happens to it.',
  },
]

export function Slide5Fit() {
  const [open, setOpen] = useState(0)

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          Continuity is the foundation
          <br />
          <span className="text-gold">under everything you built.</span>
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
        Picture it: a day you are not there, and the business keeps its doors open, the team keeps their jobs, and your family keeps the home.
      </p>
    </div>
  )
}
