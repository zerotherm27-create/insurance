'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircleIcon, XCircleIcon } from '@/components/ui/icons'

// Beat 2 — The Unseen Risk. An employee has a safety net they never think about.
// The self-employed person is the safety net. Toggling between the two empties the
// list, making the missing protection impossible to unsee.
const NETS = [
  'Paid sick leave when you cannot work',
  'A company HMO for hospital bills',
  'Employer and SSS retirement contributions',
  'Paid leave and a backup when you are out',
  'An HR team that handles all of it for you',
]

export function Slide2Benefits() {
  const [view, setView] = useState<'employee' | 'you'>('employee')
  const covered = view === 'employee'

  return (
    <div className="max-w-3xl mx-auto w-full space-y-7">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          An employee has a safety net.
          <br />
          <span className="text-gold">You are the safety net.</span>
        </h2>
      </div>

      <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
        {(['employee', 'you'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            aria-pressed={view === v}
            className={`px-5 py-2 rounded-lg font-sans text-sm transition-[background-color,color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 ${
              view === v ? 'bg-gold text-navy-dark font-medium' : 'text-white/50 hover:text-white/80'
            }`}
          >
            {v === 'employee' ? 'An employee' : 'You, self-employed'}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {NETS.map((net, i) => (
          <motion.div
            key={net}
            className="flex items-center gap-3 rounded-xl border px-5 py-3.5"
            animate={{
              borderColor: covered ? 'rgba(16,185,129,0.25)' : 'rgba(248,113,113,0.25)',
              backgroundColor: covered ? 'rgba(16,185,129,0.05)' : 'rgba(248,113,113,0.05)',
            }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <span className={covered ? 'text-emerald-400' : 'text-red-400'}>
              {covered ? <CheckCircleIcon size={18} /> : <XCircleIcon size={18} />}
            </span>
            <span className="font-sans text-sm text-white/75">{net}</span>
          </motion.div>
        ))}
      </div>

      <p className="font-sans text-sm leading-relaxed" style={{ color: covered ? 'rgba(255,255,255,0.5)' : 'rgba(248,113,113,0.85)' }}>
        {covered
          ? 'An employee gets all of this without lifting a finger.'
          : 'Every one of these is now yours to carry. Unless you put your own net in place, there is nothing under you.'}
      </p>
    </div>
  )
}
