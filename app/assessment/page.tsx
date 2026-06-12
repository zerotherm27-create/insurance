'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { FunnelSegment } from '@/types/funnel'

// Maps the deck's Slide 8 goal choices to funnel segments.
// "figuring" → null means route to /funnel so the user picks their segment.
const GOAL_TO_SEGMENT: Record<string, FunnelSegment | null> = {
  health: 'pro',
  starter: 'pro',
  income: 'family',
  growth: 'entrepreneur',
  figuring: null,
}

function Spinner() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-navy-gradient">
      <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </main>
  )
}

function AssessmentRouter() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const goal = params.get('goal') ?? 'figuring'
    const segment = GOAL_TO_SEGMENT[goal] ?? null

    if (!segment) {
      router.replace('/funnel')
      return
    }

    try {
      sessionStorage.setItem('sma_funnel_answers', JSON.stringify({ segment }))
      sessionStorage.setItem('sma_funnel_mode', 'deck')
    } catch {}

    router.replace('/funnel/step/1')
  }, [params, router])

  return <Spinner />
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <AssessmentRouter />
    </Suspense>
  )
}
