'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Legacy entry point. The deck discovery now lives at /discovery; preserve any
// inbound /assessment?goal=... links by forwarding them there.
function Redirect() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const goal = params.get('goal')
    router.replace(goal ? `/discovery?goal=${encodeURIComponent(goal)}` : '/discovery')
  }, [params, router])

  return null
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={null}>
      <Redirect />
    </Suspense>
  )
}
