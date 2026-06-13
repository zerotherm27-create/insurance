'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

// Beat 4 — The Cost of Waiting. Personally-guaranteed debt does not die with the
// owner. The toggle shows who the bank collects from: a funded policy, or the
// family. Grounded urgency, peer to peer.
export function Slide4Debt() {
  const [protectedOn, setProtectedOn] = useState(false)

  return (
    <div className="max-w-3xl mx-auto w-full space-y-7">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          The debt does not die
          <br />
          <span className="text-gold">with the business.</span>
        </h2>
        <p className="font-sans text-xs text-white/30">Who settles the loan?</p>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-5 text-center">
          <p className="font-sans text-xs text-white/40">The bank loan</p>
          <p className="font-serif text-lg text-white mt-1">With your name on it</p>
        </div>

        <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} className="text-gold text-2xl">→</motion.div>

        <motion.div
          className="rounded-xl border px-5 py-5 text-center"
          animate={
            protectedOn
              ? { borderColor: 'rgba(16,185,129,0.35)', backgroundColor: 'rgba(16,185,129,0.07)' }
              : { borderColor: 'rgba(248,113,113,0.35)', backgroundColor: 'rgba(248,113,113,0.07)' }
          }
          transition={{ duration: 0.35 }}
        >
          <p className="font-sans text-xs text-white/40">Collected from</p>
          <p className={`font-serif text-lg mt-1 ${protectedOn ? 'text-emerald-400' : 'text-red-400'}`}>
            {protectedOn ? 'A funded policy' : 'Your family and estate'}
          </p>
        </motion.div>
      </div>

      <p className="font-sans text-sm text-white/55 leading-relaxed">
        {protectedOn
          ? 'Loan and key-person protection clears the debt at the source, so the bank is paid and your family keeps the home, the savings, and their peace.'
          : 'Without protection, a personally guaranteed loan follows your name home. The bank has first claim, and your family inherits the bill.'}
      </p>

      <div className="flex items-center gap-4 flex-wrap">
        <button
          type="button"
          onClick={() => setProtectedOn((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-5 py-2.5 font-sans text-sm text-gold hover:bg-gold/10 transition-[background-color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
        >
          {protectedOn ? 'Show it unprotected' : 'Add loan protection'}
        </button>
        <span className="font-sans text-sm text-white/40 italic">And it is cheapest to put in place while you are insurable.</span>
      </div>
    </div>
  )
}
