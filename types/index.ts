export interface ClientDetails {
  fullName: string
  birthday: string
  age: number
  gender: 'male' | 'female'
  smoker: boolean
  occupation: string
  incomeRange: string
  monthlyBudget: string
  hasHMO: boolean
  hasEmergencyFund: boolean
  isBreadwinner: boolean
  hasExistingInsurance: boolean
}

export interface GoalsAndPriorities {
  goals: Goal[]
  priorityStyle: PriorityStyle
  riskComfort: RiskComfort
}

export type Goal =
  | 'health_protection'
  | 'life_protection'
  | 'predictable_income'
  | 'savings_discipline'
  | 'investment_growth'
  | 'retirement_preparation'
  | 'family_protection'

export type PriorityStyle = 'start_small' | 'balanced' | 'maximize_protection'
export type RiskComfort = 'conservative' | 'moderate' | 'growth_oriented'

export interface AssessmentData {
  clientDetails: ClientDetails
  goalsAndPriorities: GoalsAndPriorities
}

export interface ProductRecommendation {
  productId: string
  productName: string
  purpose: string
  positioning: string
  whyItFits: string
}

export interface AIAnalysisResult {
  protectionScore: number
  profileSummary: string
  foundationAnalysis: string
  protectionGap: string
  recommendedPriorityLayer: string
  primaryRecommendation?: ProductRecommendation
  alternativeRecommendation?: ProductRecommendation
  whatComesFirst: string
  whatNotToMiss: string
  suggestedNextStep: string
}

export interface LeadRecord {
  id?: string
  createdAt?: string
  assessmentData: AssessmentData
  analysis: AIAnalysisResult
  advisorNotes?: string
}
