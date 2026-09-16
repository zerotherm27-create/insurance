import { formatDuration } from '@/lib/format-duration'

interface Totals {
  sessions: number
  pageviews: number
  avgDurationSeconds: number
  bounceRate: number
}

export function AnalyticsStatCards({ totals }: { totals: Totals }) {
  const stats = [
    { label: 'Visitors', value: totals.sessions.toLocaleString() },
    { label: 'Pageviews', value: totals.pageviews.toLocaleString() },
    { label: 'Avg. Session', value: formatDuration(totals.avgDurationSeconds) },
    { label: 'Bounce Rate', value: `${totals.bounceRate}%` },
  ]

  return (
    <div className="bg-navy-card border border-white/5 rounded-xl p-4">
      <p className="font-sans text-[10px] uppercase tracking-wider text-white/40 mb-3">Site Traffic</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="font-sans text-[10px] text-white/40">{s.label}</p>
            <p className="font-serif text-xl text-gold mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
