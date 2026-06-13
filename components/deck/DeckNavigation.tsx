'use client'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface DeckNavigationProps {
  current: number
  total: number
  onPrev: () => void
  onNext: () => void
  onExportPDF: () => void
  isLastSlide: boolean
}

export function DeckNavigation({
  current,
  total,
  onPrev,
  onNext,
  onExportPDF,
  isLastSlide,
}: DeckNavigationProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 px-8 pb-8 z-20">
      <div className="max-w-5xl mx-auto space-y-4">
        <ProgressBar current={current} total={total} />

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={onPrev}
              disabled={current === 1}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              aria-label="Previous slide"
              type="button"
            >
              ←
            </button>
            <button
              onClick={onNext}
              disabled={current === total}
              className="w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center text-gold hover:bg-gold/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              aria-label="Next slide"
              type="button"
            >
              →
            </button>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={onExportPDF}
              className="text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              type="button"
            >
              Export PDF
            </button>
            {isLastSlide ? (
              <Link
                href="/discovery"
                className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-lg font-sans font-medium tracking-wide bg-gold text-navy-dark hover:bg-gold-soft transition-all duration-200"
              >
                Start Discovery →
              </Link>
            ) : (
              <Link
                href="/discovery"
                className="text-xs text-gold/70 hover:text-gold transition-colors"
              >
                Skip to Discovery →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
