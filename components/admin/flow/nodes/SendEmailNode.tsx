'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { SendEmailNodeData } from '@/types/automation-flow'

export function SendEmailNode({ data, selected }: NodeProps) {
  const d = data as SendEmailNodeData
  return (
    <div className={`min-w-[200px] rounded-xl border overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-[border-color] ${
      selected ? 'border-gold/80' : 'border-white/10'
    } bg-navy-card`}>
      {/* Gold left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold rounded-l-xl" />
      <div className="pl-4 pr-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-3 h-3 text-gold/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="font-sans text-[10px] uppercase tracking-widest text-gold/70">Send Email</span>
        </div>
        <p className="font-sans text-sm font-semibold text-white">{d.label || 'Untitled email'}</p>
        {d.templateId
          ? <p className="font-sans text-[10px] text-white/40 mt-0.5">Template: {d.templateId}</p>
          : <p className="font-sans text-[10px] text-amber-400/80 mt-0.5">No template selected</p>
        }
      </div>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-white/30 !border-2 !border-navy-card" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-gold !border-2 !border-navy-card" />
    </div>
  )
}
