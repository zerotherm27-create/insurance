interface AdvisorBookingCTAProps {
  calendlyUrl: string
  fbUrl: string
}

export function AdvisorBookingCTA({ calendlyUrl, fbUrl }: AdvisorBookingCTAProps) {
  return (
    <div className="max-w-lg mx-auto w-full px-6 space-y-4 pb-16">
      <div className="bg-navy-card border border-gold/10 rounded-2xl p-6 text-center space-y-2">
        <h3 className="font-serif text-xl text-white leading-snug">
          Want a FREE 30-minute consultation to fix these gaps?
        </h3>
        <p className="font-sans text-sm text-white/45">
          No pressure. No commitment. Just clarity on what you and your family need.
        </p>
      </div>

      <a
        href={calendlyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-full px-6 py-4 rounded-xl bg-gold text-navy-dark font-sans font-semibold text-base tracking-wide hover:bg-gold-soft transition-colors min-h-[52px]"
      >
        BOOK A FREE CALL WITH JOJO →
      </a>

      <a
        href={fbUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-full px-6 py-4 rounded-xl border border-white/10 text-white/60 font-sans text-base hover:border-white/20 hover:text-white transition-colors min-h-[52px]"
      >
        Message me on Facebook →
      </a>

      <p className="text-center text-xs text-white/20">
        Powered by Sun Life of Canada Philippines, Inc. — Neem Tree Branch
      </p>
    </div>
  )
}
