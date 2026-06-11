'use client'

import { useEffect, useState } from 'react'

const HOLD_MS = 48 * 60 * 60 * 1000

/**
 * 48-hour consultation hold, anchored to when the report was generated.
 * Falls back to first-view time (localStorage) for payloads without createdAt.
 */
export function deriveHoldExpiry(createdAt: string | undefined, id: string): number {
  let start = createdAt ? Date.parse(createdAt) : NaN
  if (Number.isNaN(start)) {
    try {
      const key = `sma_report_hold_${id}`
      const stored = localStorage.getItem(key)
      if (stored && !Number.isNaN(Number(stored))) {
        start = Number(stored)
      } else {
        start = Date.now()
        localStorage.setItem(key, String(start))
      }
    } catch {
      start = Date.now()
    }
  }
  return start + HOLD_MS
}

export function HoldBanner({ expiresAt }: { expiresAt: number }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [])

  const remaining = expiresAt - now
  if (remaining <= 0) return null

  const hours = Math.floor(remaining / 3_600_000)
  const minutes = Math.floor((remaining % 3_600_000) / 60_000)

  return (
    <div className="bg-gold/10 border-b border-gold/20 px-6 py-2.5 text-center">
      <p className="font-sans text-xs text-gold/90">
        A free consultation slot is held for you: {hours}h {minutes}m left
      </p>
    </div>
  )
}
