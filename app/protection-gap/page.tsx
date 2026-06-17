'use client'

import { useState, useMemo } from 'react'
import {
  computeDIME,
  computeCI,
  computeEducation,
  computeRetirement,
  computeEstate,
  computeGapSummary,
  computeAnalysis,
  computeInsights,
  computeRecommendations,
} from '@/lib/gap-calculator'
import { GrandTotalCard } from '@/components/protection-gap/GrandTotalCard'
import { GapResultCard } from '@/components/protection-gap/GapResultCard'
import { AnalysisPanel } from '@/components/protection-gap/AnalysisPanel'
import { InsightsPanel } from '@/components/protection-gap/InsightsPanel'
import { RecommendationsPanel } from '@/components/protection-gap/RecommendationsPanel'
import { DiméModule } from '@/components/protection-gap/DiméModule'
import { CIModule } from '@/components/protection-gap/CIModule'
import { EducationModule } from '@/components/protection-gap/EducationModule'
import { RetirementModule } from '@/components/protection-gap/RetirementModule'
import { EstateModule } from '@/components/protection-gap/EstateModule'

export default function ProtectionGapPage() {
  // ── Shared state ────────────────────────────────────────────────────────────
  const [childAges, setChildAges] = useState<number[]>([])
  const [collegeFundPerChild, setCollegeFundPerChild] = useState(0)

  // ── DIME ────────────────────────────────────────────────────────────────────
  const [finalExpenses, setFinalExpenses] = useState(0)
  const [outstandingLoans, setOutstandingLoans] = useState(0)
  const [outstandingMortgage, setOutstandingMortgage] = useState(0)
  const [annualIncome, setAnnualIncome] = useState(0)
  const [incomeYearsNeeded, setIncomeYearsNeeded] = useState(10)
  const [existingLifeCoverage, setExistingLifeCoverage] = useState(0)

  // ── CI ───────────────────────────────────────────────────────────────────────
  const [monthlyIncome, setMonthlyIncome] = useState(0)
  const [existingCICoverage, setExistingCICoverage] = useState(0)

  // ── Education ────────────────────────────────────────────────────────────────
  const [eduExistingSavings, setEduExistingSavings] = useState(0)
  const [eduMonthlySavings, setEduMonthlySavings] = useState(0)

  // ── Retirement ───────────────────────────────────────────────────────────────
  const [currentAge, setCurrentAge] = useState(35)
  const [retirementAge, setRetirementAge] = useState(65)
  const [retMonthlyIncome, setRetMonthlyIncome] = useState(0)
  const [existingRetirementSavings, setExistingRetirementSavings] = useState(0)
  const [monthlyRetirementSavings, setMonthlyRetirementSavings] = useState(0)

  // ── Estate ───────────────────────────────────────────────────────────────────
  const [netEstateValue, setNetEstateValue] = useState(0)
  const [liquidReserves, setLiquidReserves] = useState(0)
  const [estateExpanded, setEstateExpanded] = useState(false)

  // ── Interaction ──────────────────────────────────────────────────────────────
  const [highlightedModule, setHighlightedModule] = useState<string | undefined>()

  // ── Computed results ─────────────────────────────────────────────────────────
  const { summary, analysis, insights, recommendations, retProjected } = useMemo(() => {
    const life = computeDIME({
      finalExpenses,
      outstandingLoans,
      outstandingMortgage,
      annualIncome,
      incomeYearsNeeded,
      numChildren: childAges.length,
      collegeFundPerChild,
      existingLifeCoverage,
    })

    const ci = computeCI({ monthlyIncome, existingCICoverage })

    const edu = computeEducation({
      childAges,
      collegeFundPerChild,
      existingSavings: eduExistingSavings,
      monthlySavings: eduMonthlySavings,
    })

    const ret = computeRetirement({
      currentAge,
      retirementAge,
      monthlyIncome: retMonthlyIncome,
      targetIncomeReplacementPct: 0.7,
      existingRetirementSavings,
      monthlyRetirementSavings,
    })

    const estate = computeEstate({ netEstateValue, liquidReserves })

    const modules = estateExpanded || estate.gap > 0
      ? [life, ci, edu, ret, estate]
      : [life, ci, edu, ret]

    const sum = computeGapSummary(modules)
    const anal = computeAnalysis(sum, annualIncome)
    const ins = computeInsights(sum, {
      outstandingMortgage,
      incomeYearsNeeded,
      currentAge,
      retirementAge,
      retirementProjected: ret.have,
      retirementNeed: ret.need,
    })
    const recs = computeRecommendations(sum, monthlyRetirementSavings)

    return {
      summary: sum,
      analysis: anal,
      insights: ins,
      recommendations: recs,
      retProjected: ret.have,
    }
  }, [
    finalExpenses, outstandingLoans, outstandingMortgage, annualIncome, incomeYearsNeeded,
    childAges, collegeFundPerChild, existingLifeCoverage,
    monthlyIncome, existingCICoverage,
    eduExistingSavings, eduMonthlySavings,
    currentAge, retirementAge, retMonthlyIncome, existingRetirementSavings, monthlyRetirementSavings,
    netEstateValue, liquidReserves, estateExpanded,
  ])

  const calendlyUrl = process.env.NEXT_PUBLIC_ADVISOR_CALENDLY_URL ?? '#'

  return (
    <main className="min-h-screen bg-navy-gradient">
      {/* Header */}
      <header className="bg-navy border-b border-white/8 px-5 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center font-serif text-sm font-bold text-navy-dark shrink-0">
            SM
          </div>
          <div>
            <p className="font-serif text-sm text-white leading-none">Safety Margin</p>
            <p className="font-sans text-xs text-white/35 uppercase tracking-widest mt-0.5">
              Protection Gap Calculator
            </p>
          </div>
        </div>
        <a
          href="/admin"
          className="font-sans text-xs text-white/30 hover:text-white/60 transition-[color] duration-150 flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 rounded"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Admin
        </a>
      </header>

      {/* Two-column body */}
      <div className="md:grid md:grid-cols-[1fr_1fr] md:items-start">
        {/* INPUT PANEL */}
        <div className="px-5 py-6 space-y-6 md:border-r md:border-white/6 md:max-h-[calc(100vh-57px)] md:overflow-y-auto">
          <DiméModule
            finalExpenses={finalExpenses}
            outstandingLoans={outstandingLoans}
            outstandingMortgage={outstandingMortgage}
            annualIncome={annualIncome}
            incomeYearsNeeded={incomeYearsNeeded}
            childAges={childAges}
            collegeFundPerChild={collegeFundPerChild}
            existingLifeCoverage={existingLifeCoverage}
            onFinalExpenses={setFinalExpenses}
            onOutstandingLoans={setOutstandingLoans}
            onOutstandingMortgage={setOutstandingMortgage}
            onAnnualIncome={setAnnualIncome}
            onIncomeYearsNeeded={setIncomeYearsNeeded}
            onChildAgesChange={setChildAges}
            onCollegeFundPerChild={setCollegeFundPerChild}
            onExistingLifeCoverage={setExistingLifeCoverage}
          />

          <div className="border-t border-white/6" />

          <CIModule
            monthlyIncome={monthlyIncome}
            existingCICoverage={existingCICoverage}
            onMonthlyIncome={setMonthlyIncome}
            onExistingCICoverage={setExistingCICoverage}
          />

          <div className="border-t border-white/6" />

          <EducationModule
            childAges={childAges}
            collegeFundPerChild={collegeFundPerChild}
            existingSavings={eduExistingSavings}
            monthlySavings={eduMonthlySavings}
            onExistingSavings={setEduExistingSavings}
            onMonthlySavings={setEduMonthlySavings}
          />

          <div className="border-t border-white/6" />

          <RetirementModule
            currentAge={currentAge}
            retirementAge={retirementAge}
            monthlyIncome={retMonthlyIncome}
            existingRetirementSavings={existingRetirementSavings}
            monthlyRetirementSavings={monthlyRetirementSavings}
            onCurrentAge={setCurrentAge}
            onRetirementAge={setRetirementAge}
            onMonthlyIncome={setRetMonthlyIncome}
            onExistingRetirementSavings={setExistingRetirementSavings}
            onMonthlyRetirementSavings={setMonthlyRetirementSavings}
          />

          <div className="border-t border-white/6" />

          <EstateModule
            expanded={estateExpanded}
            onToggle={() => setEstateExpanded((v) => !v)}
            netEstateValue={netEstateValue}
            liquidReserves={liquidReserves}
            onNetEstateValue={setNetEstateValue}
            onLiquidReserves={setLiquidReserves}
          />
        </div>

        {/* RESULTS PANEL */}
        <div className="px-5 py-6 space-y-5 md:sticky md:top-[57px] md:max-h-[calc(100vh-57px)] md:overflow-y-auto">
          <GrandTotalCard summary={summary} status={analysis.overallStatus} />

          <AnalysisPanel analysis={analysis} />

          <div className="space-y-2">
            <p className="font-sans text-xs text-white/35 uppercase tracking-widest">Gap breakdown</p>
            {summary.modules
              .filter((m) => m.need > 0)
              .map((m) => (
                <GapResultCard
                  key={m.moduleId}
                  result={m}
                  highlighted={highlightedModule === m.moduleId}
                />
              ))}
          </div>

          <InsightsPanel
            insights={insights}
            highlightedModule={highlightedModule}
            onHoverModule={setHighlightedModule}
          />

          <RecommendationsPanel recommendations={recommendations} />

          {/* CTA */}
          <div className="pt-1">
            <a
              href={calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3.5 bg-gold text-navy-dark font-sans text-sm font-semibold rounded-xl text-center hover:bg-gold-soft transition-[background-color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            >
              Book a Consultation
            </a>
            <p className="font-sans text-xs text-white/25 text-center mt-2 leading-relaxed">
              These are estimates. All figures must be validated through an official proposal and consultation with a licensed advisor.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
