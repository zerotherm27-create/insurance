'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { FunnelSegment } from '@/types/funnel'
import { DeckSlide } from '@/components/deck/DeckSlide'
import { DeckNavigation } from '@/components/deck/DeckNavigation'
import { DeckSegmentProvider } from '@/components/deck/DeckContext'
import { getDeck } from '@/lib/deck/registry'

interface DeckRunnerProps {
  segment: FunnelSegment
}

// Shared deck shell: slide state machine, keyboard nav, progress, export, and the
// ambient background. Holds NO deck content — it looks up each segment's authored
// slide array from the registry on the client, so component functions never cross
// the server/client boundary.
export function DeckRunner({ segment }: DeckRunnerProps) {
  const slides = getDeck(segment)?.slides ?? []
  const total = slides.length
  const [current, setCurrent] = useState(1)
  const [direction, setDirection] = useState(1)

  const goNext = useCallback(() => {
    setCurrent((c) => {
      if (c >= total) return c
      setDirection(1)
      return c + 1
    })
  }, [total])

  const goPrev = useCallback(() => {
    setCurrent((c) => {
      if (c <= 1) return c
      setDirection(-1)
      return c - 1
    })
  }, [])

  const handleExport = () => window.print()

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'SELECT') return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev])

  const Slide = slides[current - 1]

  return (
    <DeckSegmentProvider value={segment}>
      <main className="relative w-screen h-screen overflow-hidden bg-navy-gradient">
        {/* Background ambience */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-gold/4 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-gold/3 rounded-full blur-3xl" />
        </div>

        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Slide {current} of {total}
        </div>

        <Link
          href="/"
          className="absolute top-6 left-6 z-30 text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-2"
        >
          <span aria-hidden="true">← </span>Home
        </Link>

        <DeckSlide slideKey={current} direction={direction}>
          <Slide />
        </DeckSlide>

        <DeckNavigation
          current={current}
          total={total}
          onPrev={goPrev}
          onNext={goNext}
          onExportPDF={handleExport}
          isLastSlide={current === total}
        />
      </main>
    </DeckSegmentProvider>
  )
}
