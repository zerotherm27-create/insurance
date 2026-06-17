'use client'

import type { ConditionNodeData } from '@/types/automation-flow'
import type { LeadStatus } from '@/lib/lead-status'
import { LEAD_STATUSES, STATUS_LABEL } from '@/lib/lead-status'
import type { FunnelSegment } from '@/types/funnel'

const SEGMENT_OPTIONS: { value: FunnelSegment; label: string }[] = [
  { value: 'pro',          label: 'Young Professional' },
  { value: 'family',       label: 'Family / Parent' },
  { value: 'ofw',          label: 'OFW' },
  { value: 'entrepreneur', label: 'Entrepreneur' },
  { value: 'business',     label: 'Business Owner' },
  { value: 'hnw',          label: 'High Net Worth' },
]

interface Props {
  nodeId: string
  data: ConditionNodeData
  onUpdate: (nodeId: string, data: Partial<ConditionNodeData>) => void
  onDelete: (nodeId: string) => void
}

const inputCls = 'w-full px-3 py-2 rounded-lg bg-navy border border-white/10 text-white font-sans text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50'

export function ConditionNodePanel({ nodeId, data, onUpdate, onDelete }: Props) {
  function toggleStatus(s: LeadStatus) {
    const current = data.statusValues ?? []
    const next = current.includes(s) ? current.filter((x) => x !== s) : [...current, s]
    onUpdate(nodeId, { statusValues: next })
  }

  function toggleSegment(s: FunnelSegment) {
    const current = data.segmentValues ?? []
    const next = current.includes(s) ? current.filter((x) => x !== s) : [...current, s]
    onUpdate(nodeId, { segmentValues: next })
  }

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
        <label className="font-sans text-[10px] uppercase tracking-wider text-white/40">Condition type</label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {([
            ['lead_status',     'Lead status'],
            ['email_engagement','Email opened'],
            ['segment',         'Segment'],
          ] as const).map(([ct, label]) => (
            <button
              key={ct}
              onClick={() => onUpdate(nodeId, { conditionType: ct })}
              className={`py-2 px-2 rounded-lg font-sans text-xs border transition-colors ${
                data.conditionType === ct
                  ? 'bg-gold text-navy-dark border-gold font-semibold'
                  : 'border-white/10 text-white/50 hover:text-white hover:border-white/30'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {data.conditionType === 'lead_status' && (
        <div>
          <label className="font-sans text-[10px] uppercase tracking-wider text-white/40 block mb-2">
            YES if status is one of:
          </label>
          <div className="space-y-2">
            {LEAD_STATUSES.map((s) => (
              <label key={s} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={(data.statusValues ?? []).includes(s)}
                  onChange={() => toggleStatus(s)}
                  className="w-4 h-4 rounded border-white/20 bg-navy accent-gold"
                />
                <span className="font-sans text-sm text-white/70 group-hover:text-white transition-colors">
                  {STATUS_LABEL[s]}
                </span>
              </label>
            ))}
          </div>
          <p className="font-sans text-[10px] text-white/25 mt-3">
            YES branch fires if the lead&apos;s current status matches any checked item. NO branch fires otherwise.
          </p>
        </div>
      )}

      {data.conditionType === 'email_engagement' && (
        <div>
          <label className="font-sans text-[10px] uppercase tracking-wider text-white/40 block mb-2">
            YES if lead:
          </label>
          <div className="flex gap-3">
            {(['opened', 'clicked'] as const).map((ev) => (
              <button
                key={ev}
                onClick={() => onUpdate(nodeId, { engagementEvent: ev })}
                className={`flex-1 py-2 px-3 rounded-lg font-sans text-xs border transition-colors ${
                  data.engagementEvent === ev
                    ? 'bg-gold text-navy-dark border-gold font-semibold'
                    : 'border-white/10 text-white/50 hover:text-white hover:border-white/30'
                }`}
              >
                {ev === 'opened' ? 'Opened last email' : 'Clicked a link'}
              </button>
            ))}
          </div>
          <p className="font-sans text-[10px] text-amber-400/60 mt-3">
            Email engagement tracking requires Resend webhook setup (Phase 2).
          </p>
        </div>
      )}

      {data.conditionType === 'segment' && (
        <div>
          <label className="font-sans text-[10px] uppercase tracking-wider text-white/40 block mb-2">
            YES if segment is one of:
          </label>
          <div className="space-y-2">
            {SEGMENT_OPTIONS.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={(data.segmentValues ?? []).includes(value)}
                  onChange={() => toggleSegment(value)}
                  className="w-4 h-4 rounded border-white/20 bg-navy accent-gold"
                />
                <span className="font-sans text-sm text-white/70 group-hover:text-white transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
          <p className="font-sans text-[10px] text-white/25 mt-3">
            YES branch fires if the lead&apos;s segment matches any checked item. NO branch fires otherwise.
          </p>
        </div>
      )}

      <button
        onClick={() => onDelete(nodeId)}
        className="w-full font-sans text-xs text-red-400/70 hover:text-red-400 transition-colors py-2 border border-red-400/20 hover:border-red-400/40 rounded-lg"
      >
        Delete node
      </button>
    </div>
  )
}
