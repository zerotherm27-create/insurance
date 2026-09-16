'use client'

import { useEffect, useState } from 'react'
import { AnalyticsStatCards } from '@/components/admin/analytics/AnalyticsStatCards'
import { TimeSeriesChart } from '@/components/admin/analytics/TimeSeriesChart'
import { RankedBarList } from '@/components/admin/analytics/RankedBarList'
import { RangeSelector, type AnalyticsRange } from '@/components/admin/analytics/RangeSelector'

interface AnalyticsData {
  totals: { sessions: number; pageviews: number; avgDurationSeconds: number; bounceRate: number }
  timeseries: { date: string; sessions: number; pageviews: number }[]
  deviceBreakdown: { key: string; count: number }[]
  osBreakdown: { key: string; count: number }[]
  browserBreakdown: { key: string; count: number }[]
  topPages: { key: string; count: number }[]
  topCountries: { key: string; count: number }[]
  trafficSources: { key: string; count: number }[]
}

const DEVICE_LABEL: Record<string, string> = {
  mobile: 'Mobile',
  tablet: 'Tablet',
  desktop: 'Desktop',
  unknown: 'Unknown',
}

export function SiteAnalyticsTab({ token }: { token: string }) {
  const [range, setRange] = useState<AnalyticsRange>('30d')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    setError(null)
    fetch(`/api/admin/site-analytics?range=${range}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load analytics.')
        return r.json()
      })
      .then((d) => setData(d))
      .catch((err) => setError(err instanceof Error ? err.message : 'Something went wrong.'))
      .finally(() => setLoading(false))
  }, [token, range])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-sans text-xs text-white/30">Anonymous, session-based traffic on public pages only.</p>
        <RangeSelector value={range} onChange={setRange} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="border border-dashed border-white/10 rounded-xl px-4 py-6 text-center">
          <p className="font-sans text-xs text-white/30">{error}</p>
        </div>
      ) : !data || data.totals.sessions === 0 ? (
        <div className="border border-dashed border-white/10 rounded-xl px-4 py-6 text-center">
          <p className="font-sans text-xs text-white/20">No visits recorded in this range yet.</p>
        </div>
      ) : (
        <>
          <AnalyticsStatCards totals={data.totals} />
          <TimeSeriesChart data={data.timeseries} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <RankedBarList title="By Device" items={data.deviceBreakdown} formatLabel={(k) => DEVICE_LABEL[k] ?? k} />
            <RankedBarList title="By OS" items={data.osBreakdown} />
            <RankedBarList title="By Browser" items={data.browserBreakdown} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <RankedBarList title="Top Pages" items={data.topPages} />
            <RankedBarList title="Top Locations" items={data.topCountries} />
            <RankedBarList title="Traffic Sources" items={data.trafficSources} />
          </div>
        </>
      )}
    </div>
  )
}
