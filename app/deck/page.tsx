'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { DeckSlide } from '@/components/deck/DeckSlide'
import { DeckNavigation } from '@/components/deck/DeckNavigation'
import { Slide1Cover } from '@/components/deck/slides/Slide1Cover'
import { Slide2 } from '@/components/deck/slides/Slide2'
import { Slide3 } from '@/components/deck/slides/Slide3'
import { Slide4 } from '@/components/deck/slides/Slide4'
import { Slide5 } from '@/components/deck/slides/Slide5'
import { Slide6 } from '@/components/deck/slides/Slide6'
import { Slide7 } from '@/components/deck/slides/Slide7'
import { Slide8 } from '@/components/deck/slides/Slide8'

const TOTAL = 8

export default function DeckPage() {
  const [current, setCurrent] = useState(1)
  const [direction, setDirection] = useState(1)

  const slides = [
    <Slide1Cover key={1} />,
    <Slide2 key={2} />,
    <Slide3 key={3} />,
    <Slide4 key={4} />,
    <Slide5 key={5} />,
    <Slide6 key={6} />,
    <Slide7 key={7} />,
    <Slide8 key={8} />,
  ]

  const goNext = useCallback(() => {
    if (current < TOTAL) {
      setDirection(1)
      setCurrent((c) => c + 1)
    }
  }, [current])

  const goPrev = useCallback(() => {
    if (current > 1) {
      setDirection(-1)
      setCurrent((c) => c - 1)
    }
  }, [current])

  const handleExport = () => {
    window.print()
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev])

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-navy-gradient">
      {/* Background ambience */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-gold/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-gold/3 rounded-full blur-3xl" />
      </div>

      <Link
        href="/"
        className="absolute top-6 left-6 z-30 text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-2"
      >
        ← Home
      </Link>

      <DeckSlide slideKey={current} direction={direction}>
        {slides[current - 1]}
      </DeckSlide>

      <DeckNavigation
        current={current}
        total={TOTAL}
        onPrev={goPrev}
        onNext={goNext}
        onExportPDF={handleExport}
        isLastSlide={current === TOTAL}
      />
    </main>
  )
}
