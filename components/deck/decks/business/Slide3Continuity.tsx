'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Beat 3 — Make It Real. The owner picks the readiness state that matches them and
// sees the honest outcome. They place themselves on the spectrum.
type State = 'none' | 'informal' | 'funded'

const STATES: Record<State, { pick: string; verdict: string; tone: string; ring: string; detail: string }> = {
  none: {
    pick: 'No plan in place',
    verdict: 'It stops',
    tone: 'text-red-400',
    ring: 'border-red-400/30 bg-red-400/5',
    detail: 'Accounts freeze, payroll is missed, and the people who depended on the business scatter before anyone can act.',
  },
  informal: {
    pick: 'An informal understanding',
    verdict: 'It struggles',
    tone: 'text-gold',
    ring: 'border-gold/30 bg-gold/5',
    detail: 'Good intentions, but no funding and no document. Family and partners negotiate under pressure, and value leaks while they do.',
  },
  funded: {
    pick: 'Funded succession and key-person cover',
    verdict: 'It keeps running',
    tone: 'text-emerald-400',
    ring: 'border-emerald-500/30 bg-emerald-500/5',
    detail: 'Cash is there on day one. Partners buy out cleanly, loans are settled, payroll continues, and your family is not pulled into it.',
  },
}

export function Slide3Continuity() {
  const [state, setState] = useState<State>('none')
  const s = STATES[state]

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          If you could not be there
          <br />
          <span className="text-gold">on Monday?</span>
        </h2>
        <p className="font-sans text-xs text-white/30">Pick what is true today.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(STATES) as State[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setState(k)}
            aria-pressed={state === k}
            className={`px-4 py-2 rounded-lg font-sans text-sm transition-[background-color,color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 ${
              state === k ? 'bg-gold text-navy-dark font-medium' : 'border border-white/10 text-white/60 hover:text-white/90'
            }`}
          >
            {STATES[k].pick}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className={`rounded-2xl border px-6 py-6 space-y-2 ${s.ring}`}
        >
          <p className={`font-serif text-3xl ${s.tone}`}>{s.verdict}</p>
          <p className="font-sans text-sm text-white/65 leading-relaxed">{s.detail}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
