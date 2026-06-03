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
    id: 'sun_fit_and_well_advantage_10',
    name: 'Sun Fit and Well Advantage 10',
    purpose:
      'Critical illness, hospitalization, and long-term health protection — payable for only 10 years.',
    bestFor: [
      'health-conscious professionals',
      'breadwinners worried about medical costs',
      'clients with family history of critical illness',
      'protecting income from medical interruption',
    ],
    positioning:
      'Pay for 10 years, get lifetime health protection that pays you back even if nothing happens.',
    tags: ['health', 'critical_illness', 'income_protection', 'living_benefit', '10_pay'],
    priorityScore: 1,
  },
  {
    id: 'sun_easylink_10',
    name: 'Sun Easylink 10',
    purpose:
      'Affordable, accessible VUL — investment-linked life protection payable for only 10 years.',
    bestFor: [
      'young professionals starting out',
      'budget-conscious first-time buyers',
      'clients who want both life cover and investment growth',
    ],
    positioning:
      'Start small, start now — lifetime protection plus market-linked growth, fully paid in 10 years.',
    tags: ['vul', 'affordable', 'starter', 'life', '10_pay', 'investment'],
    priorityScore: 2,
  },
  {
    id: 'sun_safer_life_10',
    name: 'Sun Safer Life 10',
    purpose: 'Affordable pure life protection and income replacement.',
    bestFor: [
      'newly employed professionals',
      'breadwinners needing maximum coverage on a tight budget',
      'clients who want pure protection, no investment component',
    ],
    positioning:
      'Maximum protection per peso — keep your family secure without bundling investments.',
    tags: ['life', 'affordable', 'breadwinner', 'pure_protection', '10_pay'],
    priorityScore: 3,
  },
  {
    id: 'sun_secure_income_10',
    name: 'Sun Secure Income 10',
    purpose:
      'Guaranteed future income stream plus life protection — payable for only 10 years.',
    bestFor: [
      'conservative savers',
      'clients building toward retirement income',
      'OFWs preparing to come home',
      'clients who want predictable, guaranteed cash flow',
    ],
    positioning:
      'Pay for 10 years, receive guaranteed annual income in the future — no market risk, no guesswork.',
    tags: ['income', 'retirement', 'guaranteed', 'conservative', '10_pay'],
    priorityScore: 4,
  },
  {
    id: 'sun_smarter_life_classic_10',
    name: 'Sun Smarter Life Classic 10',
    purpose: 'Whole life protection with cash value buildup — payable for only 10 years.',
    bestFor: [
      'disciplined savers',
      'clients wanting balanced protection plus structured savings',
      'parents planning for children’s future',
    ],
    positioning: 'Grow protection and a long-term cash pool together, fully paid in 10 years.',
    tags: ['savings', 'whole_life', 'balanced', 'structured', 'cash_value', '10_pay'],
    priorityScore: 5,
  },
  {
    id: 'sun_smarter_life_elite_10',
    name: 'Sun Smarter Life Elite 10',
    purpose:
      'Premium whole life protection with higher coverage and cash value — payable for only 10 years.',
    bestFor: [
      'affluent professionals and business owners',
      'clients needing higher face amounts',
      'estate-conscious clients who prefer guaranteed cash value over market-linked growth',
    ],
    positioning:
      'Elite-tier protection with substantial cash value buildup, paid in 10 years.',
    tags: ['savings', 'whole_life', 'premium', 'affluent', 'cash_value', '10_pay'],
    priorityScore: 6,
  },
  {
    id: 'sun_maxilink_prime',
    name: 'Sun MaxiLink Prime',
    purpose: 'Flagship VUL — life insurance plus investment-linked growth.',
    bestFor: [
      'growth-oriented professionals',
      'long-term wealth accumulation',
      'clients comfortable with market-linked returns',
      'building a flexible long-term fund',
    ],
    positioning:
      'Maximize long-term financial growth while keeping your family protected.',
    tags: ['vul', 'investment', 'growth', 'wealth', 'flagship', 'flexible'],
    priorityScore: 7,
  },
  {
    id: 'sun_maxilink_100',
    name: 'Sun MaxiLink 100',
    purpose:
      'VUL with life coverage extended to age 100 and investment-linked fund growth.',
    bestFor: [
      'clients wanting lifetime VUL coverage',
      'long-horizon wealth builders',
      'clients planning multi-decade legacy through investments',
    ],
    positioning:
      'Lifetime protection and investment growth in one — coverage all the way to age 100.',
    tags: ['vul', 'investment', 'lifetime', 'growth', 'legacy', 'long_horizon'],
    priorityScore: 8,
  },
  {
    id: 'sun_life_premier_legacy',
    name: 'Sun Life Premier Legacy',
    purpose:
      'High-end estate and legacy protection for affluent clients — designed for clean wealth transfer.',
    bestFor: [
      'high net worth individuals',
      'business owners planning succession',
      'clients with estate tax exposure',
      'multi-generational legacy planning',
      'estate liquidity to cover the 6% Philippine estate tax',
    ],
    positioning:
      'Protect what you’ve built — pass it to the next generation cleanly, without forced sale or tax shock.',
    tags: ['hnw', 'legacy', 'estate', 'wealth_transfer', 'succession', 'premium', 'business_owner'],
    priorityScore: 9,
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}
