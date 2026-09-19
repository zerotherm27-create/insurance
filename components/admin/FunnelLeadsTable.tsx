'use client'

import { useEffect, useState } from 'react'
import { StatusBadge } from './StatusBadge'
import { LEAD_STATUSES, STATUS_LABEL, type LeadStatus } from '@/lib/lead-status'
import { sourceLabel, sourceColor } from '@/lib/lead-source'
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
  source?: string | null
  event_tag?: string | null
  email_events?: Array<{ event_type: string }> | null
}

function OriginBadge({ source }: { source?: string | null }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-sans font-medium whitespace-nowrap ${sourceColor(source)}`}>
      {sourceLabel(source)}
    </span>
  )
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
  onStatusChange: (id: string, status: LeadStatus) => Promise<void> | void
  onSelect?: (lead: Lead) => void
  token?: string
  onBulkDone?: () => void
}

interface NurtureChoice {
  position: number
  subject: string
}

export function FunnelLeadsTable({ leads, onStatusChange, onSelect, token, onBulkDone }: FunnelLeadsTableProps) {
  const [updating, setUpdating] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [picking, setPicking] = useState(false)
  const [choices, setChoices] = useState<NurtureChoice[]>([])
  const [choice, setChoice] = useState('next')
  const [bulkBusy, setBulkBusy] = useState(false)
  const [bulkResult, setBulkResult] = useState('')

  // Drop selections for leads that are no longer in the list (filtered, closed, deleted).
  const selectedIds = leads.filter((l) => selected.has(l.id)).map((l) => l.id)
  const allSelected = leads.length > 0 && selectedIds.length === leads.length

  useEffect(() => {
    if (!picking || !token) return
    fetch('/api/admin/nurture-templates', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((body) => setChoices(body.templates ?? []))
      .catch(() => setChoices([]))
  }, [picking, token])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function applyBulkNurture() {
    setBulkBusy(true)
    setBulkResult('')
    try {
      const res = await fetch('/api/admin/funnel-leads/nurture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ leadIds: selectedIds, position: choice === 'next' ? 'next' : Number(choice) }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setBulkResult(body.error ?? 'Could not move these leads')
        return
      }
      const names = new Map(leads.map((l) => [l.id, l.first_name]))
      const skipped: Array<{ id: string; reason: string }> = body.skipped ?? []
      const detail = skipped.slice(0, 5).map((k) => `${names.get(k.id) ?? 'Lead'}: ${k.reason}`).join('. ')
      setBulkResult(
        `Moved ${body.moved} to nurture.` +
          (skipped.length ? ` Skipped ${skipped.length}. ${detail}${skipped.length > 5 ? '…' : ''}` : '')
      )
      setSelected(new Set())
      setPicking(false)
      onBulkDone?.()
    } catch {
      setBulkResult('Could not move these leads')
    } finally {
      setBulkBusy(false)
    }
  }

  async function updateStatus(id: string, status: LeadStatus) {
    setUpdating(id)
    try {
      await onStatusChange(id, status)
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
    <div className="space-y-3">
      {token && (selectedIds.length > 0 || bulkResult) && (
        <div className="space-y-2 rounded-xl border border-gold/20 bg-navy-card px-4 py-3 font-sans text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {selectedIds.length > 0 && (
              <>
                <span className="text-white/70">{selectedIds.length} selected</span>
                <button
                  onClick={() => setPicking((p) => !p)}
                  className="text-gold/70 hover:text-gold transition-[color]"
                >
                  {picking ? 'Cancel' : 'Skip to nurture'}
                </button>
                <button
                  onClick={() => { setSelected(new Set()); setPicking(false) }}
                  className="text-white/40 hover:text-white/70 transition-[color]"
                >
                  Clear
                </button>
              </>
            )}
            {bulkResult && <span className="text-white/50">{bulkResult}</span>}
          </div>
          {picking && selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={choice}
                onChange={(e) => setChoice(e.target.value)}
                className="bg-navy-dark border border-white/10 text-white/70 rounded-lg px-2 py-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/40"
              >
                <option value="next">Next nurture email for each lead</option>
                {choices.map((c) => (
                  <option key={c.position} value={c.position}>
                    Nurture email {c.position}: {c.subject}
                  </option>
                ))}
              </select>
              <button
                onClick={applyBulkNurture}
                disabled={bulkBusy}
                className="rounded-lg bg-gold px-3 py-1.5 font-medium text-navy-dark transition-[background-color] hover:bg-gold-soft disabled:opacity-50"
              >
                {bulkBusy ? 'Moving…' : `Move ${selectedIds.length} to nurture`}
              </button>
              <span className="text-white/30">Skips the rest of the follow-ups. Leads that don&apos;t qualify are skipped.</span>
            </div>
          )}
        </div>
      )}
    <div className="overflow-x-auto rounded-xl border border-white/5">
      <table className="w-full font-sans text-sm">
        <thead>
          <tr className="border-b border-white/5">
            {token && (
              <th className="pl-4 py-3 w-8">
                <input
                  type="checkbox"
                  aria-label="Select all leads"
                  checked={allSelected}
                  onChange={() => setSelected(allSelected ? new Set() : new Set(leads.map((l) => l.id)))}
                  className="accent-[#F6B21A] cursor-pointer"
                />
              </th>
            )}
            {['Name', 'Mobile', 'Email', 'Score', 'Segment', 'Origin', 'Status', 'Email', 'Sequence', 'Date', 'Actions'].map((h) => (
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
              {token && (
                <td className="pl-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    aria-label={`Select ${lead.first_name}`}
                    checked={selected.has(lead.id)}
                    onChange={() => toggle(lead.id)}
                    className="accent-[#F6B21A] cursor-pointer"
                  />
                </td>
              )}
              <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{lead.first_name}</td>
              <td className="px-4 py-3 text-white/60 whitespace-nowrap">{lead.mobile}</td>
              <td className="px-4 py-3 text-white/50 whitespace-nowrap">{lead.email ?? '—'}</td>
              <td className="px-4 py-3 text-gold font-medium">{lead.protection_score}</td>
              <td className="px-4 py-3 text-white/50 whitespace-nowrap">
                {lead.segment ? (SEGMENT_LABEL[lead.segment] ?? lead.segment) : 'General'}
              </td>
              <td className="px-4 py-3">
                <OriginBadge source={lead.source} />
                {lead.event_tag && (
                  <span className="block text-[10px] text-white/30 mt-1 truncate max-w-[120px]">{lead.event_tag}</span>
                )}
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
    </div>
  )
}
