'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Beat 4 — The Exposure. The same estate, two routes. The toggle contrasts the
// open court with a structured, liquid transfer.
const PATHS = {
  without: {
    label: 'Without a plan',
    tone: 'text-red-400',
    steps: ['Accounts freeze', 'Public probate, one to five years', 'Heirs scramble for tax cash', 'Assets sold under pressure', 'What remains, distributed late'],
  },
  with: {
    label: 'With a structured plan',
    tone: 'text-emerald-400',
    steps: ['Liquidity is ready on day one', 'Transfer bypasses probate', 'Estate tax paid on time', 'Assets stay intact', 'Heirs receive, privately and whole'],
  },
} as const

type Key = keyof typeof PATHS

export function Slide4Path() {
  const [key, setKey] = useState<Key>('without')
  const p = PATHS[key]

  return (
    <div className="max-w-3xl mx-auto w-full space-y-7">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          The same estate.
          <br />
          <span className="text-gold">Two very different routes.</span>
        </h2>
      </div>

      <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
        {(Object.keys(PATHS) as Key[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKey(k)}
            aria-pressed={key === k}
            className={`px-5 py-2 rounded-lg font-sans text-sm transition-[background-color,color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 ${
              key === k ? 'bg-gold text-navy-dark font-medium' : 'text-white/50 hover:text-white/80'
            }`}
          >
            {PATHS[k].label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.ol
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-2.5"
        >
          {p.steps.map((step, i) => (
            <motion.li
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/[0.03] px-5 py-3"
            >
              <span className={`font-serif text-sm ${p.tone}`}>{String(i + 1).padStart(2, '0')}</span>
              <span className="font-sans text-sm text-white/75">{step}</span>
            </motion.li>
          ))}
        </motion.ol>
      </AnimatePresence>
    </div>
  )
}
