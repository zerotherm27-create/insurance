'use client'

import { PesoInput, NumberInput } from './PesoInput'

interface DiméModuleProps {
  finalExpenses: number
  outstandingLoans: number
  outstandingMortgage: number
  annualIncome: number
  incomeYearsNeeded: number
  childAges: number[]
  collegeFundPerChild: number
  existingLifeCoverage: number
  onFinalExpenses: (v: number) => void
  onOutstandingLoans: (v: number) => void
  onOutstandingMortgage: (v: number) => void
  onAnnualIncome: (v: number) => void
  onIncomeYearsNeeded: (v: number) => void
  onChildAgesChange: (ages: number[]) => void
  onCollegeFundPerChild: (v: number) => void
  onExistingLifeCoverage: (v: number) => void
}

export function DiméModule({
  finalExpenses,
  outstandingLoans,
  outstandingMortgage,
  annualIncome,
  incomeYearsNeeded,
  childAges,
  collegeFundPerChild,
  existingLifeCoverage,
  onFinalExpenses,
  onOutstandingLoans,
  onOutstandingMortgage,
  onAnnualIncome,
  onIncomeYearsNeeded,
  onChildAgesChange,
  onCollegeFundPerChild,
  onExistingLifeCoverage,
}: DiméModuleProps) {
  function addChild() {
    if (childAges.length >= 8) return
    onChildAgesChange([...childAges, 5])
  }

  function removeChild(idx: number) {
    onChildAgesChange(childAges.filter((_, i) => i !== idx))
  }

  function updateAge(idx: number, age: number) {
    const next = [...childAges]
    next[idx] = Math.max(0, Math.min(17, age))
    onChildAgesChange(next)
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 shrink-0 border border-gold/40 rounded-full flex items-center justify-center font-sans text-xs text-gold">
          1
        </span>
        <h3 className="font-sans text-xs text-gold uppercase tracking-widest font-medium">
          Life Insurance (DIME)
        </h3>
      </div>

      <p className="font-sans text-xs text-white/25 leading-relaxed pl-7">
        D — Debt, I — Income, M — Mortgage, E — Education
      </p>

      <div className="grid grid-cols-2 gap-3 pl-0">
        <PesoInput label="Final expenses" value={finalExpenses} onChange={onFinalExpenses} hint="Burial, admin costs" />
        <PesoInput label="Outstanding loans" value={outstandingLoans} onChange={onOutstandingLoans} hint="Personal, car, credit cards" />
      </div>

      <PesoInput label="Mortgage balance" value={outstandingMortgage} onChange={onOutstandingMortgage} />

      <div className="grid grid-cols-2 gap-3">
        <PesoInput label="Annual income" value={annualIncome} onChange={onAnnualIncome} />
        <NumberInput
          label="Income years needed"
          value={incomeYearsNeeded}
          onChange={onIncomeYearsNeeded}
          min={1}
          max={30}
          hint="How long to replace"
        />
      </div>

      {/* Children for E component */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-sans text-xs text-white/40">Children (ages)</label>
          {childAges.length < 8 && (
            <button
              type="button"
              onClick={addChild}
              className="font-sans text-xs text-gold/60 hover:text-gold transition-[color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 rounded"
            >
              + Add child
            </button>
          )}
        </div>
        {childAges.length === 0 && (
          <p className="font-sans text-xs text-white/20 italic">No children added</p>
        )}
        <div className="flex flex-wrap gap-2">
          {childAges.map((age, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-navy-card border border-white/10 rounded-lg px-2 py-1.5">
              <span className="font-sans text-xs text-white/40">Child {i + 1}</span>
              <input
                type="number"
                min={0}
                max={17}
                value={age}
                onChange={(e) => updateAge(i, parseInt(e.target.value, 10) || 0)}
                className="w-9 bg-transparent font-sans text-xs text-white text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-label={`Child ${i + 1} age`}
              />
              <span className="font-sans text-xs text-white/30">yr</span>
              <button
                type="button"
                onClick={() => removeChild(i)}
                className="text-white/20 hover:text-white/50 transition-[color] duration-150 focus:outline-none ml-0.5"
                aria-label={`Remove child ${i + 1}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {childAges.length > 0 && (
        <PesoInput
          label="College fund per child (total, all years)"
          value={collegeFundPerChild}
          onChange={onCollegeFundPerChild}
          hint="Includes tuition, misc for 4 years"
        />
      )}

      <PesoInput
        label="Existing life insurance coverage"
        value={existingLifeCoverage}
        onChange={onExistingLifeCoverage}
      />
    </section>
  )
}
