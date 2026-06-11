import type { FunnelSegment } from '@/types/funnel'

interface PlanRow {
  letter: string
  name: string
  tagline: string
  best: boolean
}

const STANDARD_PLANS: PlanRow[] = [
  { letter: 'A', name: 'Starter Protection', tagline: 'Essential coverage, lighter budget', best: false },
  { letter: 'B', name: 'Balanced Plan', tagline: 'Covers your key gaps fully', best: true },
  { letter: 'C', name: 'Complete Coverage', tagline: 'Maximum protection plus savings', best: false },
]

// HNW framing: estate outcomes and exclusivity, never budget or downsell
// language (same rule as the "Private" badge on the hnw hook page).
const HNW_PLANS: PlanRow[] = [
  { letter: 'A', name: 'Foundational Structure', tagline: 'Estate tax liquidity secured', best: false },
  { letter: 'B', name: 'Comprehensive Estate Plan', tagline: 'Liquidity, probate bypass, documentation', best: true },
  { letter: 'C', name: 'Legacy Structure', tagline: 'Multi-generation transfer and equalization', best: false },
]

/**
 * Plan tiers with intentionally blurred placeholder values. No real premiums
 * or coverage amounts are shown anywhere (compliance: real numbers require an
 * official proposal); the blur is a curiosity driver toward the consultation.
 */
export function PlanOptionsTeaser({ segment }: { segment?: FunnelSegment | null }) {
  const hnw = segment === 'hnw'
  const plans = hnw ? HNW_PLANS : STANDARD_PLANS

  return (
    <div className="max-w-lg mx-auto w-full px-6">
      <div className="bg-navy-card border border-gold/15 rounded-2xl p-5 space-y-3">
        <div className="space-y-1">
          <p className="font-sans text-xs text-white/40 uppercase tracking-widest">
            {hnw ? 'Your Structure Options' : 'Your Plan Options'}
          </p>
          <p className="font-sans text-sm text-white/75">
            {hnw ? (
              <>Designed around <span className="text-gold italic">your</span> estate and legacy priorities</>
            ) : (
              <>Personalized for <span className="text-gold italic">your</span> situation and budget</>
            )}
          </p>
        </div>

        <div className="space-y-2">
          {plans.map((plan) => (
            <div
              key={plan.letter}
              className={`relative flex items-center gap-3 rounded-xl px-4 py-3 border ${
                plan.best
                  ? 'border-gold/40 bg-gold/5'
                  : 'border-white/8 bg-navy-light/40'
              }`}
            >
              {plan.best && (
                <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full bg-gold text-navy-dark text-[10px] font-sans font-semibold tracking-wide">
                  BEST FIT
                </span>
              )}
              <span
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-sans text-sm font-semibold ${
                  plan.best ? 'bg-gold text-navy-dark' : 'bg-white/8 text-white/60'
                }`}
              >
                {plan.letter}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-sm text-white/85 leading-snug">{plan.name}</p>
                <p className="font-sans text-[11px] text-white/40 leading-snug">{plan.tagline}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="font-sans text-[10px] text-white/30 uppercase tracking-wide">
                  {hnw ? 'Coverage' : 'Monthly'}
                </p>
                <p className="font-sans text-sm text-gold/80 blur-[5px] select-none" aria-hidden="true">
                  {hnw ? '₱XX,XXX,XXX' : '₱X,XXX'}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-gold/8 border border-gold/15 px-4 py-3">
          <p className="font-sans text-xs text-gold-pale/80 leading-relaxed">
            {hnw
              ? 'Your exact structure and amounts are designed in your private consultation with Jojo.'
              : 'Your actual numbers and exact plan match are unlocked inside your free consultation with Jojo.'}
          </p>
        </div>
      </div>
    </div>
  )
}
