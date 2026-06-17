// ── Module inputs ─────────────────────────────────────────────────────────────

export interface DiméInputs {
  finalExpenses: number
  outstandingLoans: number
  outstandingMortgage: number
  annualIncome: number
  incomeYearsNeeded: number
  // Children: count derived from shared childAges; collegeFundPerChild = total per child (all years)
  numChildren: number
  collegeFundPerChild: number
  existingLifeCoverage: number
}

export interface CIInputs {
  monthlyIncome: number
  existingCICoverage: number
}

export interface EducationInputs {
  childAges: number[]
  collegeFundPerChild: number
  existingSavings: number
  monthlySavings: number
}

export interface RetirementInputs {
  currentAge: number
  retirementAge: number
  monthlyIncome: number
  targetIncomeReplacementPct: number
  existingRetirementSavings: number
  monthlyRetirementSavings: number
}

export interface EstateInputs {
  netEstateValue: number
  liquidReserves: number
}

// ── Module results ────────────────────────────────────────────────────────────

export interface GapModuleResult {
  moduleId: string
  moduleName: string
  need: number
  have: number
  gap: number
  breakdown?: Record<string, number>
}

export interface GapSummary {
  modules: GapModuleResult[]
  totalGap: number
  totalNeed: number
  protectedPct: number
}

// ── Analysis, insights, recommendations ──────────────────────────────────────

export interface GapAnalysis {
  headline: string
  overallStatus: 'critical' | 'serious' | 'moderate' | 'good'
  biggestGapModule: string
  biggestGapPct: number
  incomeMonthsExposed: number
}

export interface GapInsight {
  text: string
  moduleId?: string
}

export interface GapRecommendation {
  priority: 1 | 2 | 3 | 4 | 5
  label: string
  rationale: string
  estimatedMonthly: string
  urgency: 'immediate' | 'within_3mo' | 'within_1yr'
}
