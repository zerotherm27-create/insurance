'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

// Beat 2 — The Unseen Risk. The remittance lifeline runs through one person. The
// toggle stops the flow and the home goes dim: the single point of failure made
// visible.
const DOTS = [0, 1, 2, 3, 4]

export function Slide2Lifeline() {
  const [flowing, setFlowing] = useState(true)

  return (
    <div className="max-w-3xl mx-auto w-full space-y-7">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          The lifeline runs through
          <br />
          <span className="text-gold">one person. You.</span>
        </h2>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-8">
        <svg viewBox="0 0 420 150" className="w-full h-auto overflow-visible">
          {/* Connection line */}
          <line x1={96} y1={75} x2={324} y2={75} stroke="rgba(246,178,26,0.2)" strokeWidth={2} strokeDasharray="2 6" />

          {/* Flowing remittance dots */}
          {flowing &&
            DOTS.map((i) => (
              <motion.circle
                key={i}
                r={5}
                cy={75}
                fill="#F6B21A"
                initial={{ cx: 96, opacity: 0 }}
                animate={{ cx: [96, 324], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.44, ease: 'linear' }}
              />
            ))}

          {/* You, abroad */}
          <circle cx={60} cy={75} r={42} fill="rgba(246,178,26,0.15)" stroke="#F6B21A" strokeWidth={1.5} />
          <text x={60} y={70} textAnchor="middle" fill="#fff" style={{ fontSize: '12px', fontWeight: 700 }}>You</text>
          <text x={60} y={86} textAnchor="middle" fill="rgba(255,255,255,0.6)" style={{ fontSize: '10px' }}>abroad</text>

          {/* Home */}
          <motion.g animate={{ opacity: flowing ? 1 : 0.35 }} transition={{ duration: 0.4 }}>
            <circle cx={360} cy={75} r={42} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} />
            <text x={360} y={70} textAnchor="middle" fill="#fff" style={{ fontSize: '12px', fontWeight: 700 }}>Home</text>
            <text x={360} y={86} textAnchor="middle" fill="rgba(255,255,255,0.6)" style={{ fontSize: '10px' }}>family</text>
          </motion.g>
        </svg>

        <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
          <p className="font-sans text-sm leading-relaxed max-w-sm" style={{ color: flowing ? 'rgba(255,255,255,0.55)' : 'rgba(248,113,113,0.85)' }}>
            {flowing
              ? 'Month after month, the support arrives. They never have to worry about where it comes from.'
              : 'The income stops, and so does everything that depends on it. No employer abroad sends it home for you.'}
          </p>
          <button
            type="button"
            onClick={() => setFlowing((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-5 py-2.5 font-sans text-sm text-gold hover:bg-gold/10 transition-[background-color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
          >
            {flowing ? 'If your income stops' : 'Restart the lifeline'}
          </button>
        </div>
      </div>
    </div>
  )
}
