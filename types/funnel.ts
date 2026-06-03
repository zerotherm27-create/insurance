export type FunnelSegment = 'pro' | 'family' | 'ofw' | 'entrepreneur' | 'business' | 'hnw'

// Answers are now flexible: each segment defines its own question fields.
// `segment` identifies which question set was used; all other keys are
// question field → chosen option value pairs.
export interface FunnelAnswers {
  segment?: FunnelSegment
  [field: string]: string | undefined
}

export interface FunnelAIReport {
  protectionScore: number
  scoreLabel: 'Critical Gaps' | 'Needs Attention' | 'Partially Protected' | 'Well Protected' | 'Strongly Protected'
  snapshot: Array<{ icon: '✅' | '❌' | '⚠️'; text: string }>
  biggestGap: string
  recommendation: string
  estimatedRange: string
  nextStep: string
}

export interface AdvisorPlaybook {
  generatedAt: string
  leadTemperature: 'hot' | 'warm' | 'cold'
  temperatureReason: string
  openingApproach: string
  talkingPoints: string[]
  discoveryQuestions: string[]
  recommendedProducts: Array<{
    productId: string
    productName: string
    whyForThisLead: string
    positioningAngle: string
  }>
  likelyObjections: Array<{ objection: string; response: string }>
  crossSellOpportunities: string[]
}

export interface FunnelLead {
  id: string
  createdAt: string
  updatedAt: string
  firstName: string
  mobile: string
  email?: string | null
  segment?: FunnelSegment | null
  answers: FunnelAnswers
  protectionScore: number
  aiReport?: FunnelAIReport | null
  status: 'new' | 'contacted' | 'converted'
  sequenceStep: number
  lastEmailedAt?: string | null
}
