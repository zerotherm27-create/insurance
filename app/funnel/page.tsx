import Link from 'next/link'

export default function FunnelLandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-navy-gradient px-6 py-16 text-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md mx-auto space-y-8">
        {/* Badge */}
        <div className="inline-block px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-sans uppercase tracking-widest">
          Free · 2 minutes · No commitment
        </div>

        {/* Headline */}
        <div className="space-y-4">
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight">
            Kung mawala ka bukas,{' '}
            <span className="text-gold">kaya ba ng pamilya mo?</span>
          </h1>
          <p className="font-sans text-base text-white/50 leading-relaxed">
            Take this free 2-minute Financial Protection Check and find out exactly where you stand — no sign-up required.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/funnel/step/1"
          className="inline-flex items-center justify-center w-full px-8 py-4 text-lg rounded-xl font-sans font-semibold tracking-wide bg-gold text-navy-dark hover:bg-gold-soft shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          START THE CHECK →
        </Link>

        <p className="text-xs text-white/25 leading-relaxed">
          Powered by Sun Life of Canada Philippines, Inc. — Neem Tree Branch
        </p>
      </div>
    </main>
  )
}
