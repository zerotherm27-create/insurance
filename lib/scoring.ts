import type { AssessmentData } from '@/types'

export interface ScoreFactor {
  label: string
  points: number
  earned: number
  description: string
}

export interface ScoreBreakdown {
  total: number
  factors: ScoreFactor[]
  tier: 'critical' | 'developing' | 'moderate' | 'strong' | 'excellent'
  tierLabel: string
  tierColor: string
}

export function calculateProtectionScore(data: AssessmentData): ScoreBreakdown {
  const { clientDetails, goalsAndPriorities } = data
  const factors: ScoreFactor[] = []

  // HMO coverage (20 pts)
  factors.push({
    label: 'HMO Coverage',
    points: 20,
    earned: clientDetails.hasHMO ? 20 : 0,
    description: clientDetails.hasHMO
      ? 'Company HMO provides a foundational health safety net.'
      : 'No HMO detected — health cost exposure is high.',
  })

  // Emergency fund (20 pts)
  factors.push({
    label: 'Emergency Fund',
    points: 20,
    earned: clientDetails.hasEmergencyFund ? 20 : 0,
    description: clientDetails.hasEmergencyFund
      ? 'Emergency fund provides buffer for unexpected events.'
      : 'No emergency fund — financial shocks have no cushion.',
  })

  // Existing insurance (25 pts)
  factors.push({
    label: 'Existing Insurance',
    points: 25,
    earned: clientDetails.hasExistingInsurance ? 25 : 0,
    description: clientDetails.hasExistingInsurance
      ? 'Existing policy adds a protection layer.'
      : 'No existing insurance — significant protection gap.',
  })

  // Budget readiness (20 pts)
  const budgets: Record<string, number> = {
    'Under ₱1,000': 5,
    '₱1,000–₱2,000': 10,
    '₱2,000–₱5,000': 15,
    'Over ₱5,000': 20,
  }
  const budgetPts = budgets[clientDetails.monthlyBudget] ?? 5
  factors.push({
    label: 'Budget Readiness',
    points: 20,
    earned: budgetPts,
    description: `Budget range: ${clientDetails.monthlyBudget}. Higher budget enables stronger protection layers.`,
  })

  // Financial clarity (15 pts)
  const hasGoals = goalsAndPriorities.goals.length >= 2
  const hasStyle = goalsAndPriorities.priorityStyle !== null
  const clarityPts = hasGoals && hasStyle ? 15 : hasGoals || hasStyle ? 8 : 0
  factors.push({
    label: 'Financial Clarity',
    points: 15,
    earned: clarityPts,
    description: hasGoals
      ? 'Clear goals identified — easier to match the right protection layer.'
      : 'Goals not fully defined — discovery is a valuable first step.',
  })

  const total = factors.reduce((sum, f) => sum + f.earned, 0)

  let tier: ScoreBreakdown['tier']
  let tierLabel: string
  let tierColor: string

  if (total >= 80) {
    tier = 'excellent'
    tierLabel = 'Excellent Foundation'
    tierColor = '#22c55e'
  } else if (total >= 60) {
    tier = 'strong'
    tierLabel = 'Strong Foundation'
    tierColor = '#84cc16'
  } else if (total >= 40) {
    tier = 'moderate'
    tierLabel = 'Moderate Foundation'
    tierColor = '#F6B21A'
  } else if (total >= 20) {
    tier = 'developing'
    tierLabel = 'Developing Foundation'
    tierColor = '#f97316'
  } else {
    tier = 'critical'
    tierLabel = 'Critical Gaps Present'
    tierColor = '#ef4444'
  }

  return { total, factors, tier, tierLabel, tierColor }
}
