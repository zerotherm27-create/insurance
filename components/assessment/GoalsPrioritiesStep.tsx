'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Goal, GoalsAndPriorities, PriorityStyle, RiskComfort } from '@/types'

interface Props {
  initial?: Partial<GoalsAndPriorities>
  onSubmit: (data: GoalsAndPriorities) => void
  onBack: () => void
}

const GOALS: { id: Goal; label: string; icon: string }[] = [
  { id: 'health_protection', label: 'Health protection', icon: '❤️' },
  { id: 'life_protection', label: 'Life protection', icon: '🛡️' },
  { id: 'predictable_income', label: 'Predictable future income', icon: '📈' },
  { id: 'savings_discipline', label: 'Savings discipline', icon: '💰' },
  { id: 'investment_growth', label: 'Investment growth', icon: '🚀' },
  { id: 'retirement_preparation', label: 'Retirement preparation', icon: '🏡' },
  { id: 'family_protection', label: 'Family protection', icon: '👨‍👩‍👧' },
]

const PRIORITY_STYLES: { id: PriorityStyle; label: string; desc: string }[] = [
  { id: 'start_small', label: 'Start Small', desc: 'Begin with affordable protection, grow over time.' },
  { id: 'balanced', label: 'Balanced', desc: 'Protection and savings side by side.' },
  { id: 'maximize_protection', label: 'Maximize Protection', desc: 'Full coverage first, growth next.' },
]

const RISK_OPTIONS: { id: RiskComfort; label: string; desc: string }[] = [
  { id: 'conservative', label: 'Conservative', desc: 'Prefer guaranteed outcomes over growth potential.' },
  { id: 'moderate', label: 'Moderate', desc: 'Comfortable with some market fluctuation.' },
  { id: 'growth_oriented', label: 'Growth-Oriented', desc: 'Willing to take higher risk for higher potential.' },
]

export function GoalsPrioritiesStep({ initial, onSubmit, onBack }: Props) {
  const [goals, setGoals] = useState<Goal[]>(initial?.goals ?? [])
  const [priorityStyle, setPriorityStyle] = useState<PriorityStyle | ''>( initial?.priorityStyle ?? '' )
  const [riskComfort, setRiskComfort] = useState<RiskComfort | ''>( initial?.riskComfort ?? '' )

  const toggleGoal = (id: Goal) =>
    setGoals((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id])

  const isValid = goals.length >= 1 && priorityStyle !== '' && riskComfort !== ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      onSubmit({
        goals,
        priorityStyle: priorityStyle as PriorityStyle,
        riskComfort: riskComfort as RiskComfort,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-4">
          Select all that apply
        </p>
        <p className="font-serif text-xl text-white mb-4">
          What financial goals matter most to you right now?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {GOALS.map(({ id, label, icon }) => {
            const selected = goals.includes(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleGoal(id)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                  selected
                    ? 'border-gold/60 bg-gold/10 text-white'
                    : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                }`}
                aria-pressed={selected}
              >
                <span className="text-lg" aria-hidden="true">{icon}</span>
                <span className="text-sm font-medium">{label}</span>
                {selected && (
                  <span className="ml-auto text-gold text-xs" aria-hidden="true">✓</span>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      <Card className="p-6">
        <p className="font-serif text-xl text-white mb-4">
          What best describes your priority style?
        </p>
        <div className="space-y-2" role="radiogroup" aria-label="Priority style">
          {PRIORITY_STYLES.map(({ id, label, desc }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={priorityStyle === id}
              onClick={() => setPriorityStyle(id)}
              className={`w-full flex items-start gap-4 rounded-xl border px-5 py-4 text-left transition-all ${
                priorityStyle === id
                  ? 'border-gold/60 bg-gold/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div
                className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                  priorityStyle === id ? 'border-gold bg-gold' : 'border-white/30'
                }`}
                aria-hidden="true"
              >
                {priorityStyle === id && (
                  <span className="w-2 h-2 rounded-full bg-navy-dark" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-white/40 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <p className="font-serif text-xl text-white mb-4">
          How comfortable are you with financial risk?
        </p>
        <div className="space-y-2" role="radiogroup" aria-label="Risk comfort">
          {RISK_OPTIONS.map(({ id, label, desc }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={riskComfort === id}
              onClick={() => setRiskComfort(id)}
              className={`w-full flex items-start gap-4 rounded-xl border px-5 py-4 text-left transition-all ${
                riskComfort === id
                  ? 'border-gold/60 bg-gold/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div
                className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                  riskComfort === id ? 'border-gold bg-gold' : 'border-white/30'
                }`}
                aria-hidden="true"
              >
                {riskComfort === id && (
                  <span className="w-2 h-2 rounded-full bg-navy-dark" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-white/40 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <Button type="submit" disabled={!isValid} size="lg" variant="primary">
          Analyze My Profile →
        </Button>
      </div>
    </form>
  )
}
