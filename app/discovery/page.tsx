'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { QuestionCard } from '@/components/funnel/QuestionCard'
import { FunnelProgress } from '@/components/funnel/FunnelProgress'
import { ScoreGauge } from '@/components/funnel/ScoreGauge'
import { AdvisorBookingCTA } from '@/components/funnel/AdvisorBookingCTA'
import { getTierColor } from '@/lib/scoring'
import {
  DISCOVERY_QUESTIONS,
  GOAL_LABEL,
  computeDiscovery,
  isDiscoveryGoal,
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
} from '@/components/ui/icons'

const GOAL_ORDER: DiscoveryGoal[] = ['health', 'starter', 'income', 'growth', 'figuring']

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

  // If the deck passed a goal, skip the goal picker.
  useEffect(() => {
    const g = params.get('goal')
    if (isDiscoveryGoal(g)) {
      setGoal(g)
      setPhase('quiz')
    }
  }, [params])

  function pickGoal(g: DiscoveryGoal) {
    setGoal(g)
    setPhase('quiz')
  }

  function answer(value: string) {
    const q = DISCOVERY_QUESTIONS[step]
    setAnswers((a) => ({ ...a, [q.field]: value }))
    if (step < DISCOVERY_QUESTIONS.length - 1) {
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
  }

  // ── Goal picker (standalone entry, when no goal passed from deck) ───────────
  if (phase === 'goal') {
    return (
      <main className="relative min-h-screen flex flex-col bg-navy-gradient">
        <header className="px-6 py-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/deck')}
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
              Which financial goal sounds most like you?
            </h2>
            <div className="space-y-3">
              {GOAL_ORDER.map((g) => (
                <button
                  key={g}
                  onClick={() => pickGoal(g)}
                  className="w-full text-left px-6 py-4 rounded-xl border border-white/10 bg-navy-card text-white/80 font-sans text-base min-h-[52px] hover:border-gold/40 hover:bg-navy-light transition-[background-color,border-color,color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                >
                  {GOAL_LABEL[g]}
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
    const q = DISCOVERY_QUESTIONS[step]
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
          <span className="font-sans text-xs text-white/30 tracking-widest uppercase">{goal && GOAL_LABEL[goal]}</span>
          <button
            onClick={() => router.push('/deck')}
            className="font-sans text-xs text-white/30 hover:text-white/60 transition-[color] duration-150 inline-flex items-center gap-1"
          >
            <XIcon size={14} /> Exit
          </button>
        </header>

        <div className="pt-4">
          <FunnelProgress currentStep={step + 1} totalSteps={DISCOVERY_QUESTIONS.length} />
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
  const result = computeDiscovery({ goal: goal!, ...answers })
  const scoreColor = getTierColor(result.score)
  const sorted = [
    ...result.gaps.filter((g) => g.status === 'gap'),
    ...result.gaps.filter((g) => g.status === 'partial'),
    ...result.gaps.filter((g) => g.status === 'have'),
  ]
  const calendlyUrl = process.env.NEXT_PUBLIC_ADVISOR_CALENDLY_URL ?? '#'
  const fbUrl = process.env.NEXT_PUBLIC_ADVISOR_FB_URL ?? '#'

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
            Goal: {result.goalLabel}
          </span>
        </div>

        {/* Score */}
        <div className="text-center space-y-3">
          <h1 className="font-serif text-2xl text-white">Your Protection Profile</h1>
          <ScoreGauge score={result.score} />
          <div className="space-y-1">
            <p className="font-sans text-base font-semibold" style={{ color: scoreColor }}>
              {result.scoreLabel}
            </p>
            <p className="font-sans text-xs text-white/40 max-w-xs mx-auto leading-relaxed">
              {SCORE_CONTEXT[result.scoreLabel] ?? ''}
            </p>
          </div>
        </div>

        {result.attentionCount > 0 && (
          <p className="text-center font-sans text-sm text-white/50">
            {result.attentionCount} of {result.gaps.length}{' '}
            {result.attentionCount === 1 ? 'area needs' : 'areas need'} attention
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
            <h2 className="font-serif text-xl text-white leading-snug">{result.plan.coverageType}</h2>
            <p className="font-sans text-sm text-white/55 leading-relaxed">{result.plan.fitReason}</p>
          </div>
          <div className="rounded-xl bg-navy-dark/40 border border-white/5 px-4 py-3">
            <p className="font-sans text-sm text-white/70 leading-relaxed">{result.plan.whatItDoes}</p>
          </div>
          <p className="font-sans text-xs text-white/30 leading-relaxed">
            The exact plan and amounts are confirmed in a short consultation, based on your full situation.
          </p>
        </div>
      </div>

      {/* Booking — brings its own width + padding */}
      <div className="relative z-10 pt-6">
        <AdvisorBookingCTA calendlyUrl={calendlyUrl} fbUrl={fbUrl} />
      </div>

      <div className="relative z-10 max-w-lg mx-auto w-full px-6 pb-10 space-y-5">
        <div className="text-center">
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

export default function DiscoveryPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <Discovery />
    </Suspense>
  )
}
