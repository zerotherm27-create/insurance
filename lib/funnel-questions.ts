import type { FunnelAnswers, FunnelSegment } from '@/types/funnel'

export interface FunnelQuestionOption {
  value: string
  label: string
}

export interface FunnelQuestion {
  field: string
  question: string
  options: FunnelQuestionOption[]
}

// ── Reusable questions shared across multiple segments ───────────────────────

const Q_AGE: FunnelQuestion = {
  field: 'ageRange',
  question: 'How old are you?',
  options: [
    { value: '18-25', label: '18–25' },
    { value: '26-35', label: '26–35' },
    { value: '36-45', label: '36–45' },
    { value: '46+', label: '46 and above' },
  ],
}

const Q_DEPENDENTS: FunnelQuestion = {
  field: 'dependents',
  question: 'Who currently depends on you financially?',
  options: [
    { value: 'no_one', label: 'No one yet — just myself' },
    { value: 'parents', label: 'My parents or older relatives' },
    { value: 'siblings', label: 'My siblings or extended family' },
    { value: 'spouse_kids', label: 'My spouse and/or children' },
  ],
}

// ── Per-segment question sets (tailored to life stage) ───────────────────────

const PRO_QUESTIONS: FunnelQuestion[] = [
  Q_AGE,
  Q_DEPENDENTS,
  {
    field: 'incomeRange',
    question: 'What is your approximate monthly income?',
    options: [
      { value: 'below_15k', label: 'Below ₱15,000' },
      { value: '15k_30k', label: '₱15,000 – ₱30,000' },
      { value: '30k_60k', label: '₱30,000 – ₱60,000' },
      { value: '60k_100k', label: '₱60,000 – ₱100,000' },
      { value: '100k_plus', label: '₱100,000 and above' },
    ],
  },
  {
    field: 'emergencyFund',
    question: 'Do you have an emergency fund?',
    options: [
      { value: 'none', label: 'None yet' },
      { value: 'under_3mo', label: 'Less than 3 months of expenses' },
      { value: '3_6mo', label: '3 – 6 months of expenses' },
      { value: '6mo_plus', label: 'More than 6 months saved' },
    ],
  },
  {
    field: 'debts',
    question: 'Do you have any debts right now?',
    options: [
      { value: 'none', label: 'None' },
      { value: 'student_personal', label: 'Student or personal loan' },
      { value: 'credit_card', label: 'Credit card balance' },
      { value: 'multiple', label: 'Multiple loans / debts' },
    ],
  },
  {
    field: 'healthCoverage',
    question: 'What health coverage do you currently have?',
    options: [
      { value: 'none', label: 'None' },
      { value: 'hmo_only', label: 'HMO only (company-provided)' },
      { value: 'personal_insurance', label: 'Personal health insurance' },
      { value: 'both', label: 'Both HMO and personal insurance' },
    ],
  },
  {
    field: 'buildingToward',
    question: 'What are you building toward right now?',
    options: [
      { value: 'emergency_fund', label: 'A solid emergency fund' },
      { value: 'first_investment', label: 'My first real investment' },
      { value: 'own_home', label: 'Owning my own home' },
      { value: 'start_business', label: 'Starting my own business' },
    ],
  },
]

const FAMILY_QUESTIONS: FunnelQuestion[] = [
  Q_AGE,
  {
    field: 'numDependents',
    question: 'How many people depend on your income?',
    options: [
      { value: '1', label: 'Just one' },
      { value: '2_3', label: '2 – 3 people' },
      { value: '4_5', label: '4 – 5 people' },
      { value: '6_plus', label: '6 or more' },
    ],
  },
  {
    field: 'earnerRole',
    question: 'Are you the main income earner in your household?',
    options: [
      { value: 'sole', label: 'Yes — I am the sole earner' },
      { value: 'main', label: 'I earn most of the household income' },
      { value: 'dual', label: 'My partner and I earn about equally' },
      { value: 'secondary', label: 'I am the secondary earner' },
    ],
  },
  {
    field: 'incomeRange',
    question: 'What is your approximate household monthly income?',
    options: [
      { value: 'below_30k', label: 'Below ₱30,000' },
      { value: '30k_60k', label: '₱30,000 – ₱60,000' },
      { value: '60k_120k', label: '₱60,000 – ₱120,000' },
      { value: '120k_plus', label: '₱120,000 and above' },
    ],
  },
  {
    field: 'lifeInsuranceAdequacy',
    question: 'If your income stopped, would your life insurance cover your family for years?',
    options: [
      { value: 'none', label: 'I have no life insurance' },
      { value: 'unsure', label: 'I have some, but I am not sure it is enough' },
      { value: 'adequate', label: 'Yes, I believe it is enough' },
    ],
  },
  {
    field: 'familyPriority',
    question: "What is your top priority for your family right now?",
    options: [
      { value: 'income_replacement', label: 'Replacing my income if I am gone' },
      { value: 'education', label: "Funding my children's education" },
      { value: 'pay_off_debt', label: 'Paying off our mortgage / debts' },
      { value: 'emergency_fund', label: 'Building an emergency fund' },
    ],
  },
  {
    field: 'majorDebts',
    question: 'Do you carry any major debts?',
    options: [
      { value: 'mortgage', label: 'A home mortgage' },
      { value: 'car', label: 'A car loan' },
      { value: 'personal', label: 'Personal / other loans' },
      { value: 'none', label: 'No major debts' },
    ],
  },
]

const OFW_QUESTIONS: FunnelQuestion[] = [
  Q_AGE,
  {
    field: 'yearsAbroad',
    question: 'How long have you been working abroad?',
    options: [
      { value: 'under_1', label: 'Less than a year' },
      { value: '1_3', label: '1 – 3 years' },
      { value: '3_10', label: '3 – 10 years' },
      { value: '10_plus', label: 'More than 10 years' },
    ],
  },
  {
    field: 'remittance',
    question: 'About how much do you send home each month?',
    options: [
      { value: 'below_15k', label: 'Below ₱15,000' },
      { value: '15k_30k', label: '₱15,000 – ₱30,000' },
      { value: '30k_60k', label: '₱30,000 – ₱60,000' },
      { value: '60k_plus', label: '₱60,000 and above' },
    ],
  },
  {
    field: 'whoDependsHome',
    question: 'Who depends on the money you send home?',
    options: [
      { value: 'parents', label: 'My parents' },
      { value: 'spouse_kids', label: 'My spouse and children' },
      { value: 'siblings', label: 'My siblings' },
      { value: 'extended', label: 'My extended family' },
    ],
  },
  {
    field: 'remittanceGoal',
    question: 'What is the money you send mainly building toward?',
    options: [
      { value: 'daily_needs', label: 'Daily needs only — nothing left over' },
      { value: 'house', label: 'Building or buying a house' },
      { value: 'education', label: "Children's education" },
      { value: 'business', label: 'Starting a business back home' },
      { value: 'comeback_fund', label: 'A fund so I can come home for good' },
    ],
  },
  {
    field: 'coverageAbroad',
    question: 'If something happened to you abroad, is your family protected?',
    options: [
      { value: 'none', label: 'No coverage at all' },
      { value: 'abroad_only', label: 'Only coverage from my employer abroad' },
      { value: 'ph_only', label: 'Only coverage back in the Philippines' },
      { value: 'both', label: 'Both abroad and in the Philippines' },
    ],
  },
  {
    field: 'comeHomePlan',
    question: 'When do you plan to come home for good?',
    options: [
      { value: 'within_2', label: 'Within 2 years' },
      { value: '3_5', label: 'In 3 – 5 years' },
      { value: '5_10', label: 'In 5 – 10 years' },
      { value: 'no_plan', label: 'No clear plan yet' },
    ],
  },
]

const ENTREPRENEUR_QUESTIONS: FunnelQuestion[] = [
  Q_AGE,
  Q_DEPENDENTS,
  {
    field: 'incomeStability',
    question: 'How stable is your income month to month?',
    options: [
      { value: 'very_variable', label: 'Very unpredictable' },
      { value: 'somewhat', label: 'Somewhat variable' },
      { value: 'stable', label: 'Fairly stable' },
    ],
  },
  {
    field: 'incomeIfSick',
    question: "If you couldn't work for 6 months, what happens to your income?",
    options: [
      { value: 'stops', label: 'It stops completely' },
      { value: 'drops_a_lot', label: 'It drops a lot' },
      { value: 'mostly_continues', label: 'It mostly continues without me' },
    ],
  },
  {
    field: 'safetyNet',
    question: 'What safety net do you have right now?',
    options: [
      { value: 'none', label: 'None at all' },
      { value: 'hmo', label: 'An HMO / health card' },
      { value: 'some_insurance', label: 'Some insurance' },
      { value: 'emergency_fund', label: 'An emergency fund' },
    ],
  },
  {
    field: 'financeSeparation',
    question: 'Do you mix your personal and business money?',
    options: [
      { value: 'fully_mixed', label: 'Fully mixed together' },
      { value: 'somewhat', label: 'Somewhat separated' },
      { value: 'separate', label: 'Fully separate' },
    ],
  },
  {
    field: 'retirementSaving',
    question: 'Are you saving for retirement on your own?',
    options: [
      { value: 'not_yet', label: 'Not yet' },
      { value: 'a_little', label: 'A little, here and there' },
      { value: 'actively', label: 'Yes, actively' },
    ],
  },
]

const BUSINESS_QUESTIONS: FunnelQuestion[] = [
  Q_AGE,
  {
    field: 'businessSize',
    question: 'How many people does your business employ or support?',
    options: [
      { value: 'just_me', label: 'Just me' },
      { value: '2_10', label: '2 – 10 people' },
      { value: '11_50', label: '11 – 50 people' },
      { value: '50_plus', label: 'More than 50' },
    ],
  },
  {
    field: 'continuity',
    question: 'If something happened to you, could the business keep running?',
    options: [
      { value: 'stops', label: 'It would likely stop' },
      { value: 'struggles', label: 'It would struggle badly' },
      { value: 'runs_a_while', label: 'It could run for a while' },
      { value: 'clear_succession', label: 'There is a clear successor' },
    ],
  },
  {
    field: 'personalGuarantees',
    question: 'Do you have business loans personally guaranteed?',
    options: [
      { value: 'significant', label: 'Yes, significant amounts' },
      { value: 'some', label: 'Some' },
      { value: 'none', label: 'None' },
      { value: 'unsure', label: 'I am not sure' },
    ],
  },
  {
    field: 'successionPlan',
    question: 'Is there a written succession or buy-sell plan?',
    options: [
      { value: 'none', label: 'None' },
      { value: 'informal', label: 'Just an informal idea' },
      { value: 'in_progress', label: 'In progress' },
      { value: 'documented', label: 'Yes, fully documented' },
    ],
  },
  {
    field: 'keyPerson',
    question: 'Is there key-person protection for you or your partners?',
    options: [
      { value: 'none', label: 'None' },
      { value: 'unsure', label: 'I am not sure' },
      { value: 'yes', label: 'Yes, we have it' },
    ],
  },
  {
    field: 'topPriority',
    question: 'Beyond the business, what matters most to you now?',
    options: [
      { value: 'protect_family', label: 'Protecting my family' },
      { value: 'business_continuity', label: 'Business continuity' },
      { value: 'build_legacy', label: 'Building a lasting legacy' },
      { value: 'retirement', label: 'My own retirement' },
    ],
  },
]

const HNW_QUESTIONS: FunnelQuestion[] = [
  Q_AGE,
  {
    field: 'netWorth',
    question: 'What is the approximate value of your estate / net worth?',
    options: [
      { value: 'under_20m', label: 'Under ₱20 million' },
      { value: '20_50m', label: '₱20 – 50 million' },
      { value: '50_200m', label: '₱50 – 200 million' },
      { value: '200m_plus', label: '₱200 million and above' },
    ],
  },
  {
    field: 'estatePlan',
    question: 'Do you have a documented estate plan or will?',
    options: [
      { value: 'none', label: 'None' },
      { value: 'outdated', label: 'Yes, but it is outdated' },
      { value: 'basic_will', label: 'A basic will' },
      { value: 'comprehensive', label: 'A comprehensive plan' },
    ],
  },
  {
    field: 'probateExposure',
    question: 'Probate is a public court process. Would your family be comfortable having your estate exposed in public record?',
    options: [
      { value: 'not_aware', label: 'I did not know probate was public' },
      { value: 'uncomfortable', label: 'No, I want full privacy for my family' },
      { value: 'accept_risk', label: 'We have discussed it and accept the risk' },
      { value: 'bypass_probate', label: 'We are already structured to bypass probate' },
    ],
  },
  {
    field: 'estateTaxReadiness',
    question: 'Your heirs may owe 6% estate tax. Is liquid cash ready to pay it?',
    options: [
      { value: 'not_aware', label: 'I was not aware of this' },
      { value: 'aware_no_plan', label: 'Aware, but no plan for it' },
      { value: 'partial', label: 'Partially prepared' },
      { value: 'funded', label: 'Fully funded and ready' },
    ],
  },
  {
    field: 'transferIntent',
    question: 'Who do you intend your wealth to pass to?',
    options: [
      { value: 'children', label: 'My children' },
      { value: 'spouse_children', label: 'My spouse and children' },
      { value: 'extended', label: 'Extended family' },
      { value: 'charity', label: 'Charity / a cause I believe in' },
      { value: 'undecided', label: 'Not yet decided' },
    ],
  },
  {
    field: 'legacyPriority',
    question: 'What is your number-one legacy priority?',
    options: [
      { value: 'minimize_tax', label: 'Minimizing estate tax' },
      { value: 'avoid_conflict', label: 'Avoiding family conflict' },
      { value: 'fund_grandchildren', label: "Funding grandchildren's future" },
      { value: 'philanthropy', label: 'Philanthropy' },
      { value: 'business_succession', label: 'Business succession' },
    ],
  },
]

// Generic fallback set — used for the plain /funnel entry when no segment is known.
const GENERAL_QUESTIONS: FunnelQuestion[] = [
  Q_AGE,
  {
    field: 'familyStatus',
    question: 'What is your current family situation?',
    options: [
      { value: 'single_no_deps', label: 'Single, no dependents' },
      { value: 'single_supporting', label: 'Single, supporting family members' },
      { value: 'married_no_kids', label: 'Married, no kids yet' },
      { value: 'married_with_kids', label: 'Married with children' },
    ],
  },
  {
    field: 'incomeRange',
    question: 'What is your approximate monthly income?',
    options: [
      { value: 'below_15k', label: 'Below ₱15,000' },
      { value: '15k_30k', label: '₱15,000 – ₱30,000' },
      { value: '30k_60k', label: '₱30,000 – ₱60,000' },
      { value: '60k_100k', label: '₱60,000 – ₱100,000' },
      { value: '100k_plus', label: '₱100,000 and above' },
    ],
  },
  {
    field: 'lifeInsurance',
    question: 'Do you currently have life insurance?',
    options: [
      { value: 'none', label: 'None at all' },
      { value: 'have_unsure', label: "I have one but I'm not sure if it's enough" },
      { value: 'active_policy', label: 'Yes, I have an active and updated policy' },
    ],
  },
  {
    field: 'healthCoverage',
    question: 'What health coverage do you currently have?',
    options: [
      { value: 'none', label: 'None' },
      { value: 'hmo_only', label: 'HMO only (company-provided)' },
      { value: 'personal_insurance', label: 'Personal health insurance' },
      { value: 'both', label: 'Both HMO and personal insurance' },
    ],
  },
  {
    field: 'biggestWorry',
    question: 'What is your biggest financial concern right now?',
    options: [
      { value: 'medical_emergency', label: 'Medical emergency / hospitalization costs' },
      { value: 'family_if_die', label: 'What happens to my family if I pass away' },
      { value: 'retirement', label: 'Not having enough money for retirement' },
      { value: 'education', label: "Funding my children's education" },
      { value: 'emergency_savings', label: 'Building emergency savings' },
    ],
  },
  {
    field: 'employment',
    question: 'What best describes your work situation?',
    options: [
      { value: 'employed_private', label: 'Employed (private company)' },
      { value: 'government', label: 'Government employee' },
      { value: 'self_employed', label: 'Self-employed / freelancer' },
      { value: 'business_owner', label: 'Business owner' },
      { value: 'ofw', label: 'OFW (Overseas Filipino Worker)' },
    ],
  },
]

export const SEGMENT_QUESTIONS: Record<FunnelSegment | 'general', FunnelQuestion[]> = {
  pro: PRO_QUESTIONS,
  family: FAMILY_QUESTIONS,
  ofw: OFW_QUESTIONS,
  entrepreneur: ENTREPRENEUR_QUESTIONS,
  business: BUSINESS_QUESTIONS,
  hnw: HNW_QUESTIONS,
  general: GENERAL_QUESTIONS,
}

export const SEGMENT_LABELS: Record<FunnelSegment, string> = {
  pro: 'Young Professional',
  family: 'Family / Parent (breadwinner)',
  ofw: 'OFW (Overseas Filipino Worker)',
  entrepreneur: 'Entrepreneur / Self-Employed',
  business: 'Business Owner',
  hnw: 'High Net Worth Individual',
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getQuestions(segment: FunnelSegment | undefined): FunnelQuestion[] {
  return SEGMENT_QUESTIONS[segment ?? 'general'] ?? GENERAL_QUESTIONS
}

export function getTotalSteps(segment: FunnelSegment | undefined): number {
  return getQuestions(segment).length
}

/**
 * Validates that every question in the segment's set has a valid answer value.
 * Returns the offending field name, or null if all answers are valid.
 */
export function validateAnswers(
  segment: FunnelSegment | undefined,
  answers: FunnelAnswers
): string | null {
  const questions = getQuestions(segment)
  for (const q of questions) {
    const val = answers[q.field]
    if (!val || !q.options.some((o) => o.value === val)) {
      return q.field
    }
  }
  return null
}

/**
 * Builds a human-readable "Question → Answer" summary for the AI prompt,
 * using the segment's actual question set and the chosen option labels.
 */
export function answerSummary(
  segment: FunnelSegment | undefined,
  answers: FunnelAnswers
): string {
  const questions = getQuestions(segment)
  return questions
    .map((q) => {
      const val = answers[q.field]
      const opt = q.options.find((o) => o.value === val)
      return `${q.question} → ${opt?.label ?? val ?? '(no answer)'}`
    })
    .join('\n')
}
