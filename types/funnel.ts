export interface FunnelAnswers {
  ageRange: '18-25' | '26-35' | '36-45' | '46+'
  familyStatus: 'single_no_deps' | 'single_supporting' | 'married_no_kids' | 'married_with_kids'
  incomeRange: 'below_15k' | '15k_30k' | '30k_60k' | '60k_100k' | '100k_plus'
  lifeInsurance: 'none' | 'have_unsure' | 'active_policy'
  healthCoverage: 'none' | 'hmo_only' | 'personal_insurance' | 'both'
  biggestWorry: 'medical_emergency' | 'family_if_die' | 'retirement' | 'education' | 'emergency_savings'
  employment: 'employed_private' | 'government' | 'self_employed' | 'business_owner' | 'ofw'
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

export interface FunnelLead {
  id: string
  createdAt: string
  firstName: string
  mobile: string
  email?: string | null
  ageRange: string
  familyStatus: string
  incomeRange: string
  lifeInsurance: string
  healthCoverage: string
  biggestWorry: string
  employment: string
  protectionScore: number
  aiReport: FunnelAIReport
  status: 'new' | 'contacted' | 'converted'
  sequenceStep: number
  lastEmailedAt?: string | null
}
