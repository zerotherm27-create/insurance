'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getQuestions } from '@/lib/funnel-questions'
import { FunnelProgress } from '@/components/funnel/FunnelProgress'
import { QuestionCard } from '@/components/funnel/QuestionCard'
import { XIcon } from '@/components/ui/icons'
import type { FunnelAnswers, FunnelSegment } from '@/types/funnel'

export default function FunnelStepPage() {
  const params = useParams()
  const router = useRouter()
  const stepNum = Number(params.n)

  const [answers, setAnswers] = useState<FunnelAnswers>({})
  const [segment, setSegment] = useState<FunnelSegment | undefined>(undefined)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let parsed: FunnelAnswers = {}
    try {
      const stored = sessionStorage.getItem('sma_funnel_answers')
      if (stored) parsed = JSON.parse(stored)
    } catch {
      // ignore
    }
    setAnswers(parsed)
    setSegment(parsed.segment)

    const total = getQuestions(parsed.segment).length
    if (isNaN(stepNum) || stepNum < 1 || stepNum > total) {
      router.replace('/funnel/step/1')
      return
    }
    setReady(true)
  }, [stepNum]) // eslint-disable-line react-hooks/exhaustive-deps

  const questions = getQuestions(segment)
  const totalSteps = questions.length
  const question = questions[stepNum - 1]

  function handleAnswer(value: string) {
    if (!question) return
    const updated: FunnelAnswers = { ...answers, [question.field]: value }
    try {
      sessionStorage.setItem('sma_funnel_answers', JSON.stringify(updated))
    } catch {
      // ignore storage errors
    }
    setAnswers(updated)
    if (stepNum < totalSteps) {
      router.push(`/funnel/step/${stepNum + 1}`)
    } else {
      router.push('/funnel/preview')
    }
  }

  if (!ready || !question) return null

  const selectedValue = answers[question.field]

  return (
    <main className="relative min-h-screen flex flex-col bg-navy-gradient">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between">
        <span className="font-sans text-xs text-white/30 tracking-widest uppercase">
          Financial Protection Check
        </span>
        <button
          onClick={() => router.push('/funnel')}
          className="font-sans text-xs text-white/30 hover:text-white/60 transition-colors inline-flex items-center gap-1"
        >
          <XIcon size={14} /> Exit
        </button>
      </header>

      {/* Progress */}
      <div className="px-0 pt-4">
        <FunnelProgress currentStep={stepNum} totalSteps={totalSteps} />
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <QuestionCard
          question={question.question}
          options={question.options}
          onSelect={handleAnswer}
          selected={selectedValue}
        />
      </div>
    </main>
  )
}
