import { estateTax } from './coverage-benefits'
import type {
  DiméInputs,
  CIInputs,
  EducationInputs,
  RetirementInputs,
  EstateInputs,
  GapModuleResult,
  GapSummary,
  GapAnalysis,
  GapInsight,
  GapRecommendation,
} from '@/types/gap'

// ── Helpers ───────────────────────────────────────────────────────────────────

function annuityFV(pmt: number, annualRate: number, years: number): number {
  if (years <= 0 || pmt <= 0) return 0
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1
  const n = Math.round(years * 12)
  return pmt * (Math.pow(1 + monthlyRate, n) - 1) / monthlyRate
}

function ciIdealAmount(monthlyIncome: number): number {
  if (monthlyIncome < 30_000) return 1_000_000
  if (monthlyIncome < 60_000) return 1_500_000
  return 2_000_000
}

// ── Module computations ───────────────────────────────────────────────────────

export function computeDIME(inputs: DiméInputs): GapModuleResult {
  const D = inputs.finalExpenses + inputs.outstandingLoans
  const I = inputs.annualIncome * inputs.incomeYearsNeeded
  const M = inputs.outstandingMortgage
  // E = total college fund per child × num children × 1.3 inflation buffer
  const E = inputs.numChildren * inputs.collegeFundPerChild * 1.3
  const need = D + I + M + E
  const gap = Math.max(0, need - inputs.existingLifeCoverage)
  return {
    moduleId: 'life',
    moduleName: 'Life Insurance (DIME)',
    need,
    have: inputs.existingLifeCoverage,
    gap,
    breakdown: { D, I, M, E },
  }
}

export function computeCI(inputs: CIInputs): GapModuleResult {
  if (inputs.monthlyIncome === 0 && inputs.existingCICoverage === 0) {
    return { moduleId: 'ci', moduleName: 'Critical Illness', need: 0, have: 0, gap: 0 }
  }
  const need = ciIdealAmount(inputs.monthlyIncome)
  const gap = Math.max(0, need - inputs.existingCICoverage)
  return {
    moduleId: 'ci',
    moduleName: 'Critical Illness',
    need,
    have: Math.min(inputs.existingCICoverage, need),
    gap,
  }
}

export function computeEducation(inputs: EducationInputs): GapModuleResult {
  const totalNeed = inputs.childAges.length * inputs.collegeFundPerChild
  if (totalNeed === 0) {
    return { moduleId: 'education', moduleName: 'Education Fund', need: 0, have: 0, gap: 0 }
  }
  // Project savings to the youngest child's college start (most conservative)
  const yearsUntilCollege = inputs.childAges.length > 0
    ? Math.max(1, Math.min(...inputs.childAges.map((a) => Math.max(1, 18 - a))))
    : 18
  const projected =
    inputs.existingSavings * Math.pow(1.06, yearsUntilCollege) +
    annuityFV(inputs.monthlySavings, 0.06, yearsUntilCollege)
  const gap = Math.max(0, totalNeed - projected)
  return {
    moduleId: 'education',
    moduleName: 'Education Fund',
    need: totalNeed,
    have: Math.min(Math.max(projected, 0), totalNeed),
    gap,
  }
}

export function computeRetirement(inputs: RetirementInputs): GapModuleResult {
  const targetMonthly = inputs.monthlyIncome * inputs.targetIncomeReplacementPct
  const corpusNeeded = targetMonthly * 12 * 25
  const years = Math.max(0, inputs.retirementAge - inputs.currentAge)
  const projectedCorpus =
    inputs.existingRetirementSavings * Math.pow(1.07, years) +
    annuityFV(inputs.monthlyRetirementSavings, 0.07, years)
  const gap = Math.max(0, corpusNeeded - projectedCorpus)
  return {
    moduleId: 'retirement',
    moduleName: 'Retirement Fund',
    need: corpusNeeded,
    have: Math.min(Math.max(projectedCorpus, 0), corpusNeeded),
    gap,
  }
}

export function computeEstate(inputs: EstateInputs): GapModuleResult {
  const taxDue = estateTax(inputs.netEstateValue)
  const gap = Math.max(0, taxDue - inputs.liquidReserves)
  return {
    moduleId: 'estate',
    moduleName: 'Estate Tax',
    need: taxDue,
    have: Math.min(inputs.liquidReserves, taxDue),
    gap,
  }
}

export function computeGapSummary(modules: GapModuleResult[]): GapSummary {
  const totalGap = modules.reduce((sum, m) => sum + m.gap, 0)
  const totalNeed = modules.reduce((sum, m) => sum + m.need, 0)
  const protectedPct =
    totalNeed > 0 ? Math.round(((totalNeed - totalGap) / totalNeed) * 100) : 100
  return { modules, totalGap, totalNeed, protectedPct }
}

// ── Analysis ──────────────────────────────────────────────────────────────────

export function computeAnalysis(
  summary: GapSummary,
  annualIncome: number
): GapAnalysis {
  const { totalGap, totalNeed, modules } = summary
  const gapRatio = totalNeed > 0 ? totalGap / totalNeed : 0
  const overallStatus: GapAnalysis['overallStatus'] =
    gapRatio > 0.6 ? 'critical' : gapRatio > 0.4 ? 'serious' : gapRatio > 0.2 ? 'moderate' : 'good'

  const biggest = modules.reduce((a, b) => (a.gap > b.gap ? a : b), modules[0])
  const biggestGapPct = totalGap > 0 ? Math.round((biggest.gap / totalGap) * 100) : 0

  const lifeModule = modules.find((m) => m.moduleId === 'life')
  const monthlyIncome = annualIncome / 12
  const incomeMonthsExposed =
    lifeModule && lifeModule.gap > 0 && monthlyIncome > 0
      ? Math.round(lifeModule.gap / monthlyIncome)
      : 0

  const statusPhrases: Record<GapAnalysis['overallStatus'], string> = {
    critical: 'Your household carries critical unprotected risk.',
    serious: 'Your household carries serious unprotected risk.',
    moderate: 'Your household has moderate gaps worth addressing.',
    good: 'Your household is well-covered on most fronts.',
  }

  const parts: string[] = []
  if (totalGap > 0) {
    parts.push(`${fmt(totalGap)} in total protection gaps across all modules.`)
    if (incomeMonthsExposed > 0) {
      parts.push(`Your life insurance gap alone represents ${incomeMonthsExposed} months of income exposure.`)
    }
    parts.push(statusPhrases[overallStatus])
  } else {
    parts.push('All gaps are fully covered based on the numbers you entered.')
    parts.push('Review these figures periodically as your income and obligations change.')
  }

  return {
    headline: parts.join(' '),
    overallStatus,
    biggestGapModule: biggest?.moduleName ?? '',
    biggestGapPct,
    incomeMonthsExposed,
  }
}

// ── Insights ──────────────────────────────────────────────────────────────────

export function computeInsights(
  summary: GapSummary,
  opts: {
    outstandingMortgage: number
    incomeYearsNeeded: number
    currentAge: number
    retirementAge: number
    retirementProjected: number
    retirementNeed: number
  }
): GapInsight[] {
  const { modules, totalGap, protectedPct } = summary
  const insights: GapInsight[] = []

  const lifeModule = modules.find((m) => m.moduleId === 'life')
  const retModule = modules.find((m) => m.moduleId === 'retirement')
  const estateModule = modules.find((m) => m.moduleId === 'estate')

  if (protectedPct >= 80) {
    insights.push({
      text: "You're already well-covered on most fronts. The remaining gaps are manageable with targeted adjustments.",
    })
    return insights
  }

  if (lifeModule && lifeModule.gap > 0 && opts.outstandingMortgage > 0) {
    const mortgagePct = Math.round((opts.outstandingMortgage / lifeModule.gap) * 100)
    if (mortgagePct >= 20) {
      insights.push({
        text: `Your outstanding mortgage represents ${mortgagePct}% of your life insurance gap. It is the single largest debt component.`,
        moduleId: 'life',
      })
    }
  }

  if (opts.incomeYearsNeeded > 0 && opts.incomeYearsNeeded < 10) {
    insights.push({
      text: `Your income replacement window is set to ${opts.incomeYearsNeeded} years. Most advisors recommend at least 10 when dependants are under 18.`,
      moduleId: 'life',
    })
  }

  const yearsToRetirement = opts.retirementAge - opts.currentAge
  if (retModule && retModule.gap > 0) {
    if (yearsToRetirement < 20) {
      insights.push({
        text: `You have less than 20 years to build your retirement corpus. Compounding has limited runway at this stage.`,
        moduleId: 'retirement',
      })
    } else if (opts.retirementProjected > 0 && retModule.gap > retModule.need * 0.5) {
      insights.push({
        text: `Your retirement savings are growing but need to roughly double to reach your target corpus by age ${opts.retirementAge}.`,
        moduleId: 'retirement',
      })
    }
  }

  if (estateModule && estateModule.gap > 0 && totalGap > 0) {
    const estatePct = Math.round((estateModule.gap / totalGap) * 100)
    if (estatePct >= 25) {
      insights.push({
        text: `Estate tax alone accounts for ${estatePct}% of your total gap. Liquidity planning is as important as coverage here.`,
        moduleId: 'estate',
      })
    }
  }

  return insights.slice(0, 5)
}

// ── Recommendations ───────────────────────────────────────────────────────────

function fmtRange(lo: number, hi: number): string {
  return `${fmt(lo)}–${fmt(hi)}/mo`
}

export function computeRecommendations(
  summary: GapSummary,
  monthlyRetirementSavings: number
): GapRecommendation[] {
  const { modules } = summary
  const recs: GapRecommendation[] = []

  const life = modules.find((m) => m.moduleId === 'life')
  const ci = modules.find((m) => m.moduleId === 'ci')
  const retirement = modules.find((m) => m.moduleId === 'retirement')
  const education = modules.find((m) => m.moduleId === 'education')
  const estate = modules.find((m) => m.moduleId === 'estate')

  if (life && life.gap > 0) {
    const coverageNeeded = Math.ceil(life.gap / 1_000_000)
    const lo = Math.round(coverageNeeded * 3_000)
    const hi = Math.round(coverageNeeded * 8_000)
    recs.push({
      priority: 1,
      label: 'Secure life insurance coverage',
      rationale: `Your ${fmt(life.gap)} life gap leaves your family with no income buffer if you were gone tomorrow.`,
      estimatedMonthly: fmtRange(lo, hi),
      urgency: life.gap / (life.need || 1) > 0.3 ? 'immediate' : 'within_3mo',
    })
  }

  if (ci && ci.gap > 0) {
    const coverageM = Math.ceil(ci.gap / 1_000_000)
    const lo = Math.round(coverageM * 800)
    const hi = Math.round(coverageM * 2_500)
    recs.push({
      priority: 2,
      label: 'Add a critical illness plan',
      rationale: `${fmt(ci.gap)} in CI exposure means one major health event could wipe out your savings.`,
      estimatedMonthly: fmtRange(lo, hi),
      urgency: ci.gap / (ci.need || 1) > 0.3 ? 'immediate' : 'within_3mo',
    })
  }

  if (retirement && retirement.gap > 0) {
    const additionalNeeded = Math.ceil(retirement.gap / 1_000_000) * 1_500
    const additionalMonthly = Math.max(additionalNeeded, monthlyRetirementSavings * 0.5)
    recs.push({
      priority: 3,
      label: 'Increase retirement contributions',
      rationale: `Your projected corpus falls ${fmt(retirement.gap)} short. Starting now maximizes compounding runway.`,
      estimatedMonthly: `+${fmt(Math.round(additionalMonthly))}/mo`,
      urgency: 'within_3mo',
    })
  }

  if (education && education.gap > 0) {
    recs.push({
      priority: 4,
      label: 'Top up your education fund',
      rationale: `Projected savings fall ${fmt(education.gap)} short of the college fund target.`,
      estimatedMonthly: `+${fmt(Math.round(education.gap / 120))}/mo`,
      urgency: 'within_1yr',
    })
  }

  if (estate && estate.gap > 0) {
    recs.push({
      priority: 5,
      label: 'Arrange estate tax liquidity',
      rationale: `${fmt(estate.gap)} in estate tax must be paid in cash within one year of death.`,
      estimatedMonthly: `${fmt(Math.round(estate.gap / 120))}/mo toward a reserve fund`,
      urgency: 'within_1yr',
    })
  }

  const maxToShow = recs.length >= 5 ? 5 : 3
  return recs.slice(0, maxToShow)
}

// ── Display helper ────────────────────────────────────────────────────────────

export function fmt(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000
    return `₱${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`
  }
  if (n >= 1_000) {
    return `₱${Math.round(n / 1_000)}K`
  }
  return `₱${Math.round(n).toLocaleString('en-PH')}`
}
