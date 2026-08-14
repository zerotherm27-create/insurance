'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  segment: string
  cta: string
}

export function SegmentCTAButton({ segment, cta }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function handleStart() {
    setLoading(true)
    try {
      sessionStorage.setItem('sma_funnel_answers', JSON.stringify({ segment }))
    } catch {
      // ignore storage errors
    }
    router.push('/funnel/step/1')
  }

  return (
    <button
      onClick={handleStart}
      disabled={loading}
      className="inline-flex items-center justify-center w-full px-8 py-4 text-base rounded-xl font-sans font-semibold tracking-wide bg-gold text-navy-dark hover:bg-gold-soft transition-[background-color,transform] duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:opacity-70 disabled:cursor-wait disabled:active:scale-100 min-h-[52px]"
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-navy-dark/30 border-t-navy-dark rounded-full animate-spin" />
          Starting…
        </span>
      ) : (
        cta
      )}
    </button>
  )
}
