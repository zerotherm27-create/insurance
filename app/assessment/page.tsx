'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ClientDetailsStep } from '@/components/assessment/ClientDetailsStep'
import { GoalsPrioritiesStep } from '@/components/assessment/GoalsPrioritiesStep'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import type { AssessmentData, ClientDetails, GoalsAndPriorities, Goal } from '@/types'

function AssessmentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [clientDetails, setClientDetails] = useState<ClientDetails | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const goalFromDeck = searchParams.get('goal')

  const goalMapping: Record<string, Goal> = {
    health: 'health_protection',
    starter: 'life_protection',
    income: 'predictable_income',
    growth: 'investment_growth',
  }

  const preselectedGoal: Goal | undefined = goalFromDeck ? goalMapping[goalFromDeck] : undefined

  const handleClientDetails = (data: ClientDetails) => {
    setClientDetails(data)
    setStep(2)
  }

  const handleGoals = async (goalsData: GoalsAndPriorities) => {
    if (!clientDetails) return
    setIsSubmitting(true)

    const assessmentData: AssessmentData = {
      clientDetails,
      goalsAndPriorities: goalsData,
    }

    try {
      sessionStorage.setItem('sma_client_name', clientDetails.fullName)

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData),
      })

      if (!res.ok) throw new Error('Analysis failed')

      const data = await res.json()
      sessionStorage.setItem('sma_analysis', JSON.stringify(data))
      router.push(`/results?id=${data.analysisId}`)
    } catch (err) {
      console.error(err)
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-navy-gradient">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-10 space-y-3">
          <Badge variant="gold">Financial Discovery</Badge>
          <h1 className="font-serif text-3xl md:text-4xl text-white">
            {step === 1 ? 'Tell Us About Yourself' : 'Your Goals & Priorities'}
          </h1>
          <ProgressBar current={step} total={2} className="pt-2" />
        </div>

        {isSubmitting ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
            <p className="text-white/60 font-sans text-sm">
              Analyzing your financial profile...
            </p>
          </div>
        ) : step === 1 ? (
          <ClientDetailsStep onSubmit={handleClientDetails} />
        ) : (
          <GoalsPrioritiesStep
            initial={preselectedGoal ? { goals: [preselectedGoal] } : undefined}
            onSubmit={handleGoals}
            onBack={() => setStep(1)}
          />
        )}

        {!isSubmitting && (
          <p className="mt-8 text-xs text-white/20 text-center leading-relaxed">
            This tool is for educational guidance only. Product suitability, eligibility, coverage, and premiums
            must be validated through an official Sun Life proposal and licensed advisor consultation.
          </p>
        )}
      </div>
    </main>
  )
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-navy-gradient flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
      </div>
    }>
      <AssessmentContent />
    </Suspense>
  )
}
