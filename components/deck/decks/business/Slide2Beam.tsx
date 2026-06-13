'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

// Beat 2 — The Unseen Risk. The whole operation balances on one support: the owner.
// Tap each load to see the exposure; pull the support to watch it tip. The single
// point of failure, made physical.
type LoadId = 'payroll' | 'partners' | 'loans' | 'family'
interface Load { id: LoadId; label: string; x: number; detail: string }

const LOADS: Load[] = [
  { id: 'payroll', label: 'Payroll', x: 78, detail: 'Salaries families count on every 15th and 30th. If the cash flow you steer stops, so do their paychecks.' },
  { id: 'partners', label: 'Partners', x: 148, detail: 'Without a funded buy-sell agreement, your partners inherit a dispute instead of a clean transition.' },
  { id: 'loans', label: 'Bank loans', x: 232, detail: 'Loans you personally guaranteed. If something happens to you, the bank looks to your personal estate, and your family.' },
  { id: 'family', label: 'Family', x: 302, detail: 'The business was meant to provide for them. Unprotected, it can become the very thing that drains them.' },
]

export function Slide2Beam() {
  const [active, setActive] = useState<LoadId | null>(null)
  const [gone, setGone] = useState(false)
  const activeLoad = LOADS.find((l) => l.id === active)

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          What has your name on it?
        </h2>
        <p className="font-sans text-xs text-white/30">Tap each load. Then pull the support.</p>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-6">
        <svg viewBox="0 0 380 200" className="w-full h-auto overflow-visible">
          {/* ground */}
          <line x1={30} y1={182} x2={350} y2={182} stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />

          {/* pillar (You) */}
          <motion.g animate={{ opacity: gone ? 0.18 : 1 }} transition={{ duration: 0.3 }}>
            <rect x={182} y={104} width={16} height={76} rx={3} fill="#F6B21A" />
            <text x={190} y={196} textAnchor="middle" fill="#F6B21A" style={{ fontSize: '11px', fontWeight: 700 }}>You</text>
          </motion.g>

          {/* beam + loads tip when the support is pulled */}
          <motion.g
            style={{ transformOrigin: '190px 100px', transformBox: 'fill-box' as never }}
            animate={gone ? { rotate: -7, y: 14 } : { rotate: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 9 }}
          >
            <rect x={40} y={94} width={300} height={14} rx={7} fill={gone ? 'rgba(248,113,113,0.7)' : 'rgba(246,178,26,0.85)'} />
            {LOADS.map((l) => {
              const on = active === l.id
              return (
                <g
                  key={l.id}
                  role="button"
                  tabIndex={0}
                  aria-label={l.label}
                  aria-pressed={on}
                  onMouseEnter={() => setActive(l.id)}
                  onFocus={() => setActive(l.id)}
                  onClick={() => setActive(l.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(l.id) } }}
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  <rect x={l.x - 30} y={62} width={60} height={30} rx={6} fill={on ? 'rgba(246,178,26,0.2)' : 'rgba(255,255,255,0.07)'} stroke={on ? '#F6B21A' : 'rgba(255,255,255,0.2)'} strokeWidth={on ? 2 : 1} />
                  <text x={l.x} y={78} textAnchor="middle" dominantBaseline="middle" fill={on ? '#fff' : 'rgba(255,255,255,0.75)'} style={{ fontSize: '10px', fontWeight: 600 }}>{l.label}</text>
                </g>
              )
            })}
          </motion.g>
        </svg>

        <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="min-h-[44px] max-w-sm">
            {activeLoad ? (
              <motion.p key={activeLoad.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-sans text-sm text-white/60 leading-relaxed">
                {activeLoad.detail}
              </motion.p>
            ) : (
              <p className="font-sans text-sm text-white/40 leading-relaxed">All of it balances on one support.</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setGone((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-5 py-2.5 font-sans text-sm text-gold hover:bg-gold/10 transition-[background-color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 shrink-0"
          >
            {gone ? 'Put the support back' : "If you're not there"}
          </button>
        </div>
      </div>
    </div>
  )
}
