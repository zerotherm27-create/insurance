'use client'

import type { WaitNodeData } from '@/types/automation-flow'

interface Props {
  nodeId: string
  data: WaitNodeData
  onUpdate: (nodeId: string, data: Partial<WaitNodeData>) => void
  onDelete: (nodeId: string) => void
}

const inputCls = 'w-full px-3 py-2 rounded-lg bg-navy border border-white/10 text-white font-sans text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50'

export function WaitNodePanel({ nodeId, data, onUpdate, onDelete }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <label className="font-sans text-[10px] uppercase tracking-wider text-white/40">Node label</label>
        <input
          className={`${inputCls} mt-1.5`}
          value={data.label}
          onChange={(e) => onUpdate(nodeId, { label: e.target.value })}
        />
      </div>

      <div>
        <label className="font-sans text-[10px] uppercase tracking-wider text-white/40">
          Days to wait
        </label>
        <input
          type="number"
          min={1}
          max={90}
          className={`${inputCls} mt-1.5`}
          value={data.days}
          onChange={(e) => {
            const days = Math.max(1, Math.min(90, Number(e.target.value)))
            onUpdate(nodeId, { days, label: `Wait ${days} ${days === 1 ? 'day' : 'days'}` })
          }}
        />
        <p className="font-sans text-[10px] text-white/25 mt-1">
          The cron runs daily — leads advance when the wait period has elapsed.
        </p>
      </div>

      <button
        onClick={() => onDelete(nodeId)}
        className="w-full font-sans text-xs text-red-400/70 hover:text-red-400 transition-colors py-2 border border-red-400/20 hover:border-red-400/40 rounded-lg"
      >
        Delete node
      </button>
    </div>
  )
}
