'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { WaitNodeData } from '@/types/automation-flow'

export function WaitNode({ data, selected }: NodeProps) {
  const d = data as WaitNodeData
  return (
    <div className={`min-w-[180px] rounded-xl border px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-[border-color] ${
      selected ? 'border-blue-400/60' : 'border-white/10'
    } bg-navy-card`}>
      <div className="flex items-center gap-2 mb-1">
        <svg className="w-3 h-3 text-blue-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-sans text-[10px] uppercase tracking-widest text-blue-400/70">Wait</span>
      </div>
      <p className="font-sans text-sm font-semibold text-white">
        {d.days} {d.days === 1 ? 'day' : 'days'}
      </p>
      <p className="font-sans text-[10px] text-white/40 mt-0.5">before continuing</p>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-white/30 !border-2 !border-navy-card" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-400 !border-2 !border-navy-card" />
    </div>
  )
}
