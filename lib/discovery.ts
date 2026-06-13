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
  incomeReplacement,
  peso,
} from '@/lib/coverage-benefits'
import type { CoverageBenefitStatus } from '@/types/funnel'

export type DiscoveryGoal = 'health' | 'starter' | 'income' | 'growth' | 'figuring'

export interface DiscoveryAnswers {
  goal: DiscoveryGoal
  income?: string
  dependents?: string
  currentProtection?: string
  emergencyFund?: string
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

export const GOAL_LABEL: Record<DiscoveryGoal, string> = {
  health: 'Health protection',
  starter: 'Affordable starter coverage',
  income: 'Future guaranteed income',
  growth: 'Long-term growth',
  figuring: 'Still figuring things out',
}

export function isDiscoveryGoal(value: string | null): value is DiscoveryGoal {
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

const GOAL_PLAN: Record<Exclude<DiscoveryGoal, 'figuring'>, DiscoveryPlan> = {
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
  const gaps = buildGaps(answers)
  const score = scoreFrom(gaps)
  const attentionCount = gaps.filter((g) => g.status !== 'have').length
  const topGap = gaps.find((g) => g.status === 'gap') ?? gaps.find((g) => g.status === 'partial') ?? gaps[0]

  const plan =
    answers.goal === 'figuring' ? planForFiguring(gaps) : GOAL_PLAN[answers.goal]

  return {
    goal: answers.goal,
    goalLabel: GOAL_LABEL[answers.goal],
    score,
    scoreLabel: scoreLabelFor(score),
    gaps,
    attentionCount,
    topGapName: topGap?.name ?? 'your protection',
    plan,
  }
}
