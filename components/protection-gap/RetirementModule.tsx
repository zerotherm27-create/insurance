'use client'

import { PesoInput, NumberInput } from './PesoInput'

interface RetirementModuleProps {
  currentAge: number
  retirementAge: number
  monthlyIncome: number
  existingRetirementSavings: number
  monthlyRetirementSavings: number
  onCurrentAge: (v: number) => void
  onRetirementAge: (v: number) => void
  onMonthlyIncome: (v: number) => void
  onExistingRetirementSavings: (v: number) => void
  onMonthlyRetirementSavings: (v: number) => void
}

export function RetirementModule({
  currentAge,
  retirementAge,
  monthlyIncome,
  existingRetirementSavings,
  monthlyRetirementSavings,
  onCurrentAge,
  onRetirementAge,
  onMonthlyIncome,
  onExistingRetirementSavings,
  onMonthlyRetirementSavings,
}: RetirementModuleProps) {
  return (
    <section className="space-y-4">
      <p className="font-sans text-xs text-white/35 leading-relaxed">
        Will your savings reach the corpus you need by retirement? Uses a 70% income replacement target and the 4% safe withdrawal rate.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="Current age"
          value={currentAge}
          onChange={onCurrentAge}
          min={18}
          max={64}
        />
        <NumberInput
          label="Target retirement age"
          value={retirementAge}
          onChange={onRetirementAge}
          min={currentAge + 1}
          max={80}
        />
      </div>

      <PesoInput
        label="Monthly income"
        value={monthlyIncome}
        onChange={onMonthlyIncome}
        hint="Target = 70% of this in retirement"
      />

      <div className="grid grid-cols-2 gap-3">
        <PesoInput
          label="Existing retirement savings"
          value={existingRetirementSavings}
          onChange={onExistingRetirementSavings}
        />
        <PesoInput
          label="Monthly retirement savings"
          value={monthlyRetirementSavings}
          onChange={onMonthlyRetirementSavings}
        />
      </div>
    </section>
  )
}
