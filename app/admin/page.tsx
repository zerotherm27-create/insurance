'use client'

import { useState, useEffect } from 'react'
import { FunnelLeadsTable } from '@/components/admin/FunnelLeadsTable'
import { KanbanBoard } from '@/components/admin/KanbanBoard'
import { LeadDetailsPanel } from '@/components/admin/LeadDetailsPanel'
import { SegmentStats } from '@/components/admin/SegmentStats'
import { ConversionStats } from '@/components/admin/ConversionStats'
import { LEAD_STATUSES, STATUS_LABEL, STATUS_COLOR, type LeadStatus } from '@/lib/lead-status'
import { leadsToCsv, downloadCsv } from '@/lib/csv-export'
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
}

type View = 'kanban' | 'table'

export default function AdminPage() {
  const [token, setToken] = useState('')
  const [inputToken, setInputToken] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('kanban')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('sma_admin_token')
      if (stored) {
        setToken(stored)
        fetchLeads(stored)
      }
      const v = localStorage.getItem('sma_admin_view')
      if (v === 'table' || v === 'kanban') setView(v)
    } catch {
      // ignore
    }
  }, [])

  function changeView(v: View) {
    setView(v)
    try { localStorage.setItem('sma_admin_view', v) } catch {}
  }

  async function fetchLeads(t: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/funnel-leads', {
        headers: { Authorization: `Bearer ${t}` },
      })
      if (res.status === 401) {
        setToken('')
        sessionStorage.removeItem('sma_admin_token')
        setError('Incorrect password.')
        return
      }
      if (!res.ok) throw new Error('Failed to fetch leads.')
      const data = await res.json()
      setLeads(data.leads ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    sessionStorage.setItem('sma_admin_token', inputToken)
    setToken(inputToken)
    await fetchLeads(inputToken)
  }

  function exportCsv() {
    const csv = leadsToCsv(leads)
    const date = new Date().toISOString().slice(0, 10)
    downloadCsv(`funnel-leads-${date}.csv`, csv)
  }

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-navy-gradient px-6">
        <div className="max-w-sm w-full space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-serif text-2xl text-white">Admin Dashboard</h1>
            <p className="font-sans text-sm text-white/40">Enter your admin password to continue.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              required
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              placeholder="Admin password"
              className="w-full px-4 py-3 rounded-xl bg-navy-card border border-white/10 text-white font-sans placeholder:text-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              className="w-full px-6 py-3 rounded-xl bg-gold text-navy-dark font-sans font-semibold hover:bg-gold-soft transition-colors"
            >
              Enter Dashboard
            </button>
          </form>
        </div>
      </main>
    )
  }

  const counts = Object.fromEntries(
    LEAD_STATUSES.map((s) => [s, leads.filter((l) => l.status === s).length])
  ) as Record<LeadStatus, number>

  return (
    <main className="min-h-screen bg-navy-gradient px-6 py-10">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-2xl text-white">Funnel Leads</h1>
            <p className="font-sans text-sm text-white/40 mt-1">{leads.length} total submissions</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={exportCsv}
              disabled={leads.length === 0}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-card border border-white/10 text-white/70 hover:text-white hover:border-white/25 transition-colors font-sans text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export CSV
            </button>
            <div className="inline-flex bg-navy-card border border-white/10 rounded-lg p-1" role="tablist">
              {(['kanban', 'table'] as View[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={view === v}
                  onClick={() => changeView(v)}
                  className={`px-3 py-1.5 rounded-md font-sans text-xs uppercase tracking-wider transition-colors ${
                    view === v
                      ? 'bg-gold text-navy-dark font-semibold'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  {v === 'kanban' ? 'Kanban' : 'Table'}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setToken(''); sessionStorage.removeItem('sma_admin_token') }}
              className="font-sans text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Stage counts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {LEAD_STATUSES.map((s) => {
            const c = STATUS_COLOR[s]
            return (
              <div key={s} className="bg-navy-card border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                  <p className="font-sans text-[10px] text-white/40 uppercase tracking-wider truncate">{STATUS_LABEL[s]}</p>
                </div>
                <p className={`font-serif text-2xl ${c.text}`}>{counts[s]}</p>
              </div>
            )
          })}
        </div>

        {/* Segment + conversion analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SegmentStats leads={leads} />
          <ConversionStats leads={leads} />
        </div>

        {/* View */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : view === 'kanban' ? (
          <KanbanBoard leads={leads} token={token} onSelect={setSelectedLead} />
        ) : (
          <FunnelLeadsTable leads={leads} token={token} onSelect={setSelectedLead} />
        )}
      </div>

      {/* Slide-over details */}
      {selectedLead && (
        <LeadDetailsPanel lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </main>
  )
}
