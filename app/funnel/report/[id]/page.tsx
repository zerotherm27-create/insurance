'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ReportCard } from '@/components/funnel/ReportCard'
import { AdvisorBookingCTA } from '@/components/funnel/AdvisorBookingCTA'
import type { FunnelAIReport } from '@/types/funnel'

interface StoredReport {
  id: string
  firstName: string
  report: FunnelAIReport
  createdAt?: string
  returning?: boolean
}

const HOLD_MS = 48 * 60 * 60 * 1000

// 48-hour consultation hold, anchored to when the report was generated.
// Falls back to first-view time (localStorage) for payloads without createdAt.
function deriveHoldExpiry(data: StoredReport, id: string): number {
  let start = data.createdAt ? Date.parse(data.createdAt) : NaN
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

function HoldBanner({ expiresAt }: { expiresAt: number }) {
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

function ShareButton({ score, firstName }: { score: number; firstName: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const message = `${firstName} just found out their Financial Protection Score is ${score}/100. Take the free 2-minute check and see where you stand!\nhttps://safetymargin.app/funnel`
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text: message })
        return
      } catch {
        // user cancelled or not supported — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // clipboard blocked
    }
  }

  return (
    <button
      onClick={handleShare}
      className="w-full max-w-lg mx-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-white/50 font-sans text-sm hover:border-white/20 hover:text-white/70 transition-[border-color,color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
    >
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      {copied ? 'Link copied!' : 'Share my score with a friend'}
    </button>
  )
}

export default function FunnelReportPage() {
  const params = useParams()
  const id = params.id as string
  const [data, setData] = useState<StoredReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null)

  const calendlyUrl = process.env.NEXT_PUBLIC_ADVISOR_CALENDLY_URL ?? '#'
  const fbUrl = process.env.NEXT_PUBLIC_ADVISOR_FB_URL ?? '#'

  useEffect(() => {
    let found = false

    // Try session storage first (fastest path)
    try {
      const stored = sessionStorage.getItem('sma_funnel_report')
      if (stored) {
        const parsed = JSON.parse(stored) as StoredReport
        if (parsed.id === id || id === 'local') {
          setData(parsed)
          setHoldExpiresAt(deriveHoldExpiry(parsed, id))
          found = true
        }
      }
    } catch {
      // ignore
    }

    if (found || id === 'local') {
      setLoading(false)
      return
    }

    // Fall back to API — covers shared links and new-tab opens
    fetch(`/api/funnel/report/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (json?.id) {
          setData(json)
          setHoldExpiresAt(deriveHoldExpiry(json, id))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-navy-gradient">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </main>
    )
  }

  if (!data) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-navy-gradient px-6 text-center">
        <p className="font-sans text-white/50 mb-4">Report not found.</p>
        <a href="/" className="text-gold underline font-sans text-sm">
          Take the check again
        </a>
      </main>
    )
  }

  const holdActive = holdExpiresAt !== null && holdExpiresAt > Date.now()

  return (
    <main className="relative min-h-screen bg-navy-gradient">
      {holdExpiresAt !== null && <HoldBanner expiresAt={holdExpiresAt} />}
      {data.returning && (
        <div className="bg-navy-card/60 border-b border-white/10 px-6 py-2.5 text-center">
          <p className="font-sans text-xs text-white/60">
            Welcome back, {data.firstName}. We updated your report using your latest answers.
            Remember: your report is only as accurate as the answers you share.
          </p>
        </div>
      )}
      <header className="px-6 py-6 text-center">
        <span className="font-sans text-xs text-white/30 tracking-widest uppercase">
          Financial Protection Check
        </span>
      </header>

      <div className="space-y-4 py-4">
        <ReportCard firstName={data.firstName} report={data.report} />

        <div className="max-w-lg mx-auto w-full px-6">
          <p className="text-center font-sans text-xs text-white/40 leading-relaxed">
            We also emailed a copy of this report to you. If it is not in your inbox,
            check Spam or Promotions and move it to your inbox so you never miss an update from Jojo.
          </p>
        </div>

        {/* Social share */}
        <div className="px-6 flex justify-center">
          <ShareButton score={data.report.protectionScore} firstName={data.firstName} />
        </div>

        <div className="pt-4">
          <AdvisorBookingCTA calendlyUrl={calendlyUrl} fbUrl={fbUrl} holdActive={holdActive} />
        </div>
      </div>
    </main>
  )
}
