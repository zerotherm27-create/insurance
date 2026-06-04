'use client'

import { useEffect, useRef } from 'react'
import { getQuestions, SEGMENT_LABELS } from '@/lib/funnel-questions'
import { STATUS_LABEL, STATUS_COLOR, type LeadStatus } from '@/lib/lead-status'
import { AdvisorPlaybookCard } from './AdvisorPlaybookCard'
import type { AdvisorPlaybook, FunnelAIReport, FunnelSegment } from '@/types/funnel'

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

const SNAPSHOT_COLOR: Record<string, string> = {
  '✅': 'text-green-400',
  '❌': 'text-red-400',
  '⚠️': 'text-amber-400',
}

/**
 * Creates a fully-expanded off-screen clone of the playbook area for capture.
 * Opens all <details> accordions, removes scroll/height constraints, renders
 * the complete content regardless of what was visible on screen.
 */
async function capturePlaybookCanvas(lead: Lead) {
  const { default: html2canvas } = await import('html2canvas')

  const el = document.getElementById('playbook-print-area')
  if (!el) return null

  // Clone into a full-width, unconstrained off-screen container
  const wrapper = document.createElement('div')
  wrapper.style.cssText = `
    position: fixed;
    top: -9999px;
    left: 0;
    width: 800px;
    background: #0A1628;
    padding: 24px;
    box-sizing: border-box;
    font-family: system-ui, sans-serif;
    overflow: visible;
  `

  // Add a print header using safe DOM methods (no innerHTML)
  const header = document.createElement('div')
  header.style.cssText = 'padding:16px 0 20px;border-bottom:1px solid rgba(255,255,255,0.1);margin-bottom:20px;'

  const label = document.createElement('p')
  label.style.cssText = 'font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:0.1em;text-transform:uppercase;margin:0 0 4px'
  label.textContent = 'Advisor Playbook · Confidential'

  const name = document.createElement('p')
  name.style.cssText = 'font-size:22px;color:#fff;font-family:Georgia,serif;margin:0'
  name.textContent = lead.first_name

  const meta = document.createElement('p')
  meta.style.cssText = 'font-size:11px;color:rgba(255,255,255,0.5);margin:4px 0 0'
  meta.textContent = [
    `Score ${lead.protection_score}`,
    lead.segment ?? 'General',
    new Date(lead.created_at).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }),
  ].join(' · ')

  header.appendChild(label)
  header.appendChild(name)
  header.appendChild(meta)
  wrapper.appendChild(header)

  // Deep clone the playbook content
  const clone = el.cloneNode(true) as HTMLElement
  clone.style.cssText = 'overflow: visible; height: auto; max-height: none; border-radius: 0;'

  // Open all <details> in clone
  clone.querySelectorAll('details').forEach((d) => d.setAttribute('open', ''))

  // Remove any overflow/height restrictions on inner elements
  clone.querySelectorAll('*').forEach((node) => {
    const el = node as HTMLElement
    if (el.style) {
      el.style.maxHeight = 'none'
      el.style.overflow = 'visible'
    }
  })

  wrapper.appendChild(clone)
  document.body.appendChild(wrapper)

  // Wait a tick for layout to settle
  await new Promise((r) => setTimeout(r, 100))

  try {
    const canvas = await html2canvas(wrapper, {
      backgroundColor: '#0A1628',
      scale: 2,
      useCORS: true,
      logging: false,
      width: wrapper.scrollWidth,
      height: wrapper.scrollHeight,
      windowWidth: wrapper.scrollWidth,
      windowHeight: wrapper.scrollHeight,
    })
    return canvas
  } finally {
    document.body.removeChild(wrapper)
  }
}

async function downloadPlaybookPDF(lead: Lead) {
  const { default: jsPDF } = await import('jspdf')

  const canvas = await capturePlaybookCanvas(lead)
  if (!canvas) return

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width
  const pageHeight = pdf.internal.pageSize.getHeight()

  let yOffset = 0
  while (yOffset < pdfHeight) {
    if (yOffset > 0) pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, -yOffset, pdfWidth, pdfHeight)
    yOffset += pageHeight
  }

  pdf.save(`playbook-${lead.first_name.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`)
}

async function downloadPlaybookImage(lead: Lead) {
  const canvas = await capturePlaybookCanvas(lead)
  if (!canvas) return

  const link = document.createElement('a')
  link.download = `playbook-${lead.first_name.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export function LeadDetailsPanel({
  lead,
  token,
  onClose,
  onPlaybookGenerated,
}: {
  lead: Lead
  token: string
  onClose: () => void
  onPlaybookGenerated?: (leadId: string, pb: AdvisorPlaybook) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

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
  const hasPlaybook = !!lead.advisor_playbook

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Scrim */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Centered modal */}
      <div
        ref={scrollRef}
        className="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col bg-navy-dark border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="shrink-0 bg-navy-dark/95 backdrop-blur border-b border-white/10 px-6 py-4 flex items-start justify-between gap-4">
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

          <div className="flex items-center gap-2 shrink-0">
            {/* Download buttons — only show when playbook exists */}
            {hasPlaybook && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => downloadPlaybookPDF(lead)}
                  title="Download playbook as PDF"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-navy-card border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-colors font-sans text-xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  PDF
                </button>
                <button
                  type="button"
                  onClick={() => downloadPlaybookImage(lead)}
                  title="Download playbook as image"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-navy-card border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-colors font-sans text-xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Image
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:bg-white/5 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
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

            {/* Advisor Playbook — printable area */}
            <div id="playbook-print-area" className="rounded-xl overflow-hidden">
              {/* Print header (only visible in export) */}
              <div className="hidden" id="print-only-header">
                <div className="bg-navy-dark p-6 border-b border-white/10">
                  <p className="font-sans text-xs text-white/40 uppercase tracking-widest mb-1">Advisor Playbook</p>
                  <h1 className="font-serif text-2xl text-white">{lead.first_name}</h1>
                  <p className="font-sans text-xs text-white/50 mt-1">
                    {segment ? SEGMENT_LABELS[segment] : 'General'} · Score: {lead.protection_score} · {new Date(lead.created_at).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <AdvisorPlaybookCard
                leadId={lead.id}
                token={token}
                initialPlaybook={lead.advisor_playbook ?? null}
                onGenerated={(pb) => onPlaybookGenerated?.(lead.id, pb)}
              />
            </div>

            {/* AI Report */}
            {report && (
              <section className="space-y-4">
                <h3 className="font-serif text-base text-white">AI Protection Report</h3>

                <div className="bg-navy-card border border-gold/20 rounded-xl p-4">
                  <p className="font-sans text-[10px] uppercase tracking-wider text-gold/70">Score Verdict</p>
                  <p className="font-serif text-lg text-white mt-1">{report.scoreLabel}</p>
                </div>

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
        </div>
      </div>
    </div>
  )
}
