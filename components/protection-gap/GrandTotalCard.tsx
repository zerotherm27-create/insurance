import { cn } from '@/lib/utils'
import type { GapSummary } from '@/types/gap'
import { fmt } from '@/lib/gap-calculator'

const STATUS_LABEL: Record<string, string> = {
  critical: 'Critical',
  serious: 'Serious',
  moderate: 'Moderate',
  good: 'Well Covered',
}

const STATUS_CLASS: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-400 border border-red-500/20',
  serious: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
  moderate: 'bg-gold/10 text-gold border border-gold/20',
  good: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
}

interface GrandTotalCardProps {
  summary: GapSummary
  status: 'critical' | 'serious' | 'moderate' | 'good'
}

export function GrandTotalCard({ summary, status }: GrandTotalCardProps) {
  const { totalGap, protectedPct } = summary

  return (
    <div className="bg-navy-card border border-white/10 rounded-xl px-5 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
      <p className="font-sans text-xs text-white/35 uppercase tracking-widest mb-1.5">
        Total protection gap
      </p>
      <div className="flex items-end gap-3 mb-1">
        <p className="font-serif text-3xl text-white leading-none">
          {totalGap === 0 ? '₱0' : fmt(totalGap)}
        </p>
        <span
          className={cn(
            'font-sans text-xs font-medium px-2 py-0.5 rounded-full mb-0.5',
            STATUS_CLASS[status]
          )}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      <div className="flex items-center gap-3 mt-3">
        <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{
              width: `${protectedPct}%`,
              background:
                protectedPct >= 80
                  ? '#34D399'
                  : protectedPct >= 50
                  ? '#F6B21A'
                  : '#F87171',
            }}
          />
        </div>
        <span className="font-sans text-xs text-white/50 shrink-0 tabular-nums">
          {protectedPct}% protected
        </span>
      </div>
    </div>
  )
}
