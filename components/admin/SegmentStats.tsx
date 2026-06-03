import { SEGMENT_LABELS } from '@/lib/funnel-questions'
import type { FunnelSegment } from '@/types/funnel'

interface Lead { segment?: string | null }

const SEGMENTS: Array<FunnelSegment | 'general'> = [
  'pro', 'family', 'ofw', 'entrepreneur', 'business', 'hnw', 'general',
]
const LABEL: Record<string, string> = { ...SEGMENT_LABELS, general: 'General' }

export function SegmentStats({ leads }: { leads: Lead[] }) {
  const counts = SEGMENTS.map((s) => ({
    key: s,
    label: LABEL[s] ?? s,
    count: leads.filter((l) => (l.segment ?? 'general') === s).length,
  })).filter((s) => s.count > 0)

  if (counts.length === 0) return null

  return (
    <div className="bg-navy-card border border-white/5 rounded-xl p-4">
      <p className="font-sans text-[10px] uppercase tracking-wider text-white/40 mb-3">By Segment</p>
      <div className="flex flex-wrap gap-2">
        {counts.map((s) => (
          <span
            key={s.key}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-dark border border-white/10 font-sans text-xs"
          >
            <span className="text-white/70">{s.label}</span>
            <span className="text-gold font-medium">{s.count}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
