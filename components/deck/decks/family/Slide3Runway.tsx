'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { peso } from '@/lib/coverage-benefits'
import { CountUp } from '@/components/deck/kit/CountUp'

// Beat 3 — Make It Real. The parent sets their own income and savings and watches
// the cliff appear: months of runway on savings alone versus a decade of replaced
// income with protection. Loss aversion, self-generated.
const PROTECTION_YEARS = 10
const SCALE_MONTHS = PROTECTION_YEARS * 12 // bar scale

export function Slide3Runway() {
  const [income, setIncome] = useState(45000)
  const [savingsMonths, setSavingsMonths] = useState(3)

  const payout = income * 12 * PROTECTION_YEARS
  const savingsPct = Math.max(0.02, savingsMonths / SCALE_MONTHS)

  return (
    <div className="max-w-3xl mx-auto w-full space-y-7">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          If your income stopped today,
          <br />
          <span className="text-gold">how long would they be okay?</span>
        </h2>
      </div>

      {/* Inputs */}
      <div className="grid sm:grid-cols-2 gap-5">
        <label className="block space-y-2">
          <span className="font-sans text-xs text-white/40">Your monthly income</span>
          <div className="font-serif text-2xl text-white">{peso(income)}</div>
          <input
            type="range" min={15000} max={150000} step={5000} value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
            className="w-full accent-gold cursor-pointer"
            aria-label="Monthly income"
          />
        </label>
        <label className="block space-y-2">
          <span className="font-sans text-xs text-white/40">Months your savings could cover</span>
          <div className="font-serif text-2xl text-white">{savingsMonths} {savingsMonths === 1 ? 'month' : 'months'}</div>
          <input
            type="range" min={0} max={12} step={1} value={savingsMonths}
            onChange={(e) => setSavingsMonths(Number(e.target.value))}
            className="w-full accent-gold cursor-pointer"
            aria-label="Months of savings"
          />
        </label>
      </div>

      {/* The cliff */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between font-sans text-xs">
            <span className="text-white/50">On your savings alone</span>
            <span className="text-red-400 font-medium">{savingsMonths} {savingsMonths === 1 ? 'month' : 'months'}</span>
          </div>
          <div className="h-3 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-red-400/70"
              animate={{ width: `${savingsPct * 100}%` }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between font-sans text-xs">
            <span className="text-white/50">With income protection</span>
            <span className="text-gold font-medium">about {PROTECTION_YEARS} years</span>
          </div>
          <div className="h-3 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gold"
              animate={{ width: '100%' }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gold/25 bg-card-gradient px-6 py-5">
        <p className="font-sans text-sm text-white/55 leading-relaxed">
          Income protection replaces about
          {' '}
          <CountUp value={payout} format={peso} className="font-serif text-2xl text-gold align-baseline" />
          {' '}
          of income for your family. The difference between a few months and a decade is one decision made in time.
        </p>
      </div>
    </div>
  )
}
