'use client'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

interface CountUpProps {
  value: number
  /** Format the displayed number, e.g. peso(). */
  format: (n: number) => string
  durationMs?: number
  className?: string
}

// Animates a number from its previous value to the new one whenever `value`
// changes. Respects prefers-reduced-motion (snaps instantly). Used by the deck
// calculators (income runway, income drain, estate-tax clock).
export function CountUp({ value, format, durationMs = 650, className }: CountUpProps) {
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (reduce) {
      setDisplay(value)
      fromRef.current = value
      return
    }
    const from = fromRef.current
    const to = value
    if (from === to) return
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      setDisplay(from + (to - from) * eased)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      fromRef.current = value
    }
  }, [value, durationMs, reduce])

  return <span className={className}>{format(display)}</span>
}
