'use client'

import { useState, useEffect } from 'react'
import { FunnelLeadsTable } from '@/components/admin/FunnelLeadsTable'
import { KanbanBoard } from '@/components/admin/KanbanBoard'
import { LeadDetailsPanel } from '@/components/admin/LeadDetailsPanel'
import { SegmentStats } from '@/components/admin/SegmentStats'
import { ConversionStats } from '@/components/admin/ConversionStats'
import { LEAD_STATUSES, STATUS_LABEL, STATUS_COLOR, type LeadStatus } from '@/lib/lead-status'
import { leadsToCsv, downloadCsv } from '@/lib/csv-export'
import { DECK_LINKS } from '@/lib/deck/segments'
import { ThemeToggle } from '@/components/admin/ThemeToggle'
import { EmailTemplatesTab } from '@/components/admin/EmailTemplatesTab'
import { FlowBuilderTab } from '@/components/admin/FlowBuilderTab'
import { NurtureSeriesTab } from '@/components/admin/NurtureSeriesTab'
import type { AdvisorPlaybook, FunnelAIReport } from '@/types/funnel'
import type { EmailTemplate } from '@/types/email-template'

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
  advisor_playbook?: AdvisorPlaybook | null
  status: LeadStatus
  sequence_step: number
  last_emailed_at?: string | null
}

type View = 'kanban' | 'table'
type MainTab = 'leads' | 'emails' | 'links'
type EmailSubTab = 'flow' | 'content' | 'nurture'

interface Bookmark {
  id: string
  label: string
  url: string
}

export default function AdminPage() {
  const [token, setToken] = useState('')
  const [inputToken, setInputToken] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('kanban')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>('leads')
  const [emailSubTab, setEmailSubTab] = useState<EmailSubTab>('flow')
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [newLabel, setNewLabel] = useState('')
  const [newUrl, setNewUrl] = useState('')

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('sma_admin_token')
      if (stored) {
        setToken(stored)
        fetchLeads(stored)
      }
      const v = localStorage.getItem('sma_admin_view')
      if (v === 'table' || v === 'kanban') setView(v)
      const raw = localStorage.getItem('sma_admin_bookmarks')
      if (raw) setBookmarks(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (mainTab !== 'emails' || !token || templates.length > 0) return
    fetch('/api/admin/email-templates', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.templates) setTemplates(d.templates) })
      .catch(() => {})
  }, [mainTab, token, templates.length])

  function changeView(v: View) {
    setView(v)
    try { localStorage.setItem('sma_admin_view', v) } catch {}
  }

  function addBookmark() {
    if (!newLabel.trim() || !newUrl.trim()) return
    const url = /^https?:\/\//i.test(newUrl.trim()) ? newUrl.trim() : 'https://' + newUrl.trim()
    const next = [...bookmarks, { id: Date.now().toString(), label: newLabel.trim(), url }]
    setBookmarks(next)
    setNewLabel('')
    setNewUrl('')
    try { localStorage.setItem('sma_admin_bookmarks', JSON.stringify(next)) } catch {}
  }

  function removeBookmark(id: string) {
    const next = bookmarks.filter((b) => b.id !== id)
    setBookmarks(next)
    try { localStorage.setItem('sma_admin_bookmarks', JSON.stringify(next)) } catch {}
  }

  async function handleStatusChange(id: string, status: LeadStatus) {
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
            <h1 className="font-serif text-2xl text-white">Advisor Dashboard</h1>
            <p className="font-sans text-sm text-white/40 mt-1">{leads.length} total submissions</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {mainTab === 'leads' && (
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
            )}
            {mainTab === 'leads' && (
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
            )}
            <ThemeToggle />
            <button
              onClick={() => { setToken(''); sessionStorage.removeItem('sma_admin_token') }}
              className="font-sans text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Main tab navigation */}
        <div className="flex gap-1 border-b border-white/5 pb-0">
          {([['leads', 'Leads'], ['emails', 'Email Automation'], ['links', 'Quick Links']] as [MainTab, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setMainTab(id)}
              className={`font-sans text-sm px-4 py-2 border-b-2 transition-colors -mb-px ${
                mainTab === id
                  ? 'border-gold text-white font-medium'
                  : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mainTab === 'leads' ? (
          <>
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
              <KanbanBoard leads={leads} onStatusChange={handleStatusChange} onSelect={(lead) => setSelectedLead(leads.find((l) => l.id === lead.id) ?? lead)} />
            ) : (
              <FunnelLeadsTable leads={leads} onStatusChange={handleStatusChange} onSelect={(lead) => setSelectedLead(leads.find((l) => l.id === lead.id) ?? lead)} />
            )}
          </>
        ) : mainTab === 'emails' ? (
          <div className="space-y-4">
            {/* Email sub-tab switcher */}
            <div className="inline-flex bg-navy-card border border-white/10 rounded-lg p-1" role="tablist">
              {([['flow', 'Flow Builder'], ['content', 'Email Content'], ['nurture', 'Nurture Series']] as [EmailSubTab, string][]).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={emailSubTab === id}
                  onClick={() => setEmailSubTab(id)}
                  className={`px-4 py-1.5 rounded-md font-sans text-xs font-medium transition-colors ${
                    emailSubTab === id
                      ? 'bg-gold text-navy-dark font-semibold'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {emailSubTab === 'flow' ? (
              <FlowBuilderTab token={token} templates={templates} />
            ) : emailSubTab === 'content' ? (
              <EmailTemplatesTab token={token} />
            ) : (
              <NurtureSeriesTab token={token} />
            )}
          </div>
        ) : mainTab === 'links' ? (
          <div className="space-y-8 pt-2">
            {/* Funnel Links */}
            <div className="space-y-3">
              <h2 className="font-sans text-xs text-white/30 uppercase tracking-widest">Funnel Links</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {([
                  ['pro', 'Pro'],
                  ['family', 'Family'],
                  ['ofw', 'OFW'],
                  ['entrepreneur', 'Entrepreneur'],
                  ['business', 'Business'],
                  ['hnw', 'HNW'],
                ] as [string, string][]).map(([slug, label]) => (
                  <a
                    key={slug}
                    href={`/funnel/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-navy-card border border-white/8 font-sans text-sm text-white/70 hover:text-gold hover:border-gold/20 transition-[color,border-color]"
                  >
                    <span>{label}</span>
                    <svg className="w-3.5 h-3.5 opacity-40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* My Bookmarks */}
            <div className="space-y-3">
              <h2 className="font-sans text-xs text-white/30 uppercase tracking-widest">My Bookmarks</h2>

              {/* Add form */}
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addBookmark()}
                  placeholder="Label"
                  className="flex-1 min-w-0 bg-navy-card border border-white/10 rounded-xl px-3 py-2 font-sans text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-[border-color] duration-150"
                />
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addBookmark()}
                  placeholder="URL"
                  className="flex-[2] min-w-0 bg-navy-card border border-white/10 rounded-xl px-3 py-2 font-sans text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-[border-color] duration-150"
                />
                <button
                  type="button"
                  onClick={addBookmark}
                  disabled={!newLabel.trim() || !newUrl.trim()}
                  className="shrink-0 px-4 py-2 bg-gold/15 hover:bg-gold/25 disabled:opacity-30 disabled:cursor-not-allowed text-gold font-sans text-sm font-semibold rounded-xl transition-[background-color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
                >
                  Add
                </button>
              </div>

              {/* Bookmark cards */}
              {bookmarks.length === 0 ? (
                <div className="border border-dashed border-white/10 rounded-xl px-4 py-3 text-center">
                  <p className="font-sans text-xs text-white/20">No bookmarks yet — add a link above</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {bookmarks.map((b) => (
                    <div key={b.id} className="group relative">
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-navy-card border border-white/8 font-sans text-sm text-white/70 hover:text-gold hover:border-gold/20 transition-[color,border-color] w-full"
                      >
                        <span className="truncate pr-1">{b.label}</span>
                        <svg className="w-3.5 h-3.5 opacity-40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      <button
                        type="button"
                        onClick={() => removeBookmark(b.id)}
                        aria-label={`Remove ${b.label}`}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-navy border border-white/15 text-white/30 hover:text-white/70 hover:border-white/30 items-center justify-center font-sans text-xs hidden group-hover:flex transition-[color,border-color] duration-150 focus:outline-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Financial Tools */}
            <div className="space-y-3">
              <h2 className="font-sans text-xs text-white/30 uppercase tracking-widest">Financial Tools</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <a
                  href="/protection-gap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-navy-card border border-white/8 font-sans text-sm text-white/70 hover:text-gold hover:border-gold/20 transition-[color,border-color]"
                >
                  <span>Protection Gap Calculator</span>
                  <svg className="w-3.5 h-3.5 opacity-40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Presentation Decks */}
            <div className="space-y-3">
              <h2 className="font-sans text-xs text-white/30 uppercase tracking-widest">Presentation Decks</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {DECK_LINKS.map(([slug, label]) => (
                  <a
                    key={slug}
                    href={`/deck/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-navy-card border border-white/8 font-sans text-sm text-white/70 hover:text-gold hover:border-gold/20 transition-[color,border-color]"
                  >
                    <span>{label}</span>
                    <svg className="w-3.5 h-3.5 opacity-40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Slide-over details */}
      {selectedLead && (
        <LeadDetailsPanel
          lead={selectedLead}
          token={token}
          onClose={() => setSelectedLead(null)}
          onPlaybookGenerated={(leadId, pb) => {
            setLeads((prev) =>
              prev.map((l) => (l.id === leadId ? { ...l, advisor_playbook: pb } : l))
            )
            setSelectedLead((cur) =>
              cur && cur.id === leadId ? { ...cur, advisor_playbook: pb } : cur
            )
          }}
        />
      )}
    </main>
  )
}
