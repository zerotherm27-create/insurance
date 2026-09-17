'use client'

import { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ModalBackdrop, ModalPanel } from '@/components/ui/Modal'
import type { AutomationFlow, FlowDefinition } from '@/types/automation-flow'
import type { FunnelSegment } from '@/types/funnel'
import { SOURCE_LABEL, type LeadSource } from '@/lib/lead-source'

interface ValidationError {
  message: string
}

const SEGMENTS: { value: FunnelSegment; label: string }[] = [
  { value: 'pro', label: 'Young Pro' },
  { value: 'family', label: 'Family' },
  { value: 'ofw', label: 'OFW' },
  { value: 'entrepreneur', label: 'Entrepreneur' },
  { value: 'business', label: 'Business' },
  { value: 'hnw', label: 'HNW' },
]

const SOURCES = Object.entries(SOURCE_LABEL).map(([value, label]) => ({ value: value as LeadSource, label }))

interface Props {
  savedFlow: AutomationFlow | null
  isDirty: boolean
  saving: boolean
  error: string | null
  validationErrors: ValidationError[]
  token: string
  flows: Omit<AutomationFlow, 'flow_json'>[]
  loadingFlows: boolean
  segments: FunnelSegment[]
  onSegmentsChange: (segments: FunnelSegment[]) => void
  professions: string[]
  onProfessionsChange: (professions: string[]) => void
  eventTags: string[]
  onEventTagsChange: (eventTags: string[]) => void
  sources: string[]
  onSourcesChange: (sources: string[]) => void
  leads: { profession?: string | null; event_tag?: string | null }[]
  onSave: (name: string) => void
  onActivate: () => void
  onNew: () => void
  onLoadFlow: (id: string) => void
  onAIGenerate: (flow: FlowDefinition) => void
}

export function FlowToolbar({
  savedFlow,
  isDirty,
  saving,
  error,
  validationErrors,
  token,
  flows,
  loadingFlows,
  segments,
  onSegmentsChange,
  professions,
  onProfessionsChange,
  eventTags,
  onEventTagsChange,
  sources,
  onSourcesChange,
  leads,
  onSave,
  onActivate,
  onNew,
  onLoadFlow,
  onAIGenerate,
}: Props) {
  const [name, setName] = useState(savedFlow?.name ?? 'My Flow')
  const [showActivateModal, setShowActivateModal] = useState(false)
  const [confirmCatchAll, setConfirmCatchAll] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiPrompt, setAIPrompt] = useState('')
  const [aiLoading, setAILoading] = useState(false)
  const [aiError, setAIError] = useState<string | null>(null)
  const [newProfession, setNewProfession] = useState('')
  const [newEventTag, setNewEventTag] = useState('')

  const availableProfessions = useMemo(
    () => Array.from(new Set([
      ...leads.map((l) => l.profession).filter((p): p is string => !!p),
      ...professions,
    ])),
    [leads, professions]
  )

  const availableEventTags = useMemo(
    () => Array.from(new Set([
      ...leads.map((l) => l.event_tag).filter((t): t is string => !!t),
      ...eventTags,
    ])),
    [leads, eventTags]
  )

  const hasNoTargeting = segments.length === 0 && professions.length === 0 && eventTags.length === 0 && sources.length === 0

  // "Who gets this flow?" is a plain-language switch on top of the four raw
  // filter facets: Everyone (all facets cleared) vs A specific group (reveals
  // the pickers below). Resets whenever a different flow is loaded (or New).
  const [targetMode, setTargetMode] = useState<'everyone' | 'specific'>(hasNoTargeting ? 'everyone' : 'specific')
  const [showMoreFilters, setShowMoreFilters] = useState(eventTags.length > 0 || sources.length > 0)

  // Re-derive targetMode/showMoreFilters only when switching to a different
  // saved (or new) flow — not on every keystroke while editing the current
  // one's filters. Adjusting state during render (rather than in an effect)
  // per https://react.dev/learn/you-might-not-need-an-effect.
  const [loadedFlowId, setLoadedFlowId] = useState<string | null>(savedFlow?.id ?? null)
  const currentFlowId = savedFlow?.id ?? null
  if (loadedFlowId !== currentFlowId) {
    setLoadedFlowId(currentFlowId)
    setTargetMode(hasNoTargeting ? 'everyone' : 'specific')
    setShowMoreFilters(eventTags.length > 0 || sources.length > 0)
  }

  function chooseEveryone() {
    setTargetMode('everyone')
    onSegmentsChange([])
    onProfessionsChange([])
    onEventTagsChange([])
    onSourcesChange([])
  }

  function chooseSpecific() {
    setTargetMode('specific')
  }

  async function callGenerate(prompt: string) {
    setAILoading(true)
    setAIError(null)
    try {
      const res = await fetch('/api/admin/automation-flows/generate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'AI generation failed')
      onAIGenerate(data.flow)
      setShowAIModal(false)
      setAIPrompt('')
    } catch (e) {
      setAIError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setAILoading(false)
    }
  }

  async function handleAIGenerate() {
    if (!aiPrompt.trim()) return
    await callGenerate(aiPrompt)
  }

  function toggleSegment(v: FunnelSegment) {
    onSegmentsChange(segments.includes(v) ? segments.filter((s) => s !== v) : [...segments, v])
  }

  function toggleProfession(v: string) {
    onProfessionsChange(professions.includes(v) ? professions.filter((p) => p !== v) : [...professions, v])
  }

  function addProfession() {
    const v = newProfession.trim()
    if (!v) return
    if (!professions.includes(v)) onProfessionsChange([...professions, v])
    setNewProfession('')
  }

  function toggleSource(v: LeadSource) {
    onSourcesChange(sources.includes(v) ? sources.filter((s) => s !== v) : [...sources, v])
  }

  function toggleEventTag(v: string) {
    onEventTagsChange(eventTags.includes(v) ? eventTags.filter((t) => t !== v) : [...eventTags, v])
  }

  function addEventTag() {
    const v = newEventTag.trim()
    if (!v) return
    if (!eventTags.includes(v)) onEventTagsChange([...eventTags, v])
    setNewEventTag('')
  }

  async function handleQuickGenerate() {
    await callGenerate(
      'Generate an optimized insurance lead nurture flow for Jojo. ' +
      'Best practice: Wait 1 day → Send followup_1 (re-engage). Wait 2 days → Check if lead status is engaged or decision_pending. ' +
      'YES (warm): Wait 2 days → Send followup_3 (conversion) → Wait 7 days → Send followup_4 (story). ' +
      'NO (cold): Send followup_2 (educational) → Wait 4 days → Check status again. ' +
      'If now warm: Send followup_3. If still cold: Wait 7 days → Send followup_4. ' +
      'Use statusValues: ["engaged","decision_pending"] for warm condition nodes.'
    )
  }

  const AI_EXAMPLES = [
    'Send a nurture email after 1 day. After 3 days, check if they are still new or contacted — if yes, send a cold follow-up. If engaged or decision_pending, send a warmer email.',
    'Simple sequence: wait 1 day, send follow-up 1. Wait 3 days, check status. If new, send follow-up 2 then wait 7 days and send follow-up 4. If engaged, send follow-up 3.',
    'Cold leads (new/contacted) get a 4-email nurture sequence with increasing wait times. Warm leads (engaged/decision_pending) get a single direct follow-up email after 2 days.',
  ]

  return (
    <>
      <div className="flex items-center gap-3 flex-wrap mb-4">
        {/* Flow selector */}
        {!loadingFlows && flows.length > 0 && (
          <select
            className="font-sans text-xs px-3 py-1.5 rounded-lg bg-navy-card border border-white/10 text-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
            value={savedFlow?.id ?? ''}
            onChange={(e) => { if (e.target.value) onLoadFlow(e.target.value) }}
          >
            <option value="">New unsaved flow</option>
            {flows.map((f) => {
              const segLabel = (f.segments ?? []).length === 0 ? 'Everyone' : (f.segments ?? []).join(', ')
              const profLabel = (f.professions ?? []).length > 0 ? ` + ${(f.professions ?? []).join(', ')}` : ''
              const eventLabel = (f.event_tags ?? []).length > 0 ? ` + ${(f.event_tags ?? []).join(', ')}` : ''
              const srcLabel = (f.sources ?? []).length > 0 ? ` + ${(f.sources ?? []).join(', ')}` : ''
              return (
                <option key={f.id} value={f.id}>
                  {f.name} — {segLabel}{profLabel}{eventLabel}{srcLabel}
                  {f.is_active ? ' (active)' : ''}
                </option>
              )
            })}
          </select>
        )}

        {/* Flow name */}
        <input
          className="font-sans text-sm px-3 py-1.5 rounded-lg bg-navy-card border border-white/10 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 w-44"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Flow name"
        />

        {/* Quick Generate — one-click best practice */}
        <button
          onClick={handleQuickGenerate}
          disabled={aiLoading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600 border border-purple-500 text-white hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-sans text-xs font-semibold"
          title="Generate the industry best-practice branching flow automatically"
        >
          {aiLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          Quick Generate
        </button>

        {/* Custom AI Generate */}
        <button
          onClick={() => setShowAIModal(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-400/30 text-purple-300 hover:bg-purple-600/30 hover:border-purple-400/50 transition-colors font-sans text-xs font-semibold"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Custom AI
        </button>

        <div className="flex-1" />

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-400/20">
            <svg className="w-3.5 h-3.5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-sans text-xs text-red-400">{validationErrors[0].message}</span>
          </div>
        )}

        {error && (
          <p className="font-sans text-xs text-red-400">{error}</p>
        )}

        {/* New */}
        <button
          onClick={onNew}
          className="font-sans text-xs text-white/30 hover:text-white/60 transition-colors px-2 py-1.5"
        >
          New
        </button>

        {/* Save */}
        <button
          onClick={() => onSave(name)}
          disabled={saving || validationErrors.length > 0}
          className="font-sans text-xs font-semibold px-4 py-1.5 rounded-lg border border-white/20 text-white/60 hover:text-white hover:border-white/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving…' : isDirty ? 'Save *' : 'Saved'}
        </button>

        {/* Activate */}
        {savedFlow && !savedFlow.is_active && (
          <button
            onClick={() => { setConfirmCatchAll(false); setShowActivateModal(true) }}
            disabled={saving || isDirty}
            className="font-sans text-xs font-semibold px-4 py-1.5 rounded-lg bg-gold text-navy-dark hover:bg-gold-soft disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Turn on
          </button>
        )}
        {savedFlow?.is_active && (
          <span className="font-sans text-xs text-green-400 px-3 py-1.5 rounded-lg bg-green-400/10 border border-green-400/20">
            Active
          </span>
        )}
      </div>

      {/* Who gets this flow? — plain-language targeting */}
      <div className="rounded-xl bg-navy-card/60 border border-white/10 p-4 space-y-3 mb-4">
        <p className="font-sans text-sm font-semibold text-white">Who gets this flow?</p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={chooseEveryone}
            className={`font-sans text-sm px-4 py-2 rounded-lg border transition-[background-color,border-color,color] ${
              targetMode === 'everyone'
                ? 'bg-gold/20 border-gold/40 text-gold'
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80 hover:border-white/25'
            }`}
          >
            Everyone
          </button>
          <button
            type="button"
            onClick={chooseSpecific}
            className={`font-sans text-sm px-4 py-2 rounded-lg border transition-[background-color,border-color,color] ${
              targetMode === 'specific'
                ? 'bg-gold/20 border-gold/40 text-gold'
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80 hover:border-white/25'
            }`}
          >
            A specific group
          </button>
        </div>

        {targetMode === 'everyone' && (
          <p className="font-sans text-xs text-white/40 leading-relaxed">
            Every lead gets this flow, unless another flow is already set up for their group.
          </p>
        )}

        {targetMode === 'specific' && (
          <div className="space-y-3 pt-1">
            {/* Group (segment) */}
            <div>
              <p className="font-sans text-xs text-white/50 mb-1.5">Which group?</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {SEGMENTS.map((sg) => {
                  const active = segments.includes(sg.value)
                  return (
                    <button
                      key={sg.value}
                      type="button"
                      onClick={() => toggleSegment(sg.value)}
                      className={`font-sans text-[11px] px-2.5 py-1 rounded-full border transition-[background-color,border-color,color] ${
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
            </div>

            {/* Job (profession) */}
            <div>
              <p className="font-sans text-xs text-white/50 mb-1.5">Only people with this job? <span className="text-white/25">(optional)</span></p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {availableProfessions.map((p) => {
                  const active = professions.includes(p)
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => toggleProfession(p)}
                      className={`font-sans text-[11px] px-2.5 py-1 rounded-full border transition-[background-color,border-color,color] ${
                        active
                          ? 'bg-blue-500/20 border-blue-400/40 text-blue-300'
                          : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/25'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
                <input
                  value={newProfession}
                  onChange={(e) => setNewProfession(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addProfession() } }}
                  onBlur={addProfession}
                  placeholder="Type a job and press Enter…"
                  className="font-sans text-[11px] px-2.5 py-1 w-40 rounded-full bg-white/5 border border-white/10 text-white/70 placeholder:text-white/25 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400/40"
                />
              </div>
            </div>

            {/* More filters: event + source, collapsed by default */}
            {!showMoreFilters && (
              <button
                type="button"
                onClick={() => setShowMoreFilters(true)}
                className="font-sans text-xs text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
              >
                + Also filter by event or signup type
              </button>
            )}

            {showMoreFilters && (
              <>
                <div>
                  <p className="font-sans text-xs text-white/50 mb-1.5">Only people from this event? <span className="text-white/25">(optional)</span></p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {availableEventTags.map((tag) => {
                      const active = eventTags.includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleEventTag(tag)}
                          className={`font-sans text-[11px] px-2.5 py-1 rounded-full border transition-[background-color,border-color,color] ${
                            active
                              ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                              : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/25'
                          }`}
                        >
                          {tag}
                        </button>
                      )
                    })}
                    <input
                      value={newEventTag}
                      onChange={(e) => setNewEventTag(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEventTag() } }}
                      onBlur={addEventTag}
                      placeholder="Type an event name and press Enter…"
                      className="font-sans text-[11px] px-2.5 py-1 w-44 rounded-full bg-white/5 border border-white/10 text-white/70 placeholder:text-white/25 focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400/40"
                    />
                  </div>
                </div>

                <div>
                  <p className="font-sans text-xs text-white/50 mb-1.5">Only people who signed up here? <span className="text-white/25">(optional)</span></p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {SOURCES.map((src) => {
                      const active = sources.includes(src.value)
                      return (
                        <button
                          key={src.value}
                          type="button"
                          onClick={() => toggleSource(src.value)}
                          className={`font-sans text-[11px] px-2.5 py-1 rounded-full border transition-[background-color,border-color,color] ${
                            active
                              ? 'bg-orange-500/20 border-orange-400/40 text-orange-300'
                              : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/25'
                          }`}
                        >
                          {src.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            {hasNoTargeting && (
              <p className="font-sans text-xs text-white/30 italic">
                You haven&apos;t picked anything yet, so this will act just like Everyone until you do.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Activate confirmation modal */}
      <AnimatePresence>
        {showActivateModal && (
          <ModalBackdrop onClose={() => setShowActivateModal(false)}>
            <ModalPanel className="bg-navy-card border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4">
              <h3 className="font-serif text-lg text-white">Turn this flow on?</h3>
              <p className="font-sans text-sm text-white/60 leading-relaxed">
                It will send to{' '}
                <strong className="text-white">
                  {hasNoTargeting
                    ? 'everyone'
                    : [
                        segments.length > 0 ? segments.map((s) => SEGMENTS.find((sg) => sg.value === s)?.label ?? s).join(', ') : null,
                        professions.length > 0 ? `who are ${professions.join(', ')}` : null,
                        eventTags.length > 0 ? `from ${eventTags.join(', ')}` : null,
                        sources.length > 0 ? `via ${sources.map((s) => SOURCE_LABEL[s as LeadSource] ?? s).join(', ')}` : null,
                      ].filter(Boolean).join(' ')}
                </strong>
                . Turning it on switches off any other flow set up for the exact same people, and restarts anyone already in this flow from the beginning. Flows for other groups keep running on their own.
              </p>
              {targetMode === 'specific' && hasNoTargeting && (
                <div className="rounded-xl bg-red-500/10 border border-red-400/20 p-3 space-y-2.5">
                  <p className="font-sans text-xs text-red-400 leading-relaxed">
                    You picked &quot;A specific group&quot; but haven&apos;t chosen anyone yet. This will act like Everyone.
                  </p>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmCatchAll}
                      onChange={(e) => setConfirmCatchAll(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span className="font-sans text-xs text-white/70">Yes, I mean everyone, not a mistake.</span>
                  </label>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowActivateModal(false)}
                  className="flex-1 font-sans text-sm text-white/40 hover:text-white/70 transition-colors py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowActivateModal(false); onActivate() }}
                  disabled={targetMode === 'specific' && hasNoTargeting && !confirmCatchAll}
                  className="flex-1 font-sans text-sm font-semibold py-2 rounded-lg bg-gold text-navy-dark hover:bg-gold-soft disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Yes, turn it on
                </button>
              </div>
            </ModalPanel>
          </ModalBackdrop>
        )}
      </AnimatePresence>

      {/* AI Generate modal */}
      <AnimatePresence>
        {showAIModal && (
          <ModalBackdrop onClose={() => { setShowAIModal(false); setAIError(null); setAIPrompt('') }}>
            <ModalPanel className="bg-navy-card border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-400/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg text-white">Generate flow with AI</h3>
            </div>

            <p className="font-sans text-sm text-white/50 leading-relaxed">
              Describe the automation you want in plain English. The AI will build the nodes and connections for you — you can always edit after.
            </p>

            <textarea
              rows={4}
              value={aiPrompt}
              onChange={(e) => setAIPrompt(e.target.value)}
              placeholder="e.g. Send a nurture email after 1 day. Check the lead's status — if they're new or contacted, continue the cold sequence. If they're engaged, send a warmer follow-up instead."
              className="w-full px-3 py-2.5 rounded-xl bg-navy border border-white/10 text-white font-sans text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/40 placeholder:text-white/20"
            />

            {/* Examples */}
            <div>
              <p className="font-sans text-[10px] uppercase tracking-wider text-white/25 mb-2">Examples — click to use</p>
              <div className="space-y-1.5">
                {AI_EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setAIPrompt(ex)}
                    className="w-full text-left font-sans text-xs text-white/40 hover:text-white/70 px-3 py-2 rounded-lg bg-navy/50 border border-white/5 hover:border-white/15 transition-colors leading-relaxed"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {aiError && (
              <p className="font-sans text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{aiError}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setShowAIModal(false); setAIError(null); setAIPrompt('') }}
                className="flex-1 font-sans text-sm text-white/40 hover:text-white/70 transition-colors py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAIGenerate}
                disabled={aiLoading || !aiPrompt.trim()}
                className="flex-1 font-sans text-sm font-semibold py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {aiLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating…
                  </>
                ) : 'Generate flow'}
              </button>
            </div>
            </ModalPanel>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    </>
  )
}
