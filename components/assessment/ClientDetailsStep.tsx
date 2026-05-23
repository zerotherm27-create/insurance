'use client'
import { useState } from 'react'
import { FormField } from './FormField'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { ClientDetails } from '@/types'
import { calculateAge } from '@/lib/utils'

interface Props {
  initial?: Partial<ClientDetails>
  onSubmit: (data: ClientDetails) => void
}

const INCOME_OPTIONS = [
  { value: 'Under ₱20,000', label: 'Under ₱20,000' },
  { value: '₱20,000–₱35,000', label: '₱20,000–₱35,000' },
  { value: '₱35,000–₱60,000', label: '₱35,000–₱60,000' },
  { value: '₱60,000–₱100,000', label: '₱60,000–₱100,000' },
  { value: 'Over ₱100,000', label: 'Over ₱100,000' },
]

const BUDGET_OPTIONS = [
  { value: 'Under ₱1,000', label: 'Under ₱1,000/month' },
  { value: '₱1,000–₱2,000', label: '₱1,000–₱2,000/month' },
  { value: '₱2,000–₱5,000', label: '₱2,000–₱5,000/month' },
  { value: 'Over ₱5,000', label: 'Over ₱5,000/month' },
]

export function ClientDetailsStep({ initial, onSubmit }: Props) {
  const [form, setForm] = useState<Partial<ClientDetails>>({
    fullName: '',
    birthday: '',
    age: 0,
    gender: 'male',
    smoker: false,
    occupation: '',
    incomeRange: '',
    monthlyBudget: '',
    hasHMO: false,
    hasEmergencyFund: false,
    isBreadwinner: false,
    hasExistingInsurance: false,
    ...initial,
  })

  const computedAge = form.birthday ? calculateAge(form.birthday) : 0

  const set = (key: keyof ClientDetails, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  const isValid =
    !!form.fullName && !!form.birthday && computedAge > 0 && !!form.occupation && !!form.incomeRange && !!form.monthlyBudget

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid && computedAge > 0) {
      const clientData: ClientDetails = {
        fullName: form.fullName!,
        birthday: form.birthday!,
        age: computedAge,
        gender: form.gender ?? 'male',
        smoker: form.smoker ?? false,
        occupation: form.occupation!,
        incomeRange: form.incomeRange!,
        monthlyBudget: form.monthlyBudget!,
        hasHMO: form.hasHMO ?? false,
        hasEmergencyFund: form.hasEmergencyFund ?? false,
        isBreadwinner: form.isBreadwinner ?? false,
        hasExistingInsurance: form.hasExistingInsurance ?? false,
      }
      onSubmit(clientData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            type="text"
            label="Full Name"
            required
            placeholder="Your full name"
            value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)}
          />
          <FormField
            type="date"
            label="Birthday"
            required
            max={new Date().toISOString().split('T')[0]}
            value={form.birthday}
            onChange={(e) => set('birthday', e.target.value)}
          />
        </div>

        {computedAge > 0 ? (
          <div className="rounded-xl bg-gold/10 border border-gold/20 px-4 py-2">
            <p className="text-sm text-gold/90">Age computed: <strong>{computedAge} years old</strong></p>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            type="select"
            label="Gender"
            required
            value={form.gender}
            onChange={(e) => set('gender', e.target.value as 'male' | 'female')}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
            ]}
          />
          <FormField
            type="text"
            label="Occupation"
            required
            placeholder="e.g. Software Engineer"
            value={form.occupation}
            onChange={(e) => set('occupation', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            type="select"
            label="Monthly Income Range"
            required
            value={form.incomeRange}
            onChange={(e) => set('incomeRange', e.target.value)}
            options={INCOME_OPTIONS}
          />
          <FormField
            type="select"
            label="Monthly Budget for Protection"
            required
            value={form.monthlyBudget}
            onChange={(e) => set('monthlyBudget', e.target.value)}
            options={BUDGET_OPTIONS}
          />
        </div>
      </Card>

      <Card className="p-6">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Financial Foundation</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'hasHMO' as const, label: 'Company HMO', hint: 'Do you have employer HMO?' },
            { key: 'hasEmergencyFund' as const, label: 'Emergency Fund', hint: '3–6 months expenses saved?' },
            { key: 'isBreadwinner' as const, label: 'Breadwinner', hint: 'Do others depend on your income?' },
            { key: 'hasExistingInsurance' as const, label: 'Existing Insurance', hint: 'Any active policy?' },
          ].map(({ key, label, hint }) => (
            <div key={key} className="space-y-2">
              <FormField
                type="toggle"
                label={label}
                hint={hint}
                checked={!!form[key]}
                onChange={(v) => set(key, v)}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Health Profile</p>
        <FormField
          type="toggle"
          label="Smoker"
          hint="This affects eligibility and coverage options."
          checked={!!form.smoker}
          onChange={(v) => set('smoker', v)}
        />
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={!isValid} size="lg" variant="primary">
          Continue to Goals →
        </Button>
      </div>
    </form>
  )
}
