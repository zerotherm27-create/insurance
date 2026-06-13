'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type LevelId = 'protection' | 'accumulation' | 'preservation' | 'legacy'

interface Level {
  id: LevelId
  num: string
  word: string
  name: string
  tagline: string
  lead?: string
  focus: string
  actions: string
  objective: string
  // Vertical band of the triangle this level occupies (0 = apex, 1 = base).
  t1: number
  t2: number
  // Fill when idle / when active.
  fill: string
  fillActive: string
}

// Foundation first. The build animation lays the base before the peak.
const LEVELS: Level[] = [
  {
    id: 'protection',
    num: '01',
    word: 'Protection',
    name: 'Protection',
    tagline: 'The Foundation',
    lead: 'The number one asset to protect is you. Your income, your health, your life.',
    focus: 'Safeguard what you already have, starting with the person who earns it.',
    actions: 'Build an emergency fund of 3 to 6 months of expenses, then secure health, life, and disability protection.',
    objective: 'One crisis, a job loss, an illness, an early death, should never derail your future.',
    t1: 0.75,
    t2: 1,
    fill: '#F6B21A',
    fillActive: '#FFC53D',
  },
  {
    id: 'accumulation',
    num: '02',
    word: 'Growth',
    name: 'Wealth Accumulation',
    tagline: 'The Middle Tier',
    focus: 'Grow your assets and beat inflation.',
    actions: 'Direct your surplus into long-term savings and investments.',
    objective: 'Steadily raise your net worth and build capital for future milestones.',
    t1: 0.5,
    t2: 0.75,
    fill: '#D9A441',
    fillActive: '#E8B85C',
  },
  {
    id: 'preservation',
    num: '03',
    word: 'Preserve',
    name: 'Wealth Preservation',
    tagline: 'The Upper Tier',
    focus: 'Secure your wealth against market swings and taxes.',
    actions: 'Use tax-efficient strategies, rebalancing, and stable, yield-generating assets.',
    objective: 'Protect your purchasing power and maintain your lifestyle.',
    t1: 0.25,
    t2: 0.5,
    fill: '#C2932F',
    fillActive: '#D6A53D',
  },
  {
    id: 'legacy',
    num: '04',
    word: 'Legacy',
    name: 'Legacy & Succession',
    tagline: 'The Peak',
    focus: 'Pass your wealth to the next generation.',
    actions: 'Set up trusts, wills, and formal estate planning.',
    objective: 'Transfer assets efficiently, minimize estate taxes, and prevent disputes among heirs.',
    t1: 0,
    t2: 0.25,
    fill: '#F6E9C4',
    fillActive: '#FFF4D8',
  },
]

// Triangle geometry — apex at top centre, flat base at the bottom. Each tier is
// a horizontal slice (t = 0 at the apex, 1 at the base). The apex tier is a
// triangle; the rest are trapezoids that stack into one solid triangle.
const APEX_X = 150
const APEX_Y = 18
const BASE_Y = 212
const HALF_BASE = 132 // half-width of the base

const sliceY = (t: number) => APEX_Y + (BASE_Y - APEX_Y) * t
const halfW = (t: number) => HALF_BASE * t

function band(t1: number, t2: number) {
  const y1 = sliceY(t1)
  const y2 = sliceY(t2)
  const w1 = halfW(t1)
  const w2 = halfW(t2)
  return {
    d: `M${(APEX_X - w1).toFixed(1)},${y1.toFixed(1)} L${(APEX_X + w1).toFixed(1)},${y1.toFixed(1)} L${(APEX_X + w2).toFixed(1)},${y2.toFixed(1)} L${(APEX_X - w2).toFixed(1)},${y2.toFixed(1)} Z`,
    labelY: sliceY((t1 + t2) / 2),
  }
}

const tierVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
}

export function Slide5() {
  const [active, setActive] = useState<LevelId>('protection')
  const level = LEVELS.find((l) => l.id === active)!

  return (
    <div className="max-w-4xl mx-auto w-full space-y-7">
      <div className="space-y-1.5">
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          The Four Levels of Wealth.
          <br />
          <span className="text-gold">Each One Built on the Last.</span>
        </h2>
        <p className="font-sans text-xs text-white/30">Hover or tap each level.</p>
      </div>

      <div className="grid md:grid-cols-[1.15fr_1fr] gap-8 md:gap-10 items-center">
        {/* Triangle */}
        <div className="w-full max-w-[460px] mx-auto">
          <motion.svg
            viewBox="0 0 300 230"
            className="w-full h-auto overflow-visible"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.13, delayChildren: 0.1 } } }}
          >
            {LEVELS.map((l) => {
              const isActive = l.id === active
              const b = band(l.t1, l.t2)
              const edge = isActive ? 'rgba(255,255,255,0.8)' : 'rgba(10,22,40,0.45)'
              // The apex band is narrow at its midpoint, so drop its label lower
              // into the wider part of the tier; centre the rest.
              const labelY = sliceY(l.t1 === 0 ? l.t1 + (l.t2 - l.t1) * 0.74 : (l.t1 + l.t2) / 2)
              return (
                <motion.g
                  key={l.id}
                  variants={tierVariants}
                  transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${l.name}, ${l.tagline}`}
                  aria-pressed={isActive}
                  onMouseEnter={() => setActive(l.id)}
                  onFocus={() => setActive(l.id)}
                  onClick={() => setActive(l.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setActive(l.id)
                    }
                  }}
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  <path
                    d={b.d}
                    fill={isActive ? l.fillActive : l.fill}
                    stroke={edge}
                    strokeWidth={isActive ? 2 : 1}
                    strokeLinejoin="round"
                  />
                  <text
                    x={150}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#fff"
                    stroke="#0A1628"
                    strokeWidth={3}
                    paintOrder="stroke"
                    strokeLinejoin="round"
                    className="font-sans"
                    style={{ fontSize: '12px', fontWeight: 700, pointerEvents: 'none' }}
                  >
                    {l.word}
                  </text>
                </motion.g>
              )
            })}
          </motion.svg>
        </div>

        {/* Detail panel */}
        <div className="min-h-[230px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-4"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-2xl text-gold">{level.num}</span>
                <div>
                  <h3 className="font-serif text-xl text-white leading-tight">{level.name}</h3>
                  <p className="font-sans text-xs text-gold/60">{level.tagline}</p>
                </div>
              </div>

              {level.lead && (
                <p className="font-sans text-sm text-white/90 leading-relaxed border-l-2 border-gold/40 pl-4">
                  {level.lead}
                </p>
              )}

              <div className="space-y-2.5">
                <Row label="Focus" value={level.focus} />
                <Row label="Actions" value={level.actions} />
                <Row label="Objective" value={level.objective} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="font-sans text-[11px] font-medium text-gold/70 w-16 flex-shrink-0 pt-0.5">{label}</span>
      <span className="font-sans text-sm text-white/60 leading-relaxed">{value}</span>
    </div>
  )
}
