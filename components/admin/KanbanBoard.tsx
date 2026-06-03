'use client'

import { useState } from 'react'
import { LEAD_STATUSES, STATUS_LABEL, STATUS_COLOR, type LeadStatus } from '@/lib/lead-status'

interface Lead {
  id: string
  created_at: string
  first_name: string
  mobile: string
  email?: string | null
  segment?: string | null
  protection_score: number
  status: LeadStatus
  sequence_step: number
}

const SEGMENT_LABEL: Record<string, string> = {
  pro: 'Young Pro',
  family: 'Family',
  ofw: 'OFW',
  entrepreneur: 'Self-Employed',
  business: 'Business Owner',
  hnw: 'High Net Worth',
}

export function KanbanBoard({ leads: initialLeads, token }: { leads: Lead[]; token: string }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [hoverColumn, setHoverColumn] = useState<LeadStatus | null>(null)

  async function moveLead(id: string, status: LeadStatus) {
    const prev = leads
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)))
    try {
      const res = await fetch(`/api/admin/funnel-leads/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) setLeads(prev)
    } catch {
      setLeads(prev)
    }
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="grid grid-flow-col auto-cols-[minmax(280px,1fr)] gap-4 min-w-full">
        {LEAD_STATUSES.map((status) => {
          const colLeads = leads.filter((l) => l.status === status)
          const c = STATUS_COLOR[status]
          const isHover = hoverColumn === status

          return (
            <div
              key={status}
              onDragOver={(e) => { e.preventDefault(); setHoverColumn(status) }}
              onDragLeave={() => setHoverColumn(null)}
              onDrop={() => {
                if (draggingId) moveLead(draggingId, status)
                setDraggingId(null)
                setHoverColumn(null)
              }}
              className={`rounded-xl border bg-navy-card/40 flex flex-col transition-colors ${
                isHover ? `${c.border} bg-white/[0.03]` : 'border-white/5'
              }`}
            >
              {/* Column header */}
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between sticky top-0 bg-navy-card/80 backdrop-blur rounded-t-xl">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <span className="font-sans text-sm font-medium text-white">{STATUS_LABEL[status]}</span>
                </div>
                <span className={`font-sans text-xs font-semibold ${c.text}`}>{colLeads.length}</span>
              </div>

              {/* Cards */}
              <div className="p-3 space-y-2 flex-1 min-h-[200px]">
                {colLeads.length === 0 ? (
                  <p className="font-sans text-xs text-white/20 text-center pt-6">No leads here yet</p>
                ) : (
                  colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={() => setDraggingId(lead.id)}
                      onDragEnd={() => { setDraggingId(null); setHoverColumn(null) }}
                      className={`bg-navy-card border border-white/10 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-white/25 transition-colors space-y-2 ${
                        draggingId === lead.id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-sans text-sm font-medium text-white truncate">{lead.first_name}</p>
                        <span className="font-serif text-lg text-gold leading-none">{lead.protection_score}</span>
                      </div>
                      <p className="font-sans text-xs text-white/50 truncate">{lead.mobile}</p>
                      {lead.email && <p className="font-sans text-xs text-white/40 truncate">{lead.email}</p>}
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-sans text-[10px] uppercase tracking-wider text-white/30">
                          {lead.segment ? (SEGMENT_LABEL[lead.segment] ?? lead.segment) : 'General'}
                        </span>
                        <span className="font-sans text-[10px] text-white/25">
                          {new Date(lead.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      {/* Quick move dropdown for mobile/non-drag use */}
                      <select
                        value={lead.status}
                        onChange={(e) => moveLead(lead.id, e.target.value as LeadStatus)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-navy-dark border border-white/10 text-white/70 text-xs rounded px-2 py-1 mt-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/40 cursor-pointer"
                      >
                        {LEAD_STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                        ))}
                      </select>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
