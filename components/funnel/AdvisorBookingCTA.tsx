import type { FunnelSegment } from '@/types/funnel'

interface AdvisorBookingCTAProps {
  calendlyUrl: string
  fbUrl: string
  holdActive?: boolean
  segment?: FunnelSegment | null
}

export function AdvisorBookingCTA({ calendlyUrl, fbUrl, holdActive = false, segment }: AdvisorBookingCTAProps) {
  const hnw = segment === 'hnw'

  return (
    <div className="max-w-lg mx-auto w-full px-6 space-y-4 pb-16">
      <div className="bg-navy-card border border-gold/10 rounded-2xl p-6 text-center space-y-2">
        <h3 className="font-serif text-xl text-white leading-snug">
          {hnw
            ? 'Ready for a private consultation on your estate structure?'
            : 'Want a FREE 30-minute consultation to fix these gaps?'}
        </h3>
        <p className="font-sans text-sm text-white/45">
          {hnw
            ? 'No generic pitch. A focused conversation around your actual situation and legacy goals.'
            : 'No pressure. No commitment. Just clarity on what you and your family need.'}
        </p>
        {holdActive && (
          <p className="font-sans text-xs text-gold/80">
            Your slot is held for 48 hours after your report is generated. Claim it while it is open.
          </p>
        )}
      </div>

      <a
        href={calendlyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-full px-6 py-4 rounded-xl bg-gold text-navy-dark font-sans font-semibold text-base tracking-wide hover:bg-gold-soft transition-[background-color,transform] duration-150 active:scale-[0.98] min-h-[52px]"
      >
        {hnw ? 'Request a Private Consultation →' : 'Book a Free Call with Jojo →'}
      </a>

      <a
        href={fbUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-full px-6 py-4 rounded-xl border border-white/10 text-white/60 font-sans text-base hover:border-white/20 hover:text-white transition-[border-color,color,transform] duration-150 active:scale-[0.98] min-h-[52px]"
      >
        Message me on Facebook →
      </a>

      <p className="text-center text-xs text-white/20">
        Safety Margin
      </p>
    </div>
  )
}
