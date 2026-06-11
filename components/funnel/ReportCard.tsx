import Image from 'next/image'
import { getTierColor } from '@/lib/scoring'
import type { CoverageBenefit, FunnelAIReport } from '@/types/funnel'
import { ShieldCheckIcon, SnapshotIcon } from '@/components/ui/icons'

interface ReportCardProps {
  firstName: string
  report: FunnelAIReport
}

const STATUS_CHIP: Record<CoverageBenefit['status'], { label: string; className: string }> = {
  have: { label: 'You Have This', className: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30' },
  partial: { label: 'Worth Reviewing', className: 'bg-amber-400/10 text-amber-400 border-amber-400/30' },
  gap: { label: 'Gap Detected', className: 'bg-red-400/10 text-red-400 border-red-400/30' },
}

const STATUS_ICON: Record<CoverageBenefit['status'], '✅' | '⚠️' | '❌'> = {
  have: '✅',
  partial: '⚠️',
  gap: '❌',
}

function BenefitRow({ benefit }: { benefit: CoverageBenefit }) {
  const chip = STATUS_CHIP[benefit.status]
  return (
    <div className="p-5 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <span className="mt-0.5 flex-shrink-0">
            <SnapshotIcon icon={STATUS_ICON[benefit.status]} />
          </span>
          <p className="font-sans text-sm font-medium text-white/90 leading-snug">{benefit.name}</p>
        </div>
        <span
          className={`flex-shrink-0 px-2.5 py-0.5 rounded-full border text-[11px] font-sans font-medium whitespace-nowrap ${chip.className}`}
        >
          {chip.label}
        </span>
      </div>

      <div className="pl-7 space-y-1">
        <p className="font-sans text-xs text-white/45 leading-relaxed">
          <span className="text-gold/80">{benefit.idealLabel ?? 'Ideal coverage'}:</span>{' '}
          {benefit.idealAmount}
        </p>
        {benefit.starterAmount && (
          <p className="font-sans text-xs text-white/45 leading-relaxed">
            <span className="text-gold/50">{benefit.starterLabel ?? 'Starter coverage'}:</span>{' '}
            {benefit.starterAmount}
          </p>
        )}
        {benefit.whyItMatters && (
          <p className="font-sans text-xs text-white/55 leading-relaxed pt-1">{benefit.whyItMatters}</p>
        )}
      </div>
    </div>
  )
}

export function ReportCard({ firstName, report }: ReportCardProps) {
  const scoreColor = getTierColor(report.protectionScore)
  const benefits = report.coverageBenefits

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

      {/* Personal note from Jojo */}
      <div className="bg-navy-card border border-white/5 rounded-2xl p-4 flex items-start gap-3">
        <Image
          src="/jojo.jpeg"
          alt="Jojo Cruzado"
          width={36}
          height={36}
          className="rounded-full object-cover shrink-0 mt-0.5"
        />
        <div className="min-w-0">
          <p className="font-sans text-[11px] text-gold/70 uppercase tracking-widest mb-1">
            From Jojo, your advisor
          </p>
          <p className="font-sans text-xs text-white/55 leading-relaxed">
            Based on what you shared, I put this report together for you. It shows where your
            protection stands today and which gaps are worth closing first.
          </p>
        </div>
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

      {/* Coverage benefits — new reports; legacy snapshot for older ones */}
      {benefits && benefits.length > 0 ? (
        <div className="bg-navy-card border border-white/5 rounded-2xl divide-y divide-white/5">
          <div className="p-5 pb-0">
            <p className="font-sans text-xs text-white/40 uppercase tracking-widest">Your Coverage Benefits</p>
          </div>
          {benefits.map((b) => (
            <BenefitRow key={b.id} benefit={b} />
          ))}
        </div>
      ) : (
        <div className="bg-navy-card border border-white/5 rounded-2xl">
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
        </div>
      )}

      {/* What You Need Most + Next Step */}
      <div className="bg-navy-card border border-white/5 rounded-2xl divide-y divide-white/5">
        <div className="p-5 space-y-2">
          <p className="font-sans text-xs text-white/40 uppercase tracking-widest">What You Need Most</p>
          <p className="font-sans text-sm text-white/80 leading-relaxed">{report.biggestGap}</p>
          <p className="font-sans text-sm text-white/55 leading-relaxed">{report.recommendation}</p>
          <p className="font-sans text-xs text-gold/80 mt-1">
            {benefits && benefits.length > 0
              ? report.estimatedRange
              : `Estimated monthly cost for your profile: ${report.estimatedRange}`}
          </p>
        </div>

        <div className="p-5">
          <p className="font-sans text-xs text-white/40 uppercase tracking-widest mb-2">Your Next Step</p>
          <p className="font-sans text-sm text-white/75 leading-relaxed">{report.nextStep}</p>
        </div>
      </div>

      {/* Legal */}
      <p className="text-center text-xs text-white/20 leading-relaxed px-2">
        Coverage amounts are estimates based on the ranges you shared and common planning guidelines.
        This assessment is for informational purposes only and does not constitute financial advice.
        It must be validated through an official proposal and consultation with a licensed advisor.
      </p>
    </div>
  )
}
