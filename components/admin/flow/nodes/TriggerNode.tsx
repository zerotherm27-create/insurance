'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { TriggerNodeData } from '@/types/automation-flow'

export function TriggerNode({ data, selected }: NodeProps) {
  const d = data as TriggerNodeData
  return (
    <div className={`min-w-[180px] rounded-xl border-2 px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-[border-color] ${
      selected ? 'border-gold' : 'border-gold/60'
    } bg-navy`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
        <span className="font-sans text-[10px] uppercase tracking-widest text-gold/70">Trigger</span>
      </div>
      <p className="font-sans text-sm font-semibold text-white">{d.label}</p>
      <p className="font-sans text-[10px] text-white/40 mt-0.5">Form submitted</p>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-gold !border-2 !border-navy"
      />
    </div>
  )
}
