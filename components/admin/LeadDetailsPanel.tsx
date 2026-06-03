'use client'

import { useEffect } from 'react'
import { getQuestions, SEGMENT_LABELS } from '@/lib/funnel-questions'
import { STATUS_LABEL, STATUS_COLOR, type LeadStatus } from '@/lib/lead-status'
import type { FunnelAIReport, FunnelSegment } from '@/types/funnel'

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

const SNAPSHOT_COLOR: Record<string, string> = {
  '✅': 'text-green-400',
  '❌': 'text-red-400',
  '⚠️': 'text-amber-400',
}

export function LeadDetailsPanel({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  useEffect(() => {
    function onEsc(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onEsc)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onEsc); document.body.style.overflow = '' }
  }, [onClose])

  const segment = (lead.segment as FunnelSegment | undefined) ?? undefined
  const questions = getQuestions(segment)
  const report = lead.ai_report
  const c = STATUS_COLOR[lead.status]

  return (
    <div className="fixed inset-0 z-50">
      {/* Scrim */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />
      {/* Panel */}
      <aside className="absolute right-0 top-0 h-full w-full max-w-2xl bg-navy-dark border-l border-white/10 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-navy-dark/95 backdrop-blur border-b border-white/10 px-6 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-serif text-xl text-white truncate">{lead.first_name}</h2>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-medium border ${c.bg} ${c.text} ${c.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                {STATUS_LABEL[lead.status]}
              </span>
            </div>
            <p className="font-sans text-xs text-white/40 mt-1">
              {segment ? SEGMENT_LABELS[segment] : 'General'} · Submitted{' '}
              {new Date(lead.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:bg-white/5 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Contact + score */}
          <section className="grid grid-cols-2 gap-3">
            <div className="bg-navy-card border border-white/5 rounded-lg p-3">
              <p className="font-sans text-[10px] uppercase tracking-wider text-white/40">Mobile</p>
              <p className="font-sans text-sm text-white mt-1">{lead.mobile}</p>
            </div>
            <div className="bg-navy-card border border-white/5 rounded-lg p-3">
              <p className="font-sans text-[10px] uppercase tracking-wider text-white/40">Email</p>
              <p className="font-sans text-sm text-white mt-1 truncate">{lead.email ?? '—'}</p>
            </div>
            <div className="bg-navy-card border border-white/5 rounded-lg p-3">
              <p className="font-sans text-[10px] uppercase tracking-wider text-white/40">Protection Score</p>
              <p className="font-serif text-2xl text-gold mt-1">{lead.protection_score}</p>
            </div>
            <div className="bg-navy-card border border-white/5 rounded-lg p-3">
              <p className="font-sans text-[10px] uppercase tracking-wider text-white/40">Sequence Step</p>
              <p className="font-sans text-sm text-white mt-1">
                Step {lead.sequence_step}
                {lead.last_emailed_at && (
                  <span className="block text-xs text-white/40">
                    Last emailed {new Date(lead.last_emailed_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </p>
            </div>
          </section>

          {/* AI Report */}
          {report && (
            <section className="space-y-4">
              <h3 className="font-serif text-base text-white">AI Protection Report</h3>

              <div className="bg-navy-card border border-gold/20 rounded-xl p-4">
                <p className="font-sans text-[10px] uppercase tracking-wider text-gold/70">Score Verdict</p>
                <p className="font-serif text-lg text-white mt-1">{report.scoreLabel}</p>
              </div>

              {/* Snapshot */}
              {report.snapshot?.length > 0 && (
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-wider text-white/40 mb-2">Snapshot</p>
                  <ul className="space-y-1.5">
                    {report.snapshot.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm font-sans">
                        <span className={`shrink-0 ${SNAPSHOT_COLOR[s.icon] ?? 'text-white/60'}`}>{s.icon}</span>
                        <span className="text-white/80">{s.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-wider text-white/40 mb-1">Biggest Gap</p>
                  <p className="font-sans text-sm text-white/80 leading-relaxed">{report.biggestGap}</p>
                </div>
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-wider text-white/40 mb-1">Recommendation</p>
                  <p className="font-sans text-sm text-white/80 leading-relaxed">{report.recommendation}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-navy-card border border-white/5 rounded-lg p-3">
                    <p className="font-sans text-[10px] uppercase tracking-wider text-white/40">Estimated Range</p>
                    <p className="font-sans text-sm text-white mt-1">{report.estimatedRange}</p>
                  </div>
                  <div className="bg-navy-card border border-white/5 rounded-lg p-3">
                    <p className="font-sans text-[10px] uppercase tracking-wider text-white/40">Next Step</p>
                    <p className="font-sans text-sm text-white mt-1">{report.nextStep}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Questionnaire */}
          {lead.answers && Object.keys(lead.answers).length > 0 && (
            <section className="space-y-3">
              <h3 className="font-serif text-base text-white">Questionnaire Answers</h3>
              <div className="space-y-2">
                {questions.map((q) => {
                  const val = lead.answers?.[q.field]
                  const opt = q.options.find((o) => o.value === val)
                  return (
                    <div key={q.field} className="bg-navy-card border border-white/5 rounded-lg p-3">
                      <p className="font-sans text-xs text-white/50 leading-snug">{q.question}</p>
                      <p className="font-sans text-sm text-white mt-1.5">
                        {opt?.label ?? val ?? <span className="text-white/30">(no answer)</span>}
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </aside>
    </div>
  )
}
