import { cn } from '@/lib/utils'
import type { GapRecommendation } from '@/types/gap'

const URGENCY_LABEL: Record<GapRecommendation['urgency'], string> = {
  immediate: 'Immediate',
  within_3mo: '3 months',
  within_1yr: '1 year',
}

const URGENCY_CLASS: Record<GapRecommendation['urgency'], string> = {
  immediate: 'bg-red-500/15 text-red-400',
  within_3mo: 'bg-gold/10 text-gold',
  within_1yr: 'bg-white/10 text-white/50',
}

interface RecommendationsPanelProps {
  recommendations: GapRecommendation[]
}

export function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  if (recommendations.length === 0) return null
  return (
    <div>
      <p className="font-sans text-xs text-white/35 uppercase tracking-widest mb-2">
        Priority actions
      </p>
      <ol className="space-y-2" role="list">
        {recommendations.map((rec) => (
          <li key={rec.priority} className="bg-navy-card border border-white/10 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 h-5 shrink-0 bg-gold/15 rounded-full flex items-center justify-center font-sans text-xs font-semibold text-gold">
                {rec.priority}
              </span>
              <span className="font-sans text-xs text-white/80 font-medium flex-1 leading-snug">
                {rec.label}
              </span>
              <span
                className={cn(
                  'font-sans text-xs font-medium px-2 py-0.5 rounded-full shrink-0',
                  URGENCY_CLASS[rec.urgency]
                )}
              >
                {URGENCY_LABEL[rec.urgency]}
              </span>
            </div>
            <p className="font-sans text-xs text-white/40 leading-relaxed mb-1">
              {rec.rationale}
            </p>
            <p className="font-sans text-xs text-gold font-medium">{rec.estimatedMonthly}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
