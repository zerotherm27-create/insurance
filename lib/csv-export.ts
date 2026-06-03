import { STATUS_LABEL, type LeadStatus } from '@/lib/lead-status'
import { SEGMENT_LABELS, getQuestions } from '@/lib/funnel-questions'
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

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return ''
  const s = String(v).replace(/"/g, '""')
  return /[",\n]/.test(s) ? `"${s}"` : s
}

export function leadsToCsv(leads: Lead[]): string {
  const headers = [
    'Date', 'Name', 'Mobile', 'Email', 'Segment', 'Status',
    'Protection Score', 'Score Label', 'Sequence Step', 'Last Emailed',
    'Biggest Gap', 'Recommendation', 'Estimated Range', 'Next Step',
    'Answers (Q → A)',
  ]
  const rows = leads.map((l) => {
    const segment = (l.segment as FunnelSegment | undefined) ?? undefined
    const questions = getQuestions(segment)
    const answersText = questions
      .map((q) => {
        const val = l.answers?.[q.field]
        const opt = q.options.find((o) => o.value === val)
        return `${q.question} → ${opt?.label ?? val ?? '(no answer)'}`
      })
      .join(' | ')

    return [
      new Date(l.created_at).toISOString(),
      l.first_name,
      l.mobile,
      l.email ?? '',
      segment ? SEGMENT_LABELS[segment] : 'General',
      STATUS_LABEL[l.status],
      l.protection_score,
      l.ai_report?.scoreLabel ?? '',
      l.sequence_step,
      l.last_emailed_at ? new Date(l.last_emailed_at).toISOString() : '',
      l.ai_report?.biggestGap ?? '',
      l.ai_report?.recommendation ?? '',
      l.ai_report?.estimatedRange ?? '',
      l.ai_report?.nextStep ?? '',
      answersText,
    ]
  })
  return [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\n')
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
