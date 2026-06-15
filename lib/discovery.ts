/**
 * Deck-native financial discovery.
 *
 * Self-contained from the presentation deck (Slide 8 goal → /discovery). It is
 * intentionally separate from the public /funnel quiz: a short 4-question pass
 * that turns a chosen goal plus a few facts into a clear gap board and a
 * recommended coverage type that fits the goal.
 *
 * Compliance: no product or company names anywhere here. Coverage types only,
 * matching the public funnel's lead-facing rule. Jojo names the specific
 * product verbally during the consultation.
 *
 * Peso math is shared with lib/coverage-benefits.ts so the deck and the funnel
 * never drift apart on coverage amounts.
 */

import {
  ciAmounts,
  emergencyFund,
  estateTax,
  incomeReplacement,
  peso,
} from '@/lib/coverage-benefits'
import type { CoverageBenefitStatus } from '@/types/funnel'

// Two discovery tracks. The default track is the income-based pass used by the
// mass-market decks (pro, family, ofw, etc.). The HNW track is estate-based: it
// never asks about monthly income or budgets, and its gap board is built from
// net estate and the 6% estate tax due in cash.
export type DefaultGoal = 'health' | 'starter' | 'income' | 'growth' | 'figuring'
export type HnwGoal = 'estate_liquidity' | 'clean_transfer' | 'preservation' | 'legacy' | 'confidential'
export type DiscoveryGoal = DefaultGoal | HnwGoal

export interface DiscoveryAnswers {
  goal: DiscoveryGoal
  // Default track
  income?: string
  dependents?: string
  currentProtection?: string
  emergencyFund?: string
  // HNW track
  netEstate?: string
  liquidity?: string
  heirs?: string
  structure?: string
}

export interface DiscoveryQuestion {
  field: keyof Omit<DiscoveryAnswers, 'goal'>
  question: string
  options: { value: string; label: string }[]
}

export interface DiscoveryGapItem {
  id: string
  name: string
  status: CoverageBenefitStatus
  idealAmount: string
  starterAmount?: string
}

export interface DiscoveryPlan {
  // Coverage type, never a product name.
  coverageType: string
  // One line on why this fits the goal the client picked.
  fitReason: string
  // What this kind of plan does for them, in plain language.
  whatItDoes: string
}

export interface DiscoveryResult {
  goal: DiscoveryGoal
  goalLabel: string
  score: number
  scoreLabel: string
  gaps: DiscoveryGapItem[]
  attentionCount: number
  topGapName: string
  plan: DiscoveryPlan
}

// ── Goal copy ────────────────────────────────────────────────────────────────

export const GOAL_LABEL: Record<DefaultGoal, string> = {
  health: 'Health protection',
  starter: 'Affordable starter coverage',
  income: 'Future guaranteed income',
  growth: 'Long-term growth',
  figuring: 'Still figuring things out',
}

export function isDiscoveryGoal(value: string | null): value is DefaultGoal {
  return value === 'health' || value === 'starter' || value === 'income' || value === 'growth' || value === 'figuring'
}

// ── The short quiz (same 4 questions regardless of goal) ─────────────────────

export const DISCOVERY_QUESTIONS: DiscoveryQuestion[] = [
  {
    field: 'income',
    question: 'What is your monthly income range?',
    options: [
      { value: 'below_15k', label: 'Below ₱15,000' },
      { value: '15k_30k', label: '₱15,000 to ₱30,000' },
      { value: '30k_60k', label: '₱30,000 to ₱60,000' },
      { value: '60k_100k', label: '₱60,000 to ₱100,000' },
      { value: '100k_plus', label: 'More than ₱100,000' },
    ],
  },
  {
    field: 'dependents',
    question: 'Who depends on your income?',
    options: [
      { value: 'no_one', label: 'No one yet, just myself' },
      { value: 'parents', label: 'My parents or siblings' },
      { value: 'partner', label: 'My partner or spouse' },
      { value: 'children', label: 'My children' },
    ],
  },
  {
    field: 'currentProtection',
    question: 'What protection do you have right now?',
    options: [
      { value: 'none', label: 'None yet' },
      { value: 'hmo_only', label: 'Company HMO only' },
      { value: 'some', label: 'Some insurance, but unsure if enough' },
      { value: 'covered', label: 'I feel well covered already' },
    ],
  },
  {
    field: 'emergencyFund',
    question: 'How much emergency savings do you have?',
    options: [
      { value: 'none', label: 'No emergency fund yet' },
      { value: 'under_3mo', label: 'Less than 3 months of expenses' },
      { value: '3_plus', label: '3 months or more' },
    ],
  },
]

const INCOME_MID: Record<string, number> = {
  below_15k: 12000,
  '15k_30k': 22500,
  '30k_60k': 45000,
  '60k_100k': 80000,
  '100k_plus': 120000,
}

// ── Gap computation ──────────────────────────────────────────────────────────

function buildGaps(a: DiscoveryAnswers): DiscoveryGapItem[] {
  const income = INCOME_MID[a.income ?? ''] ?? 45000
  const ci = ciAmounts(income)
  const life = incomeReplacement(income)
  const ef = emergencyFund(income)
  const hasDeps = a.dependents && a.dependents !== 'no_one'

  // Health & critical illness
  const healthStatus: CoverageBenefitStatus =
    a.currentProtection === 'none'
      ? 'gap'
      : a.currentProtection === 'hmo_only'
        ? 'partial'
        : a.currentProtection === 'some'
          ? 'partial'
          : 'have'

  // Life / income protection — only a true gap when others depend on you
  const lifeStatus: CoverageBenefitStatus = hasDeps
    ? a.currentProtection === 'covered'
      ? 'have'
      : a.currentProtection === 'some'
        ? 'partial'
        : 'gap'
    : a.currentProtection === 'covered'
      ? 'have'
      : 'partial'

  // Emergency fund
  const efStatus: CoverageBenefitStatus =
    a.emergencyFund === 'none' ? 'gap' : a.emergencyFund === 'under_3mo' ? 'partial' : 'have'

  const gaps: DiscoveryGapItem[] = [
    {
      id: 'health_ci',
      name: 'Health and Critical Illness Fund',
      status: healthStatus,
      idealAmount: ci.ideal,
      starterAmount: ci.starter,
    },
    hasDeps
      ? {
          id: 'income_protection',
          name: 'Income and Life Protection',
          status: lifeStatus,
          idealAmount: life.ideal,
          starterAmount: life.starter,
        }
      : {
          id: 'income_protection',
          name: 'Life Coverage',
          status: lifeStatus,
          idealAmount: `${peso(250_000)} to ${peso(500_000)}, covers final costs so nothing falls on family`,
        },
    {
      id: 'emergency_fund',
      name: 'Emergency Fund',
      status: efStatus,
      idealAmount: ef.ideal,
      starterAmount: ef.starter,
    },
  ]

  // Goal-specific fourth row
  if (a.goal === 'growth') {
    gaps.push({
      id: 'growth_fund',
      name: 'Long-Term Growth Fund',
      status: 'gap',
      idealAmount: 'A plan that grows your money while keeping you protected',
    })
  } else if (a.goal === 'income') {
    gaps.push({
      id: 'income_stream',
      name: 'Future Income Stream',
      status: 'gap',
      idealAmount: 'A plan that pays you guaranteed income later in life',
    })
  }

  return gaps
}

// ── Score (mirrors coverage-benefits weighting: first row double weight) ─────

function scoreFrom(gaps: DiscoveryGapItem[]): number {
  const value: Record<CoverageBenefitStatus, number> = { have: 100, partial: 50, gap: 10 }
  let total = 0
  let weightSum = 0
  gaps.forEach((g, i) => {
    const weight = i === 0 ? 2 : 1
    total += value[g.status] * weight
    weightSum += weight
  })
  const score = weightSum > 0 ? total / weightSum : 50
  return Math.min(95, Math.max(15, Math.round(score)))
}

function scoreLabelFor(score: number): string {
  if (score < 30) return 'Critical Gaps'
  if (score < 50) return 'Needs Attention'
  if (score < 70) return 'Partially Protected'
  if (score < 85) return 'Well Protected'
  return 'Strongly Protected'
}

// ── Plan recommendation — coverage type fitted to the goal ───────────────────

const GOAL_PLAN: Record<Exclude<DefaultGoal, 'figuring'>, DiscoveryPlan> = {
  health: {
    coverageType: 'A health and critical illness plan',
    fitReason: 'You told us health protection matters most to you.',
    whatItDoes:
      'Gives you a cash fund the moment a major illness is diagnosed, on top of any HMO, so treatment never drains your savings.',
  },
  starter: {
    coverageType: 'An affordable starter protection plan',
    fitReason: 'You want meaningful coverage without a heavy budget.',
    whatItDoes:
      'Locks in essential life and health protection at a low entry cost while you are young and insurable, with room to grow later.',
  },
  income: {
    coverageType: 'A guaranteed income plan',
    fitReason: 'You want predictable income you can count on in the future.',
    whatItDoes:
      'Builds a pool that pays you guaranteed cash benefits down the line, while protecting your family in the meantime.',
  },
  growth: {
    coverageType: 'A plan that pairs protection with investment growth',
    fitReason: 'You want your money working and growing over the long term.',
    whatItDoes:
      'Combines life protection with an investment fund, so you stay covered while your money grows toward your bigger goals.',
  },
}

// For "still figuring it out", recommend based on the most urgent gap.
function planForFiguring(gaps: DiscoveryGapItem[]): DiscoveryPlan {
  const topGap = gaps.find((g) => g.status === 'gap') ?? gaps.find((g) => g.status === 'partial')
  if (topGap?.id === 'emergency_fund') {
    return {
      coverageType: 'A protect-and-save plan',
      fitReason: 'Your most urgent gap right now is your emergency buffer.',
      whatItDoes:
        'Builds an accessible fund while giving you essential protection, so one emergency does not undo your progress.',
    }
  }
  if (topGap?.id === 'income_protection') {
    return {
      coverageType: 'An income and life protection plan',
      fitReason: 'People depend on your income, and that is the biggest gap to close first.',
      whatItDoes:
        'Replaces your income for the people who rely on you if something happens to you.',
    }
  }
  return {
    coverageType: 'A health and critical illness plan',
    fitReason: 'Closing your health gap is the strongest first move for your profile.',
    whatItDoes:
      'Gives you a cash fund the moment a major illness strikes, so treatment never drains your savings.',
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

export function computeDiscovery(answers: DiscoveryAnswers): DiscoveryResult {
  const goal = answers.goal as DefaultGoal
  const gaps = buildGaps(answers)
  const score = scoreFrom(gaps)
  const attentionCount = gaps.filter((g) => g.status !== 'have').length
  const topGap = gaps.find((g) => g.status === 'gap') ?? gaps.find((g) => g.status === 'partial') ?? gaps[0]

  const plan = goal === 'figuring' ? planForFiguring(gaps) : GOAL_PLAN[goal]

  return {
    goal,
    goalLabel: GOAL_LABEL[goal],
    score,
    scoreLabel: scoreLabelFor(score),
    gaps,
    attentionCount,
    topGapName: topGap?.name ?? 'your protection',
    plan,
  }
}

// ── HNW track ────────────────────────────────────────────────────────────────
//
// Estate-based discovery. No monthly income, no budget framing. The gap board
// is built from net estate and the 6% estate tax due in cash within one year.

export const HNW_GOAL_LABEL: Record<HnwGoal, string> = {
  estate_liquidity: 'Estate tax liquidity',
  clean_transfer: 'Clean wealth transfer',
  preservation: 'Estate preservation',
  legacy: 'A continuing legacy',
  confidential: 'A confidential review',
}

export function isHnwGoal(value: string | null): value is HnwGoal {
  return (
    value === 'estate_liquidity' ||
    value === 'clean_transfer' ||
    value === 'preservation' ||
    value === 'legacy' ||
    value === 'confidential'
  )
}

export const HNW_QUESTIONS: DiscoveryQuestion[] = [
  {
    field: 'netEstate',
    question: 'What is the estimated value of your estate?',
    options: [
      { value: 'under_20m', label: 'Under ₱20 million' },
      { value: '20_50m', label: '₱20 to ₱50 million' },
      { value: '50_200m', label: '₱50 to ₱200 million' },
      { value: '200m_plus', label: 'Over ₱200 million' },
    ],
  },
  {
    field: 'liquidity',
    question: 'How much of the estate is held as liquid cash?',
    options: [
      { value: 'most', label: 'Most of it is liquid' },
      { value: 'about_half', label: 'Roughly half' },
      { value: 'small', label: 'A small portion' },
      { value: 'minimal', label: 'Very little, it is mostly property, shares, or the business' },
    ],
  },
  {
    field: 'heirs',
    question: 'Who are the intended heirs?',
    options: [
      { value: 'spouse', label: 'My spouse' },
      { value: 'children', label: 'My children' },
      { value: 'multi_gen', label: 'Multiple generations and extended family' },
      { value: 'foundation', label: 'A foundation or a cause I care about' },
    ],
  },
  {
    field: 'structure',
    question: 'What transfer structure is in place today?',
    options: [
      { value: 'none', label: 'Nothing formal yet' },
      { value: 'will_only', label: 'A will only' },
      { value: 'partial', label: 'Some planning, not complete' },
      { value: 'structured', label: 'A full, structured plan' },
    ],
  },
]

// Net estate midpoints (total pesos), mirroring the deck's estate-tax clock.
const ESTATE_MID: Record<string, number> = {
  under_20m: 15_000_000,
  '20_50m': 35_000_000,
  '50_200m': 100_000_000,
  '200m_plus': 250_000_000,
}

const LIQUIDITY_RANK: Record<string, number> = { most: 3, about_half: 2, small: 1, minimal: 0 }

function buildHnwGaps(a: DiscoveryAnswers): DiscoveryGapItem[] {
  const estate = ESTATE_MID[a.netEstate ?? ''] ?? 35_000_000
  const tax = estateTax(estate)
  const liq = LIQUIDITY_RANK[a.liquidity ?? ''] ?? 1

  // Estate tax due in cash within one year: covered only when the estate is
  // liquid enough to pay it without selling assets.
  const taxStatus: CoverageBenefitStatus = liq >= 3 ? 'have' : liq === 2 ? 'partial' : 'gap'

  // Clean transfer. A will alone still passes through public probate, so it is
  // a partial at best; only a full structure bypasses the court.
  const transferStatus: CoverageBenefitStatus =
    a.structure === 'structured'
      ? 'have'
      : a.structure === 'partial' || a.structure === 'will_only'
        ? 'partial'
        : 'gap'

  // Preservation: protected only when the estate is both liquid enough and
  // has a structure; fully exposed when it is illiquid and unstructured.
  const preservationStatus: CoverageBenefitStatus =
    liq >= 2 && (a.structure === 'structured' || a.structure === 'partial')
      ? 'have'
      : liq === 0 && (a.structure === 'none' || a.structure === 'will_only')
        ? 'gap'
        : 'partial'

  const gaps: DiscoveryGapItem[] = [
    {
      id: 'estate_tax_liquidity',
      name: 'Estate Tax Liquidity',
      status: taxStatus,
      idealAmount: `${peso(tax)} in cash, payable within one year`,
    },
    {
      id: 'clean_transfer',
      name: 'Clean Transfer, Outside Probate',
      status: transferStatus,
      idealAmount: `Up to ${peso(estate)} passed directly to your heirs, bypassing public probate`,
    },
    {
      id: 'estate_preservation',
      name: 'Estate Preservation',
      status: preservationStatus,
      idealAmount: 'Liquidity that covers the tax and settlement costs, so no asset is sold under pressure',
    },
  ]

  // Goal-specific fourth row.
  if (a.goal === 'legacy') {
    gaps.push({
      id: 'legacy_fund',
      name: 'Legacy and Succession Fund',
      status: 'gap',
      idealAmount: 'A funded structure that keeps your legacy intact for the next generation',
    })
  } else if (a.goal === 'preservation') {
    gaps.push({
      id: 'preservation_vehicle',
      name: 'Preservation and Growth Vehicle',
      status: 'gap',
      idealAmount: 'A plan that grows the estate while shielding it from erosion',
    })
  }

  return gaps
}

const HNW_GOAL_PLAN: Record<Exclude<HnwGoal, 'confidential'>, DiscoveryPlan> = {
  estate_liquidity: {
    coverageType: 'An estate liquidity plan',
    fitReason: 'You want the estate tax settled in cash, without touching the assets.',
    whatItDoes:
      'Creates tax-free cash precisely when it is needed, so the 6% is paid on time and the property, shares, and business stay intact.',
  },
  clean_transfer: {
    coverageType: 'A guaranteed transfer plan',
    fitReason: 'You want wealth to reach your heirs cleanly and privately.',
    whatItDoes:
      'Moves a defined sum directly to named heirs, outside the probate process, on your terms.',
  },
  preservation: {
    coverageType: 'A protection and preservation plan',
    fitReason: 'You want the estate to pass on at full value, not discounted under pressure.',
    whatItDoes:
      'Shields the estate from forced sales and delay, so what you built transfers whole rather than eroded.',
  },
  legacy: {
    coverageType: 'A legacy and succession plan',
    fitReason: 'You want to provide for the next generation or a cause that matters to you.',
    whatItDoes:
      'Funds a continuing legacy, with the structure to keep it intact for decades.',
  },
}

// For "a confidential review", recommend based on the most urgent gap.
function planForConfidential(gaps: DiscoveryGapItem[]): DiscoveryPlan {
  const topGap = gaps.find((g) => g.status === 'gap') ?? gaps.find((g) => g.status === 'partial')
  if (topGap?.id === 'clean_transfer') return HNW_GOAL_PLAN.clean_transfer
  if (topGap?.id === 'estate_preservation') return HNW_GOAL_PLAN.preservation
  return HNW_GOAL_PLAN.estate_liquidity
}

export function computeHnwDiscovery(answers: DiscoveryAnswers): DiscoveryResult {
  const goal = answers.goal as HnwGoal
  const gaps = buildHnwGaps(answers)
  const score = scoreFrom(gaps)
  const attentionCount = gaps.filter((g) => g.status !== 'have').length
  const topGap = gaps.find((g) => g.status === 'gap') ?? gaps.find((g) => g.status === 'partial') ?? gaps[0]

  const plan = goal === 'confidential' ? planForConfidential(gaps) : HNW_GOAL_PLAN[goal]

  return {
    goal,
    goalLabel: HNW_GOAL_LABEL[goal],
    score,
    scoreLabel: scoreLabelFor(score),
    gaps,
    attentionCount,
    topGapName: topGap?.name ?? 'your estate',
    plan,
  }
}

// ── Track registry ───────────────────────────────────────────────────────────

export type DiscoveryTrack = 'default' | 'hnw'

export interface DiscoveryTrackConfig {
  /** Heading for the standalone goal picker (when no goal is passed in). */
  goalHeading: string
  goalOrder: DiscoveryGoal[]
  goalLabel: Record<string, string>
  questions: DiscoveryQuestion[]
  isGoal: (value: string | null) => boolean
  compute: (answers: DiscoveryAnswers) => DiscoveryResult
}

export const DISCOVERY_TRACKS: Record<DiscoveryTrack, DiscoveryTrackConfig> = {
  default: {
    goalHeading: 'Which financial goal sounds most like you?',
    goalOrder: ['health', 'starter', 'income', 'growth', 'figuring'],
    goalLabel: GOAL_LABEL,
    questions: DISCOVERY_QUESTIONS,
    isGoal: isDiscoveryGoal,
    compute: computeDiscovery,
  },
  hnw: {
    goalHeading: 'Where should your private review begin?',
    goalOrder: ['estate_liquidity', 'clean_transfer', 'preservation', 'legacy', 'confidential'],
    goalLabel: HNW_GOAL_LABEL,
    questions: HNW_QUESTIONS,
    isGoal: isHnwGoal,
    compute: computeHnwDiscovery,
  },
}

export function trackForSegment(from: string | null): DiscoveryTrack {
  return from === 'hnw' ? 'hnw' : 'default'
}
