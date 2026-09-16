'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface Point {
  date: string // YYYY-MM-DD
  sessions: number
  pageviews: number
}

function formatDateLabel(date: string): string {
  const d = new Date(`${date}T00:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="bg-navy-card border border-white/10 rounded-lg px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
      <p className="font-sans text-[10px] text-white/40 mb-1">{label ? formatDateLabel(label) : ''}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-sans text-xs flex items-center gap-1.5" style={{ color: p.color }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-medium">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export function TimeSeriesChart({ data }: { data: Point[] }) {
  return (
    <div className="bg-navy-card border border-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-sans text-[10px] uppercase tracking-wider text-white/40">Visits Over Time</p>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-sans text-[10px] text-white/50">
            <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" /> Sessions
          </span>
          <span className="flex items-center gap-1.5 font-sans text-[10px] text-white/50">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 inline-block" /> Pageviews
          </span>
        </div>
      </div>
      {data.length === 0 ? (
        <p className="font-sans text-xs text-white/20 py-12 text-center">No traffic in this range yet.</p>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="sessionsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F6B21A" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#F6B21A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateLabel}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.15)' }} />
              <Area
                type="monotone"
                dataKey="sessions"
                name="Sessions"
                stroke="#F6B21A"
                strokeWidth={2}
                fill="url(#sessionsFill)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="pageviews"
                name="Pageviews"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth={2}
                fill="transparent"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
