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

export default function FunnelReportPage() {
  const params = useParams()
  const [data, setData] = useState<StoredReport | null>(null)
  const [loading, setLoading] = useState(true)

  const calendlyUrl = process.env.NEXT_PUBLIC_ADVISOR_CALENDLY_URL ?? '#'
  const fbUrl = process.env.NEXT_PUBLIC_ADVISOR_FB_URL ?? '#'

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('sma_funnel_report')
      if (stored) {
        const parsed = JSON.parse(stored) as StoredReport
        if (parsed.id === params.id || params.id === 'local') {
          setData(parsed)
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [params.id])

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
        <div className="pt-4">
          <AdvisorBookingCTA calendlyUrl={calendlyUrl} fbUrl={fbUrl} />
        </div>
      </div>
    </main>
  )
}
