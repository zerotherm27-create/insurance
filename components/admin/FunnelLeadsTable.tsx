'use client'

import { useState } from 'react'
import { StatusBadge } from './StatusBadge'
import { LEAD_STATUSES, STATUS_LABEL, type LeadStatus } from '@/lib/lead-status'
import type { FunnelAIReport } from '@/types/funnel'

interface Lead {
  id: string
  created_at: string
  first_name: string
  mobile: string
  email?: string | null
  segment?: string | null
  answers?: Record<string, string> | null
  protection_score: number
  ai_report?: FunnelAIReport | null
  status: LeadStatus
  sequence_step: number
  last_emailed_at?: string | null
  email_events?: Array<{ event_type: string }> | null
}

const EVENT_BADGE: Record<string, { text: string; classes: string }> = {
  bounced:   { text: 'Bounced',   classes: 'bg-red-500/15 text-red-400 border-red-500/20'       },
  clicked:   { text: 'Clicked',   classes: 'bg-gold/15 text-gold border-gold/20'                 },
  opened:    { text: 'Opened',    classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  delivered: { text: 'Delivered', classes: 'bg-white/5 text-white/50 border-white/10'            },
}

function EmailActivityBadges({ events }: { events: Array<{ event_type: string }> }) {
  if (!events.length) return <span className="text-white/20 text-xs">—</span>

  // Show highest-priority status only (bounced > clicked > opened > delivered)
  const priority = ['bounced', 'clicked', 'opened', 'delivered']
  const types = new Set(events.map((e) => e.event_type))
  const top = priority.find((p) => types.has(p))
  if (!top) return <span className="text-white/20 text-xs">—</span>

  const badge = EVENT_BADGE[top]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-sans font-medium ${badge.classes}`}>
      {badge.text}
    </span>
  )
}

const SEGMENT_LABEL: Record<string, string> = {
  pro: 'Young Pro',
  family: 'Family',
  ofw: 'OFW',
  entrepreneur: 'Self-Employed',
  business: 'Business Owner',
  hnw: 'High Net Worth',
}

interface FunnelLeadsTableProps {
  leads: Lead[]
  token: string
  onSelect?: (lead: Lead) => void
}

export function FunnelLeadsTable({ leads: initialLeads, token, onSelect }: FunnelLeadsTableProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [updating, setUpdating] = useState<string | null>(null)

  async function updateStatus(id: string, status: LeadStatus) {
    setUpdating(id)
    try {
      const res = await fetch(`/api/admin/funnel-leads/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status } : l))
        )
      }
    } finally {
      setUpdating(null)
    }
  }

  if (leads.length === 0) {
    return (
      <p className="font-sans text-white/40 text-center py-16">
        No funnel leads yet. Share your funnel link to start collecting!
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/5">
      <table className="w-full font-sans text-sm">
        <thead>
          <tr className="border-b border-white/5">
            {['Name', 'Mobile', 'Email', 'Score', 'Segment', 'Status', 'Email', 'Sequence', 'Date', 'Actions'].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-white/30 text-xs uppercase tracking-wider font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              onClick={() => onSelect?.(lead)}
              className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{lead.first_name}</td>
              <td className="px-4 py-3 text-white/60 whitespace-nowrap">{lead.mobile}</td>
              <td className="px-4 py-3 text-white/50 whitespace-nowrap">{lead.email ?? '—'}</td>
              <td className="px-4 py-3 text-gold font-medium">{lead.protection_score}</td>
              <td className="px-4 py-3 text-white/50 whitespace-nowrap">
                {lead.segment ? (SEGMENT_LABEL[lead.segment] ?? lead.segment) : 'General'}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={lead.status} />
              </td>
              <td className="px-4 py-3">
                <EmailActivityBadges events={lead.email_events ?? []} />
              </td>
              <td className="px-4 py-3 text-white/40 text-xs">
                Step {lead.sequence_step}
                {lead.last_emailed_at && (
                  <span className="block text-white/25">
                    {new Date(lead.last_emailed_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                {new Date(lead.created_at).toLocaleDateString('en-PH', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <select
                  value={lead.status}
                  disabled={updating === lead.id}
                  onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                  className="bg-navy-card border border-white/10 text-white/70 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/40 disabled:opacity-50 cursor-pointer"
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
