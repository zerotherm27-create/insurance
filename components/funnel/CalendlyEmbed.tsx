'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Inline Calendly booking widget. Falls back to nothing (callers keep the
 * AdvisorBookingCTA buttons below) when the URL is missing or the script
 * fails to load, so booking is never blocked by the embed.
 */
export function CalendlyEmbed({ calendlyUrl }: { calendlyUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  const valid = calendlyUrl.startsWith('https://calendly.com/')

  useEffect(() => {
    if (!valid) return
    const existing = document.querySelector('script[src*="assets.calendly.com"]')
    if (existing) return
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    script.onerror = () => setFailed(true)
    document.body.appendChild(script)
  }, [valid])

  if (!valid || failed) return null

  return (
    <div className="max-w-lg mx-auto w-full px-6 space-y-3">
      <div className="text-center space-y-1">
        <h3 className="font-serif text-xl text-white leading-snug">
          Turn these coverages into an actual plan
        </h3>
        <p className="font-sans text-xs text-white/45 leading-relaxed">
          Pick a time below for your free 30-minute session. We already have your answers to work from.
        </p>
      </div>
      <div
        ref={containerRef}
        className="calendly-inline-widget rounded-2xl overflow-hidden border border-white/10"
        data-url={`${calendlyUrl}?hide_gdpr_banner=1&background_color=0f1f3d&text_color=ffffff&primary_color=f6b21a`}
        style={{ minWidth: '280px', height: '640px' }}
      />
    </div>
  )
}
