import type { FunnelAnswers, FunnelSegment } from '@/types/funnel'

export const TOTAL_STEPS = 7

export interface FunnelQuestion {
  step: number
  question: string
  field: keyof FunnelAnswers
  options: Array<{ value: string; label: string }>
}

interface StepOverride {
  question?: string
  optionOrder?: string[]
}

// Per-segment overrides: tailored question wording + option ordering
export const SEGMENT_OVERRIDES: Record<FunnelSegment, Partial<Record<number, StepOverride>>> = {
  pro: {
    6: { question: "As a young professional, what's your biggest financial concern right now?" },
  },
  family: {
    6: { question: "As your family's provider, what worries you most financially?" },
    7: {
      question: 'What is your employment situation?',
      optionOrder: ['employed_private', 'self_employed', 'business_owner', 'government', 'ofw'],
    },
  },
  ofw: {
    5: { question: 'What health coverage do you currently have while working abroad?' },
    6: { question: "What concerns you most about your family's financial security back home?" },
    7: {
      question: 'Confirm your work situation:',
      optionOrder: ['ofw', 'employed_private', 'self_employed', 'business_owner', 'government'],
    },
  },
  entrepreneur: {
    6: { question: "As someone running your own business, what's your biggest financial concern?" },
    7: {
      question: 'How would you describe your work setup?',
      optionOrder: ['self_employed', 'business_owner', 'employed_private', 'government', 'ofw'],
    },
  },
  business: {
    6: { question: 'What aspect of your financial protection concerns you most as a business owner?' },
    7: {
      question: 'How would you describe your work setup?',
      optionOrder: ['business_owner', 'self_employed', 'employed_private', 'government', 'ofw'],
    },
  },
  hnw: {
    6: { question: 'Which area of your wealth and financial protection concerns you most?' },
    7: {
      question: 'What is your primary income source?',
      optionOrder: ['business_owner', 'self_employed', 'employed_private', 'government', 'ofw'],
    },
  },
}

export function applySegmentOverride(
  question: FunnelQuestion,
  segment: FunnelSegment | undefined
): FunnelQuestion {
  if (!segment) return question
  const override = SEGMENT_OVERRIDES[segment]?.[question.step]
  if (!override) return question

  let options = question.options
  if (override.optionOrder) {
    const orderMap = Object.fromEntries(override.optionOrder.map((v, i) => [v, i]))
    options = [...question.options].sort(
      (a, b) => (orderMap[a.value] ?? 99) - (orderMap[b.value] ?? 99)
    )
  }

  return { ...question, question: override.question ?? question.question, options }
}

export const FUNNEL_QUESTIONS: FunnelQuestion[] = [
  {
    step: 1,
    question: 'How old are you?',
    field: 'ageRange',
    options: [
      { value: '18-25', label: '18–25' },
      { value: '26-35', label: '26–35' },
      { value: '36-45', label: '36–45' },
      { value: '46+', label: '46 and above' },
    ],
  },
  {
    step: 2,
    question: 'What is your current family situation?',
    field: 'familyStatus',
    options: [
      { value: 'single_no_deps', label: 'Single, no dependents' },
      { value: 'single_supporting', label: 'Single, supporting family members' },
      { value: 'married_no_kids', label: 'Married, no kids yet' },
      { value: 'married_with_kids', label: 'Married with children' },
    ],
  },
  {
    step: 3,
    question: 'What is your approximate monthly income?',
    field: 'incomeRange',
    options: [
      { value: 'below_15k', label: 'Below ₱15,000' },
      { value: '15k_30k', label: '₱15,000 – ₱30,000' },
      { value: '30k_60k', label: '₱30,000 – ₱60,000' },
      { value: '60k_100k', label: '₱60,000 – ₱100,000' },
      { value: '100k_plus', label: '₱100,000 and above' },
    ],
  },
  {
    step: 4,
    question: 'Do you currently have life insurance?',
    field: 'lifeInsurance',
    options: [
      { value: 'none', label: 'None at all' },
      { value: 'have_unsure', label: "I have one but I'm not sure if it's enough" },
      { value: 'active_policy', label: 'Yes, I have an active and updated policy' },
    ],
  },
  {
    step: 5,
    question: 'What health coverage do you currently have?',
    field: 'healthCoverage',
    options: [
      { value: 'none', label: 'None' },
      { value: 'hmo_only', label: 'HMO only (company-provided)' },
      { value: 'personal_insurance', label: 'Personal health insurance' },
      { value: 'both', label: 'Both HMO and personal insurance' },
    ],
  },
  {
    step: 6,
    question: 'What is your biggest financial concern right now?',
    field: 'biggestWorry',
    options: [
      { value: 'medical_emergency', label: 'Medical emergency / hospitalization costs' },
      { value: 'family_if_die', label: 'What happens to my family if I pass away' },
      { value: 'retirement', label: 'Not having enough money for retirement' },
      { value: 'education', label: "Funding my children's education" },
      { value: 'emergency_savings', label: 'Building emergency savings' },
    ],
  },
  {
    step: 7,
    question: 'What best describes your work situation?',
    field: 'employment',
    options: [
      { value: 'employed_private', label: 'Employed (private company)' },
      { value: 'government', label: 'Government employee' },
      { value: 'self_employed', label: 'Self-employed / freelancer' },
      { value: 'business_owner', label: 'Business owner' },
      { value: 'ofw', label: 'OFW (Overseas Filipino Worker)' },
    ],
  },
]

// Human-readable labels for use in AI prompts
export const LABEL_MAP: Record<keyof FunnelAnswers, Record<string, string>> = {
  ageRange: {
    '18-25': '18–25 years old',
    '26-35': '26–35 years old',
    '36-45': '36–45 years old',
    '46+': '46 and above',
  },
  familyStatus: {
    single_no_deps: 'Single, no dependents',
    single_supporting: 'Single, supporting family members',
    married_no_kids: 'Married, no kids yet',
    married_with_kids: 'Married with children',
  },
  incomeRange: {
    below_15k: 'Below ₱15,000/month',
    '15k_30k': '₱15,000 – ₱30,000/month',
    '30k_60k': '₱30,000 – ₱60,000/month',
    '60k_100k': '₱60,000 – ₱100,000/month',
    '100k_plus': '₱100,000+/month',
  },
  lifeInsurance: {
    none: 'No life insurance',
    have_unsure: 'Has life insurance but unsure if adequate',
    active_policy: 'Active and updated life insurance policy',
  },
  healthCoverage: {
    none: 'No health coverage',
    hmo_only: 'Company HMO only',
    personal_insurance: 'Personal health insurance',
    both: 'Both HMO and personal health insurance',
  },
  biggestWorry: {
    medical_emergency: 'Medical emergency / hospitalization costs',
    family_if_die: 'Financial security for family if I pass away',
    retirement: 'Not having enough for retirement',
    education: "Funding children's education",
    emergency_savings: 'Building emergency savings',
  },
  employment: {
    employed_private: 'Employed at a private company',
    government: 'Government employee',
    self_employed: 'Self-employed or freelancer',
    business_owner: 'Business owner',
    ofw: 'Overseas Filipino Worker (OFW)',
  },
  segment: {
    pro: 'Young Professional',
    family: 'Family / Parent (breadwinner)',
    ofw: 'OFW (Overseas Filipino Worker)',
    entrepreneur: 'Entrepreneur / Self-Employed',
    business: 'Business Owner',
    hnw: 'High Net Worth Individual',
  },
}
