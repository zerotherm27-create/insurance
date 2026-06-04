import { getTierColor } from '@/lib/scoring'
import type { FunnelAIReport } from '@/types/funnel'
import { ShieldCheckIcon, SnapshotIcon } from '@/components/ui/icons'

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
        <h2 className="font-serif text-2xl text-white inline-flex items-center gap-2 justify-center">
          Financial Protection Report
          <ShieldCheckIcon size={22} className="text-gold" />
        </h2>
      </div>

      {/* Score — primary card, gold accent border */}
      <div className="bg-navy-card border border-gold/20 rounded-2xl p-6 text-center space-y-2">
        <p className="font-sans text-xs text-white/40 uppercase tracking-widest">Your Protection Score</p>
        <p className="font-serif text-7xl leading-none" style={{ color: scoreColor }}>
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

      {/* Detail sections — single card with internal dividers */}
      <div className="bg-navy-card border border-white/5 rounded-2xl divide-y divide-white/5">
        {/* Snapshot */}
        <div className="p-5 space-y-3">
          <p className="font-sans text-xs text-white/40 uppercase tracking-widest">Your Protection Snapshot</p>
          {report.snapshot.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="mt-0.5 flex-shrink-0">
                <SnapshotIcon icon={item.icon} />
              </span>
              <p className="font-sans text-sm text-white/75 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        {/* What You Need Most */}
        <div className="p-5 space-y-2">
          <p className="font-sans text-xs text-white/40 uppercase tracking-widest">What You Need Most</p>
          <p className="font-sans text-sm text-white/80 leading-relaxed">{report.biggestGap}</p>
          <p className="font-sans text-sm text-white/55 leading-relaxed">{report.recommendation}</p>
          <p className="font-sans text-xs text-gold/80 mt-1">
            Estimated monthly cost for your profile: {report.estimatedRange}
          </p>
        </div>

        {/* Next Step */}
        <div className="p-5">
          <p className="font-sans text-xs text-white/40 uppercase tracking-widest mb-2">Your Next Step</p>
          <p className="font-sans text-sm text-white/75 leading-relaxed">{report.nextStep}</p>
        </div>
      </div>

      {/* Legal */}
      <p className="text-center text-xs text-white/20 leading-relaxed px-2">
        This assessment is for informational purposes only and does not constitute financial advice.
        Please consult a licensed advisor for personalized recommendations.
      </p>
    </div>
  )
}
