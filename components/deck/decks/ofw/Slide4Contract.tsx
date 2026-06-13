'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

// Beat 4 — The Cost of Waiting. Employer cover is tied to the contract. The toggle
// contrasts the recurring gaps of borrowed coverage with one plan that never lapses.
const EMPLOYER = [
  { label: 'Contract 1', covered: true, w: 26 },
  { label: 'Gap', covered: false, w: 10 },
  { label: 'Contract 2', covered: true, w: 26 },
  { label: 'Gap', covered: false, w: 10 },
  { label: 'Home for good', covered: false, w: 28 },
]

export function Slide4Contract() {
  const [own, setOwn] = useState(false)

  return (
    <div className="max-w-3xl mx-auto w-full space-y-7">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          Your contract is not forever.
          <br />
          <span className="text-gold">Your family is.</span>
        </h2>
        <p className="font-sans text-xs text-white/30">See the difference over a working life.</p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between font-sans text-xs text-white/40">
          <span>Today</span>
          <span>A working life abroad</span>
          <span>Home for good</span>
        </div>
        <div className="flex gap-1 h-12 rounded-xl overflow-hidden">
          {EMPLOYER.map((seg, i) => {
            const covered = own ? true : seg.covered
            return (
              <motion.div
                key={i}
                className="h-full flex items-center justify-center font-sans text-[10px] text-center px-1"
                style={{ flex: seg.w }}
                animate={{
                  backgroundColor: covered ? 'rgba(246,178,26,0.85)' : 'rgba(248,113,113,0.18)',
                  color: covered ? '#0A1628' : 'rgba(248,113,113,0.9)',
                }}
                transition={{ duration: 0.35 }}
              >
                {own ? '' : seg.covered ? '' : 'exposed'}
              </motion.div>
            )
          })}
        </div>
        <p className="font-sans text-sm text-white/55 leading-relaxed">
          {own
            ? 'Your own plan follows you across every contract and all the way home. No gaps, no lapses, no starting over.'
            : 'Employer coverage protects you only while the contract runs. Between jobs, and the day you finally come home, the protection is gone.'}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setOwn((v) => !v)}
        className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-5 py-2.5 font-sans text-sm text-gold hover:bg-gold/10 transition-[background-color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
      >
        {own ? 'Show employer coverage' : 'Show your own plan'}
      </button>

      <p className="font-sans text-sm text-white/40 italic">
        And the cheapest time to lock in your own plan is now, while you are working and insurable.
      </p>
    </div>
  )
}
