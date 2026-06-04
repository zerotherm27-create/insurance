import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-navy-gradient">
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center" aria-hidden="true">
            <span className="text-navy-dark font-serif font-bold text-sm">S</span>
          </div>
          <span className="font-sans text-sm text-white/60 tracking-widest uppercase">
            Safety Margin Advisor
          </span>
        </div>
        <Badge variant="navy">Educational Tool</Badge>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Text content */}
          <div className="flex-1 text-center lg:text-left space-y-8">
          <Badge variant="gold">Free Financial Protection Check</Badge>

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white leading-tight tracking-tight">
            What&apos;s Your
            <br />
            <span className="text-gold">Financial Protection</span>
            <br />
            Score?
          </h1>

          <p className="font-sans text-lg md:text-xl text-white/60 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Most Filipinos believe they&apos;re protected. Few actually know.
            Take the free 2-minute check and see exactly where you and your family
            stand — at any stage of life.
          </p>

          <div className="space-y-4 pt-4">
            {/* Primary funnel CTA */}
            <Link
              href="/funnel"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 text-lg rounded-xl font-sans font-semibold tracking-wide bg-gold text-navy-dark hover:bg-gold-soft shadow-lg hover:shadow-gold/20 hover:-translate-y-0.5 transition-[background-color,transform,box-shadow] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            >
              Get My Free Score
              <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <p className="font-sans text-xs text-white/40 tracking-wide">
              Free · 2 minutes · No sign-up to begin
            </p>
          </div>

          <p className="text-xs text-white/30 max-w-md mx-auto lg:mx-0 leading-relaxed pt-4">
            This tool is for educational guidance only. Product suitability, eligibility, coverage, and premiums
            must be validated through an official Sun Life proposal and licensed advisor consultation.
          </p>
          </div>
        </div>
      </section>

      {/* Bottom stats row */}
      <section className="relative z-10 border-t border-white/5 px-6 py-8 md:px-12">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
          {[
            { value: '5', label: 'Protection Layers' },
            { value: 'AI', label: 'Guided Analysis' },
            { value: 'Free', label: 'Educational Tool' },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="font-serif text-2xl md:text-3xl text-gold">{stat.value}</p>
              <p className="font-sans text-xs text-white/40 tracking-wider uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-4 md:px-12">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-sans text-xs text-white/25">
            © {new Date().getFullYear()} Safety Margin Advisor. Educational use only.
          </p>
          <Link
            href="/data-deletion"
            className="font-sans text-xs text-white/30 hover:text-white/60 transition-colors underline underline-offset-2"
          >
            Data Deletion Policy
          </Link>
        </div>
      </footer>
    </main>
  )
}
