import type { GapAnalysis } from '@/types/gap'

interface AnalysisPanelProps {
  analysis: GapAnalysis
}

export function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  if (!analysis.headline) return null
  return (
    <div>
      <p className="font-sans text-xs text-white/35 uppercase tracking-widest mb-2">Analysis</p>
      <div className="bg-white/[0.04] border-l-2 border-gold/40 rounded-r-lg px-4 py-3">
        <p className="font-sans text-sm text-white/70 leading-relaxed">{analysis.headline}</p>
      </div>
    </div>
  )
}
