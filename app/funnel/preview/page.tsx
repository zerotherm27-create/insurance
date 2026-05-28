'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FunnelAnswers, FunnelAIReport } from '@/types/funnel'

// ── Score gauge (CSS conic-gradient ring) ───────────────────────────────────

function scoreColor(score: number) {
  if (score < 31) return '#ef4444'
  if (score < 51) return '#f97316'
  if (score < 66) return '#f59e0b'
  if (score < 81) return '#60a5fa'
  return '#10b981'
}

function ScoreGauge({ score }: { score: number }) {
  const color = scoreColor(score)
  return (
    <div className="relative w-40 h-40 mx-auto">
      <div
        className="w-full h-full rounded-full"
        style={{
          background: `conic-gradient(${color} ${score}%, rgba(255,255,255,0.07) 0%)`,
        }}
      />
      <div className="absolute inset-[10px] rounded-full bg-[#0b1a2e] flex flex-col items-center justify-center gap-0.5">
        <span className="font-serif text-4xl text-white leading-none">{score}</span>
        <span className="font-sans text-xs text-white/30">out of 100</span>
      </div>
    </div>
  )
}

const LABEL_COLOR: Record<string, string> = {
  'Critical Gaps': 'text-red-400',
  'Needs Attention': 'text-orange-400',
  'Partially Protected': 'text-amber-400',
  'Well Protected': 'text-blue-400',
  'Strongly Protected': 'text-emerald-400',
}

const SCORE_CONTEXT: Record<string, string> = {
  'Critical Gaps': 'Your profile shows significant protection gaps that need immediate attention.',
  'Needs Attention': 'You have some coverage but important gaps remain in your protection.',
  'Partially Protected': "You're partially covered, but there are areas that could leave you exposed.",
  'Well Protected': "You're in good shape — a few improvements would make your protection solid.",
  'Strongly Protected': 'Your protection foundation is strong. Let your advisor confirm the details.',
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function FunnelPreviewPage() {
  const router = useRouter()
  const [answers, setAnswers] = useState<FunnelAnswers | null>(null)
  const [report, setReport] = useState<FunnelAIReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCapture, setShowCapture] = useState(false)

  // Lead capture form
  const [form, setForm] = useState({ firstName: '', mobile: '', email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    let parsed: FunnelAnswers | null = null
    try {
      const raw = sessionStorage.getItem('sma_funnel_answers')
      if (raw) parsed = JSON.parse(raw)
    } catch {}

    if (!parsed) {
      router.replace('/funnel')
      return
    }
    setAnswers(parsed)

    fetch('/api/funnel/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: parsed }),
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(body.error ?? 'Generation failed')
        setReport(body.report)
      })
      .catch((err) => setError(err.message ?? 'Something went wrong'))
      .finally(() => setLoading(false))
  }, [router])

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (!/^09\d{9}$/.test(form.mobile)) {
      setFormError('Please enter a valid Philippine mobile number — e.g. 09171234567.')
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
          email: form.email.trim() || undefined,
          answers,
          report, // skip AI re-run
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error ?? 'Something went wrong. Please try again.')

      sessionStorage.setItem('sma_funnel_report', JSON.stringify(body))
      sessionStorage.removeItem('sma_funnel_answers')
      router.push(`/funnel/report/${body.id}`)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="relative min-h-screen flex flex-col items-center justify-center bg-navy-gradient px-6 text-center">
        <div className="space-y-5">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <p className="font-sans text-sm text-white/60">Analyzing your protection profile…</p>
            <p className="font-sans text-xs text-white/30">This takes about 5 seconds</p>
          </div>
        </div>
      </main>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error || !report) {
    return (
      <main className="relative min-h-screen flex flex-col items-center justify-center bg-navy-gradient px-6 text-center">
        <div className="space-y-4 max-w-sm">
          <p className="font-sans text-sm text-white/60">
            {error ?? 'Could not generate your report. Please try again.'}
          </p>
          <button
            onClick={() => router.push('/funnel')}
            className="text-gold text-sm underline underline-offset-2"
          >
            Restart the check
          </button>
        </div>
      </main>
    )
  }

  const labelColor = LABEL_COLOR[report.scoreLabel] ?? 'text-white/60'
  const scoreContext = SCORE_CONTEXT[report.scoreLabel] ?? ''
  const [firstSnap, ...hiddenSnaps] = report.snapshot

  // ── Preview + capture ──────────────────────────────────────────────────────
  return (
    <main className="relative min-h-screen flex flex-col bg-navy-gradient px-6 py-10 overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: scoreColor(report.protectionScore) }}
      />

      <div className="relative z-10 max-w-md mx-auto w-full space-y-6">

        {/* Header */}
        <div className="text-center">
          <p className="font-sans text-xs text-white/30 uppercase tracking-widest">
            Your Financial Protection Score
          </p>
        </div>

        {/* Gauge + label */}
        <div className="text-center space-y-3 pt-2">
          <ScoreGauge score={report.protectionScore} />
          <div className="space-y-1">
            <p className={`font-sans text-base font-semibold ${labelColor}`}>
              {report.scoreLabel}
            </p>
            <p className="font-sans text-xs text-white/40 max-w-xs mx-auto leading-relaxed">
              {scoreContext}
            </p>
          </div>
        </div>

        {/* Gap Score Breakdown */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-4">
          <p className="font-sans text-xs text-white/40 uppercase tracking-widest">
            Protection Snapshot
          </p>

          {/* First item — fully visible */}
          <div className="flex items-start gap-3">
            <span className="text-xl leading-none mt-0.5 shrink-0">{firstSnap.icon}</span>
            <p className="font-sans text-sm text-white/80 leading-snug">{firstSnap.text}</p>
          </div>

          {/* Remaining items — blurred with lock overlay */}
          <div className="relative rounded-xl overflow-hidden">
            <div className="space-y-3 blur-[3px] select-none pointer-events-none" aria-hidden="true">
              {hiddenSnaps.map((snap, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-xl leading-none mt-0.5 shrink-0">{snap.icon}</span>
                  <p className="font-sans text-sm text-white/80 leading-snug">{snap.text}</p>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-[#0b1a2e]/40 backdrop-blur-[1px]">
              <p className="font-sans text-xs text-gold/90 flex items-center gap-1.5">
                <span>🔒</span> Unlock to see all gaps
              </p>
            </div>
          </div>
        </div>

        {/* Biggest Gap — blurred */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <p className="font-sans text-xs text-white/40 uppercase tracking-widest">
            Your Most Critical Gap
          </p>
          <p
            className="font-sans text-sm text-white/80 leading-snug blur-[3px] select-none"
            aria-hidden="true"
          >
            {report.biggestGap}
          </p>
          <div className="absolute inset-0 flex items-center justify-center bg-[#0b1a2e]/50 backdrop-blur-[1px]">
            <p className="font-sans text-xs text-gold/90 flex items-center gap-1.5">
              <span>🔒</span> Enter your details to unlock
            </p>
          </div>
        </div>

        {/* Recommendation — blurred */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <p className="font-sans text-xs text-white/40 uppercase tracking-widest">
            Personalized Recommendation
          </p>
          <p
            className="font-sans text-sm text-white/80 leading-snug blur-[3px] select-none"
            aria-hidden="true"
          >
            {report.recommendation}
          </p>
          <div className="absolute inset-0 flex items-center justify-center bg-[#0b1a2e]/50 backdrop-blur-[1px]">
            <p className="font-sans text-xs text-gold/90 flex items-center gap-1.5">
              <span>🔒</span> Enter your details to unlock
            </p>
          </div>
        </div>

        {/* Unlock CTA or Inline Capture Form */}
        {!showCapture ? (
          <div className="space-y-3 pt-2">
            <button
              onClick={() => setShowCapture(true)}
              className="w-full px-8 py-4 text-base rounded-xl font-sans font-semibold tracking-wide bg-gold text-navy-dark hover:bg-gold-soft shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            >
              UNLOCK MY FULL REPORT →
            </button>
            <p className="text-center text-xs text-white/25">
              Free · No spam · A licensed advisor will reach out within 24 hours
            </p>
          </div>
        ) : (
          <form onSubmit={handleUnlock} noValidate className="space-y-4 pt-2">
            <div className="text-center space-y-1 pb-2">
              <p className="font-sans text-sm text-white/70 font-medium">
                Almost there — unlock your full report:
              </p>
              <p className="font-sans text-xs text-white/35">
                Your score, all gaps, recommendation &amp; estimated coverage range
              </p>
            </div>

            <div>
              <label htmlFor="firstName" className="block font-sans text-sm text-white/50 mb-1.5">
                First Name <span className="text-gold">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                required
                autoComplete="given-name"
                autoFocus
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
                Email{' '}
                <span className="text-white/30 font-normal">(optional — receive your report by email)</span>
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

            {formError && (
              <p role="alert" className="text-sm text-red-400 leading-relaxed">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !form.firstName || !form.mobile}
              className="w-full px-6 py-4 rounded-xl bg-gold text-navy-dark font-sans font-semibold text-base tracking-wide hover:bg-gold-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px]"
            >
              {submitting ? 'Unlocking your report…' : 'SEE MY FULL RESULTS →'}
            </button>

            <p className="text-center text-xs text-white/25 leading-relaxed">
              🔒 Your information is safe. A licensed Sun Life advisor will reach out within 24 hours
              — no spam, no pressure.
            </p>
          </form>
        )}
      </div>
    </main>
  )
}
