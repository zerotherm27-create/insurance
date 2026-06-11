import type {
  CoverageBenefit,
  CoverageBenefitStatus,
  FunnelAIReport,
  FunnelAnswers,
  FunnelSegment,
} from '@/types/funnel'

/**
 * Deterministic coverage-benefit engine.
 *
 * Every status comes straight from the lead's own quiz answers, and every peso
 * amount comes from the constants below (bracket midpoints x standard planning
 * multiples). The AI never computes or alters these numbers; it only writes
 * short prose around them. Jojo: adjust any constant here and the whole
 * funnel follows.
 *
 * Number sources:
 * - Coverage multiples (10x/5x annual income, 3-6 months emergency fund,
 *   2-5 years of expenses) are standard industry guidelines (DIME method).
 * - Critical illness anchors sit at the conservative end of published PH
 *   treatment costs (stroke ~1.8M, heart bypass 700k+, cancer up to 1M+).
 * - Estate tax is the TRAIN Law flat 6% on the NET estate; copy must say
 *   "roughly 6% of your net estate" since deductions apply.
 */

// ── Bracket midpoints (monthly pesos unless noted) ───────────────────────────

const PRO_INCOME_MID: Record<string, number> = {
  below_15k: 12000,
  '15k_30k': 22500,
  '30k_60k': 45000,
  '60k_100k': 80000,
  '100k_plus': 120000,
}

const FAMILY_INCOME_MID: Record<string, number> = {
  below_30k: 25000,
  '30k_60k': 45000,
  '60k_120k': 90000,
  '120k_plus': 150000,
}

const OFW_REMITTANCE_MID: Record<string, number> = {
  below_15k: 12000,
  '15k_30k': 22500,
  '30k_60k': 45000,
  '60k_plus': 75000,
}

// Estate value midpoints (total pesos)
const HNW_ESTATE_MID: Record<string, number> = {
  under_20m: 15_000_000,
  '20_50m': 35_000_000,
  '50_200m': 100_000_000,
  '200m_plus': 250_000_000,
}

const ESTATE_TAX_RATE = 0.06 // TRAIN Law (RA 10963), flat 6% on the net estate

// ── Helpers ──────────────────────────────────────────────────────────────────

function peso(n: number): string {
  return `₱${Math.round(n).toLocaleString('en-PH')}`
}

// Critical illness fund anchors, tiered by monthly income.
function ciAmounts(monthlyIncome: number): { ideal: string; starter: string } {
  if (monthlyIncome < 30000) return { ideal: peso(1_000_000), starter: peso(500_000) }
  if (monthlyIncome < 60000) return { ideal: peso(1_500_000), starter: peso(750_000) }
  return { ideal: peso(2_000_000), starter: peso(1_000_000) }
}

function incomeReplacement(monthlyIncome: number): { ideal: string; starter: string } {
  const annual = monthlyIncome * 12
  return { ideal: peso(annual * 10), starter: peso(annual * 5) }
}

function emergencyFund(monthlyIncome: number): { ideal: string; starter: string } {
  return { ideal: `${peso(monthlyIncome * 6)} (6 months)`, starter: `${peso(monthlyIncome * 3)} (3 months)` }
}

// ── Per-segment builders ─────────────────────────────────────────────────────

function proBenefits(a: FunnelAnswers): CoverageBenefit[] {
  const income = PRO_INCOME_MID[a.incomeRange ?? ''] ?? 45000
  const ef = emergencyFund(income)
  const ci = ciAmounts(income)
  const life = incomeReplacement(income)
  const noDeps = a.dependents === 'no_one'

  const efStatus: CoverageBenefitStatus =
    a.emergencyFund === 'none' ? 'gap' : a.emergencyFund === 'under_3mo' ? 'partial' : 'have'
  const ciStatus: CoverageBenefitStatus =
    a.healthCoverage === 'none' ? 'gap' : a.healthCoverage === 'hmo_only' ? 'partial' : 'have'
  const debtStatus: CoverageBenefitStatus =
    a.debts === 'none' ? 'have' : a.debts === 'student_personal' ? 'partial' : 'gap'

  return [
    {
      id: 'emergency_fund',
      name: 'Emergency Fund',
      status: efStatus,
      idealAmount: ef.ideal,
      starterAmount: ef.starter,
    },
    {
      id: 'critical_illness',
      name: 'Health and Critical Illness Fund',
      status: ciStatus,
      idealAmount: ci.ideal,
      starterAmount: ci.starter,
    },
    noDeps
      ? {
          id: 'life_coverage',
          name: 'Life Coverage',
          status: 'partial',
          idealAmount: `${peso(250_000)} to ${peso(500_000)}, covers final costs so nothing falls on others`,
        }
      : {
          id: 'life_coverage',
          name: 'Life Coverage',
          status: 'gap',
          idealAmount: life.ideal,
          starterAmount: life.starter,
        },
    {
      id: 'debt_protection',
      name: 'Debt Protection',
      status: debtStatus,
      idealAmount: 'Enough to clear your balances so they never pass to your family',
    },
  ]
}

function familyBenefits(a: FunnelAnswers): CoverageBenefit[] {
  const income = FAMILY_INCOME_MID[a.incomeRange ?? ''] ?? 45000
  const ir = incomeReplacement(income)
  const ci = ciAmounts(income)
  const ef = emergencyFund(income)

  const irStatus: CoverageBenefitStatus =
    a.lifeInsuranceAdequacy === 'none' ? 'gap' : a.lifeInsuranceAdequacy === 'unsure' ? 'partial' : 'have'
  const ciStatus: CoverageBenefitStatus = a.lifeInsuranceAdequacy === 'adequate' ? 'have' : 'partial'
  const debtStatus: CoverageBenefitStatus = a.majorDebts === 'none' ? 'have' : 'gap'
  const efStatus: CoverageBenefitStatus = a.familyPriority === 'emergency_fund' ? 'gap' : 'partial'

  return [
    {
      id: 'income_replacement',
      name: 'Income Replacement',
      status: irStatus,
      idealAmount: ir.ideal,
      starterAmount: ir.starter,
    },
    {
      id: 'critical_illness',
      name: 'Critical Illness Fund',
      status: ciStatus,
      idealAmount: ci.ideal,
      starterAmount: ci.starter,
    },
    {
      id: 'debt_protection',
      name: 'Debt Protection',
      status: debtStatus,
      idealAmount: 'Enough to clear your mortgage or loan balance so it never passes to your family',
    },
    {
      id: 'emergency_fund',
      name: 'Emergency Fund',
      status: efStatus,
      idealAmount: ef.ideal,
      starterAmount: ef.starter,
    },
  ]
}

function ofwBenefits(a: FunnelAnswers): CoverageBenefit[] {
  const remit = OFW_REMITTANCE_MID[a.remittance ?? ''] ?? 45000
  const ir = incomeReplacement(remit)
  const ci = ciAmounts(remit)

  const coverStatus: CoverageBenefitStatus =
    a.coverageAbroad === 'none' ? 'gap' : a.coverageAbroad === 'both' ? 'have' : 'partial'
  const goalStatus: CoverageBenefitStatus =
    a.remittanceGoal === 'daily_needs' || a.comeHomePlan === 'no_plan'
      ? 'gap'
      : a.remittanceGoal === 'comeback_fund' && a.comeHomePlan === 'within_2'
        ? 'have'
        : 'partial'

  return [
    {
      id: 'family_income_protection',
      name: 'Family Income Protection',
      status: coverStatus,
      idealAmount: `${ir.ideal}, based on what you send home (your real income is likely higher)`,
      starterAmount: ir.starter,
    },
    {
      id: 'critical_illness',
      name: 'Critical Illness Fund (valid in the Philippines)',
      status: coverStatus,
      idealAmount: ci.ideal,
      starterAmount: ci.starter,
    },
    {
      id: 'homecoming_fund',
      name: 'Homecoming Fund Protection',
      status: goalStatus,
      idealAmount: 'A fund that keeps growing even if your remittances stop',
    },
  ]
}

function entrepreneurBenefits(a: FunnelAnswers): CoverageBenefit[] {
  const ipStatus: CoverageBenefitStatus =
    a.incomeIfSick === 'stops' ? 'gap' : a.incomeIfSick === 'drops_a_lot' ? 'partial' : 'have'
  const ciStatus: CoverageBenefitStatus =
    a.safetyNet === 'none' || a.safetyNet === 'emergency_fund'
      ? 'gap'
      : 'partial'
  const bufferStatus: CoverageBenefitStatus = a.safetyNet === 'emergency_fund' ? 'have' : 'gap'
  const retStatus: CoverageBenefitStatus =
    a.retirementSaving === 'not_yet' ? 'gap' : a.retirementSaving === 'a_little' ? 'partial' : 'have'

  return [
    {
      id: 'income_protection',
      name: 'Income Protection',
      status: ipStatus,
      idealAmount: '5 years of your monthly expenses',
      starterAmount: '2 years of your monthly expenses',
    },
    {
      id: 'critical_illness',
      name: 'Health and Critical Illness Fund',
      status: ciStatus,
      idealAmount: peso(2_000_000),
      starterAmount: peso(1_000_000),
    },
    {
      id: 'emergency_buffer',
      name: 'Emergency Buffer',
      status: bufferStatus,
      idealAmount: '6 months of personal and business expenses',
      starterAmount: '3 months of personal and business expenses',
    },
    {
      id: 'retirement',
      name: 'Your Own Retirement Fund',
      status: retStatus,
      idealAmount: 'A self-funded plan growing monthly, since no employer is building one for you',
    },
  ]
}

function businessBenefits(a: FunnelAnswers): CoverageBenefit[] {
  const bigBusiness = a.businessSize === '11_50' || a.businessSize === '50_plus'

  const kpStatus: CoverageBenefitStatus =
    a.keyPerson === 'yes' ? 'have' : a.keyPerson === 'unsure' ? 'partial' : 'gap'
  const loanStatus: CoverageBenefitStatus =
    a.personalGuarantees === 'none'
      ? 'have'
      : a.personalGuarantees === 'significant'
        ? 'gap'
        : 'partial'
  const succStatus: CoverageBenefitStatus =
    a.successionPlan === 'documented' ? 'have' : a.successionPlan === 'none' ? 'gap' : 'partial'

  return [
    {
      id: 'key_person',
      name: 'Key-Person Coverage',
      status: kpStatus,
      idealAmount: bigBusiness
        ? '2 to 3 years of the income your absence would erase, typically ₱10M and up at your scale'
        : '2 to 3 years of the income your absence would erase',
    },
    {
      id: 'loan_protection',
      name: 'Loan and Guarantee Protection',
      status: loanStatus,
      idealAmount: 'Equal to your personally guaranteed balances, so your family never inherits business debt',
    },
    {
      id: 'succession_funding',
      name: 'Succession Funding',
      status: succStatus,
      idealAmount: 'A funded buy-sell agreement so ownership transfers without conflict',
    },
    {
      id: 'family_protection',
      name: 'Family Protection',
      status: 'gap',
      idealAmount: 'Separate from the business: 10x your personal annual income',
    },
  ]
}

function hnwBenefits(a: FunnelAnswers): CoverageBenefit[] {
  const estate = HNW_ESTATE_MID[a.netWorth ?? ''] ?? 35_000_000
  const taxCash = estate * ESTATE_TAX_RATE

  const taxStatus: CoverageBenefitStatus =
    a.estateTaxReadiness === 'funded' ? 'have' : a.estateTaxReadiness === 'partial' ? 'partial' : 'gap'
  const probateStatus: CoverageBenefitStatus =
    a.probateExposure === 'bypass_probate'
      ? 'have'
      : a.probateExposure === 'accept_risk'
        ? 'partial'
        : 'gap'
  const docStatus: CoverageBenefitStatus =
    a.estatePlan === 'comprehensive' ? 'have' : a.estatePlan === 'none' ? 'gap' : 'partial'

  const LEGACY_FRAMING: Record<string, string> = {
    minimize_tax: 'Coverage structured to absorb estate taxes instead of your assets',
    avoid_conflict: 'Coverage with named beneficiaries, removing room for family dispute',
    fund_grandchildren: 'Coverage dedicated to funding the next generation directly',
    philanthropy: 'Coverage that funds your cause without reducing what your family receives',
    business_succession: 'Coverage that funds succession so heirs are treated fairly',
  }

  return [
    {
      id: 'estate_tax_liquidity',
      name: 'Estate Tax Liquidity',
      status: taxStatus,
      idealLabel: 'Estimated cash your heirs may need',
      idealAmount: `${peso(taxCash)}, roughly 6% of your net estate before deductions`,
    },
    {
      id: 'probate_bypass',
      name: 'Probate Bypass Structure',
      status: probateStatus,
      idealLabel: 'Comprehensive',
      idealAmount: 'Direct, private transfer to named beneficiaries with no court involvement',
    },
    {
      id: 'estate_documentation',
      name: 'Estate Documentation',
      status: docStatus,
      idealLabel: 'Comprehensive',
      idealAmount: 'A current, fully documented estate plan',
    },
    {
      id: 'legacy_coverage',
      name: 'Legacy Coverage',
      status: 'partial',
      idealLabel: 'Comprehensive',
      idealAmount:
        LEGACY_FRAMING[a.legacyPriority ?? ''] ?? 'Coverage sized to your estate and legacy goals',
    },
  ]
}

function generalBenefits(a: FunnelAnswers): CoverageBenefit[] {
  const income = PRO_INCOME_MID[a.incomeRange ?? ''] ?? 45000
  const ir = incomeReplacement(income)
  const ci = ciAmounts(income)
  const ef = emergencyFund(income)

  const irStatus: CoverageBenefitStatus =
    a.lifeInsurance === 'none' ? 'gap' : a.lifeInsurance === 'have_unsure' ? 'partial' : 'have'
  const ciStatus: CoverageBenefitStatus =
    a.healthCoverage === 'none' ? 'gap' : a.healthCoverage === 'hmo_only' ? 'partial' : 'have'
  const efStatus: CoverageBenefitStatus = a.biggestWorry === 'emergency_savings' ? 'gap' : 'partial'

  return [
    {
      id: 'income_replacement',
      name: 'Income Replacement',
      status: irStatus,
      idealAmount: ir.ideal,
      starterAmount: ir.starter,
    },
    {
      id: 'critical_illness',
      name: 'Health and Critical Illness Fund',
      status: ciStatus,
      idealAmount: ci.ideal,
      starterAmount: ci.starter,
    },
    {
      id: 'emergency_fund',
      name: 'Emergency Fund',
      status: efStatus,
      idealAmount: ef.ideal,
      starterAmount: ef.starter,
    },
  ]
}

// ── Public API ───────────────────────────────────────────────────────────────

export function buildCoverageBenefits(answers: FunnelAnswers): CoverageBenefit[] {
  switch (answers.segment) {
    case 'pro': return proBenefits(answers)
    case 'family': return familyBenefits(answers)
    case 'ofw': return ofwBenefits(answers)
    case 'entrepreneur': return entrepreneurBenefits(answers)
    case 'business': return businessBenefits(answers)
    case 'hnw': return hnwBenefits(answers)
    default: return generalBenefits(answers)
  }
}

/**
 * Weighted score from benefit statuses. The first benefit is the segment's
 * primary protection need, so it carries double weight. An all-gaps lead
 * lands well under 30; a fully covered lead lands above 85.
 */
export function computeProtectionScore(benefits: CoverageBenefit[]): number {
  const value: Record<CoverageBenefitStatus, number> = { have: 100, partial: 50, gap: 10 }
  let total = 0
  let weightSum = 0
  benefits.forEach((b, i) => {
    const weight = i === 0 ? 2 : 1
    total += value[b.status] * weight
    weightSum += weight
  })
  const score = weightSum > 0 ? total / weightSum : 50
  return Math.min(95, Math.max(15, Math.round(score)))
}

export function scoreLabelFor(score: number): FunnelAIReport['scoreLabel'] {
  if (score < 30) return 'Critical Gaps'
  if (score < 50) return 'Needs Attention'
  if (score < 70) return 'Partially Protected'
  if (score < 85) return 'Well Protected'
  return 'Strongly Protected'
}

/**
 * Monthly protection budget guideline, computed (not AI-estimated).
 * Income segments: 10 to 15% of monthly income, a standard planning guideline.
 */
export function estimatedRangeFor(segment: FunnelSegment | undefined, answers: FunnelAnswers): string {
  const guideline = (monthly: number) =>
    `A common guideline is 10 to 15% of income: around ${peso(monthly * 0.10)} to ${peso(monthly * 0.15)} monthly for your range.`

  switch (segment) {
    case 'pro':
      return guideline(PRO_INCOME_MID[answers.incomeRange ?? ''] ?? 45000)
    case 'family':
      return guideline(FAMILY_INCOME_MID[answers.incomeRange ?? ''] ?? 45000)
    case 'ofw':
      return guideline(OFW_REMITTANCE_MID[answers.remittance ?? ''] ?? 45000)
    case 'entrepreneur':
      return 'A common guideline for variable earners is 10 to 15% of your average monthly income.'
    case 'business':
      return 'Your coverage budget depends on scale and is best estimated in a short consultation.'
    case 'hnw':
      return 'Coverage is structured to your estate scale and discussed privately in consultation.'
    default:
      return guideline(PRO_INCOME_MID[answers.incomeRange ?? ''] ?? 45000)
  }
}

/** Legacy snapshot derived from benefits so older UI and emails keep working. */
export function snapshotFromBenefits(benefits: CoverageBenefit[]): FunnelAIReport['snapshot'] {
  const icon: Record<CoverageBenefitStatus, '✅' | '⚠️' | '❌'> = {
    have: '✅',
    partial: '⚠️',
    gap: '❌',
  }
  const phrase: Record<CoverageBenefitStatus, string> = {
    have: 'you have this covered',
    partial: 'worth reviewing',
    gap: 'gap detected',
  }
  return benefits.slice(0, 4).map((b) => ({
    icon: icon[b.status],
    text: `${b.name}: ${phrase[b.status]}`,
  }))
}

/**
 * The lead's most urgent benefit (first gap, else first partial) for email
 * personalization. Fallbacks keep template sentences readable for old leads
 * whose stored reports predate coverageBenefits.
 */
export function topGapFromReport(report: Pick<FunnelAIReport, 'coverageBenefits'> | null): {
  name: string
  ideal: string
  starter: string
} {
  const benefits = report?.coverageBenefits ?? []
  const top = benefits.find((b) => b.status === 'gap') ?? benefits.find((b) => b.status === 'partial')
  if (!top) {
    return {
      name: 'your biggest protection gap',
      ideal: 'the ideal level for your profile',
      starter: 'a starter level',
    }
  }
  return {
    name: top.name,
    ideal: top.idealAmount,
    starter: top.starterAmount ?? top.idealAmount,
  }
}

/** Compact one-line-per-benefit table for the AI prompt (keeps tokens low). */
export function benefitTableForPrompt(benefits: CoverageBenefit[]): string {
  return benefits
    .map((b) => {
      const starter = b.starterAmount ? ` | starter ${b.starterAmount}` : ''
      return `${b.id} | ${b.name} | ${b.status} | ideal ${b.idealAmount}${starter}`
    })
    .join('\n')
}
