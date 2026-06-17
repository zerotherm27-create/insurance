import { cn } from '@/lib/utils'
import type { GapSummary } from '@/types/gap'
import { fmt } from '@/lib/gap-calculator'

const STATUS_LABEL: Record<string, string> = {
  critical: 'Critical Risk',
  serious: 'Serious Risk',
  moderate: 'Moderate Risk',
  good: 'Well Covered',
}

const STATUS_CLASS: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-400 border border-red-500/25',
  serious: 'bg-orange-500/15 text-orange-400 border border-orange-500/25',
  moderate: 'bg-gold/10 text-gold border border-gold/25',
  good: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
}

const BAR_COLOR: Record<string, string> = {
  critical: '#F87171',
  serious: '#FB923C',
  moderate: '#F6B21A',
  good: '#34D399',
}

interface GrandTotalCardProps {
  summary: GapSummary
  status: 'critical' | 'serious' | 'moderate' | 'good'
}

export function GrandTotalCard({ summary, status }: GrandTotalCardProps) {
  const { totalGap, totalNeed, protectedPct } = summary

  return (
    <div className="bg-navy-card border border-white/10 rounded-xl px-5 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
      <div className="flex items-start justify-between mb-1">
        <p className="font-sans text-xs text-white/35 uppercase tracking-widest">
          Total protection gap
        </p>
        <span className={cn('font-sans text-xs font-semibold px-2.5 py-0.5 rounded-full', STATUS_CLASS[status])}>
          {STATUS_LABEL[status]}
        </span>
      </div>

      <p className="font-serif text-4xl text-white leading-none mt-2 mb-1 tabular-nums">
        {totalGap === 0 ? '₱0' : fmt(totalGap)}
      </p>
      {totalNeed > 0 && totalGap > 0 && (
        <p className="font-sans text-xs text-white/30 mb-4">
          out of {fmt(totalNeed)} total need
        </p>
      )}
      {totalGap === 0 && (
        <p className="font-sans text-xs text-emerald-400/70 mb-4">All gaps covered</p>
      )}

      <div className="space-y-1.5">
        <div className="flex-1 h-2.5 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{
              width: `${protectedPct}%`,
              background: BAR_COLOR[status],
            }}
          />
        </div>
        <div className="flex justify-between">
          <span className="font-sans text-xs text-white/30">Protected</span>
          <span className="font-sans text-sm font-semibold text-white tabular-nums">
            {protectedPct}%
          </span>
        </div>
      </div>
    </div>
  )
}
