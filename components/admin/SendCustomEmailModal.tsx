'use client'

import { useState, useEffect, useMemo } from 'react'
import { ModalBackdrop, ModalPanel } from '@/components/ui/Modal'
import { PREVIEW_VARS, substituteVars } from '@/types/email-template'
import { SOURCE_LABEL } from '@/lib/lead-source'
import { LEAD_STATUSES, STATUS_LABEL } from '@/lib/lead-status'

const SEGMENTS = [
  { value: 'pro', label: 'Young Pro' },
  { value: 'family', label: 'Family' },
  { value: 'ofw', label: 'OFW' },
  { value: 'entrepreneur', label: 'Entrepreneur' },
  { value: 'business', label: 'Business' },
  { value: 'hnw', label: 'HNW' },
]

const SOURCES = Object.entries(SOURCE_LABEL).map(([value, label]) => ({ value, label }))

const inputCls =
  'w-full px-3 py-2 rounded-lg bg-navy border border-white/10 text-white font-sans text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 placeholder:text-white/20'

interface Props {
  token: string
  leads: { event_tag?: string | null }[]
  onClose: () => void
  onSent?: () => void
}

type SendResult = { sent: number; failed: number; totalMatched: number }

function Chips({
  options,
  active,
  onToggle,
  activeCls,
}: {
  options: { value: string; label: string }[]
  active: string[]
  onToggle: (value: string) => void
  activeCls: string
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-0.5">
      {options.map((o) => {
        const isActive = active.includes(o.value)
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onToggle(o.value)}
            className={`font-sans text-xs px-3 py-1 rounded-full border transition-[background-color,border-color,color] ${
              isActive ? activeCls : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/25'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function FieldRow({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-sans text-[10px] uppercase tracking-wider text-white/40">
        {label}
        {note && <span className="ml-2 normal-case text-white/20">{note}</span>}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

function CustomEmailPreview({
  subject,
  heading,
  paragraphs,
  ctaText,
}: {
  subject: string
  heading: string
  paragraphs: string[]
  ctaText: string
}) {
  const sub = (t: string) => substituteVars(t, PREVIEW_VARS)
  return (
    <div className="rounded-xl overflow-hidden border border-white/10 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
      <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 space-y-1">
        <p className="font-sans text-[11px] text-gray-500">
          <span className="font-semibold text-gray-700">Subject: </span>
          {sub(subject)}
        </p>
        <p className="font-sans text-[10px] text-gray-400">
          From: Jojo from Safety Margin &lt;jojo@safetymargin.app&gt;
        </p>
      </div>
      <div className="bg-white p-5 space-y-4">
        <h2 className="font-serif text-lg font-bold text-gray-900 leading-snug">{sub(heading)}</h2>
        <div className="space-y-3">
          {paragraphs.map((p, i) => (
            <p key={i} className="font-sans text-gray-700 leading-relaxed text-sm">{sub(p)}</p>
          ))}
        </div>
        <p className="font-sans text-gray-500 text-sm leading-relaxed">
          Ingat,<br />
          Jojo
        </p>
        <div className="pt-1 text-center space-y-3">
          <span
            className="inline-block font-sans font-semibold text-sm text-white px-5 py-2.5 rounded-lg"
            style={{ backgroundColor: '#F6B21A', color: '#0A1628' }}
          >
            {sub(ctaText)}
          </span>
          <p className="font-sans text-[11px] text-gray-400">
            Or{' '}
            <span className="text-[#F6B21A]">message me on Messenger</span>
            {' '}— whichever is easier for you.
          </p>
        </div>
      </div>
    </div>
  )
}

export function SendCustomEmailModal({ token, leads, onClose, onSent }: Props) {
  const availableEventTags = useMemo(
    () => Array.from(new Set(leads.map((l) => l.event_tag).filter((t): t is string => !!t))),
    [leads]
  )

  const [sources, setSources] = useState<string[]>([])
  const [eventTags, setEventTags] = useState<string[]>([])
  const [segments, setSegments] = useState<string[]>([])
  const [statuses, setStatuses] = useState<string[]>([])
  const [newEventTag, setNewEventTag] = useState('')

  const [matchCount, setMatchCount] = useState<number | null>(null)
  const [countLoading, setCountLoading] = useState(false)

  const [subject, setSubject] = useState('')
  const [heading, setHeading] = useState('')
  const [paragraphs, setParagraphs] = useState<string[]>([''])
  const [ctaText, setCtaText] = useState('Book a Free Call')

  const [showAIModal, setShowAIModal] = useState(false)
  const [aiHint, setAIHint] = useState('')
  const [aiSegment, setAISegment] = useState('')
  const [aiLoading, setAILoading] = useState(false)
  const [aiError, setAIError] = useState<string | null>(null)

  const [sendMode, setSendMode] = useState<'now' | 'schedule'>('now')
  const [scheduledAt, setScheduledAt] = useState('')
  const [minScheduledAt, setMinScheduledAt] = useState('')

  useEffect(() => {
    setMinScheduledAt(new Date(Date.now() + 60000).toISOString().slice(0, 16))
  }, [])

  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendResult, setSendResult] = useState<SendResult | null>(null)
  const [scheduleResult, setScheduleResult] = useState<{ scheduledAt: string } | null>(null)

  const [savingTemplate, setSavingTemplate] = useState(false)
  const [templateSaved, setTemplateSaved] = useState(false)
  const [templateError, setTemplateError] = useState<string | null>(null)

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  useEffect(() => {
    const t = setTimeout(() => {
      setCountLoading(true)
      fetch('/api/admin/custom-email', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun: true, criteria: { sources, eventTags, segments, statuses } }),
      })
        .then((r) => r.json())
        .then((d) => setMatchCount(typeof d.matched === 'number' ? d.matched : null))
        .catch(() => setMatchCount(null))
        .finally(() => setCountLoading(false))
    }, 400)
    return () => clearTimeout(t)
  }, [token, sources, eventTags, segments, statuses])

  function setParagraph(i: number, val: string) {
    const p = [...paragraphs]
    p[i] = val
    setParagraphs(p)
  }
  function addParagraph() {
    setParagraphs([...paragraphs, ''])
  }
  function removeParagraph(i: number) {
    setParagraphs(paragraphs.filter((_, idx) => idx !== i))
  }

  function addEventTag() {
    const tag = newEventTag.trim()
    if (!tag || eventTags.includes(tag)) return
    setEventTags([...eventTags, tag])
    setNewEventTag('')
  }

  async function generateWithAI() {
    setAILoading(true)
    setAIError(null)
    try {
      const res = await fetch('/api/admin/custom-email/generate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hint: aiHint.trim() || undefined,
          segment: aiSegment || undefined,
          eventTags,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'AI generation failed')
      const c = data.content
      setSubject(c.subject ?? subject)
      setHeading(c.heading ?? heading)
      setParagraphs(c.paragraphs ?? paragraphs)
      setCtaText(c.cta_text ?? ctaText)
      setShowAIModal(false)
      setAIHint('')
      setAISegment('')
    } catch (e) {
      setAIError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setAILoading(false)
    }
  }

  async function send() {
    setSending(true)
    setSendError(null)
    try {
      const res = await fetch('/api/admin/custom-email', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dryRun: false,
          criteria: { sources, eventTags, segments, statuses },
          content: { subject, heading, paragraphs, ctaText },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Send failed')
      setSendResult(data)
      onSent?.()
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Send failed')
    } finally {
      setSending(false)
    }
  }

  async function schedule() {
    setSending(true)
    setSendError(null)
    try {
      const iso = new Date(scheduledAt).toISOString()
      const res = await fetch('/api/admin/custom-email/schedule', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          criteria: { sources, eventTags, segments, statuses },
          content: { subject, heading, paragraphs, ctaText },
          scheduled_at: iso,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Scheduling failed')
      setScheduleResult({ scheduledAt: data.scheduled.scheduled_at })
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Scheduling failed')
    } finally {
      setSending(false)
    }
  }

  async function saveAsNurtureTemplate() {
    setSavingTemplate(true)
    setTemplateError(null)
    try {
      const createRes = await fetch('/api/admin/nurture-templates', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const created = await createRes.json()
      if (!createRes.ok) throw new Error(created.error ?? 'Failed to create template')

      const label = subject.trim().slice(0, 60) || created.template.label

      const putRes = await fetch(`/api/admin/nurture-templates/${created.template.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label,
          subject,
          heading,
          paragraphs,
          cta_text: ctaText,
          wait_days: 0,
          segments,
          sources,
          event_tags: eventTags,
        }),
      })
      const putData = await putRes.json()
      if (!putRes.ok) throw new Error(putData.error ?? 'Failed to save template')

      setTemplateSaved(true)
    } catch (err) {
      setTemplateError(err instanceof Error ? err.message : 'Failed to save template')
    } finally {
      setSavingTemplate(false)
    }
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalPanel className="bg-navy-card border border-white/10 rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="shrink-0 px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg text-white">Send Custom Email</h3>
            <p className="font-sans text-xs text-white/40 mt-0.5">
              One-off email to leads matching your filters below — e.g. everyone from a specific event.
            </p>
          </div>
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

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">
          <div className="space-y-5 min-w-0">
            {/* Recipient criteria */}
            <div className="bg-navy border border-white/5 rounded-xl p-4 space-y-4">
              <p className="font-sans text-xs uppercase tracking-wider text-white/40">Who receives this</p>

              <FieldRow label="Source" note="empty = any source">
                <Chips
                  options={SOURCES}
                  active={sources}
                  onToggle={(v) => toggle(sources, setSources, v)}
                  activeCls="bg-blue-500/20 border-blue-400/40 text-blue-300"
                />
              </FieldRow>

              <FieldRow label="Event" note="empty = no event filter">
                <Chips
                  options={availableEventTags.map((t) => ({ value: t, label: t }))}
                  active={eventTags}
                  onToggle={(v) => toggle(eventTags, setEventTags, v)}
                  activeCls="bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                />
                <div className="flex gap-2 mt-2">
                  <input
                    value={newEventTag}
                    onChange={(e) => setNewEventTag(e.target.value)}
                    placeholder="Add an event not listed above"
                    className={`${inputCls} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={addEventTag}
                    className="px-3 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/25 font-sans text-xs transition-colors"
                  >
                    Add
                  </button>
                </div>
              </FieldRow>

              <FieldRow label="Segment" note="empty = all segments">
                <Chips
                  options={SEGMENTS}
                  active={segments}
                  onToggle={(v) => toggle(segments, setSegments, v)}
                  activeCls="bg-gold/20 border-gold/40 text-gold"
                />
              </FieldRow>

              <FieldRow label="Status" note="empty = any status">
                <Chips
                  options={LEAD_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
                  active={statuses}
                  onToggle={(v) => toggle(statuses, setStatuses, v)}
                  activeCls="bg-purple-500/20 border-purple-400/40 text-purple-300"
                />
              </FieldRow>

              <p className="font-sans text-sm text-white/70">
                {countLoading ? (
                  'Counting…'
                ) : matchCount === null ? (
                  'Unable to count matching leads.'
                ) : (
                  <>
                    <span className="font-serif text-gold text-lg align-middle">{matchCount}</span>{' '}
                    lead{matchCount === 1 ? '' : 's'} match right now
                  </>
                )}
              </p>
            </div>

            {/* Compose */}
            <div className="flex items-center justify-between">
              <p className="font-sans text-xs uppercase tracking-wider text-white/40">Compose</p>
              <button
                type="button"
                onClick={() => setShowAIModal(true)}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-400/30 text-purple-300 hover:bg-purple-600/30 hover:border-purple-400/50 disabled:opacity-40 transition-colors"
              >
                {aiLoading ? (
                  <div className="w-3 h-3 border border-purple-300/30 border-t-purple-300 rounded-full animate-spin" />
                ) : (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )}
                Generate with AI
              </button>
            </div>

            <FieldRow label="Subject line" note="variables allowed">
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls} placeholder="Great meeting you, {firstName}!" />
            </FieldRow>

            <FieldRow label="Email heading" note="variables allowed">
              <input value={heading} onChange={(e) => setHeading(e.target.value)} className={inputCls} placeholder="Following up from the seminar" />
            </FieldRow>

            <div>
              <label className="font-sans text-[10px] uppercase tracking-wider text-white/40">
                Body paragraphs
                <span className="ml-2 normal-case text-white/20">variables allowed</span>
              </label>
              <div className="space-y-3 mt-1.5">
                {paragraphs.map((p, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="font-sans text-[10px] text-white/20 mt-2.5 w-5 text-right shrink-0 select-none">{i + 1}</span>
                    <textarea rows={3} value={p} onChange={(e) => setParagraph(i, e.target.value)} className={`${inputCls} resize-y flex-1`} />
                    <button onClick={() => removeParagraph(i)} title="Remove" className="mt-2 text-white/20 hover:text-red-400 transition-colors shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button onClick={addParagraph} className="font-sans text-xs text-gold/60 hover:text-gold transition-colors flex items-center gap-1.5 ml-7">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add paragraph
                </button>
              </div>
            </div>

            <FieldRow label="Button text">
              <input value={ctaText} onChange={(e) => setCtaText(e.target.value)} className={inputCls} />
            </FieldRow>

            {!sendResult && !scheduleResult && (
              <FieldRow label="When to send">
                <div className="flex gap-2 mt-0.5">
                  <button
                    type="button"
                    onClick={() => setSendMode('now')}
                    className={`font-sans text-xs px-3 py-1.5 rounded-full border transition-[background-color,border-color,color] ${
                      sendMode === 'now'
                        ? 'bg-gold/20 border-gold/40 text-gold'
                        : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/25'
                    }`}
                  >
                    Send now
                  </button>
                  <button
                    type="button"
                    onClick={() => setSendMode('schedule')}
                    className={`font-sans text-xs px-3 py-1.5 rounded-full border transition-[background-color,border-color,color] ${
                      sendMode === 'schedule'
                        ? 'bg-gold/20 border-gold/40 text-gold'
                        : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/25'
                    }`}
                  >
                    Schedule for later
                  </button>
                </div>
                {sendMode === 'schedule' && (
                  <>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      min={minScheduledAt}
                      className={`${inputCls} mt-2`}
                    />
                    <p className="font-sans text-[10px] text-white/20 mt-1.5 leading-relaxed">
                      Recipients are matched against your filters above at send time, not now — so a lead added or re-tagged before then is still included. Checked every 15 minutes.
                    </p>
                  </>
                )}
              </FieldRow>
            )}

            {sendError && (
              <p className="font-sans text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{sendError}</p>
            )}

            {scheduleResult ? (
              <div className="space-y-3 bg-navy border border-white/5 rounded-xl p-4">
                <p className="font-sans text-sm text-white">
                  Scheduled for{' '}
                  <span className="text-gold font-semibold">
                    {new Date(scheduleResult.scheduledAt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </p>
                <button onClick={onClose} className="w-full font-sans text-xs text-white/40 hover:text-white/70 transition-colors py-1">
                  Close
                </button>
              </div>
            ) : !sendResult ? (
              <button
                onClick={sendMode === 'schedule' ? schedule : send}
                disabled={
                  sending || !matchCount || !subject || !heading || !ctaText ||
                  (sendMode === 'schedule' && !scheduledAt)
                }
                className="w-full font-sans text-sm font-semibold py-2.5 rounded-lg bg-gold text-navy-dark hover:bg-gold-soft disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {sending
                  ? (sendMode === 'schedule' ? 'Scheduling…' : 'Sending…')
                  : sendMode === 'schedule'
                    ? 'Schedule email'
                    : matchCount ? `Send to ${matchCount} lead${matchCount === 1 ? '' : 's'}` : 'Send'}
              </button>
            ) : (
              <div className="space-y-3 bg-navy border border-white/5 rounded-xl p-4">
                <p className="font-sans text-sm text-white">
                  Sent to <span className="text-gold font-semibold">{sendResult.sent}</span> of {sendResult.totalMatched} leads
                  {sendResult.failed > 0 && <span className="text-red-400"> ({sendResult.failed} failed)</span>}
                </p>
                {templateError && (
                  <p className="font-sans text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{templateError}</p>
                )}
                {templateSaved ? (
                  <p className="font-sans text-xs text-green-400">
                    Saved to Nurture Series — future matching leads will get this automatically.
                  </p>
                ) : (
                  <button
                    onClick={saveAsNurtureTemplate}
                    disabled={savingTemplate}
                    className="w-full font-sans text-xs font-semibold px-4 py-2 rounded-lg border border-gold/40 text-gold hover:bg-gold/10 disabled:opacity-40 transition-colors"
                  >
                    {savingTemplate ? 'Saving…' : 'Save as Nurture Template'}
                  </button>
                )}
                <button onClick={onClose} className="w-full font-sans text-xs text-white/40 hover:text-white/70 transition-colors py-1">
                  Close
                </button>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="font-sans text-[10px] uppercase tracking-wider text-white/30 mb-3">Preview — Maria, score 42</p>
            <CustomEmailPreview subject={subject} heading={heading} paragraphs={paragraphs} ctaText={ctaText} />
          </div>
        </div>
      </ModalPanel>

      {showAIModal && (
        <ModalBackdrop onClose={() => { setShowAIModal(false); setAIError(null); setAIHint(''); setAISegment('') }}>
          <ModalPanel className="bg-navy-card border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-400/30 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-serif text-base text-white">Generate custom email</h3>
                <p className="font-sans text-xs text-white/40">AI writes the subject, heading, body, and CTA</p>
              </div>
            </div>

            <div>
              <label className="font-sans text-[10px] uppercase tracking-wider text-white/35 block mb-1.5">
                What's this email about?
              </label>
              <textarea
                rows={3}
                value={aiHint}
                onChange={(e) => setAIHint(e.target.value)}
                placeholder="e.g. Following up with everyone I met at the seminar last week…"
                className="w-full px-3 py-2.5 rounded-xl bg-navy border border-white/10 text-white font-sans text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/40 placeholder:text-white/20"
              />
              {eventTags.length > 0 && (
                <p className="font-sans text-[10px] text-white/20 mt-1.5">
                  AI will frame this as a follow-up to: {eventTags.join(', ')}
                </p>
              )}
            </div>

            <div>
              <label className="font-sans text-[10px] uppercase tracking-wider text-white/35 block mb-1.5">
                Write for segment (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {SEGMENTS.map((sg) => (
                  <button
                    key={sg.value}
                    type="button"
                    onClick={() => setAISegment((v) => v === sg.value ? '' : sg.value)}
                    className={`font-sans text-xs px-3 py-1 rounded-full border transition-[background-color,border-color,color] ${
                      aiSegment === sg.value
                        ? 'bg-purple-600/30 border-purple-400/50 text-purple-200'
                        : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/25'
                    }`}
                  >
                    {sg.label}
                  </button>
                ))}
              </div>
            </div>

            {aiError && (
              <p className="font-sans text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{aiError}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setShowAIModal(false); setAIError(null); setAIHint(''); setAISegment('') }}
                className="flex-1 font-sans text-sm text-white/40 hover:text-white/70 transition-colors py-2"
              >
                Cancel
              </button>
              <button
                onClick={generateWithAI}
                disabled={aiLoading}
                className="flex-1 font-sans text-sm font-semibold py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {aiLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating…</>
                ) : 'Generate content'}
              </button>
            </div>
          </ModalPanel>
        </ModalBackdrop>
      )}
    </ModalBackdrop>
  )
}
