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
      .then((json) => { if (json?.id) setData(json) })
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
        <a href="/funnel" className="text-gold underline font-sans text-sm">
          Take the check again
        </a>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen bg-navy-gradient">
      <header className="px-6 py-6 text-center">
        <span className="font-sans text-xs text-white/30 tracking-widest uppercase">
          Financial Protection Check
        </span>
      </header>

      <div className="space-y-4 py-4">
        <ReportCard firstName={data.firstName} report={data.report} />

        {/* Social share */}
        <div className="px-6 flex justify-center">
          <ShareButton score={data.report.protectionScore} firstName={data.firstName} />
        </div>

        <div className="pt-4">
          <AdvisorBookingCTA calendlyUrl={calendlyUrl} fbUrl={fbUrl} />
        </div>
      </div>
    </main>
  )
}
