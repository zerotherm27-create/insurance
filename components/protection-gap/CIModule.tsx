'use client'

import { PesoInput } from './PesoInput'

interface CIModuleProps {
  monthlyIncome: number
  existingCICoverage: number
  onMonthlyIncome: (v: number) => void
  onExistingCICoverage: (v: number) => void
}

export function CIModule({
  monthlyIncome,
  existingCICoverage,
  onMonthlyIncome,
  onExistingCICoverage,
}: CIModuleProps) {
  return (
    <section className="space-y-3">
      <p className="font-sans text-xs text-white/35 leading-relaxed">
        A critical illness plan pays out a lump sum if you are diagnosed with a major condition such as cancer, heart attack, or stroke. The payout replaces lost income while you recover and covers out-of-pocket medical costs that health insurance may not cover. The ideal fund is based on your monthly income.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <PesoInput
          label="Monthly income"
          value={monthlyIncome}
          onChange={onMonthlyIncome}
          hint="Sets your ideal CI fund"
        />
        <PesoInput
          label="Existing CI coverage"
          value={existingCICoverage}
          onChange={onExistingCICoverage}
          hint="Rider or standalone plan"
        />
      </div>
    </section>
  )
}
