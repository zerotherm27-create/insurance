'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

type NodeId = 'kids' | 'spouse' | 'parents' | 'home'

interface DepNode {
  id: NodeId
  label: string
  x: number
  y: number
  detail: string
}

// Beat 2 — The Unseen Risk. The parent sees a web of people who quietly depend on
// one income source. Tapping each reveals what stops for them. Self-discovery, not
// a lecture: they connect the lines themselves.
const CENTER = { x: 190, y: 158 }
const NODES: DepNode[] = [
  { id: 'kids', label: 'Your kids', x: 64, y: 70, detail: 'Tuition, daily baon, the roof over their heads. Every peso of it traces back to one income.' },
  { id: 'spouse', label: 'Your partner', x: 316, y: 70, detail: 'Whether the home runs on two incomes or yours alone, your share is what keeps it steady.' },
  { id: 'parents', label: 'Your parents', x: 64, y: 246, detail: 'The support you quietly send home every month does not pause if your income does.' },
  { id: 'home', label: 'Your home', x: 316, y: 246, detail: 'The amortization carries your name. If your income stops, the loan does not.' },
]

export function Slide2Web() {
  const [active, setActive] = useState<NodeId | null>(null)
  const activeNode = NODES.find((n) => n.id === active)

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          They do not see the one risk.
          <br />
          <span className="text-gold">You have to.</span>
        </h2>
        <p className="font-sans text-xs text-white/30">Tap each person.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="w-full max-w-[420px] mx-auto">
          <svg viewBox="0 0 380 320" className="w-full h-auto overflow-visible">
            {/* Connections */}
            {NODES.map((n) => {
              const on = active === n.id
              return (
                <motion.line
                  key={`l-${n.id}`}
                  x1={CENTER.x}
                  y1={CENTER.y}
                  x2={n.x}
                  y2={n.y}
                  stroke={on ? '#F6B21A' : 'rgba(246,178,26,0.18)'}
                  strokeWidth={on ? 2.5 : 1.5}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                />
              )
            })}

            {/* Center: the single source */}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <circle cx={CENTER.x} cy={CENTER.y} r={46} fill="#F6B21A" />
              <circle cx={CENTER.x} cy={CENTER.y} r={46} fill="none" stroke="#F6B21A" strokeOpacity={0.4}>
                <animate attributeName="r" values="46;56;46" dur="2.8s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.4;0;0.4" dur="2.8s" repeatCount="indefinite" />
              </circle>
              <text x={CENTER.x} y={CENTER.y - 4} textAnchor="middle" dominantBaseline="middle" fill="#0A1628" style={{ fontSize: '12px', fontWeight: 700 }}>Your</text>
              <text x={CENTER.x} y={CENTER.y + 11} textAnchor="middle" dominantBaseline="middle" fill="#0A1628" style={{ fontSize: '12px', fontWeight: 700 }}>income</text>
            </motion.g>

            {/* Dependants */}
            {NODES.map((n, i) => {
              const on = active === n.id
              return (
                <motion.g
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  aria-label={n.label}
                  aria-pressed={on}
                  onMouseEnter={() => setActive(n.id)}
                  onFocus={() => setActive(n.id)}
                  onClick={() => setActive(n.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setActive(n.id)
                    }
                  }}
                  style={{ cursor: 'pointer', outline: 'none' }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.25 + i * 0.1 }}
                >
                  <circle cx={n.x} cy={n.y} r={38} fill={on ? 'rgba(246,178,26,0.18)' : 'rgba(255,255,255,0.06)'} stroke={on ? '#F6B21A' : 'rgba(255,255,255,0.18)'} strokeWidth={on ? 2 : 1} />
                  <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="middle" fill={on ? '#fff' : 'rgba(255,255,255,0.75)'} style={{ fontSize: '11px', fontWeight: 600 }}>
                    {n.label.split(' ').map((w, wi) => (
                      <tspan key={wi} x={n.x} dy={wi === 0 ? '-0.3em' : '1.1em'}>{w}</tspan>
                    ))}
                  </text>
                </motion.g>
              )
            })}
          </svg>
        </div>

        <div className="min-h-[150px] flex items-center">
          {activeNode ? (
            <motion.div
              key={activeNode.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <h3 className="font-serif text-2xl text-white">{activeNode.label}</h3>
              <p className="font-sans text-base text-white/60 leading-relaxed">{activeNode.detail}</p>
            </motion.div>
          ) : (
            <p className="font-sans text-base text-white/40 leading-relaxed">
              Everything they have is wired to one source. They never have to think about it. <span className="text-white/70">That is your job.</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
