'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { peso } from '@/lib/coverage-benefits'
import { CountUp } from '@/components/deck/kit/CountUp'

// Beat 3 — Make It Real. The entrepreneur sets their income and savings, then
// imagines six months unable to work. The runway counter shows how fast it drains
// when income stops but the bills do not. Self-generated loss aversion.
export function Slide3Drain() {
  const [income, setIncome] = useState(60000)
  const [savings, setSavings] = useState(150000)

  // Living costs roughly track income; assume ~70% must keep being paid.
  const monthlyCost = Math.round(income * 0.7)
  const runway = monthlyCost > 0 ? savings / monthlyCost : 0
  const runwayMonths = Math.max(0, Math.round(runway * 10) / 10)
  const short = runwayMonths < 6

  return (
    <div className="max-w-3xl mx-auto w-full space-y-7">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          If you could not work
          <br />
          <span className="text-gold">for six months?</span>
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <label className="block space-y-2">
          <span className="font-sans text-xs text-white/40">Your monthly income</span>
          <div className="font-serif text-2xl text-white">{peso(income)}</div>
          <input type="range" min={15000} max={200000} step={5000} value={income} onChange={(e) => setIncome(Number(e.target.value))} className="w-full accent-gold cursor-pointer" aria-label="Monthly income" />
        </label>
        <label className="block space-y-2">
          <span className="font-sans text-xs text-white/40">What you have saved</span>
          <div className="font-serif text-2xl text-white">{peso(savings)}</div>
          <input type="range" min={0} max={1000000} step={25000} value={savings} onChange={(e) => setSavings(Number(e.target.value))} className="w-full accent-gold cursor-pointer" aria-label="Savings" />
        </label>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between font-sans text-xs">
          <span className="text-white/50">Your savings last</span>
          <span className={short ? 'text-red-400 font-medium' : 'text-gold font-medium'}>
            <CountUp value={runwayMonths} format={(n) => `${n.toFixed(1)} months`} />
          </span>
        </div>
        <div className="h-3 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${Math.min(100, (runwayMonths / 12) * 100)}%`, backgroundColor: short ? 'rgba(248,113,113,0.8)' : '#F6B21A' }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
        {/* 6-month marker */}
        <div className="relative h-4">
          <div className="absolute top-0 h-3 -mt-5 border-l border-dashed border-white/30" style={{ left: '50%' }} />
          <span className="absolute font-sans text-[10px] text-white/30 -mt-4" style={{ left: '50%', transform: 'translateX(-50%)' }}>6 months</span>
        </div>
      </div>

      <div className="rounded-2xl border border-gold/25 bg-card-gradient px-6 py-5">
        <p className="font-sans text-sm text-white/55 leading-relaxed">
          {short
            ? 'Your savings run out before six months are up, while the bills keep coming. Income protection pays you a benefit when you cannot work, so the engine keeps running even when you stop.'
            : 'Even a healthy buffer is finite. Income protection pays you a benefit when you cannot work, so you recover without burning everything you built.'}
        </p>
      </div>
    </div>
  )
}
