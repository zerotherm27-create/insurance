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
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 shrink-0 border border-gold/40 rounded-full flex items-center justify-center font-sans text-xs text-gold">
          3
        </span>
        <h3 className="font-sans text-xs text-gold uppercase tracking-widest font-medium">
          Education Fund
        </h3>
      </div>

      <p className="font-sans text-xs text-white/25 leading-relaxed">
        Savings-based: are you on track to fund college even if you live?
      </p>

      {childAges.length === 0 ? (
        <p className="font-sans text-xs text-white/25 italic">
          Add children in Module 1 to enable education projections.
        </p>
      ) : (
        <>
          <div className="space-y-1 bg-white/[0.04] border border-white/8 rounded-lg px-3 py-2">
            <p className="font-sans text-xs text-white/35">Children (synced from Module 1)</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {childAges.map((age, i) => (
                <span
                  key={i}
                  className="font-sans text-xs text-white/50 bg-navy-card border border-white/10 rounded px-2 py-0.5"
                >
                  Child {i + 1}: age {age}
                </span>
              ))}
            </div>
            <p className="font-sans text-xs text-white/35 mt-1">
              Target: {collegeFundPerChild > 0
                ? `₱${(collegeFundPerChild * childAges.length).toLocaleString('en-PH')} total`
                : 'set college fund per child in Module 1'}
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
