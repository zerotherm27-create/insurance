import { getTierColor } from '@/lib/scoring'
import type { FunnelAIReport } from '@/types/funnel'

interface ReportCardProps {
  firstName: string
  report: FunnelAIReport
}

export function ReportCard({ firstName, report }: ReportCardProps) {
  const scoreColor = getTierColor(report.protectionScore)

  return (
    <div className="max-w-lg mx-auto w-full px-6 space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <p className="font-sans text-white/40 text-sm">Hi {firstName}! Here is your</p>
        <h2 className="font-serif text-2xl text-white">Financial Protection Report 🛡️</h2>
      </div>

      {/* Score */}
      <div className="bg-navy-card border border-white/5 rounded-2xl p-6 text-center space-y-2">
        <p className="font-sans text-xs text-white/40 uppercase tracking-widest">Protection Score</p>
        <p className="font-serif text-6xl leading-none" style={{ color: scoreColor }}>
          {report.protectionScore}
        </p>
        <p className="font-sans text-sm text-white/30">/ 100</p>
        <div
          className="inline-block mt-1 px-4 py-1 rounded-full text-xs font-sans font-medium"
          style={{
            backgroundColor: `${scoreColor}1a`,
            color: scoreColor,
            border: `1px solid ${scoreColor}40`,
          }}
        >
          {report.scoreLabel}
        </div>
      </div>

      {/* Snapshot */}
      <div className="bg-navy-card border border-white/5 rounded-2xl p-5 space-y-3">
        <p className="font-sans text-xs text-white/40 uppercase tracking-widest">
          Your Protection Snapshot
        </p>
        {report.snapshot.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-lg leading-none mt-0.5 flex-shrink-0">{item.icon}</span>
            <p className="font-sans text-sm text-white/75 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>

      {/* What You Need Most */}
      <div className="bg-navy-card border border-white/5 rounded-2xl p-5 space-y-2">
        <p className="font-sans text-xs text-white/40 uppercase tracking-widest">What You Need Most</p>
        <p className="font-sans text-sm text-white/80 leading-relaxed">{report.biggestGap}</p>
        <p className="font-sans text-sm text-white/55 leading-relaxed">{report.recommendation}</p>
        <p className="font-sans text-xs text-gold/80 mt-1">
          Estimated monthly cost for your profile: {report.estimatedRange}
        </p>
      </div>

      {/* Next Step */}
      <div className="bg-navy-card border border-white/5 rounded-2xl p-5">
        <p className="font-sans text-xs text-white/40 uppercase tracking-widest mb-2">Next Step</p>
        <p className="font-sans text-sm text-white/75 leading-relaxed">{report.nextStep}</p>
      </div>

      {/* Legal */}
      <p className="text-center text-xs text-white/20 leading-relaxed px-2">
        This assessment is for informational purposes only and does not constitute financial advice.
        Please consult a licensed advisor for personalized recommendations.
      </p>
    </div>
  )
}
