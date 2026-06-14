'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { peso, estateTax } from '@/lib/coverage-benefits'
import { CountUp } from '@/components/deck/kit/CountUp'

// Beat 3 — Make It Real (the signature). The client sets their estate and how much
// of it is liquid. The 6% tax, due in cash within a year, is anchored first; then
// the forced-sale shortfall appears if the liquid cash cannot cover it.
export function Slide3Clock() {
  const [netWorth, setNetWorth] = useState(80_000_000)
  const [liquidPct, setLiquidPct] = useState(15)

  const tax = estateTax(netWorth)
  const cash = Math.round((netWorth * liquidPct) / 100)
  const shortfall = Math.max(0, tax - cash)
  const forced = shortfall > 0

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
          6% estate tax. In cash.
          <br />
          <span className="text-gold">Within one year.</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-5">
          <label className="block space-y-2">
            <span className="font-sans text-xs text-white/40">Estimated net estate</span>
            <div className="font-serif text-2xl text-white">{peso(netWorth)}</div>
            <input type="range" min={5_000_000} max={500_000_000} step={5_000_000} value={netWorth} onChange={(e) => setNetWorth(Number(e.target.value))} className="w-full accent-gold cursor-pointer" aria-label="Net estate" />
          </label>
          <label className="block space-y-2">
            <span className="font-sans text-xs text-white/40">Share held as liquid cash</span>
            <div className="font-serif text-2xl text-white">{liquidPct}%</div>
            <input type="range" min={0} max={100} step={5} value={liquidPct} onChange={(e) => setLiquidPct(Number(e.target.value))} className="w-full accent-gold cursor-pointer" aria-label="Liquid percentage" />
          </label>
        </div>

        <div className="space-y-4">
          {/* Tax due, anchored */}
          <div className="rounded-2xl border border-gold/25 bg-card-gradient px-6 py-5 text-center">
            <p className="font-sans text-xs text-gold/70 uppercase tracking-widest">Estate tax due in cash</p>
            <CountUp value={tax} format={peso} className="block font-serif text-4xl text-gold mt-1" />
            <p className="font-sans text-xs text-white/40 mt-1">payable within 12 months</p>
          </div>

          {/* Liquidity verdict */}
          <motion.div
            className="rounded-2xl border px-6 py-4"
            animate={{
              borderColor: forced ? 'rgba(248,113,113,0.35)' : 'rgba(16,185,129,0.3)',
              backgroundColor: forced ? 'rgba(248,113,113,0.06)' : 'rgba(16,185,129,0.06)',
            }}
            transition={{ duration: 0.3 }}
          >
            {forced ? (
              <p className="font-sans text-sm text-white/70 leading-relaxed">
                <span className="text-red-400 font-medium">Forced-sale risk.</span> Your heirs are short{' '}
                <CountUp value={shortfall} format={peso} className="text-red-400 font-medium" /> and must raise it by selling property, shares, or the business, under a deadline and often below value.
              </p>
            ) : (
              <p className="font-sans text-sm text-white/70 leading-relaxed">
                <span className="text-emerald-400 font-medium">Liquid enough.</span> The cash on hand can settle the tax without selling a single asset under pressure.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
