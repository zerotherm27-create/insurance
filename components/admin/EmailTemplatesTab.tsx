'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ModalBackdrop, ModalPanel } from '@/components/ui/Modal'
import type { EmailTemplate } from '@/types/email-template'
import { EMAIL_ORDER, PREVIEW_VARS, SEGMENTS, segmentFollowupOrder, substituteVars } from '@/types/email-template'

interface Props {
  token: string
}

function templateColor(id: string): string {
  if (id === 'report')            return 'bg-gold/15 text-gold border-gold/20'
  if (id.startsWith('followup_1')) return 'bg-blue-500/15 text-blue-300 border-blue-400/20'
  if (id.startsWith('followup_2')) return 'bg-purple-500/15 text-purple-300 border-purple-400/20'
  if (id.startsWith('followup_3')) return 'bg-orange-500/15 text-orange-300 border-orange-400/20'
  if (id.startsWith('followup_4')) return 'bg-pink-500/15 text-pink-300 border-pink-400/20'
  return 'bg-white/10 text-white/50 border-white/10'
}

const inputCls =
  'w-full px-3 py-2 rounded-lg bg-navy border border-white/10 text-white font-sans text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 placeholder:text-white/20'

export function EmailTemplatesTab({ token }: Props) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [segmentFilter, setSegmentFilter] = useState<string>('general')
  const [selected, setSelected] = useState<string>('report')
  const [draft, setDraft] = useState<EmailTemplate | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [aiLoading, setAILoading] = useState(false)
  const [aiError, setAIError] = useState<string | null>(null)
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiHint, setAIHint] = useState('')

  useEffect(() => {
    setLoading(true)
    fetch('/api/admin/email-templates', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates ?? []))
      .catch(() => setFetchError('Failed to load email templates.'))
      .finally(() => setLoading(false))
  }, [token])

  const visibleTemplates: EmailTemplate[] = (() => {
    if (segmentFilter === 'general') {
      return EMAIL_ORDER.map((id) => templates.find((t) => t.id === id)).filter(Boolean) as EmailTemplate[]
    }
    return segmentFollowupOrder(segmentFilter)
      .map((id) => templates.find((t) => t.id === id))
      .filter(Boolean) as EmailTemplate[]
  })()

  const current = templates.find((t) => t.id === selected) ?? null
  const display = draft ?? current

  function select(id: string) {
    setSelected(id)
    setDraft(null)
    setSaveError(null)
  }

  function switchSegment(seg: string) {
    setSegmentFilter(seg)
    setDraft(null)
    setSaveError(null)
    if (seg === 'general') {
      setSelected('report')
    } else {
      setSelected(`followup_1_${seg}`)
    }
  }

  function startEdit() {
    if (!current) return
    setDraft({ ...current, paragraphs: [...current.paragraphs] })
    setSaveError(null)
  }

  function cancelEdit() {
    setDraft(null)
    setSaveError(null)
  }

  async function save() {
    if (!draft) return
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(`/api/admin/email-templates/${draft.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: draft.subject,
          heading: draft.heading,
          paragraphs: draft.paragraphs,
          cta_text: draft.cta_text,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = await res.json()
      setTemplates((prev) => prev.map((t) => (t.id === draft.id ? data.template : t)))
      setSavedId(draft.id)
      setDraft(null)
      setTimeout(() => setSavedId(null), 3000)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function generateWithAI() {
    if (!current) return
    setAILoading(true)
    setAIError(null)
    try {
      const res = await fetch('/api/admin/email-templates/generate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: current.id, hint: aiHint.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'AI generation failed')
      const c = data.content
      const base = draft ?? current
      setDraft({
        ...base,
        subject: c.subject ?? base.subject,
        heading: c.heading ?? base.heading,
        paragraphs: c.paragraphs ?? base.paragraphs,
        cta_text: c.cta_text ?? base.cta_text,
      })
      setShowAIModal(false)
      setAIHint('')
    } catch (e) {
      setAIError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setAILoading(false)
    }
  }

  function setParagraph(i: number, val: string) {
    if (!draft) return
    const p = [...draft.paragraphs]
    p[i] = val
    setDraft({ ...draft, paragraphs: p })
  }

  function addParagraph() {
    if (!draft) return
    setDraft({ ...draft, paragraphs: [...draft.paragraphs, ''] })
  }

  function removeParagraph(i: number) {
    if (!draft) return
    setDraft({ ...draft, paragraphs: draft.paragraphs.filter((_, idx) => idx !== i) })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="text-center py-20 space-y-2">
        <p className="text-red-400 font-sans text-sm">{fetchError}</p>
        <p className="text-white/30 font-sans text-xs">
          Apply migration <code className="font-mono">006_email_templates.sql</code> in Supabase first.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[260px_1fr] gap-6 items-start">
      {/* ── Sidebar ── */}
      <div className="space-y-1.5">
        {/* Segment filter pills */}
        <div className="flex flex-wrap gap-1.5 px-1 mb-3">
          <button
            onClick={() => switchSegment('general')}
            className={`font-sans text-[10px] px-2.5 py-1 rounded-full border transition-[background-color,border-color,color] ${
              segmentFilter === 'general'
                ? 'bg-gold/20 border-gold/40 text-gold'
                : 'border-white/10 text-white/35 hover:text-white/60 hover:border-white/20'
            }`}
          >
            General
          </button>
          {SEGMENTS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => switchSegment(value)}
              className={`font-sans text-[10px] px-2.5 py-1 rounded-full border transition-[background-color,border-color,color] ${
                segmentFilter === value
                  ? 'bg-gold/20 border-gold/40 text-gold'
                  : 'border-white/10 text-white/35 hover:text-white/60 hover:border-white/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {visibleTemplates.map((t, i) => (
          <button
            key={t.id}
            onClick={() => select(t.id)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-[background-color,border-color,color] ${
              selected === t.id
                ? 'bg-navy-card border-gold/30 text-white'
                : 'bg-navy-card/40 border-white/5 text-white/55 hover:text-white hover:bg-navy-card hover:border-white/15'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-serif text-base leading-none text-gold/50">{i + 1}</span>
              <span className="font-sans text-xs font-semibold leading-tight truncate flex-1">
                {t.label}
              </span>
              {savedId === t.id && (
                <span className="text-[10px] text-green-400 font-sans shrink-0">Saved ✓</span>
              )}
            </div>
            <span
              className={`inline-block font-sans text-[10px] px-2 py-0.5 rounded-full border ${templateColor(t.id)}`}
            >
              {t.timing.split(' — ')[0]}
            </span>
          </button>
        ))}

        <div className="mt-4 p-3 rounded-xl bg-navy-card/40 border border-white/5">
          <p className="font-sans text-[10px] uppercase tracking-wider text-white/25 mb-2">
            Template variables
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(PREVIEW_VARS).map((k) => (
              <code
                key={k}
                className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold border border-gold/15"
              >
                {`{${k}}`}
              </code>
            ))}
          </div>
          <p className="font-sans text-[10px] text-white/20 mt-2 leading-relaxed">
            These are replaced automatically when emails are sent.
          </p>
        </div>
      </div>

      {/* ── Editor + Preview ── */}
      {display && (
        <div className="bg-navy-card border border-white/5 rounded-2xl overflow-hidden">
          {/* Panel header */}
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-base text-white">{display.label}</h3>
              <p className="font-sans text-xs text-white/35 mt-0.5">{display.timing}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* AI Generate button — always visible */}
              <button
                onClick={() => { if (!draft) startEdit(); setShowAIModal(true) }}
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

              {draft ? (
                <>
                  <button
                    onClick={cancelEdit}
                    className="font-sans text-xs text-white/35 hover:text-white/60 transition-colors px-3 py-1.5 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="font-sans text-xs font-semibold px-4 py-1.5 rounded-lg bg-gold text-navy-dark hover:bg-gold-soft disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={startEdit}
                  className="font-sans text-xs font-semibold px-4 py-1.5 rounded-lg border border-white/15 text-white/60 hover:text-white hover:border-white/35 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">
            {/* ── Left: edit form ── */}
            <div className="space-y-5 min-w-0">
              {saveError && (
                <p className="text-red-400 font-sans text-xs bg-red-400/10 px-3 py-2 rounded-lg">
                  {saveError}
                </p>
              )}

              {/* Subject */}
              <FieldRow label="Subject line" note="variables allowed">
                {draft ? (
                  <input
                    value={draft.subject}
                    onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                    className={inputCls}
                  />
                ) : (
                  <HighlightedText text={display.subject} />
                )}
              </FieldRow>

              {/* Heading */}
              <FieldRow label="Email heading" note="variables allowed">
                {draft ? (
                  <input
                    value={draft.heading}
                    onChange={(e) => setDraft({ ...draft, heading: e.target.value })}
                    className={inputCls}
                  />
                ) : (
                  <HighlightedText text={display.heading} />
                )}
              </FieldRow>

              {/* Paragraphs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-sans text-[10px] uppercase tracking-wider text-white/40">
                    Body paragraphs
                    <span className="ml-2 normal-case text-white/20">variables allowed</span>
                  </label>
                </div>
                <div className="space-y-3">
                  {(draft?.paragraphs ?? display.paragraphs).map((p, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="font-sans text-[10px] text-white/20 mt-2.5 w-5 text-right shrink-0 select-none">
                        {i + 1}
                      </span>
                      {draft ? (
                        <>
                          <textarea
                            rows={3}
                            value={p}
                            onChange={(e) => setParagraph(i, e.target.value)}
                            className={`${inputCls} resize-y flex-1`}
                          />
                          <button
                            onClick={() => removeParagraph(i)}
                            title="Remove"
                            className="mt-2 text-white/20 hover:text-red-400 transition-colors shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <HighlightedText
                          text={p}
                          className="font-sans text-sm text-white/75 leading-relaxed flex-1"
                        />
                      )}
                    </div>
                  ))}
                  {draft && (
                    <button
                      onClick={addParagraph}
                      className="font-sans text-xs text-gold/60 hover:text-gold transition-colors flex items-center gap-1.5 ml-7"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Add paragraph
                    </button>
                  )}
                </div>
              </div>

              {/* CTA */}
              <FieldRow label="Button text">
                {draft ? (
                  <input
                    value={draft.cta_text}
                    onChange={(e) => setDraft({ ...draft, cta_text: e.target.value })}
                    className={inputCls}
                  />
                ) : (
                  <span className="font-sans text-sm text-white">{display.cta_text}</span>
                )}
              </FieldRow>
            </div>

            {/* ── Right: live preview ── */}
            <div className="min-w-0">
              <p className="font-sans text-[10px] uppercase tracking-wider text-white/30 mb-3">
                Preview — Maria, score 42
              </p>
              <EmailPreview template={display} />
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Modal */}
      <AnimatePresence>
        {showAIModal && current && (
          <ModalBackdrop onClose={() => { setShowAIModal(false); setAIError(null); setAIHint('') }}>
            <ModalPanel className="bg-navy-card border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-400/30 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-serif text-base text-white">Generate — {current.label}</h3>
                <p className="font-sans text-xs text-white/40">{current.timing}</p>
              </div>
            </div>

            <p className="font-sans text-sm text-white/50 leading-relaxed">
              AI will write the subject, heading, paragraphs, and CTA for this email using the right tone and timing. You can review and edit before saving.
            </p>

            <div>
              <label className="font-sans text-[10px] uppercase tracking-wider text-white/35 block mb-1.5">
                Optional hint (or leave blank for best practice)
              </label>
              <textarea
                rows={2}
                value={aiHint}
                onChange={(e) => setAIHint(e.target.value)}
                placeholder="e.g. Focus on health protection for young families…"
                className="w-full px-3 py-2.5 rounded-xl bg-navy border border-white/10 text-white font-sans text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/40 placeholder:text-white/20"
              />
            </div>

            {aiError && (
              <p className="font-sans text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{aiError}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setShowAIModal(false); setAIError(null); setAIHint('') }}
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
      </AnimatePresence>
    </div>
  )
}

/* ─── Helper components ─── */

function FieldRow({
  label,
  note,
  children,
}: {
  label: string
  note?: string
  children: React.ReactNode
}) {
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

function HighlightedText({
  text,
  className = 'font-sans text-sm text-white',
}: {
  text: string
  className?: string
}) {
  const parts = text.split(/(\{[a-zA-Z]+\})/g)
  return (
    <span className={className}>
      {parts.map((p, i) =>
        /^\{[a-zA-Z]+\}$/.test(p) ? (
          <span key={i} className="font-mono text-[11px] text-gold bg-gold/10 px-1 rounded">
            {p}
          </span>
        ) : (
          p
        )
      )}
    </span>
  )
}

function EmailPreview({ template }: { template: EmailTemplate }) {
  const sub = (t: string) => substituteVars(t, PREVIEW_VARS)
  return (
    <div className="rounded-xl overflow-hidden border border-white/10 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
      {/* Inbox chrome */}
      <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 space-y-1">
        <p className="font-sans text-[11px] text-gray-500">
          <span className="font-semibold text-gray-700">Subject: </span>
          {sub(template.subject)}
        </p>
        <p className="font-sans text-[10px] text-gray-400">
          From: Jojo from Safety Margin &lt;jojo@safetymargin.app&gt;
        </p>
      </div>
      {/* Email body */}
      <div className="bg-white p-5 space-y-4">
        <h2 className="font-serif text-lg font-bold text-gray-900 leading-snug">
          {sub(template.heading)}
        </h2>
        <div className="space-y-3">
          {template.paragraphs.map((p, i) => (
            <p key={i} className="font-sans text-gray-700 leading-relaxed text-sm">
              {sub(p)}
            </p>
          ))}
        </div>
        <div className="pt-1">
          <span
            className="inline-block font-sans font-semibold text-sm text-white px-5 py-2.5 rounded-lg"
            style={{ backgroundColor: '#0F1F3D' }}
          >
            {template.cta_text}
          </span>
        </div>
      </div>
    </div>
  )
}
