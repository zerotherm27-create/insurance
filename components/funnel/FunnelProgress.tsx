interface FunnelProgressProps {
  currentStep: number
  totalSteps: number
}

export function FunnelProgress({ currentStep, totalSteps }: FunnelProgressProps) {
  const pct = Math.round((currentStep / totalSteps) * 100)
  return (
    <div className="w-full px-6 pb-8 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-2">
        <span className="font-sans text-xs text-white/40 uppercase tracking-wider">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="font-sans text-xs text-white/30">{pct}%</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full w-full origin-left bg-gold rounded-full transition-transform duration-500 ease-out"
          style={{ transform: `scaleX(${pct / 100})` }}
        />
      </div>
    </div>
  )
}
