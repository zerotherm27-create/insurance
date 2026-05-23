import { Card } from '@/components/ui/Card'

interface Insight {
  label: string
  content: string
  accent?: boolean
}

interface Props {
  insights: Insight[]
}

export function InsightSection({ insights }: Props) {
  return (
    <div className="space-y-3">
      {insights.map((insight) => (
        <Card key={insight.label} className={`p-5 ${insight.accent ? 'border-gold/20 bg-gold/5' : ''}`}>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-2">{insight.label}</p>
          <p className="text-sm text-white/80 leading-relaxed">{insight.content}</p>
        </Card>
      ))}
    </div>
  )
}
