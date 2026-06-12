'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  buildCoverageBenefits,
  computeProtectionScore,
  scoreLabelFor,
} from '@/lib/coverage-benefits'
import { getTierColor } from '@/lib/scoring'
import { ScoreGauge } from '@/components/funnel/ScoreGauge'
import {
  CheckCircleIcon,
  AlertTriangleIcon,
  XCircleIcon,
  LockIcon,
} from '@/components/ui/icons'
import type { FunnelAnswers, CoverageBenefit } from '@/types/funnel'

const STATUS_CONFIG = {
  gap: {
    card: 'border-red-400/30 bg-red-400/5',
    badge: 'text-red-400 bg-red-400/10 border border-red-400/25',
    label: 'Gap Detected',
  },
  partial: {
    card: 'border-gold/25 bg-gold/5',
    badge: 'text-gold bg-gold/10 border border-gold/25',
    label: 'Worth Reviewing',
  },
  have: {
    card: 'border-emerald-500/15 bg-emerald-500/5',
    badge: 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20',
    label: 'Covered',
  },
}

const SCORE_CONTEXT: Record<string, string> = {
  'Critical Gaps': 'Significant gaps that need to be addressed.',
  'Needs Attention': 'Important areas of your protection need attention.',
  'Partially Protected': 'Some coverage in place, but gaps remain.',
  'Well Protected': 'Mostly solid. A few areas worth confirming.',
  'Strongly Protected': 'Your protection foundation is strong.',
}

function StatusIcon({ status }: { status: CoverageBenefit['status'] }) {
  if (status === 'gap') return <XCircleIcon size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
  if (status === 'partial') return <AlertTriangleIcon size={16} className="text-gold flex-shrink-0 mt-0.5" />
  return <CheckCircleIcon size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
}

export default function GapBoardPage() {
  const router = useRouter()
  const [answers, setAnswers] = useState<FunnelAnswers | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ firstName: '', mobile: '', email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    let parsed: FunnelAnswers | null = null
    try {
      const raw = sessionStorage.getItem('sma_funnel_answers')
      if (raw) parsed = JSON.parse(raw)
    } catch {}

    if (!parsed?.segment) {
      router.replace('/funnel')
      return
    }

    // Deck mode routing is done — clear the flag
    try { sessionStorage.removeItem('sma_funnel_mode') } catch {}

    setAnswers(parsed)
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFormError('Please enter a valid email address.')
      return
    }
    if (!/^09\d{9}$/.test(form.mobile)) {
      setFormError('Please enter a valid mobile number, e.g. 09171234567.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/funnel/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          mobile: form.mobile.trim(),
          email: form.email.trim(),
          answers,
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error ?? 'Something went wrong. Please try again.')

      sessionStorage.setItem('sma_funnel_report', JSON.stringify(body))
      sessionStorage.removeItem('sma_funnel_answers')
      router.push(`/funnel/snapshot/${body.id}`)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!answers) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-navy-gradient">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </main>
    )
  }

  const benefits = buildCoverageBenefits(answers)
  const sorted = [
    ...benefits.filter((b) => b.status === 'gap'),
    ...benefits.filter((b) => b.status === 'partial'),
    ...benefits.filter((b) => b.status === 'have'),
  ]
  const score = computeProtectionScore(benefits)
  const scoreLabel = scoreLabelFor(score)
  const scoreColor = getTierColor(score)
  const attentionCount = benefits.filter((b) => b.status !== 'have').length

  return (
    <main className="relative min-h-screen flex flex-col bg-navy-gradient px-6 py-10 overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[280px] rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ background: scoreColor }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-lg mx-auto w-full space-y-6">

        {/* Score */}
        <div className="text-center space-y-3 pt-2">
          <h1 className="font-serif text-2xl text-white">Your Protection Profile</h1>
          <ScoreGauge score={score} />
          <div className="space-y-1">
            <p className="font-sans text-base font-semibold" style={{ color: scoreColor }}>
              {scoreLabel}
            </p>
            <p className="font-sans text-xs text-white/40 max-w-xs mx-auto leading-relaxed">
              {SCORE_CONTEXT[scoreLabel] ?? ''}
            </p>
          </div>
        </div>

        {/* Summary */}
        {attentionCount > 0 && (
          <p className="text-center font-sans text-sm text-white/50">
            {attentionCount} of {benefits.length}{' '}
            {attentionCount === 1 ? 'area needs' : 'areas need'} attention
          </p>
        )}

        {/* Gap cards */}
        <div className="space-y-2.5">
          {sorted.map((benefit) => {
            const config = STATUS_CONFIG[benefit.status]
            const showAmounts = benefit.status !== 'have'
            return (
              <div
                key={benefit.id}
                className={`rounded-xl border px-4 py-4 ${config.card} ${showAmounts ? 'space-y-2.5' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <StatusIcon status={benefit.status} />
                    <p className="font-sans text-sm font-medium text-white/90 leading-snug">
                      {benefit.name}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium whitespace-nowrap ${config.badge}`}>
                    {config.label}
                  </span>
                </div>

                {showAmounts && (
                  <div className="pl-7 space-y-1">
                    <p className="font-sans text-xs text-white/60 leading-relaxed">
                      <span className="text-gold/80">{benefit.idealLabel ?? 'Ideal'}:</span>{' '}
                      {benefit.idealAmount}
                    </p>
                    {benefit.starterAmount && (
                      <p className="font-sans text-xs text-white/40 leading-relaxed">
                        <span className="text-white/40">{benefit.starterLabel ?? 'Starter'}:</span>{' '}
                        {benefit.starterAmount}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA and inline capture form */}
        <div className="pt-2 space-y-3">
          {!showForm ? (
            <>
              <button
                onClick={() => setShowForm(true)}
                className="w-full px-6 py-4 text-base rounded-xl font-sans font-semibold tracking-wide bg-gold text-navy-dark hover:bg-gold-soft transition-[background-color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              >
                Get My Full Report →
              </button>
              <p className="text-center text-xs text-white/25">
                Free. Jojo will follow up within 24 hours.
              </p>
            </>
          ) : (
            <AnimatePresence mode="wait">
              <motion.form
                key="capture"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
                onSubmit={handleSubmit}
                noValidate
                className="space-y-4"
              >
                <p className="font-sans text-sm text-white/70 font-medium text-center pb-1">
                  Where should we send your full report?
                </p>

                <div>
                  <label htmlFor="gap-name" className="block font-sans text-sm text-white/50 mb-1.5">
                    Full Name <span className="text-gold">*</span>
                  </label>
                  <input
                    id="gap-name"
                    type="text"
                    required
                    autoComplete="name"
                    autoFocus
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    placeholder="Maria Santos"
                    className="w-full px-4 py-3 rounded-xl bg-navy-card border border-white/10 text-white font-sans placeholder:text-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus:border-gold/40 transition-[border-color] duration-150"
                  />
                </div>

                <div>
                  <label htmlFor="gap-mobile" className="block font-sans text-sm text-white/50 mb-1.5">
                    Mobile Number <span className="text-gold">*</span>
                  </label>
                  <input
                    id="gap-mobile"
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
                  <label htmlFor="gap-email" className="block font-sans text-sm text-white/50 mb-1.5">
                    Email Address <span className="text-gold">*</span>
                  </label>
                  <input
                    id="gap-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="maria@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-navy-card border border-white/10 text-white font-sans placeholder:text-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus:border-gold/40 transition-[border-color] duration-150"
                  />
                </div>

                {formError && (
                  <p role="alert" className="text-sm text-red-400 leading-relaxed">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting || !form.firstName || !form.mobile || !form.email}
                  className="w-full px-6 py-4 rounded-xl bg-gold text-navy-dark font-sans font-semibold text-base tracking-wide hover:bg-gold-soft transition-[background-color] duration-150 disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                >
                  {submitting ? 'Generating your report…' : 'Send My Report →'}
                </button>

                <p className="text-center text-xs text-white/25 leading-relaxed flex items-start gap-1.5 justify-center">
                  <LockIcon size={13} className="mt-0.5 flex-shrink-0" />
                  <span>No spam. A licensed advisor will reach out within 24 hours.</span>
                </p>
              </motion.form>
            </AnimatePresence>
          )}
        </div>

        <p className="text-center text-xs text-white/15 leading-relaxed pb-4">
          Coverage amounts are estimates based on your answers and standard planning guidelines.
          This is for educational purposes only and must be validated through an official proposal
          and consultation with a licensed advisor.
        </p>
      </div>
    </main>
  )
}
