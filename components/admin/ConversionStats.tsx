import type { LeadStatus } from '@/lib/lead-status'

interface Lead { status: LeadStatus }

// Rate as % of leads that have advanced beyond a given stage
function pct(num: number, denom: number): string {
  if (denom === 0) return '—'
  return `${Math.round((num / denom) * 100)}%`
}

export function ConversionStats({ leads }: { leads: Lead[] }) {
  const total = leads.length
  if (total === 0) return null

  // Pipeline progression: leads that have moved past "new"
  const contacted = leads.filter((l) => l.status !== 'new').length
  // Engaged or later
  const engaged = leads.filter((l) =>
    ['engaged', 'decision_pending', 'closed_won', 'closed_lost'].includes(l.status)
  ).length
  const decisionStage = leads.filter((l) =>
    ['decision_pending', 'closed_won', 'closed_lost'].includes(l.status)
  ).length
  const closed = leads.filter((l) =>
    ['closed_won', 'closed_lost'].includes(l.status)
  ).length
  const won = leads.filter((l) => l.status === 'closed_won').length

  const steps = [
    { label: 'Contact rate', value: pct(contacted, total), sub: `${contacted}/${total} contacted` },
    { label: 'Engagement rate', value: pct(engaged, total), sub: `${engaged}/${total} engaged` },
    { label: 'Decision rate', value: pct(decisionStage, total), sub: `${decisionStage}/${total} in decision` },
    { label: 'Close rate', value: pct(won, closed || 0), sub: `${won}/${closed} won` },
  ]

  return (
    <div className="bg-navy-card border border-white/5 rounded-xl p-4">
      <p className="font-sans text-[10px] uppercase tracking-wider text-white/40 mb-3">Conversion Funnel</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map((s) => (
          <div key={s.label}>
            <p className="font-sans text-[10px] text-white/40">{s.label}</p>
            <p className="font-serif text-xl text-gold mt-0.5">{s.value}</p>
            <p className="font-sans text-[10px] text-white/30">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
