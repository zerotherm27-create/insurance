'use client'

import { PesoInput } from './PesoInput'

interface EstateModuleProps {
  expanded: boolean
  onToggle: () => void
  netEstateValue: number
  liquidReserves: number
  onNetEstateValue: (v: number) => void
  onLiquidReserves: (v: number) => void
}

export function EstateModule({
  expanded,
  onToggle,
  netEstateValue,
  liquidReserves,
  onNetEstateValue,
  onLiquidReserves,
}: EstateModuleProps) {
  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between border border-white/10 rounded-xl px-4 py-3 hover:border-white/20 transition-[border-color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 shrink-0 border border-gold/40 rounded-full flex items-center justify-center font-sans text-xs text-gold">
            5
          </span>
          <span className="font-sans text-xs text-gold uppercase tracking-widest font-medium">
            Estate Tax
          </span>
          <span className="font-sans text-xs text-white/30">optional</span>
        </div>
        <svg
          className={`w-3.5 h-3.5 text-white/30 transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="space-y-3 px-1">
          <p className="font-sans text-xs text-white/25 leading-relaxed">
            Philippine estate tax: 6% of net estate (TRAIN Law), payable in cash within one year of death.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <PesoInput
              label="Net estate value"
              value={netEstateValue}
              onChange={onNetEstateValue}
              hint="Assets minus liabilities"
            />
            <PesoInput
              label="Liquid reserves for estate tax"
              value={liquidReserves}
              onChange={onLiquidReserves}
              hint="Cash set aside already"
            />
          </div>
        </div>
      )}
    </section>
  )
}
