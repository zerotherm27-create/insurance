import type { GapInsight } from '@/types/gap'

interface InsightsPanelProps {
  insights: GapInsight[]
  highlightedModule?: string
  onHoverModule?: (moduleId: string | undefined) => void
}

export function InsightsPanel({ insights, highlightedModule, onHoverModule }: InsightsPanelProps) {
  if (insights.length === 0) return null
  return (
    <div>
      <p className="font-sans text-xs text-white/35 uppercase tracking-widest mb-2">Insights</p>
      <ul className="space-y-1.5" role="list">
        {insights.map((insight, i) => (
          <li
            key={i}
            onMouseEnter={() => onHoverModule?.(insight.moduleId)}
            onMouseLeave={() => onHoverModule?.(undefined)}
            className="font-sans text-xs text-white/60 leading-relaxed pl-3 py-2 pr-3 border-l-2 border-gold/40 bg-white/[0.04] rounded-r-lg"
          >
            {insight.text}
          </li>
        ))}
      </ul>
    </div>
  )
}
