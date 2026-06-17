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

  const chipClass = !hasGap
    ? 'bg-emerald-500/15 text-emerald-400'
    : fillPct >= 50
    ? 'bg-gold/10 text-gold'
    : 'bg-red-500/15 text-red-400'

  return (
    <div
      className={cn(
        'bg-navy-card border rounded-xl px-4 py-3',
        'transition-[border-color] duration-150',
        highlighted ? 'border-gold/30' : 'border-white/10'
      )}
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="font-sans text-xs text-white/70 font-medium">{moduleName}</span>
        <span className={cn('font-sans text-xs font-medium px-2 py-0.5 rounded-full', chipClass)}>
          {hasGap ? `Gap ${fmt(gap)}` : 'Covered'}
        </span>
      </div>

      <div className="flex gap-4 mb-2">
        <div>
          <p className="font-sans text-xs text-white/30 mb-0.5">Need</p>
          <p className="font-sans text-xs text-white/70 font-medium">{fmt(need)}</p>
        </div>
        <div>
          <p className="font-sans text-xs text-white/30 mb-0.5">Have</p>
          <p className="font-sans text-xs text-white/70 font-medium">{fmt(have)}</p>
        </div>
        {hasGap && (
          <div>
            <p className="font-sans text-xs text-white/30 mb-0.5">Gap</p>
            <p className="font-sans text-xs font-medium" style={{ color: fillPct >= 50 ? '#F6B21A' : '#F87171' }}>
              {fmt(gap)}
            </p>
          </div>
        )}
      </div>

      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${fillPct}%`,
            background: !hasGap ? '#34D399' : fillPct >= 50 ? '#F6B21A' : '#F87171',
          }}
        />
      </div>
    </div>
  )
}
