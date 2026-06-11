'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AdvisorBookingCTA } from '@/components/funnel/AdvisorBookingCTA'
import { HoldBanner, deriveHoldExpiry } from '@/components/funnel/HoldBanner'
import { ScoreGauge } from '@/components/funnel/ScoreGauge'
import { BenefitRow } from '@/components/funnel/BenefitRow'
import { PlanOptionsTeaser } from '@/components/funnel/PlanOptionsTeaser'
import { LockIcon, MailIcon } from '@/components/ui/icons'
import type { FunnelAIReport, FunnelSegment } from '@/types/funnel'

interface StoredReport {
  id: string
  firstName: string
  report: FunnelAIReport
  createdAt?: string
  returning?: boolean
  segment?: FunnelSegment | null
}

const VISIBLE_BENEFITS = 2

export default function FunnelSnapshotPage() {
  const params = useParams()
  const id = params.id as string
  const [data, setData] = useState<StoredReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null)

  const calendlyUrl = process.env.NEXT_PUBLIC_ADVISOR_CALENDLY_URL ?? '#'
  const fbUrl = process.env.NEXT_PUBLIC_ADVISOR_FB_URL ?? '#'

  useEffect(() => {
    let found = false

    try {
      const stored = sessionStorage.getItem('sma_funnel_report')
      if (stored) {
        const parsed = JSON.parse(stored) as StoredReport
        if (parsed.id === id || id === 'local') {
          setData(parsed)
          setHoldExpiresAt(deriveHoldExpiry(parsed.createdAt, id))
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

    fetch(`/api/funnel/report/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.id) {
          setData(json)
          setHoldExpiresAt(deriveHoldExpiry(json.createdAt, id))
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
        <p className="font-sans text-white/50 mb-4">Results not found.</p>
        <a href="/" className="text-gold underline font-sans text-sm">
          Take the check again
        </a>
      </main>
    )
  }

  const holdActive = holdExpiresAt !== null && holdExpiresAt > Date.now()
  const benefits = data.report.coverageBenefits ?? []
  const visible = benefits.slice(0, VISIBLE_BENEFITS)
  const lockedCount = Math.max(benefits.length - visible.length, 0)

  return (
    <main className="relative min-h-screen bg-navy-gradient">
      {/* Email banner: the full report lives in their inbox */}
      <div className="bg-gold/15 border-b border-gold/25 px-6 py-2.5 text-center">
        <p className="font-sans text-xs text-gold-pale/90">
          Your <span className="text-gold font-medium">full Coverage Report</span> was emailed to you.
          Check <span className="text-gold">Spam</span> or <span className="text-gold">Promotions</span> if it is not in your inbox.
        </p>
      </div>

      {holdExpiresAt !== null && <HoldBanner expiresAt={holdExpiresAt} />}

      {data.returning && (
        <div className="bg-navy-card/60 border-b border-white/10 px-6 py-2.5 text-center">
          <p className="font-sans text-xs text-white/60">
            Welcome back, {data.firstName}. We updated your results using your latest answers.
            Remember: your report is only as accurate as the answers you share.
          </p>
        </div>
      )}

      <header className="px-6 py-6 text-center space-y-2">
        <span className="font-sans text-xs text-white/30 tracking-widest uppercase">Your Results</span>
        <h1 className="font-serif text-2xl text-white">
          Your Coverage Snapshot is ready, {data.firstName}.
        </h1>
        <p className="font-sans text-sm text-white/45">Here is what we found based on your answers.</p>
      </header>

      <div className="space-y-4 pb-4">
        {/* Protection level */}
        <div className="max-w-lg mx-auto w-full px-6">
          <div className="bg-navy-card border border-gold/20 rounded-2xl p-6 space-y-4 text-center">
            <p className="font-sans text-xs text-white/40 uppercase tracking-widest">
              Your Current Protection Level
            </p>
            <ScoreGauge score={data.report.protectionScore} />
            <p className="font-sans text-sm text-white/60">{data.report.scoreLabel}</p>
            <div className="rounded-xl bg-red-400/8 border-l-2 border-red-400/50 px-4 py-3 text-left">
              <p className="font-sans text-xs text-white/70 leading-relaxed">{data.report.biggestGap}</p>
            </div>
          </div>
        </div>

        {/* First benefits, rest locked */}
        {benefits.length > 0 && (
          <div className="max-w-lg mx-auto w-full px-6 space-y-3">
            <div className="text-center space-y-1 pt-2">
              <h2 className="font-serif text-lg text-white">Benefits identified for your profile</h2>
              <p className="font-sans text-xs text-white/40">
                {visible.length} of {benefits.length} shown here. The full breakdown is in your email.
              </p>
            </div>
            <div className="bg-navy-card border border-white/5 rounded-2xl divide-y divide-white/5">
              {visible.map((b) => (
                <BenefitRow key={b.id} benefit={b} />
              ))}
            </div>
            {lockedCount > 0 && (
              <div className="bg-navy-light/40 border border-white/8 rounded-2xl p-5 flex items-start gap-3">
                <span className="text-white/30 mt-0.5">
                  <LockIcon size={16} />
                </span>
                <div className="space-y-0.5">
                  <p className="font-sans text-sm text-white/70">
                    +{lockedCount} more {lockedCount === 1 ? 'benefit' : 'benefits'} identified
                  </p>
                  <p className="font-sans text-xs text-white/40 leading-relaxed">
                    Your full report with all amounts was sent to your email.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Email callout */}
        <div className="max-w-lg mx-auto w-full px-6">
          <div className="bg-navy-card border border-gold/25 rounded-2xl p-5 flex items-start gap-3">
            <span className="text-gold/70 mt-0.5">
              <MailIcon size={18} />
            </span>
            <div className="space-y-1.5">
              <p className="font-sans text-sm font-medium text-white/90">
                Your full Coverage Report is in your email
              </p>
              <p className="font-sans text-xs text-white/50 leading-relaxed">
                The complete report, with all {benefits.length > 0 ? benefits.length : ''} identified benefits
                and your recommended coverage amounts, was sent to the email you used.
                We sent it there so you can open it anytime, even after you close this browser.
              </p>
              <p className="font-sans text-xs text-gold/70 leading-relaxed">
                Can&apos;t find it? Check your Spam or Promotions folder and move it to your inbox.
              </p>
            </div>
          </div>
        </div>

        {/* Plan options teaser */}
        <PlanOptionsTeaser segment={data.segment} />

        {/* Booking */}
        <div className="pt-2">
          <AdvisorBookingCTA calendlyUrl={calendlyUrl} fbUrl={fbUrl} holdActive={holdActive} segment={data.segment} />
        </div>

        <p className="max-w-lg mx-auto text-center text-xs text-white/20 leading-relaxed px-8 pb-8">
          Coverage amounts are estimates based on the ranges you shared and common planning guidelines.
          This assessment is for informational purposes only and does not constitute financial advice.
          It must be validated through an official proposal and consultation with a licensed advisor.
        </p>
      </div>
    </main>
  )
}
