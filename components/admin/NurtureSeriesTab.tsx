'use client'

import { useState, useEffect } from 'react'
import type { NurtureTemplate } from '@/types/nurture'
import { PREVIEW_VARS, substituteVars } from '@/types/email-template'

const SEGMENTS = [
  { value: 'pro', label: 'Young Pro' },
  { value: 'family', label: 'Family' },
  { value: 'ofw', label: 'OFW' },
  { value: 'entrepreneur', label: 'Entrepreneur' },
  { value: 'business', label: 'Business' },
  { value: 'hnw', label: 'HNW' },
]

interface Props {
  token: string
}

const inputCls =
  'w-full px-3 py-2 rounded-lg bg-navy border border-white/10 text-white font-sans text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 placeholder:text-white/20'

export function NurtureSeriesTab({ token }: Props) {
  const [templates, setTemplates] = useState<NurtureTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<NurtureTemplate | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [reordering, setReordering] = useState<string | null>(null)
  const [aiLoading, setAILoading] = useState(false)
  const [aiError, setAIError] = useState<string | null>(null)
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiHint, setAIHint] = useState('')
  const [showSeriesModal, setShowSeriesModal] = useState(false)
  const [seriesCount, setSeriesCount] = useState(5)
  const [seriesWaitDays, setSeriesWaitDays] = useState(3)
  const [seriesTheme, setSeriesTheme] = useState('')
  const [seriesSegment, setSeriesSegment] = useState('')
  const [seriesLoading, setSeriesLoading] = useState(false)
  const [seriesError, setSeriesError] = useState<string | null>(null)
  const [aiSegment, setAISegment] = useState('')

  useEffect(() => {
    setLoading(true)
    fetch('/api/admin/nurture-templates', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.templates) setTemplates(d.templates) })
      .catch(() => setFetchError('Failed to load nurture templates.'))
      .finally(() => setLoading(false))
  }, [token])

  const current = templates.find((t) => t.id === selectedId) ?? null
  const display = draft ?? current

  function select(id: string) {
    setSelectedId(id)
    setDraft(null)
    setSaveError(null)
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
      const res = await fetch(`/api/admin/nurture-templates/${draft.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: draft.label,
          subject: draft.subject,
          heading: draft.heading,
          paragraphs: draft.paragraphs,
          cta_text: draft.cta_text,
          wait_days: draft.wait_days,
          segments: draft.segments ?? [],
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

  async function addTemplate() {
    setAdding(true)
    try {
      const res = await fetch('/api/admin/nurture-templates', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to add')
      setTemplates((prev) => [...prev, data.template])
      setSelectedId(data.template.id)
      setDraft({ ...data.template, paragraphs: [...data.template.paragraphs] })
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Failed to add template')
    } finally {
      setAdding(false)
    }
  }

  async function deleteTemplate(id: string) {
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/nurture-templates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Delete failed')
      setTemplates((prev) => prev.filter((t) => t.id !== id))
      if (selectedId === id) { setSelectedId(null); setDraft(null) }
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  async function reorder(id: string, direction: 'up' | 'down') {
    setReordering(id)
    try {
      const res = await fetch('/api/admin/nurture-templates/reorder', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, direction }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Reorder failed')
      setTemplates(data.templates)
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Reorder failed')
    } finally {
      setReordering(null)
    }
  }

  async function generateSeries() {
    setSeriesLoading(true)
    setSeriesError(null)
    try {
      const startPosition = (templates[templates.length - 1]?.position ?? 0) + 1
      const res = await fetch('/api/admin/nurture-templates/generate-series', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: seriesCount,
          wait_days: seriesWaitDays,
          theme: seriesTheme.trim() || undefined,
          segment: seriesSegment || undefined,
          startPosition,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      setTemplates((prev) => [...prev, ...data.templates])
      if (data.templates.length > 0) setSelectedId(data.templates[0].id)
      setShowSeriesModal(false)
      setSeriesTheme('')
      setSeriesSegment('')
    } catch (e) {
      setSeriesError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setSeriesLoading(false)
    }
  }

  async function generateWithAI() {
    if (!current) return
    setAILoading(true)
    setAIError(null)
    try {
      const res = await fetch('/api/admin/nurture-templates/generate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position: current.position,
          label: current.label,
          hint: aiHint.trim() || undefined,
          segment: aiSegment || undefined,
        }),
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
      setAISegment('')
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
          Apply migration <code className="font-mono">010_nurture_templates.sql</code> in Supabase first.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[260px_1fr] gap-6 items-start">
      {/* ── Sidebar ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1 mb-3">
          <p className="font-sans text-[10px] uppercase tracking-widest text-white/30">
            Nurture series
          </p>
          <button
            onClick={() => setShowSeriesModal(true)}
            className="inline-flex items-center gap-1 font-sans text-[10px] font-semibold px-2 py-1 rounded-lg bg-purple-600/20 border border-purple-400/30 text-purple-300 hover:bg-purple-600/30 transition-colors"
          >
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Series
          </button>
        </div>

        {templates.length === 0 && (
          <p className="font-sans text-xs text-white/25 px-1 pb-2 leading-relaxed">
            No nurture emails yet. Add your first one below.
          </p>
        )}

        {templates.map((t, i) => (
          <div
            key={t.id}
            className={`group w-full text-left px-4 py-3 rounded-xl border transition-all ${
              selectedId === t.id
                ? 'bg-navy-card border-gold/30 text-white'
                : 'bg-navy-card/40 border-white/5 text-white/55 hover:text-white hover:bg-navy-card hover:border-white/15'
            }`}
          >
            <button className="w-full text-left" onClick={() => select(t.id)}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-serif text-base leading-none text-gold/50">{i + 1}</span>
                <span className="font-sans text-xs font-semibold leading-tight truncate flex-1">
                  {t.label}
                  {savedId === t.id && (
                    <span className="ml-1.5 text-[10px] text-green-400 font-sans">Saved ✓</span>
                  )}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 items-center">
                <span className="inline-block font-sans text-[10px] px-2 py-0.5 rounded-full border bg-teal-500/10 text-teal-300 border-teal-400/20">
                  Wait {t.wait_days}d
                </span>
                {(t.segments ?? []).length === 0 ? (
                  <span className="font-sans text-[10px] text-white/20">All segments</span>
                ) : (
                  (t.segments ?? []).map((s) => (
                    <span key={s} className="inline-block font-sans text-[10px] px-1.5 py-0.5 rounded-full bg-gold/10 text-gold/70 border border-gold/15">
                      {SEGMENTS.find((sg) => sg.value === s)?.label ?? s}
                    </span>
                  ))
                )}
              </div>
            </button>

            {/* Row actions */}
            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-[opacity]">
              <button
                onClick={() => reorder(t.id, 'up')}
                disabled={i === 0 || reordering === t.id}
                title="Move up"
                className="p-1 rounded text-white/25 hover:text-white/70 disabled:opacity-20 disabled:cursor-not-allowed transition-[color]"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                onClick={() => reorder(t.id, 'down')}
                disabled={i === templates.length - 1 || reordering === t.id}
                title="Move down"
                className="p-1 rounded text-white/25 hover:text-white/70 disabled:opacity-20 disabled:cursor-not-allowed transition-[color]"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                onClick={() => deleteTemplate(t.id)}
                disabled={deleting === t.id}
                title="Delete"
                className="ml-auto p-1 rounded text-white/20 hover:text-red-400 disabled:opacity-20 transition-[color]"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addTemplate}
          disabled={adding}
          className="w-full mt-2 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-dashed border-white/15 text-white/35 hover:text-white/60 hover:border-white/30 font-sans text-xs transition-[color,border-color] disabled:opacity-40 disabled:cursor-wait"
        >
          {adding ? (
            <div className="w-3 h-3 border border-white/30 border-t-white/70 rounded-full animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          )}
          Add nurture email
        </button>

        {/* Variable reference */}
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
        </div>
      </div>

      {/* ── Editor + Preview ── */}
      {display ? (
        <div className="bg-navy-card border border-white/5 rounded-2xl overflow-hidden">
          {/* Panel header */}
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-base text-white">{display.label}</h3>
              <p className="font-sans text-xs text-white/35 mt-0.5">
                Sent {display.wait_days} day{display.wait_days !== 1 ? 's' : ''} after previous email
              </p>
            </div>
            <div className="flex items-center gap-2">
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

              {/* Label + wait_days */}
              <div className="grid grid-cols-2 gap-4">
                <FieldRow label="Label (admin only)">
                  {draft ? (
                    <input
                      value={draft.label}
                      onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                      className={inputCls}
                    />
                  ) : (
                    <span className="font-sans text-sm text-white">{display.label}</span>
                  )}
                </FieldRow>
                <FieldRow label="Wait (days before sending)">
                  {draft ? (
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={draft.wait_days}
                      onChange={(e) => setDraft({ ...draft, wait_days: Number(e.target.value) })}
                      className={inputCls}
                    />
                  ) : (
                    <span className="font-sans text-sm text-white">{display.wait_days} days</span>
                  )}
                </FieldRow>
              </div>

              {/* Target segments */}
              <FieldRow label="Target segments" note="empty = all segments">
                <div className="flex flex-wrap gap-2 mt-0.5">
                  {SEGMENTS.map((sg) => {
                    const active = (draft?.segments ?? display.segments ?? []).includes(sg.value)
                    return (
                      <button
                        key={sg.value}
                        type="button"
                        onClick={() => {
                          if (!draft) startEdit()
                          setDraft((d) => {
                            if (!d) return d
                            const segs = d.segments ?? []
                            return {
                              ...d,
                              segments: active
                                ? segs.filter((s) => s !== sg.value)
                                : [...segs, sg.value],
                            }
                          })
                        }}
                        className={`font-sans text-xs px-3 py-1 rounded-full border transition-[background-color,border-color,color] ${
                          active
                            ? 'bg-gold/20 border-gold/40 text-gold'
                            : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/25'
                        }`}
                      >
                        {sg.label}
                      </button>
                    )
                  })}
                </div>
              </FieldRow>

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
                <label className="font-sans text-[10px] uppercase tracking-wider text-white/40">
                  Body paragraphs
                  <span className="ml-2 normal-case text-white/20">variables allowed</span>
                </label>
                <div className="space-y-3 mt-1.5">
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
              <NurtureEmailPreview template={display} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-20 text-white/20 font-sans text-sm">
          Select a nurture email to edit it
        </div>
      )}

      {/* Generate Series Modal */}
      {showSeriesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-navy-card border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-400/30 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-serif text-base text-white">Generate Nurture Series</h3>
                <p className="font-sans text-xs text-white/40">AI writes a full batch of emails at once</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-sans text-[10px] uppercase tracking-wider text-white/35 block mb-1.5">
                  Number of emails
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={seriesCount}
                  onChange={(e) => setSeriesCount(Number(e.target.value))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="font-sans text-[10px] uppercase tracking-wider text-white/35 block mb-1.5">
                  Days between each
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={seriesWaitDays}
                  onChange={(e) => setSeriesWaitDays(Number(e.target.value))}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className="font-sans text-[10px] uppercase tracking-wider text-white/35 block mb-1.5">
                Theme or topic (optional)
              </label>
              <textarea
                rows={2}
                value={seriesTheme}
                onChange={(e) => setSeriesTheme(e.target.value)}
                placeholder="e.g. Stories about OFW families, common insurance mistakes, why term vs whole life…"
                className="w-full px-3 py-2.5 rounded-xl bg-navy border border-white/10 text-white font-sans text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/40 placeholder:text-white/20"
              />
              <p className="font-sans text-[10px] text-white/20 mt-1.5 leading-relaxed">
                Leave blank for a mix of stories, tips, and relatable scenarios.
              </p>
            </div>

            <div>
              <label className="font-sans text-[10px] uppercase tracking-wider text-white/35 block mb-1.5">
                Target segment (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {SEGMENTS.map((sg) => (
                  <button
                    key={sg.value}
                    type="button"
                    onClick={() => setSeriesSegment((v) => v === sg.value ? '' : sg.value)}
                    className={`font-sans text-xs px-3 py-1 rounded-full border transition-[background-color,border-color,color] ${
                      seriesSegment === sg.value
                        ? 'bg-purple-600/30 border-purple-400/50 text-purple-200'
                        : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/25'
                    }`}
                  >
                    {sg.label}
                  </button>
                ))}
              </div>
              <p className="font-sans text-[10px] text-white/20 mt-1.5">
                Leave unselected to write for all segments.
              </p>
            </div>

            {seriesError && (
              <p className="font-sans text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{seriesError}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setShowSeriesModal(false); setSeriesError(null); setSeriesSegment('') }}
                className="flex-1 font-sans text-sm text-white/40 hover:text-white/70 transition-colors py-2"
              >
                Cancel
              </button>
              <button
                onClick={generateSeries}
                disabled={seriesLoading}
                className="flex-1 font-sans text-sm font-semibold py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {seriesLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating {seriesCount} emails…</>
                ) : `Generate ${seriesCount} emails`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Modal */}
      {showAIModal && current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-navy-card border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-400/30 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-serif text-base text-white">Generate — {current.label}</h3>
                <p className="font-sans text-xs text-white/40">Nurture email #{current.position}</p>
              </div>
            </div>

            <p className="font-sans text-sm text-white/50 leading-relaxed">
              AI will write a story or insurance tip email in Jojo's voice. You can review and edit before saving.
            </p>

            <div>
              <label className="font-sans text-[10px] uppercase tracking-wider text-white/35 block mb-1.5">
                Topic or hint (optional)
              </label>
              <textarea
                rows={2}
                value={aiHint}
                onChange={(e) => setAIHint(e.target.value)}
                placeholder="e.g. A story about an OFW who wasn't covered when something happened…"
                className="w-full px-3 py-2.5 rounded-xl bg-navy border border-white/10 text-white font-sans text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/40 placeholder:text-white/20"
              />
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
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Helper components ─── */

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

function HighlightedText({ text, className = 'font-sans text-sm text-white' }: { text: string; className?: string }) {
  const parts = text.split(/(\{[a-zA-Z]+\})/g)
  return (
    <span className={className}>
      {parts.map((p, i) =>
        /^\{[a-zA-Z]+\}$/.test(p) ? (
          <span key={i} className="font-mono text-[11px] text-gold bg-gold/10 px-1 rounded">{p}</span>
        ) : p
      )}
    </span>
  )
}

function NurtureEmailPreview({ template }: { template: NurtureTemplate }) {
  const sub = (t: string) => substituteVars(t, PREVIEW_VARS)
  return (
    <div className="rounded-xl overflow-hidden border border-white/10 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
      <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 space-y-1">
        <p className="font-sans text-[11px] text-gray-500">
          <span className="font-semibold text-gray-700">Subject: </span>
          {sub(template.subject)}
        </p>
        <p className="font-sans text-[10px] text-gray-400">
          From: Jojo from Safety Margin &lt;jojo@safetymargin.app&gt;
        </p>
      </div>
      <div className="bg-white p-5 space-y-4">
        <h2 className="font-serif text-lg font-bold text-gray-900 leading-snug">
          {sub(template.heading)}
        </h2>
        <div className="space-y-3">
          {template.paragraphs.map((p, i) => (
            <p key={i} className="font-sans text-gray-700 leading-relaxed text-sm">{sub(p)}</p>
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
