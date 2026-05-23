'use client'
import { useEffect, useState } from 'react'

interface Props {
  score: number
  tier: string
  tierColor: string
}

export function ProtectionScore({ score, tier, tierColor }: Props) {
  const [displayed, setDisplayed] = useState(0)
  const radius = 70
  const circ = 2 * Math.PI * radius
  const offset = circ - (displayed / 100) * circ

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayed(score)
    }, 300)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160" aria-hidden="true">
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="8"
          />
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke={tierColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-4xl text-white">{score}</span>
          <span className="text-xs text-white/40">/ 100</span>
        </div>
      </div>
      <div
        className="px-4 py-1.5 rounded-full text-xs font-medium border"
        style={{ color: tierColor, borderColor: `${tierColor}40`, backgroundColor: `${tierColor}10` }}
      >
        {tier}
      </div>
    </div>
  )
}
