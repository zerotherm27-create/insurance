'use client'

import { PesoInput, NumberInput } from './PesoInput'

const COLLEGE_PRESETS = [
  { label: 'State U', sublabel: '~₱500K', value: 500_000 },
  { label: 'Local Private', sublabel: '~₱1.5M', value: 1_500_000 },
  { label: 'International', sublabel: '~₱4M', value: 4_000_000 },
]

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

  function changeAge(idx: number, delta: number) {
    const next = [...childAges]
    next[idx] = Math.max(0, Math.min(17, next[idx] + delta))
    onChildAgesChange(next)
  }

  return (
    <section className="space-y-4">
      <p className="font-sans text-xs text-white/30 leading-relaxed">
        D — Debt &amp; final expenses · I — Income replacement · M — Mortgage · E — Education fund
      </p>

      {/* Coverage first — anchor on what they already have */}
      <PesoInput
        label="Existing life insurance coverage"
        value={existingLifeCoverage}
        onChange={onExistingLifeCoverage}
        hint="Total face amount of all current policies"
      />

      {/* D: Debts */}
      <div className="grid grid-cols-2 gap-3">
        <PesoInput label="Final expenses" value={finalExpenses} onChange={onFinalExpenses} hint="Burial, admin costs" />
        <PesoInput label="Outstanding loans" value={outstandingLoans} onChange={onOutstandingLoans} hint="Personal, car, credit cards" />
      </div>

      {/* M: Mortgage */}
      <PesoInput label="Mortgage balance" value={outstandingMortgage} onChange={onOutstandingMortgage} />

      {/* I: Income */}
      <div className="grid grid-cols-2 gap-3 items-end">
        <PesoInput label="Annual income" value={annualIncome} onChange={onAnnualIncome} />
        <NumberInput
          label="Income years to replace"
          value={incomeYearsNeeded}
          onChange={onIncomeYearsNeeded}
          min={1}
          max={30}
        />
      </div>

      {/* E: Children */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs text-white/40">Children</span>
          {childAges.length < 8 && (
            <button
              type="button"
              onClick={addChild}
              className="font-sans text-xs text-gold/70 hover:text-gold transition-[color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 rounded px-1"
            >
              + Add child
            </button>
          )}
        </div>

        {childAges.length === 0 ? (
          <p className="font-sans text-xs text-white/20 italic">No children — skip if not applicable</p>
        ) : (
          <div className="space-y-2">
            {childAges.map((age, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-navy-card border border-white/10 rounded-xl px-4 py-3"
              >
                <span className="font-sans text-sm text-white/60">Child {i + 1}</span>

                <div className="flex items-center gap-3">
                  {/* − button */}
                  <button
                    type="button"
                    onClick={() => changeAge(i, -1)}
                    disabled={age <= 0}
                    aria-label={`Decrease age of child ${i + 1}`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/15 text-white/60 hover:border-white/30 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-[border-color,color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 font-sans text-base select-none"
                  >
                    −
                  </button>

                  <div className="flex items-baseline gap-1 w-12 justify-center">
                    <span className="font-sans text-lg font-semibold text-white tabular-nums">{age}</span>
                    <span className="font-sans text-xs text-white/30">yr</span>
                  </div>

                  {/* + button */}
                  <button
                    type="button"
                    onClick={() => changeAge(i, 1)}
                    disabled={age >= 17}
                    aria-label={`Increase age of child ${i + 1}`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/15 text-white/60 hover:border-white/30 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-[border-color,color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 font-sans text-base select-none"
                  >
                    +
                  </button>

                  <button
                    type="button"
                    onClick={() => removeChild(i)}
                    aria-label={`Remove child ${i + 1}`}
                    className="ml-1 w-6 h-6 flex items-center justify-center text-white/20 hover:text-white/50 transition-[color] duration-150 focus:outline-none rounded"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* E: College fund */}
      {childAges.length > 0 && (
        <div className="space-y-2">
          <p className="font-sans text-xs text-white/40">College fund per child (total, 4 years)</p>

          {/* Quick presets */}
          <div className="grid grid-cols-3 gap-2">
            {COLLEGE_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onCollegeFundPerChild(p.value)}
                className={[
                  'flex flex-col items-center py-2.5 px-2 rounded-xl border text-center transition-[border-color,background-color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40',
                  collegeFundPerChild === p.value
                    ? 'border-gold/50 bg-gold/10'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20',
                ].join(' ')}
              >
                <span className={[
                  'font-sans text-xs font-semibold leading-none mb-1',
                  collegeFundPerChild === p.value ? 'text-gold' : 'text-white/70',
                ].join(' ')}>
                  {p.label}
                </span>
                <span className={[
                  'font-sans text-[10px] tabular-nums',
                  collegeFundPerChild === p.value ? 'text-gold/70' : 'text-white/30',
                ].join(' ')}>
                  {p.sublabel}
                </span>
              </button>
            ))}
          </div>

          <PesoInput
            label="Custom amount"
            value={collegeFundPerChild}
            onChange={onCollegeFundPerChild}
            hint="Or type your own estimate"
          />
        </div>
      )}
    </section>
  )
}
