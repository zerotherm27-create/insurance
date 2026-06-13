'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Beat 4 — The Cost of Waiting. Grounded urgency: insurability is a window, not a
// guarantee. The toggle lets them feel the door narrowing.
const STATES = {
  today: {
    label: 'If you apply today',
    tone: 'text-emerald-400',
    ring: 'border-emerald-500/30 bg-emerald-500/5',
    lines: [
      'Approved at the lowest premium you will ever qualify for.',
      'Full choice of coverage, no exclusions.',
      'Locked in while you are healthy and insurable.',
    ],
  },
  wait: {
    label: 'If you wait',
    tone: 'text-red-400',
    ring: 'border-red-400/30 bg-red-400/5',
    lines: [
      'One diagnosis can mean a higher premium.',
      'Conditions can be excluded, or coverage declined.',
      'The door narrows a little more every year.',
    ],
  },
} as const

type StateKey = keyof typeof STATES

export function Slide4Now() {
  const [key, setKey] = useState<StateKey>('today')
  const s = STATES[key]

  return (
    <div className="max-w-3xl mx-auto w-full space-y-7">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          Protection is cheapest while
          <br />
          <span className="text-gold">you are still healthy.</span>
        </h2>
      </div>

      <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
        {(Object.keys(STATES) as StateKey[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKey(k)}
            aria-pressed={key === k}
            className={`px-5 py-2 rounded-lg font-sans text-sm transition-[background-color,color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 ${
              key === k ? 'bg-gold text-navy-dark font-medium' : 'text-white/50 hover:text-white/80'
            }`}
          >
            {STATES[k].label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className={`rounded-2xl border px-6 py-5 space-y-3 ${s.ring}`}
        >
          {s.lines.map((line) => (
            <div key={line} className="flex items-start gap-3">
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.tone.replace('text', 'bg')}`} />
              <p className="font-sans text-base text-white/75 leading-relaxed">{line}</p>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      <p className="font-sans text-sm text-white/40 italic">
        The healthiest you will ever be, for insurance purposes, is today.
      </p>
    </div>
  )
}
