'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircleIcon } from '@/components/ui/icons'

// Beat 4 — Reframe + urgency. The entrepreneur already insures the things that
// earn money. The one thing that earns it all is usually left uninsured. The
// reveal makes that gap obvious, and the close is "do it while you are insurable".
const ASSETS = ['Your phone and gadgets', 'Your vehicle', 'Your shop and equipment', 'Your stock and inventory']

export function Slide4Asset() {
  const [insured, setInsured] = useState(false)

  return (
    <div className="max-w-3xl mx-auto w-full space-y-7">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          You insure everything
          <br />
          <span className="text-gold">except the engine.</span>
        </h2>
      </div>

      <div className="space-y-2.5">
        {ASSETS.map((a) => (
          <div key={a} className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-3">
            <span className="text-emerald-400"><CheckCircleIcon size={18} /></span>
            <span className="font-sans text-sm text-white/70">{a}</span>
            <span className="ml-auto font-sans text-xs text-emerald-400/70">insured</span>
          </div>
        ))}

        {/* The one that earns it all */}
        <motion.div
          className="flex items-center gap-3 rounded-xl border px-5 py-4"
          animate={{
            borderColor: insured ? 'rgba(246,178,26,0.5)' : 'rgba(248,113,113,0.4)',
            backgroundColor: insured ? 'rgba(246,178,26,0.1)' : 'rgba(248,113,113,0.08)',
          }}
          transition={{ duration: 0.4 }}
        >
          <span style={{ color: insured ? '#F6B21A' : '#F87171' }}>
            <CheckCircleIcon size={20} />
          </span>
          <span className="font-sans text-sm font-semibold text-white">You, the one who earns it all</span>
          <span className="ml-auto font-sans text-xs" style={{ color: insured ? 'rgba(246,178,26,0.9)' : 'rgba(248,113,113,0.9)' }}>
            {insured ? 'protected' : 'uninsured'}
          </span>
        </motion.div>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="font-sans text-sm text-white/45 italic max-w-sm">
          And the cheapest time to insure the engine is while it is still running well.
        </p>
        <button
          type="button"
          onClick={() => setInsured((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-5 py-2.5 font-sans text-sm text-gold hover:bg-gold/10 transition-[background-color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
        >
          {insured ? 'Reset' : 'Insure the engine'}
        </button>
      </div>
    </div>
  )
}
