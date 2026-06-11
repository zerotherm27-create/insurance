'use client'

import { useState } from 'react'
import type { AdvisorPlaybook } from '@/types/funnel'

const TEMPERATURE_STYLE: Record<AdvisorPlaybook['leadTemperature'], { label: string; cls: string; dot: string }> = {
  hot:  { label: 'Hot lead',  cls: 'bg-red-500/15 text-red-300 border-red-500/30',     dot: 'bg-red-400' },
  warm: { label: 'Warm lead', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
  cold: { label: 'Cold lead', cls: 'bg-white/5 text-white/50 border-white/15',          dot: 'bg-white/40' },
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

interface Props {
  leadId: string
  token: string
  initialPlaybook: AdvisorPlaybook | null
  onGenerated: (pb: AdvisorPlaybook) => void
}

export function AdvisorPlaybookCard({ leadId, token, initialPlaybook, onGenerated }: Props) {
  const [playbook, setPlaybook] = useState<AdvisorPlaybook | null>(initialPlaybook)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/funnel-leads/${leadId}/playbook`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate playbook')
      setPlaybook(data.playbook)
      onGenerated(data.playbook)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate playbook')
    } finally {
      setLoading(false)
    }
  }

  // Empty state
  if (!playbook) {
    return (
      <section className="rounded-xl border border-gold/30 bg-gradient-to-br from-gold/[0.05] to-transparent p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-serif text-base text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Advisor Playbook
            </h3>
            <p className="font-sans text-xs text-white/50">
              Get AI-generated talking points, product recommendations, and objection handlers tailored to this lead.
            </p>
          </div>
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-navy-dark font-sans text-sm font-semibold hover:bg-gold-soft transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-navy-dark/40 border-t-navy-dark rounded-full animate-spin" />
                Generating…
              </>
            ) : (
              'Generate Playbook'
            )}
          </button>
        </div>
        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      </section>
    )
  }

  const temp = TEMPERATURE_STYLE[playbook.leadTemperature]

  return (
    <section className="rounded-xl border border-gold/30 bg-gradient-to-br from-gold/[0.05] to-transparent p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="font-serif text-base text-white flex items-center gap-2">
            <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Advisor Playbook
          </h3>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-medium border ${temp.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${temp.dot}`} />
            {temp.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-sans text-[10px] text-white/30">Generated {formatRelative(playbook.generatedAt)}</span>
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="font-sans text-xs text-gold hover:text-gold-soft transition-colors disabled:opacity-50"
          >
            {loading ? 'Regenerating…' : 'Regenerate'}
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <p className="font-sans text-xs text-white/60 italic">{playbook.temperatureReason}</p>

      {/* The case for protection */}
      {playbook.protectionCase && (
        <div className="rounded-lg border border-gold/20 bg-gold/[0.04] p-3.5">
          <p className="font-sans text-[10px] uppercase tracking-wider text-gold/70 mb-1.5">The case for protection</p>
          <p className="font-sans text-sm text-white/90 leading-relaxed">{playbook.protectionCase}</p>
        </div>
      )}

      {/* Opening approach */}
      <div>
        <p className="font-sans text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Opening approach</p>
        <p className="font-sans text-sm text-white leading-relaxed">{playbook.openingApproach}</p>
      </div>

      {/* Talking points */}
      {playbook.talkingPoints?.length > 0 && (
        <div>
          <p className="font-sans text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Talking points</p>
          <ul className="space-y-1.5">
            {playbook.talkingPoints.map((pt, i) => (
              <li key={i} className="font-sans text-sm text-white/80 flex gap-2">
                <span className="text-gold shrink-0">·</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pros & cons */}
      {(playbook.prosAndCons?.pros?.length || playbook.prosAndCons?.cons?.length) ? (
        <div>
          <p className="font-sans text-[10px] uppercase tracking-wider text-white/40 mb-2">Pros & cons to put on the table</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {playbook.prosAndCons?.pros?.length > 0 && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-3">
                <p className="font-sans text-[10px] uppercase tracking-wider text-emerald-400/70 mb-1.5">Pros</p>
                <ul className="space-y-1.5">
                  {playbook.prosAndCons.pros.map((p, i) => (
                    <li key={i} className="font-sans text-xs text-white/80 flex gap-2">
                      <span className="text-emerald-400/70 shrink-0">+</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {playbook.prosAndCons?.cons?.length > 0 && (
              <div className="rounded-lg border border-white/10 bg-navy-card p-3">
                <p className="font-sans text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Cons to be upfront about</p>
                <ul className="space-y-1.5">
                  {playbook.prosAndCons.cons.map((c, i) => (
                    <li key={i} className="font-sans text-xs text-white/70 flex gap-2">
                      <span className="text-white/40 shrink-0">−</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Discovery questions */}
      {playbook.discoveryQuestions?.length > 0 && (
        <div>
          <p className="font-sans text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Discovery questions</p>
          <ul className="space-y-1.5">
            {playbook.discoveryQuestions.map((q, i) => (
              <li key={i} className="font-sans text-sm text-white/80 flex gap-2">
                <span className="text-gold shrink-0">{i + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended products */}
      {playbook.recommendedProducts?.length > 0 && (
        <div>
          <p className="font-sans text-[10px] uppercase tracking-wider text-white/40 mb-2">Recommended products</p>
          <div className="space-y-2">
            {playbook.recommendedProducts.map((p) => (
              <div key={p.productId} className="bg-navy-card border border-white/10 rounded-lg p-3 space-y-1.5">
                <p className="font-serif text-sm text-white">{p.productName}</p>
                <p className="font-sans text-xs text-white/70 leading-relaxed">{p.whyForThisLead}</p>
                <p className="font-sans text-xs text-gold/80 italic">{p.positioningAngle}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SMART action plan */}
      {playbook.smartPlan && (
        <div>
          <p className="font-sans text-[10px] uppercase tracking-wider text-white/40 mb-2">SMART action plan</p>
          <div className="rounded-lg border border-white/10 bg-navy-card divide-y divide-white/5">
            {([
              ['Specific', playbook.smartPlan.specific],
              ['Measurable', playbook.smartPlan.measurable],
              ['Achievable', playbook.smartPlan.achievable],
              ['Relevant', playbook.smartPlan.relevant],
              ['Time-bound', playbook.smartPlan.timeBound],
            ] as const).map(([label, value]) =>
              value ? (
                <div key={label} className="flex gap-3 px-3 py-2">
                  <span className="font-sans text-[10px] uppercase tracking-wider text-gold/70 w-20 shrink-0 pt-0.5">{label}</span>
                  <span className="font-sans text-xs text-white/80 leading-relaxed">{value}</span>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Likely objections */}
      {playbook.likelyObjections?.length > 0 && (
        <div>
          <p className="font-sans text-[10px] uppercase tracking-wider text-white/40 mb-2">Likely objections & responses</p>
          <div className="space-y-2">
            {playbook.likelyObjections.map((o, i) => (
              <details key={i} className="bg-navy-card border border-white/5 rounded-lg group">
                <summary className="px-3 py-2 cursor-pointer font-sans text-xs text-white/80 list-none flex items-center justify-between">
                  <span>“{o.objection}”</span>
                  <svg className="w-3 h-3 text-white/40 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-3 pb-3 font-sans text-xs text-white/70 leading-relaxed border-t border-white/5 pt-2">
                  {o.response}
                </p>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Cross-sell */}
      {playbook.crossSellOpportunities?.length > 0 && (
        <div>
          <p className="font-sans text-[10px] uppercase tracking-wider text-white/40 mb-2">Cross-sell opportunities</p>
          <div className="flex flex-wrap gap-1.5">
            {playbook.crossSellOpportunities.map((c, i) => (
              <span key={i} className="inline-flex px-2.5 py-1 rounded-full bg-navy-card border border-white/10 font-sans text-xs text-white/70">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
