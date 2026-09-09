'use client'

import { useEffect, useState } from 'react'
import { ModalBackdrop, ModalPanel } from '@/components/ui/Modal'

interface ScheduledEmail {
  id: string
  criteria: { sources?: string[]; eventTags?: string[]; segments?: string[]; statuses?: string[] }
  content: { subject: string }
  scheduled_at: string
  status: 'pending' | 'sent' | 'failed' | 'canceled'
  result: { sent?: number; failed?: number; totalMatched?: number; error?: string } | null
  created_at: string
  sent_at: string | null
}

const STATUS_STYLE: Record<ScheduledEmail['status'], string> = {
  pending: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  sent: 'bg-green-500/15 text-green-400 border-green-500/30',
  failed: 'bg-red-500/15 text-red-400 border-red-500/30',
  canceled: 'bg-white/5 text-white/40 border-white/15',
}

function criteriaSummary(c: ScheduledEmail['criteria']): string {
  const parts: string[] = []
  if (c.sources?.length) parts.push(c.sources.join('/'))
  if (c.eventTags?.length) parts.push(c.eventTags.join('/'))
  if (c.segments?.length) parts.push(c.segments.join('/'))
  if (c.statuses?.length) parts.push(c.statuses.join('/'))
  return parts.length > 0 ? parts.join(' · ') : 'Everyone'
}

interface Props {
  token: string
  onClose: () => void
}

export function ScheduledEmailsModal({ token, onClose }: Props) {
  const [items, setItems] = useState<ScheduledEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canceling, setCanceling] = useState<string | null>(null)

  function load() {
    setLoading(true)
    fetch('/api/admin/custom-email/schedule', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.scheduled) setItems(d.scheduled) })
      .catch(() => setError('Failed to load scheduled emails.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [token])

  async function cancel(id: string) {
    setCanceling(id)
    try {
      const res = await fetch(`/api/admin/custom-email/schedule/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Cancel failed')
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status: 'canceled' } : it)))
    } catch {
      setError('Failed to cancel.')
    } finally {
      setCanceling(null)
    }
  }

  const pending = items.filter((i) => i.status === 'pending')
  const history = items.filter((i) => i.status !== 'pending')

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalPanel className="bg-navy-card border border-white/10 rounded-2xl max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col overflow-hidden">
        <div className="shrink-0 px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-serif text-lg text-white">Scheduled Emails</h3>
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

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {error && <p className="font-sans text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}

              <div>
                <p className="font-sans text-[10px] uppercase tracking-wider text-white/30 mb-2">
                  Pending ({pending.length})
                </p>
                {pending.length === 0 ? (
                  <p className="font-sans text-xs text-white/25">Nothing scheduled right now.</p>
                ) : (
                  <div className="space-y-2">
                    {pending.map((it) => (
                      <div key={it.id} className="bg-navy border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-sans text-sm text-white truncate">{it.content.subject}</p>
                          <p className="font-sans text-xs text-white/40 mt-0.5">
                            {new Date(it.scheduled_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
                            {' · '}{criteriaSummary(it.criteria)}
                          </p>
                        </div>
                        <button
                          onClick={() => cancel(it.id)}
                          disabled={canceling === it.id}
                          className="shrink-0 font-sans text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-400/30 text-red-400 hover:bg-red-400/10 disabled:opacity-40 transition-colors"
                        >
                          {canceling === it.id ? 'Canceling…' : 'Cancel'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {history.length > 0 && (
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-wider text-white/30 mb-2">History</p>
                  <div className="space-y-2">
                    {history.map((it) => (
                      <div key={it.id} className="bg-navy border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-sans text-sm text-white/70 truncate">{it.content.subject}</p>
                          <p className="font-sans text-xs text-white/40 mt-0.5">
                            {new Date(it.scheduled_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
                            {it.status === 'sent' && it.result && (
                              <> · sent {it.result.sent}/{it.result.totalMatched}</>
                            )}
                            {it.status === 'failed' && it.result?.error && <> · {it.result.error}</>}
                          </p>
                        </div>
                        <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-sans font-medium border ${STATUS_STYLE[it.status]}`}>
                          {it.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ModalPanel>
    </ModalBackdrop>
  )
}
