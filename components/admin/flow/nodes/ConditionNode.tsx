'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { ConditionNodeData } from '@/types/automation-flow'

const SEGMENT_SHORT: Record<string, string> = {
  pro: 'Pro', family: 'Family', ofw: 'OFW',
  entrepreneur: 'Entrepreneur', business: 'Business', hnw: 'HNW',
}

export function ConditionNode({ data, selected }: NodeProps) {
  const d = data as ConditionNodeData
  const count = d.statusValues?.length ?? 0
  const segCount = d.segmentValues?.length ?? 0
  return (
    <div className={`min-w-[220px] rounded-xl border px-4 py-3 shadow-lg transition-all ${
      selected ? 'border-purple-400/60 shadow-purple-400/10' : 'border-white/10'
    } bg-navy-card`}>
      <div className="flex items-center gap-2 mb-1">
        <svg className="w-3 h-3 text-purple-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-sans text-[10px] uppercase tracking-widest text-purple-400/70">Condition</span>
      </div>
      <p className="font-sans text-sm font-semibold text-white">{d.label}</p>
      {d.conditionType === 'lead_status' && (
        <p className="font-sans text-[10px] text-white/40 mt-0.5">
          {count > 0 ? `Status is: ${d.statusValues!.join(', ')}` : 'No statuses selected'}
        </p>
      )}
      {d.conditionType === 'email_engagement' && (
        <p className="font-sans text-[10px] text-white/40 mt-0.5">
          Email was {d.engagementEvent ?? 'opened'}
        </p>
      )}
      {d.conditionType === 'segment' && (
        <p className="font-sans text-[10px] text-white/40 mt-0.5">
          {segCount > 0
            ? `Segment: ${d.segmentValues!.map((s) => SEGMENT_SHORT[s] ?? s).join(', ')}`
            : 'No segments selected'}
        </p>
      )}
      {/* Yes / No handles at bottom */}
      <div className="flex justify-between mt-3 text-[10px] font-sans">
        <span className="flex items-center gap-1 text-green-400">
          <span className="w-2 h-2 rounded-full bg-green-400" /> Yes
        </span>
        <span className="flex items-center gap-1 text-red-400">
          No <span className="w-2 h-2 rounded-full bg-red-400" />
        </span>
      </div>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-white/30 !border-2 !border-navy-card" />
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        style={{ left: '25%' }}
        className="!w-3 !h-3 !bg-green-400 !border-2 !border-navy-card"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        style={{ left: '75%' }}
        className="!w-3 !h-3 !bg-red-400 !border-2 !border-navy-card"
      />
    </div>
  )
}
