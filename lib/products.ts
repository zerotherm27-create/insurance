export interface Product {
  id: string
  name: string
  purpose: string
  bestFor: string[]
  positioning: string
  tags: string[]
  priorityScore: number
}

export const PRODUCTS: readonly Product[] = [
  {
    id: 'sun_fit_and_well',
    name: 'SUN Fit and Well',
    purpose: 'Critical illness and long-term health protection.',
    bestFor: [
      'health-focused young professionals',
      'protecting income from medical interruption',
    ],
    positioning: 'Protect your ability to continue earning.',
    tags: ['health', 'critical_illness', 'income_protection'],
    priorityScore: 1,
  },
  {
    id: 'sun_safer_life',
    name: 'SUN Safer Life',
    purpose: 'Affordable life protection and income replacement.',
    bestFor: [
      'newly employed professionals',
      'budget-conscious starters',
      'breadwinners',
    ],
    positioning: 'Start protection early while keeping flexibility.',
    tags: ['life', 'affordable', 'breadwinner', 'starter'],
    priorityScore: 2,
  },
  {
    id: 'sun_life_secure_income',
    name: 'Sun Life Secure Income',
    purpose: 'Protection plus predictable future income.',
    bestFor: [
      'conservative savers',
      'retirement preparation',
      'future cash flow planning',
    ],
    positioning: 'Build future financial flexibility while protection is still affordable.',
    tags: ['income', 'retirement', 'conservative', 'guaranteed'],
    priorityScore: 3,
  },
  {
    id: 'sun_smarter_life_classic',
    name: 'Sun Smarter Life Classic',
    purpose: 'Protection with structured savings.',
    bestFor: [
      'disciplined savers',
      'balanced financial planning',
    ],
    positioning: 'Grow protection and savings together.',
    tags: ['savings', 'balanced', 'structured'],
    priorityScore: 4,
  },
  {
    id: 'sun_maxilink_prime',
    name: 'Sun MaxiLink Prime',
    purpose: 'Insurance plus investment-linked growth.',
    bestFor: [
      'growth-oriented clients',
      'long-term wealth accumulation',
    ],
    positioning: 'Maximize long-term financial growth with insurance protection.',
    tags: ['investment', 'growth', 'vul', 'wealth'],
    priorityScore: 5,
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}
