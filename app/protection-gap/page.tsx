'use client'

import Image from 'next/image'
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

const STEPS = [
  { id: 'life', label: 'Life', full: 'Life Insurance' },
  { id: 'health', label: 'Health', full: 'Critical Illness' },
  { id: 'education', label: 'Education', full: 'Education Fund' },
  { id: 'retirement', label: 'Retirement', full: 'Retirement Fund' },
  { id: 'estate', label: 'Estate', full: 'Estate Tax' },
]

export default function ProtectionGapPage() {
  // ── Stepper ──────────────────────────────────────────────────────────────────
  const [activeStep, setActiveStep] = useState(0)

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

  // ── Interaction ──────────────────────────────────────────────────────────────
  const [highlightedModule, setHighlightedModule] = useState<string | undefined>()

  // ── Computed results ─────────────────────────────────────────────────────────
  const { summary, analysis, insights, recommendations } = useMemo(() => {
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

    // Always include estate; GapResultCard filters by need > 0 so ₱0 estate stays hidden
    const modules = [life, ci, edu, ret, estate]

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

    return { summary: sum, analysis: anal, insights: ins, recommendations: recs }
  }, [
    finalExpenses, outstandingLoans, outstandingMortgage, annualIncome, incomeYearsNeeded,
    childAges, collegeFundPerChild, existingLifeCoverage,
    monthlyIncome, existingCICoverage,
    eduExistingSavings, eduMonthlySavings,
    currentAge, retirementAge, retMonthlyIncome, existingRetirementSavings, monthlyRetirementSavings,
    netEstateValue, liquidReserves,
  ])

  const calendlyUrl = process.env.NEXT_PUBLIC_ADVISOR_CALENDLY_URL ?? '#'

  return (
    <main className="min-h-screen bg-navy-gradient">
      {/* Header */}
      <header className="bg-navy border-b border-white/8 px-5 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Safety Margin"
            width={36}
            height={36}
            className="object-contain"
            priority
          />
          <div>
            <p className="font-sans text-sm font-semibold text-white leading-none tracking-wide">
              Safety Margin
            </p>
            <p className="font-sans text-[10px] text-white/35 uppercase tracking-widest mt-0.5">
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
        <div className="md:border-r md:border-white/6 md:max-h-[calc(100vh-57px)] md:overflow-y-auto">

          {/* Stepper nav */}
          <div className="px-5 pt-5 pb-4 border-b border-white/6">
            {/* Step label */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-sans text-[10px] text-white/30 uppercase tracking-widest">
                  Step {activeStep + 1} of {STEPS.length}
                </p>
                <p className="font-sans text-base font-semibold text-white mt-0.5">
                  {STEPS[activeStep].full}
                </p>
              </div>
              {/* Mini dots */}
              <div className="flex items-center gap-1.5">
                {STEPS.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveStep(i)}
                    aria-label={`Go to step ${i + 1}: ${s.full}`}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 rounded-full"
                  >
                    <span
                      className="block rounded-full transition-[width,height,background-color] duration-150"
                      style={{
                        width: i === activeStep ? 20 : 6,
                        height: 6,
                        background: i < activeStep
                          ? '#F6B21A'
                          : i === activeStep
                          ? '#F6B21A'
                          : 'rgba(255,255,255,0.15)',
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Step labels row — horizontal scrollable on mobile */}
            <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide -mx-1 px-1">
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveStep(i)}
                  className={[
                    'shrink-0 font-sans text-[11px] px-2.5 py-1 rounded-full transition-[background-color,color] duration-150 focus:outline-none',
                    i === activeStep
                      ? 'bg-gold/15 text-gold font-semibold'
                      : i < activeStep
                      ? 'text-gold/60 hover:text-gold/80'
                      : 'text-white/30 hover:text-white/50',
                  ].join(' ')}
                >
                  {i < activeStep ? '✓ ' : ''}{s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active module */}
          <div className="px-5 py-6">
            {activeStep === 0 && (
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
            )}
            {activeStep === 1 && (
              <CIModule
                monthlyIncome={monthlyIncome}
                existingCICoverage={existingCICoverage}
                onMonthlyIncome={setMonthlyIncome}
                onExistingCICoverage={setExistingCICoverage}
              />
            )}
            {activeStep === 2 && (
              <EducationModule
                childAges={childAges}
                collegeFundPerChild={collegeFundPerChild}
                existingSavings={eduExistingSavings}
                monthlySavings={eduMonthlySavings}
                onExistingSavings={setEduExistingSavings}
                onMonthlySavings={setEduMonthlySavings}
              />
            )}
            {activeStep === 3 && (
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
            )}
            {activeStep === 4 && (
              <EstateModule
                netEstateValue={netEstateValue}
                liquidReserves={liquidReserves}
                onNetEstateValue={setNetEstateValue}
                onLiquidReserves={setLiquidReserves}
              />
            )}

            {/* Back / Next */}
            <div className="flex items-center gap-3 mt-8">
              {activeStep > 0 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep((s) => s - 1)}
                  className="flex items-center gap-1.5 font-sans text-sm text-white/50 hover:text-white/80 transition-[color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 rounded px-1 py-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              ) : (
                <span />
              )}

              {activeStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep((s) => s + 1)}
                  className="ml-auto flex items-center gap-1.5 bg-gold/15 hover:bg-gold/25 text-gold font-sans text-sm font-semibold px-5 py-2.5 rounded-xl transition-[background-color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
                >
                  Next: {STEPS[activeStep + 1].label}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <a
                  href={calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto flex items-center gap-1.5 bg-gold text-navy-dark font-sans text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gold-soft transition-[background-color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                >
                  Book a Consultation
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>
          </div>
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
