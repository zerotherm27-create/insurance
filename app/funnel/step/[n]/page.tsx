'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FUNNEL_QUESTIONS, TOTAL_STEPS } from '@/lib/funnel-questions'
import { FunnelProgress } from '@/components/funnel/FunnelProgress'
import { QuestionCard } from '@/components/funnel/QuestionCard'
import type { FunnelAnswers } from '@/types/funnel'

export default function FunnelStepPage() {
  const params = useParams()
  const router = useRouter()
  const stepNum = Number(params.n)
  const question = FUNNEL_QUESTIONS.find((q) => q.step === stepNum)

  const [answers, setAnswers] = useState<Partial<FunnelAnswers>>({})

  useEffect(() => {
    if (!question || isNaN(stepNum) || stepNum < 1 || stepNum > TOTAL_STEPS) {
      router.replace('/funnel/step/1')
      return
    }
    try {
      const stored = sessionStorage.getItem('sma_funnel_answers')
      if (stored) setAnswers(JSON.parse(stored))
    } catch {
      // ignore
    }
  }, [stepNum]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleAnswer(value: string) {
    if (!question) return
    const updated = { ...answers, [question.field]: value }
    try {
      sessionStorage.setItem('sma_funnel_answers', JSON.stringify(updated))
    } catch {
      // ignore storage errors
    }
    setAnswers(updated)
    if (stepNum < TOTAL_STEPS) {
      router.push(`/funnel/step/${stepNum + 1}`)
    } else {
      router.push('/funnel/capture')
    }
  }

  if (!question) return null

  const selectedValue = answers[question.field] as string | undefined

  return (
    <main className="relative min-h-screen flex flex-col bg-navy-gradient">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between">
        <span className="font-sans text-xs text-white/30 tracking-widest uppercase">
          Financial Protection Check
        </span>
        <button
          onClick={() => router.push('/funnel')}
          className="font-sans text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          ✕ Exit
        </button>
      </header>

      {/* Progress */}
      <div className="px-0 pt-4">
        <FunnelProgress currentStep={stepNum} totalSteps={TOTAL_STEPS} />
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
