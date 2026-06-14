'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Beat 2 — The Unseen Risk. Probate is a public court process that can freeze an
// estate for years. The interactive timeline lets them walk it and feel the freeze.
const PHASES = [
  { id: 'today', label: 'Today', at: 4, frozen: false, detail: 'The estate is intact and fully in your control. This is the only window in which it can be structured.' },
  { id: 'passing', label: 'Passing', at: 26, frozen: false, detail: 'The moment it happens, banks freeze the accounts. Even your spouse cannot simply withdraw.' },
  { id: 'probate', label: 'Probate', at: 60, frozen: true, detail: 'A public court process that commonly runs one to five years. Assets are locked, legal fees mount, and the proceedings are on the record for anyone to see.' },
  { id: 'release', label: 'Release', at: 94, frozen: false, detail: 'Only what survives the delay, the fees, and the tax is finally distributed, years after it was needed.' },
]

export function Slide2Probate() {
  const [active, setActive] = useState('probate')
  const phase = PHASES.find((p) => p.id === active)!

  return (
    <div className="max-w-3xl mx-auto w-full space-y-7">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          Probate can freeze everything.
          <br />
          <span className="text-gold">For years.</span>
        </h2>
        <p className="font-sans text-xs text-white/30">Walk the timeline.</p>
      </div>

      <div className="px-2 pt-8 pb-2">
        <div className="relative h-1 rounded-full bg-white/10">
          {/* frozen span */}
          <div className="absolute top-0 h-1 rounded-full bg-red-400/40" style={{ left: '26%', width: '34%' }} />
          {PHASES.map((p) => {
            const on = active === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActive(p.id)}
                aria-pressed={on}
                aria-label={p.label}
                className="absolute -top-2 -translate-x-1/2 focus:outline-none group"
                style={{ left: `${p.at}%` }}
              >
                <span className={`block w-5 h-5 rounded-full border-2 transition-[background-color,border-color] ${on ? 'bg-gold border-gold' : p.frozen ? 'bg-navy border-red-400/60' : 'bg-navy border-white/40 group-hover:border-gold/60'}`} />
                <span className={`absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-sans text-[11px] ${on ? 'text-gold' : 'text-white/40'}`}>{p.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={phase.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className={`rounded-2xl border px-6 py-5 ${phase.frozen ? 'border-red-400/30 bg-red-400/5' : 'border-white/10 bg-white/[0.03]'}`}
        >
          <p className="font-sans text-sm text-white/70 leading-relaxed">{phase.detail}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
