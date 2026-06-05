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
      setError('Please enter a valid Philippine mobile number, e.g. 09171234567.')
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

  const canSubmit = form.firstName.trim() && form.mobile.trim() && form.email.trim()

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-md mx-auto w-full px-6 space-y-4">
      <div>
        <label htmlFor="firstName" className="block font-sans text-sm text-white/60 mb-1.5">
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
          className="w-full px-4 py-3 rounded-xl bg-navy-card border border-white/10 text-white font-sans placeholder:text-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus:border-gold/40 transition-[border-color] duration-150"
        />
      </div>

      <div>
        <label htmlFor="mobile" className="block font-sans text-sm text-white/60 mb-1.5">
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
          className="w-full px-4 py-3 rounded-xl bg-navy-card border border-white/10 text-white font-sans placeholder:text-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus:border-gold/40 transition-[border-color] duration-150"
        />
      </div>

      <div>
        <label htmlFor="email" className="block font-sans text-sm text-white/60 mb-1.5">
          Email Address <span className="text-gold">*</span>
          <span className="ml-1.5 text-white/35 font-normal text-xs">(we&apos;ll send your full report here)</span>
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="maria@email.com"
          className="w-full px-4 py-3 rounded-xl bg-navy-card border border-white/10 text-white font-sans placeholder:text-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus:border-gold/40 transition-[border-color] duration-150"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400 leading-relaxed">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !canSubmit}
        className="w-full px-6 py-4 rounded-xl bg-gold text-navy-dark font-sans font-semibold text-base tracking-wide hover:bg-gold-soft transition-[background-color] duration-150 disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px]"
      >
        {loading ? 'Generating your report…' : 'See My Results →'}
      </button>

      <p className="font-sans text-[11px] text-white/30 text-center leading-relaxed px-2">
        By submitting, I agree to receive my results and follow-up messages from Jojo at Safety Margin. We never sell or share your information. Unsubscribe anytime.
      </p>

      <div className="flex items-start gap-2 bg-white/[0.04] border border-white/8 rounded-xl px-4 py-3">
        <LockIcon size={14} className="mt-0.5 shrink-0 text-white/50" />
        <p className="font-sans text-xs text-white/55 leading-relaxed">
          Your information is kept private. Jojo will reach out within 24 hours. No spam, no pressure.
        </p>
      </div>
    </form>
  )
}
