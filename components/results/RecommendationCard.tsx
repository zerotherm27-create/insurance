import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { ProductRecommendation } from '@/types'

interface Props {
  recommendation: ProductRecommendation
  isPrimary?: boolean
}

export function RecommendationCard({ recommendation, isPrimary = false }: Props) {
  return (
    <Card glow={isPrimary} className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Badge variant={isPrimary ? 'gold' : 'navy'}>
            {isPrimary ? 'Primary Recommendation' : 'Alternative'}
          </Badge>
          <h3 className="font-serif text-xl text-white mt-2">
            {recommendation.productName}
          </h3>
        </div>
      </div>
      <p className="text-sm text-white/60 leading-relaxed">{recommendation.purpose}</p>
      <div className="border-t border-white/10 pt-4">
        <p className="text-xs text-gold/70 uppercase tracking-widest mb-2">Why this fits you</p>
        <p className="text-sm text-white/80 leading-relaxed">{recommendation.whyItFits}</p>
      </div>
      <div className="rounded-xl bg-navy-light/60 border border-white/10 px-4 py-3">
        <p className="text-xs text-white/40 italic">{recommendation.positioning}</p>
      </div>
    </Card>
  )
}
