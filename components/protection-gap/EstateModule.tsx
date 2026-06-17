'use client'

import { PesoInput } from './PesoInput'

interface EstateModuleProps {
  netEstateValue: number
  liquidReserves: number
  onNetEstateValue: (v: number) => void
  onLiquidReserves: (v: number) => void
}

export function EstateModule({
  netEstateValue,
  liquidReserves,
  onNetEstateValue,
  onLiquidReserves,
}: EstateModuleProps) {
  return (
    <section className="space-y-4">
      <p className="font-sans text-xs text-white/35 leading-relaxed">
        Philippine estate tax is 6% of net estate value (TRAIN Law), payable in cash within one year of death. Skip this step if it does not apply.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <PesoInput
          label="Net estate value"
          value={netEstateValue}
          onChange={onNetEstateValue}
          hint="Total assets minus liabilities"
        />
        <PesoInput
          label="Liquid reserves for estate tax"
          value={liquidReserves}
          onChange={onLiquidReserves}
          hint="Cash already set aside"
        />
      </div>
    </section>
  )
}
