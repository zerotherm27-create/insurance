'use client'

import { PesoInput } from './PesoInput'

interface EducationModuleProps {
  childAges: number[]
  collegeFundPerChild: number
  existingSavings: number
  monthlySavings: number
  onExistingSavings: (v: number) => void
  onMonthlySavings: (v: number) => void
}

export function EducationModule({
  childAges,
  collegeFundPerChild,
  existingSavings,
  monthlySavings,
  onExistingSavings,
  onMonthlySavings,
}: EducationModuleProps) {
  return (
    <section className="space-y-4">
      <p className="font-sans text-xs text-white/35 leading-relaxed">
        Are your savings on track to fund college even if you live? Enter what you have and what you contribute monthly.
      </p>

      {childAges.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/8 rounded-xl px-4 py-4 text-center">
          <p className="font-sans text-xs text-white/30">
            Add children in the Life Insurance step to enable education projections.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 space-y-1.5">
            <div className="flex flex-wrap gap-2">
              {childAges.map((age, i) => (
                <span
                  key={i}
                  className="font-sans text-xs text-white/50 bg-navy-card border border-white/10 rounded-lg px-2.5 py-1"
                >
                  Child {i + 1} · age {age}
                </span>
              ))}
            </div>
            <p className="font-sans text-xs text-white/30">
              {collegeFundPerChild > 0
                ? `Target: ₱${(collegeFundPerChild * childAges.length).toLocaleString('en-PH')} total (set in Step 1)`
                : 'Set college fund per child in the Life Insurance step'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <PesoInput
              label="Existing education savings"
              value={existingSavings}
              onChange={onExistingSavings}
            />
            <PesoInput
              label="Monthly savings toward education"
              value={monthlySavings}
              onChange={onMonthlySavings}
            />
          </div>
        </>
      )}
    </section>
  )
}
