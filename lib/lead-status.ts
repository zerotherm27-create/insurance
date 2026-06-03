export const LEAD_STATUSES = [
  'new',
  'contacted',
  'engaged',
  'decision_pending',
  'closed_won',
  'closed_lost',
] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]

export const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'New Lead',
  contacted: 'Contacted',
  engaged: 'Engaged',
  decision_pending: 'Decision Pending',
  closed_won: 'Closed (Won)',
  closed_lost: 'Closed (Lost)',
}

export const STATUS_COLOR: Record<LeadStatus, { text: string; bg: string; border: string; dot: string }> = {
  new:              { text: 'text-blue-400',   bg: 'bg-blue-500/15',   border: 'border-blue-500/30',   dot: 'bg-blue-400' },
  contacted:        { text: 'text-gold',       bg: 'bg-gold/15',       border: 'border-gold/30',       dot: 'bg-gold' },
  engaged:          { text: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30', dot: 'bg-purple-400' },
  decision_pending: { text: 'text-amber-400',  bg: 'bg-amber-500/15',  border: 'border-amber-500/30',  dot: 'bg-amber-400' },
  closed_won:       { text: 'text-green-400',  bg: 'bg-green-500/15',  border: 'border-green-500/30',  dot: 'bg-green-400' },
  closed_lost:      { text: 'text-white/40',   bg: 'bg-white/5',       border: 'border-white/15',      dot: 'bg-white/40' },
}

// Terminal statuses — no further drip emails or follow-ups
export const TERMINAL_STATUSES: LeadStatus[] = ['closed_won', 'closed_lost']
