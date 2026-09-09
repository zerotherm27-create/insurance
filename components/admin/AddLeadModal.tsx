'use client'

import { useState } from 'react'
import { ModalBackdrop, ModalPanel } from '@/components/ui/Modal'

const SEGMENT_OPTIONS = [
  { value: '', label: 'General (no segment)' },
  { value: 'pro', label: 'Young Professional' },
  { value: 'family', label: 'Family / Parent' },
  { value: 'ofw', label: 'OFW' },
  { value: 'entrepreneur', label: 'Entrepreneur' },
  { value: 'business', label: 'Business Owner' },
  { value: 'hnw', label: 'High Net Worth' },
]

const inputCls =
  'w-full px-3 py-2.5 rounded-xl bg-navy border border-white/10 text-white font-sans text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 placeholder:text-white/20'

interface Props {
  token: string
  onClose: () => void
  onAdded: (lead: unknown) => void
}

export function AddLeadModal({ token, onClose, onAdded }: Props) {
  const [firstName, setFirstName] = useState('')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState('')
  const [segment, setSegment] = useState('')
  const [eventTag, setEventTag] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/funnel-leads', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          mobile: mobile.trim(),
          email: email.trim(),
          age: age.trim() ? Number(age) : undefined,
          segment,
          event_tag: eventTag.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to add lead')
      onAdded(data.lead)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add lead')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalPanel className="bg-navy-card border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 space-y-4">
        <div>
          <h3 className="font-serif text-lg text-white">Add Lead</h3>
          <p className="font-sans text-xs text-white/40 mt-1">
            For someone you met in person, a phone inquiry, or a referral — not the quiz.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="font-sans text-[10px] uppercase tracking-wider text-white/40">Full Name</label>
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Maria Santos"
              className={`${inputCls} mt-1.5`}
            />
          </div>

          <div>
            <label className="font-sans text-[10px] uppercase tracking-wider text-white/40">Mobile</label>
            <input
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="09171234567"
              className={`${inputCls} mt-1.5`}
            />
          </div>

          <div>
            <label className="font-sans text-[10px] uppercase tracking-wider text-white/40">
              Email <span className="normal-case text-white/20">(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maria@email.com"
              className={`${inputCls} mt-1.5`}
            />
          </div>

          <div>
            <label className="font-sans text-[10px] uppercase tracking-wider text-white/40">
              Age <span className="normal-case text-white/20">(optional)</span>
            </label>
            <input
              type="number"
              min={18}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="35"
              className={`${inputCls} mt-1.5`}
            />
          </div>

          <div>
            <label className="font-sans text-[10px] uppercase tracking-wider text-white/40">
              Segment <span className="normal-case text-white/20">(optional)</span>
            </label>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className={`${inputCls} mt-1.5`}
            >
              {SEGMENT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-sans text-[10px] uppercase tracking-wider text-white/40">
              Event <span className="normal-case text-white/20">(optional)</span>
            </label>
            <input
              value={eventTag}
              onChange={(e) => setEventTag(e.target.value)}
              placeholder="Insurance Seminar Jan 2027"
              className={`${inputCls} mt-1.5`}
            />
            <p className="font-sans text-[10px] text-white/20 mt-1.5">
              Which in-person event this lead came from, so you can later send them (and others from the same event) a custom follow-up email.
            </p>
          </div>

          {error && (
            <p className="font-sans text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 font-sans text-sm text-white/40 hover:text-white/70 transition-colors py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 font-sans text-sm font-semibold py-2 rounded-lg bg-gold text-navy-dark hover:bg-gold-soft disabled:opacity-50 transition-colors"
            >
              {saving ? 'Adding…' : 'Add Lead'}
            </button>
          </div>
        </form>
      </ModalPanel>
    </ModalBackdrop>
  )
}
