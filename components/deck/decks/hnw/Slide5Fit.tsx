'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Beat 5 — Frame + Fit. The structure is the legacy. Coverage TYPES only, in the
// discreet register the HNW audience expects. Future-paces heirs receiving cleanly.
const FITS = [
  {
    goal: 'Cover the estate tax in cash',
    type: 'An estate liquidity plan',
    does: 'Creates tax-free cash precisely when it is needed, so the 6% is settled without touching the property, the shares, or the business.',
  },
  {
    goal: 'Transfer wealth cleanly',
    type: 'A guaranteed transfer plan',
    does: 'Moves a defined sum directly to named heirs, outside the probate process, privately and on your terms.',
  },
  {
    goal: 'Preserve the estate against erosion',
    type: 'A protection and preservation plan',
    does: 'Shields the estate from forced sales and delay, so what you built passes on at full value rather than discounted under pressure.',
  },
  {
    goal: 'Provide for a continuing legacy',
    type: 'A legacy and succession plan',
    does: 'Funds the next generation, a foundation, or a philanthropic intent, with the structure to keep it intact for decades.',
  },
]

export function Slide5Fit() {
  const [open, setOpen] = useState(0)

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          The structure is the legacy.
          <br />
          <span className="text-gold">Not the size.</span>
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
        Picture it: your heirs receive what you intended, privately and intact, instead of spending years and fortunes to recover it.
      </p>
    </div>
  )
}
