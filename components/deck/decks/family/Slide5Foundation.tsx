'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

// Beat 5 — The Frame. Everything the family values rests on one base: a protected
// income. Toggling the foundation off destabilises the whole stack, making
// "foundation first" something they see rather than hear.
const LAYERS = ['Their future', 'Their education', 'Daily life and food', 'The home']

export function Slide5Foundation() {
  const [protectedOn, setProtectedOn] = useState(true)

  return (
    <div className="max-w-3xl mx-auto w-full space-y-7">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          Everything they have
          <br />
          <span className="text-gold">rests on one thing.</span>
        </h2>
        <p className="font-sans text-xs text-white/30">Toggle the foundation.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-2">
          {LAYERS.map((layer, i) => (
            <motion.div
              key={layer}
              className="rounded-xl border px-5 py-3.5 font-sans text-sm"
              animate={
                protectedOn
                  ? { opacity: 1, x: 0, borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }
                  : { opacity: 0.4, x: [0, -6, 5, -3, 0][i] ?? 0, borderColor: 'rgba(248,113,113,0.25)', color: 'rgba(255,255,255,0.4)' }
              }
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
            >
              {layer}
            </motion.div>
          ))}

          {/* Foundation */}
          <motion.div
            className="rounded-xl px-5 py-4 font-sans text-sm font-semibold flex items-center justify-between"
            animate={
              protectedOn
                ? { backgroundColor: '#F6B21A', color: '#0A1628' }
                : { backgroundColor: 'rgba(248,113,113,0.15)', color: 'rgba(248,113,113,0.9)' }
            }
            transition={{ duration: 0.4 }}
          >
            <span>{protectedOn ? 'Your income, protected' : 'Your income, unprotected'}</span>
            <span className="text-xs opacity-70">{protectedOn ? 'stable' : 'at risk'}</span>
          </motion.div>
        </div>

        <div className="space-y-5">
          <p className="font-sans text-base text-white/60 leading-relaxed">
            {protectedOn
              ? 'With the foundation secure, everything above it stays standing, no matter what.'
              : 'Take the foundation away and everything resting on it starts to shake. The future, the schooling, the home.'}
          </p>
          <button
            type="button"
            onClick={() => setProtectedOn((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-5 py-2.5 font-sans text-sm text-gold hover:bg-gold/10 transition-[background-color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
          >
            {protectedOn ? 'Remove the foundation' : 'Restore the foundation'}
          </button>
        </div>
      </div>
    </div>
  )
}
