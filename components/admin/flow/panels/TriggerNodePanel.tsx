'use client'

export function TriggerNodePanel() {
  return (
    <div className="space-y-4">
      <p className="font-sans text-sm text-white/70 leading-relaxed">
        This flow starts when a new lead completes the funnel and submits their contact info.
      </p>
      <div className="p-3 rounded-xl bg-navy border border-white/5">
        <p className="font-sans text-[10px] uppercase tracking-wider text-white/30 mb-1">Trigger event</p>
        <p className="font-sans text-sm text-white">Form submitted</p>
        <p className="font-sans text-[10px] text-white/30 mt-1">
          The immediate report email is always sent at submission time via the funnel API — that&apos;s separate from this sequence.
        </p>
      </div>
    </div>
  )
}
