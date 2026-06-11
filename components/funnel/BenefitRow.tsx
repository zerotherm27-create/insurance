import type { CoverageBenefit } from '@/types/funnel'
import { SnapshotIcon } from '@/components/ui/icons'

export const STATUS_CHIP: Record<CoverageBenefit['status'], { label: string; className: string }> = {
  have: { label: 'You Have This', className: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30' },
  partial: { label: 'Worth Reviewing', className: 'bg-amber-400/10 text-amber-400 border-amber-400/30' },
  gap: { label: 'Gap Detected', className: 'bg-red-400/10 text-red-400 border-red-400/30' },
}

export const STATUS_ICON: Record<CoverageBenefit['status'], '✅' | '⚠️' | '❌'> = {
  have: '✅',
  partial: '⚠️',
  gap: '❌',
}

export function BenefitRow({ benefit }: { benefit: CoverageBenefit }) {
  const chip = STATUS_CHIP[benefit.status]
  return (
    <div className="p-5 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <span className="mt-0.5 flex-shrink-0">
            <SnapshotIcon icon={STATUS_ICON[benefit.status]} />
          </span>
          <p className="font-sans text-sm font-medium text-white/90 leading-snug">{benefit.name}</p>
        </div>
        <span
          className={`flex-shrink-0 px-2.5 py-0.5 rounded-full border text-[11px] font-sans font-medium whitespace-nowrap ${chip.className}`}
        >
          {chip.label}
        </span>
      </div>

      <div className="pl-7 space-y-1">
        <p className="font-sans text-xs text-white/45 leading-relaxed">
          <span className="text-gold/80">{benefit.idealLabel ?? 'Ideal coverage'}:</span>{' '}
          {benefit.idealAmount}
        </p>
        {benefit.starterAmount && (
          <p className="font-sans text-xs text-white/45 leading-relaxed">
            <span className="text-gold/50">{benefit.starterLabel ?? 'Starter coverage'}:</span>{' '}
            {benefit.starterAmount}
          </p>
        )}
        {benefit.whyItMatters && (
          <p className="font-sans text-xs text-white/55 leading-relaxed pt-1">{benefit.whyItMatters}</p>
        )}
      </div>
    </div>
  )
}
