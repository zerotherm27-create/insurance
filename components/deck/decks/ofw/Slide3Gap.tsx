'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircleIcon, XCircleIcon } from '@/components/ui/icons'

// Beat 3 — Make It Real. The OFW picks their real situation and the gap lights up.
// Most have cover on one side of the ocean but not the other.
type Scenario = 'employer' | 'ph' | 'both'

const SCENARIOS: { id: Scenario; label: string; abroad: boolean; home: boolean; note: string }[] = [
  { id: 'employer', label: 'Employer coverage only', abroad: true, home: false, note: 'Covered while the contract runs. The moment it ends, or you come home, the cover ends with it. Nothing reaches your family long term.' },
  { id: 'ph', label: 'Insurance in PH only', abroad: false, home: true, note: 'Your family has something, but if something happens to you abroad, the protection may not follow you across the border.' },
  { id: 'both', label: 'Protected both sides', abroad: true, home: true, note: 'Your own plan follows you wherever you work and pays your family back home, contract or no contract.' },
]

function Zone({ name, covered }: { name: string; covered: boolean }) {
  return (
    <motion.div
      className="rounded-xl border px-5 py-5 flex flex-col items-center gap-2 text-center"
      animate={{
        borderColor: covered ? 'rgba(16,185,129,0.3)' : 'rgba(248,113,113,0.3)',
        backgroundColor: covered ? 'rgba(16,185,129,0.06)' : 'rgba(248,113,113,0.06)',
      }}
      transition={{ duration: 0.3 }}
    >
      <span className={covered ? 'text-emerald-400' : 'text-red-400'}>
        {covered ? <CheckCircleIcon size={26} /> : <XCircleIcon size={26} />}
      </span>
      <span className="font-sans text-sm font-medium text-white/80">{name}</span>
      <span className={`font-sans text-xs ${covered ? 'text-emerald-400/80' : 'text-red-400/80'}`}>
        {covered ? 'Protected' : 'Exposed'}
      </span>
    </motion.div>
  )
}

export function Slide3Gap() {
  const [scn, setScn] = useState<Scenario>('employer')
  const s = SCENARIOS.find((x) => x.id === scn)!

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          Where are you covered,
          <br />
          <span className="text-gold">and where is the gap?</span>
        </h2>
        <p className="font-sans text-xs text-white/30">Pick what is true for you today.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setScn(x.id)}
            aria-pressed={scn === x.id}
            className={`px-4 py-2 rounded-lg font-sans text-sm transition-[background-color,color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 ${
              scn === x.id ? 'bg-gold text-navy-dark font-medium' : 'border border-white/10 text-white/60 hover:text-white/90'
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Zone name="You, abroad" covered={s.abroad} />
        <Zone name="Family, home" covered={s.home} />
      </div>

      <motion.p key={scn} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="font-sans text-sm text-white/55 leading-relaxed border-l-2 border-gold/40 pl-4">
        {s.note}
      </motion.p>
    </div>
  )
}
