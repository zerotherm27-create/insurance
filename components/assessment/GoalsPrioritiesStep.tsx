'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  HeartIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  WalletIcon,
  RocketIcon,
  HomeIcon,
  FamilyIcon,
  CheckIcon,
  type IconProps,
} from '@/components/ui/icons'
import type { Goal, GoalsAndPriorities, PriorityStyle, RiskComfort } from '@/types'

interface Props {
  initial?: Partial<GoalsAndPriorities>
  onSubmit: (data: GoalsAndPriorities) => void
  onBack: () => void
}

const GOALS: { id: Goal; label: string; Icon: (p: IconProps) => React.ReactElement }[] = [
  { id: 'health_protection', label: 'Health protection', Icon: HeartIcon },
  { id: 'life_protection', label: 'Life protection', Icon: ShieldCheckIcon },
  { id: 'predictable_income', label: 'Predictable future income', Icon: TrendingUpIcon },
  { id: 'savings_discipline', label: 'Savings discipline', Icon: WalletIcon },
  { id: 'investment_growth', label: 'Investment growth', Icon: RocketIcon },
  { id: 'retirement_preparation', label: 'Retirement preparation', Icon: HomeIcon },
  { id: 'family_protection', label: 'Family protection', Icon: FamilyIcon },
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
          {GOALS.map(({ id, label, Icon }) => {
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
                <Icon size={18} className={selected ? 'text-gold' : 'text-white/50'} />
                <span className="text-sm font-medium">{label}</span>
                {selected && (
                  <CheckIcon size={14} className="ml-auto text-gold" />
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
