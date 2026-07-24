'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { QuestionCard } from '@/components/funnel/QuestionCard'
import { FunnelProgress } from '@/components/funnel/FunnelProgress'
import { ScoreGauge } from '@/components/funnel/ScoreGauge'
import { getTierColor } from '@/lib/scoring'
import {
  DISCOVERY_TRACKS,
  trackForSegment,
  type DiscoveryAnswers,
  type DiscoveryGoal,
  type DiscoveryGapItem,
} from '@/lib/discovery'
import {
  CheckCircleIcon,
  AlertTriangleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  XIcon,
  ArrowRightIcon,
} from '@/components/ui/icons'

const STATUS_CONFIG = {
  gap: { card: 'border-red-400/30 bg-red-400/5', badge: 'text-red-400 bg-red-400/10 border border-red-400/25', label: 'Gap Detected' },
  partial: { card: 'border-gold/25 bg-gold/5', badge: 'text-gold bg-gold/10 border border-gold/25', label: 'Worth Reviewing' },
  have: { card: 'border-emerald-500/15 bg-emerald-500/5', badge: 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20', label: 'Covered' },
}

const SCORE_CONTEXT: Record<string, string> = {
  'Critical Gaps': 'Significant gaps that need to be addressed.',
  'Needs Attention': 'Important areas of your protection need attention.',
  'Partially Protected': 'Some coverage in place, but gaps remain.',
  'Well Protected': 'Mostly solid. A few areas worth confirming.',
  'Strongly Protected': 'Your protection foundation is strong.',
}

function StatusIcon({ status }: { status: DiscoveryGapItem['status'] }) {
  if (status === 'gap') return <XCircleIcon size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
  if (status === 'partial') return <AlertTriangleIcon size={16} className="text-gold flex-shrink-0 mt-0.5" />
  return <CheckCircleIcon size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
}

function Spinner() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-navy-gradient">
      <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </main>
  )
}

type Phase = 'goal' | 'quiz' | 'result'

function Discovery() {
  const router = useRouter()
  const params = useSearchParams()

  const [phase, setPhase] = useState<Phase>('goal')
  const [goal, setGoal] = useState<DiscoveryGoal | null>(null)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<DiscoveryAnswers>>({})

  // Capture form state
  const [captureForm, setCaptureForm] = useState({ firstName: '', mobile: '', email: '' })
  const [captureState, setCaptureState] = useState<'idle' | 'submitting' | 'saved' | 'returning'>('idle')

  // Which segment deck the client came from, so the back/exit buttons return
  // there instead of always to /deck/pro. The segment also selects the
  // discovery track (HNW gets an estate-based quiz, not the income-based one).
  const from = params.get('from')
  const deckHref = `/deck/${from || 'pro'}`
  const track = trackForSegment(from)
  const config = DISCOVERY_TRACKS[track]

  // If the deck passed a goal, skip the goal picker.
  useEffect(() => {
    const g = params.get('goal')
    if (g && config.isGoal(g)) {
      setGoal(g as DiscoveryGoal)
      setPhase('quiz')
    }
  }, [params, config])

  function pickGoal(g: DiscoveryGoal) {
    setGoal(g)
    setPhase('quiz')
  }

  function answer(value: string) {
    const q = config.questions[step]
    setAnswers((a) => ({ ...a, [q.field]: value }))
    if (step < config.questions.length - 1) {
      setStep((s) => s + 1)
    } else {
      setPhase('result')
    }
  }

  function back() {
    if (step > 0) setStep((s) => s - 1)
    else setPhase('goal')
  }

  function restart() {
    setAnswers({})
    setStep(0)
    setGoal(null)
    setPhase('goal')
    setCaptureForm({ firstName: '', mobile: '', email: '' })
    setCaptureState('idle')
  }

  async function submitCapture(e: React.FormEvent) {
    e.preventDefault()
    if (!captureForm.firstName || !captureForm.mobile) return
    setCaptureState('submitting')
    try {
      const res = await fetch('/api/discovery/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: captureForm.firstName,
          mobile: captureForm.mobile,
          email: captureForm.email || undefined,
          answers: { goal: goal!, ...answers },
          result,
        }),
      })
      const json = await res.json()
      setCaptureState(json.returning ? 'returning' : 'saved')
    } catch {
      setCaptureState('idle')
    }
  }

  // Computed eagerly so submitCapture can close over it; safe because the
  // track's compute handles missing answers with sensible defaults.
  const result = goal ? config.compute({ goal, ...answers } as DiscoveryAnswers) : null

  // ── Goal picker (standalone entry, when no goal passed from deck) ───────────
  if (phase === 'goal') {
    return (
      <main className="relative min-h-screen flex flex-col bg-navy-gradient">
        <header className="px-6 py-6 flex items-center justify-between">
          <button
            onClick={() => router.push(deckHref)}
            className="font-sans text-xs text-white/30 hover:text-white/60 transition-[color] duration-150 inline-flex items-center gap-1"
          >
            <span aria-hidden="true">←</span> Deck
          </button>
          <span className="font-sans text-xs text-white/30 tracking-widest uppercase">Financial Discovery</span>
          <span className="w-10" />
        </header>
        <div className="flex-1 flex flex-col items-center justify-center py-8">
          <div className="max-w-lg mx-auto w-full px-6 space-y-6">
            <h2 className="font-serif text-2xl md:text-3xl text-white text-center leading-snug">
              {config.goalHeading}
            </h2>
            <div className="space-y-3">
              {config.goalOrder.map((g) => (
                <button
                  key={g}
                  onClick={() => pickGoal(g)}
                  className="w-full text-left px-6 py-4 rounded-xl border border-white/10 bg-navy-card text-white/80 font-sans text-base min-h-[52px] hover:border-gold/40 hover:bg-navy-light transition-[background-color,border-color,color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                >
                  {config.goalLabel[g]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ── Short quiz ─────────────────────────────────────────────────────────────
  if (phase === 'quiz') {
    const q = config.questions[step]
    return (
      <main className="relative min-h-screen flex flex-col bg-navy-gradient">
        <header className="px-6 py-6 flex items-center justify-between">
          <button
            onClick={back}
            className="font-sans text-xs text-white/30 hover:text-white/60 transition-[color] duration-150 inline-flex items-center gap-1"
            aria-label="Go back"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <span className="font-sans text-xs text-white/30 tracking-widest uppercase">{goal && config.goalLabel[goal]}</span>
          <button
            onClick={() => router.push(deckHref)}
            className="font-sans text-xs text-white/30 hover:text-white/60 transition-[color] duration-150 inline-flex items-center gap-1"
          >
            <XIcon size={14} /> Exit
          </button>
        </header>

        <div className="pt-4">
          <FunnelProgress currentStep={step + 1} totalSteps={config.questions.length} />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full"
            >
              <QuestionCard
                question={q.question}
                options={q.options}
                onSelect={answer}
                selected={answers[q.field]}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    )
  }

  // ── Result: gap board + recommended plan ───────────────────────────────────
  const r = result!
  const scoreColor = getTierColor(r.score)
  const sorted = [
    ...r.gaps.filter((g) => g.status === 'gap'),
    ...r.gaps.filter((g) => g.status === 'partial'),
    ...r.gaps.filter((g) => g.status === 'have'),
  ]
  const sunSmartUrl = 'https://sunsmartpos.sunlife.com.ph/?fbclid=IwY2xjawObfVFleHRuA2FlbQIxMABicmlkETFMMUdWU3huV29XSm9IS1Izc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHl5LG1qntuEdinWMqNL6I-XmGa8bG-TDqWdfyH8xkXGTx3DxCF-1d9XOFndi_aem_xUf_itUe3Cxte1AtvPKdQQ'

  return (
    <main className="relative min-h-screen bg-navy-gradient overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[280px] rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ background: scoreColor }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-lg mx-auto w-full px-6 pt-10 space-y-6">
        {/* Goal tag */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 rounded-full border border-gold/25 bg-gold/5 text-gold/90 font-sans text-xs">
            Goal: {r.goalLabel}
          </span>
        </div>

        {/* Score */}
        <div className="text-center space-y-3">
          <h1 className="font-serif text-2xl text-white">Your Protection Profile</h1>
          <ScoreGauge score={r.score} />
          <div className="space-y-1">
            <p className="font-sans text-base font-semibold" style={{ color: scoreColor }}>
              {r.scoreLabel}
            </p>
            <p className="font-sans text-xs text-white/40 max-w-xs mx-auto leading-relaxed">
              {SCORE_CONTEXT[r.scoreLabel] ?? ''}
            </p>
          </div>
        </div>

        {r.attentionCount > 0 && (
          <p className="text-center font-sans text-sm text-white/50">
            {r.attentionCount} of {r.gaps.length}{' '}
            {r.attentionCount === 1 ? 'area needs' : 'areas need'} attention
          </p>
        )}

        {/* Gap board */}
        <div className="space-y-2.5">
          {sorted.map((g) => {
            const config = STATUS_CONFIG[g.status]
            const showAmounts = g.status !== 'have'
            return (
              <div key={g.id} className={`rounded-xl border px-4 py-4 ${config.card} ${showAmounts ? 'space-y-2.5' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <StatusIcon status={g.status} />
                    <p className="font-sans text-sm font-medium text-white/90 leading-snug">{g.name}</p>
                  </div>
                  <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium whitespace-nowrap ${config.badge}`}>
                    {config.label}
                  </span>
                </div>
                {showAmounts && (
                  <div className="pl-7 space-y-1">
                    <p className="font-sans text-xs text-white/60 leading-relaxed">
                      <span className="text-gold/80">Ideal:</span> {g.idealAmount}
                    </p>
                    {g.starterAmount && (
                      <p className="font-sans text-xs text-white/40 leading-relaxed">
                        <span className="text-white/40">Starter:</span> {g.starterAmount}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Recommended plan, fitted to the goal */}
        <div className="rounded-2xl border border-gold/25 bg-card-gradient p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="text-gold">
              <ShieldCheckIcon size={20} />
            </span>
            <p className="font-sans text-xs text-gold/70 uppercase tracking-widest">Recommended for your goal</p>
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-xl text-white leading-snug">{r.plan.coverageType}</h2>
            <p className="font-sans text-sm text-white/55 leading-relaxed">{r.plan.fitReason}</p>
          </div>
          <div className="rounded-xl bg-navy-dark/40 border border-white/5 px-4 py-3">
            <p className="font-sans text-sm text-white/70 leading-relaxed">{r.plan.whatItDoes}</p>
          </div>
          <p className="font-sans text-xs text-white/30 leading-relaxed">
            The exact plan and amounts are confirmed in a short consultation, based on your full situation.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 max-w-lg mx-auto w-full px-6 pt-2 pb-2">
        <div className="rounded-2xl border border-gold/20 bg-navy-card/60 p-6 text-center space-y-4">
          <p className="font-serif text-lg text-white leading-snug">
            Ready to see the real numbers<br />
            <span className="text-gold">built for your situation?</span>
          </p>
          <p className="font-sans text-xs text-white/40 leading-relaxed">
            We will run the actual illustration live, based on your profile.
          </p>
          <a
            href={sunSmartUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl font-sans font-semibold text-sm tracking-wide bg-gold text-navy-dark hover:bg-gold-soft transition-[background-color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
          >
            Let&apos;s See the Real Numbers
            <ArrowRightIcon size={15} />
          </a>
        </div>
      </div>

      {/* Contact capture */}
      <div className="relative z-10 max-w-lg mx-auto w-full px-6 pt-4 pb-2">
        <div className="rounded-2xl border border-white/8 bg-navy-card/40 p-6 space-y-4">
          {captureState === 'saved' || captureState === 'returning' ? (
            <div className="text-center space-y-2 py-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/25 mx-auto">
                <CheckCircleIcon size={18} className="text-emerald-400" />
              </div>
              <p className="font-sans text-sm font-medium text-white/80">
                {captureState === 'returning' ? 'Already in your contacts.' : 'Profile saved.'}
              </p>
              <p className="font-sans text-xs text-white/35">
                {captureForm.firstName} will appear in your CRM as a new lead.
              </p>
            </div>
          ) : (
            <>
              <p className="font-sans text-xs text-white/40 font-medium">Save this profile to your CRM</p>
              <form onSubmit={submitCapture} className="space-y-3">
                <input
                  type="text"
                  placeholder="Full name"
                  required
                  value={captureForm.firstName}
                  onChange={(e) => setCaptureForm((f) => ({ ...f, firstName: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-navy-dark/60 px-4 py-2.5 font-sans text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/30 transition-[border-color,box-shadow]"
                />
                <input
                  type="tel"
                  placeholder="Mobile number"
                  required
                  value={captureForm.mobile}
                  onChange={(e) => setCaptureForm((f) => ({ ...f, mobile: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-navy-dark/60 px-4 py-2.5 font-sans text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/30 transition-[border-color,box-shadow]"
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={captureForm.email}
                  onChange={(e) => setCaptureForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-navy-dark/60 px-4 py-2.5 font-sans text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/30 transition-[border-color,box-shadow]"
                />
                <button
                  type="submit"
                  disabled={captureState === 'submitting'}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 font-sans text-sm text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-[background-color,color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                >
                  {captureState === 'submitting' ? 'Saving...' : 'Save to CRM'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto w-full px-6 pb-10 space-y-5">
        <div className="text-center pt-2">
          <button
            onClick={restart}
            className="font-sans text-xs text-white/30 hover:text-white/60 transition-[color] duration-150 underline underline-offset-2"
          >
            Start over
          </button>
        </div>

        <p className="text-center text-xs text-white/15 leading-relaxed">
          Coverage amounts are estimates based on the answers shared and standard planning guidelines.
          This is for educational purposes only and must be validated through an official proposal and
          consultation with a licensed advisor.
        </p>
      </div>
    </main>
  )
}

export function DiscoveryClient() {
  return (
    <Suspense fallback={<Spinner />}>
      <Discovery />
    </Suspense>
  )
}
