import { cn } from '@/lib/utils'
import type { GapModuleResult } from '@/types/gap'
import { fmt } from '@/lib/gap-calculator'

interface GapResultCardProps {
  result: GapModuleResult
  highlighted?: boolean
}

export function GapResultCard({ result, highlighted }: GapResultCardProps) {
  const { moduleName, need, have, gap } = result
  const fillPct = need > 0 ? Math.round((have / need) * 100) : 100
  const hasGap = gap > 0

  const gapColor = !hasGap ? '#34D399' : fillPct >= 50 ? '#F6B21A' : '#F87171'
  const barColor = gapColor

  const statusLabel = !hasGap ? 'Covered' : fillPct >= 50 ? 'Partial' : 'Exposed'
  const statusClass = !hasGap
    ? 'bg-emerald-500/15 text-emerald-400'
    : fillPct >= 50
    ? 'bg-gold/10 text-gold'
    : 'bg-red-500/15 text-red-400'

  return (
    <div
      className={cn(
        'bg-navy-card border rounded-xl px-4 py-4',
        'transition-[border-color] duration-150',
        highlighted ? 'border-gold/30' : 'border-white/10'
      )}
    >
      {/* Module name + status */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-sans text-xs text-white/50">{moduleName}</span>
        <span className={cn('font-sans text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide', statusClass)}>
          {statusLabel}
        </span>
      </div>

      {hasGap ? (
        <>
          {/* Gap = hero stat */}
          <p
            className="font-serif text-2xl font-bold leading-none mb-0.5 tabular-nums"
            style={{ color: gapColor }}
          >
            {fmt(gap)}
          </p>
          <p className="font-sans text-[11px] text-white/30 mb-3">protection gap</p>

          {/* Need / Have */}
          <div className="flex gap-5 mb-3">
            <div>
              <p className="font-sans text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Need</p>
              <p className="font-sans text-sm text-white/70 tabular-nums">{fmt(need)}</p>
            </div>
            <div>
              <p className="font-sans text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Have</p>
              <p className="font-sans text-sm text-white/70 tabular-nums">{fmt(have)}</p>
            </div>
          </div>
        </>
      ) : (
        <div className="mb-3">
          <p className="font-serif text-xl text-emerald-400 leading-none mb-0.5">{fmt(need)}</p>
          <p className="font-sans text-[11px] text-white/30">fully covered</p>
        </div>
      )}

      {/* Fill bar */}
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${fillPct}%`, background: barColor }}
        />
      </div>
      <p className="font-sans text-[10px] text-white/25 mt-1 text-right tabular-nums">{fillPct}% covered</p>
    </div>
  )
}
