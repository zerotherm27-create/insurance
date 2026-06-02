'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FunnelAnswers } from '@/types/funnel'
import { LockIcon } from '@/components/ui/icons'

export function LeadCaptureForm() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName: '', mobile: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    let answers: FunnelAnswers
    try {
      const stored = sessionStorage.getItem('sma_funnel_answers')
      if (!stored) throw new Error('missing')
      answers = JSON.parse(stored)
    } catch {
      setError('Your answers were not found. Please restart the check.')
      return
    }

    if (!/^09\d{9}$/.test(form.mobile)) {
      setError('Please enter a valid Philippine mobile number — e.g. 09171234567.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/funnel/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          mobile: form.mobile.trim(),
          email: form.email.trim() || undefined,
          answers,
        }),
      })

      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(typeof body.error === 'string' ? body.error : 'Something went wrong. Please try again.')
      }

      sessionStorage.setItem('sma_funnel_report', JSON.stringify(body))
      sessionStorage.removeItem('sma_funnel_answers')
      router.push(`/funnel/report/${body.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-md mx-auto w-full px-6 space-y-4">
      <div>
        <label htmlFor="firstName" className="block font-sans text-sm text-white/50 mb-1.5">
          First Name <span className="text-gold">*</span>
        </label>
        <input
          id="firstName"
          type="text"
          required
          autoComplete="given-name"
          value={form.firstName}
          onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
          placeholder="Maria"
          className="w-full px-4 py-3 rounded-xl bg-navy-card border border-white/10 text-white font-sans placeholder:text-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus:border-gold/40 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="mobile" className="block font-sans text-sm text-white/50 mb-1.5">
          Mobile Number <span className="text-gold">*</span>
        </label>
        <input
          id="mobile"
          type="tel"
          required
          autoComplete="tel"
          value={form.mobile}
          onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
          placeholder="09171234567"
          className="w-full px-4 py-3 rounded-xl bg-navy-card border border-white/10 text-white font-sans placeholder:text-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus:border-gold/40 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="email" className="block font-sans text-sm text-white/50 mb-1.5">
          Email <span className="text-white/30 font-normal">(optional — receive your report by email)</span>
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="maria@email.com"
          className="w-full px-4 py-3 rounded-xl bg-navy-card border border-white/10 text-white font-sans placeholder:text-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus:border-gold/40 transition-colors"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400 leading-relaxed">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !form.firstName || !form.mobile}
        className="w-full px-6 py-4 rounded-xl bg-gold text-navy-dark font-sans font-semibold text-base tracking-wide hover:bg-gold-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px]"
      >
        {loading ? 'Generating your report…' : 'SEE MY RESULTS →'}
      </button>

      <p className="text-center text-xs text-white/25 leading-relaxed inline-flex items-start gap-1.5 justify-center">
        <LockIcon size={13} className="mt-0.5 shrink-0" />
        <span>Your information is safe. A licensed Sun Life advisor will reach out within 24 hours — no spam, no pressure.</span>
      </p>
    </form>
  )
}
