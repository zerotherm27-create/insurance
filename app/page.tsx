import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-navy-gradient">
      {/* Cinematic background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-navy-light/20 rounded-full blur-[120px]" />
      </div>

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
          <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center">
            <span className="text-navy-dark font-serif font-bold text-sm">S</span>
          </div>
          <span className="font-sans text-sm text-white/60 tracking-widest uppercase">
            Safety Margin Advisor
          </span>
        </div>
        <Badge variant="navy">Educational Tool</Badge>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <Badge variant="gold">For Young Filipino Professionals</Badge>

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white leading-tight tracking-tight">
            The Financial Advantage
            <br />
            <span className="text-gold">Most Young Professionals</span>
            <br />
            Ignore
          </h1>

          <p className="font-sans text-lg md:text-xl text-white/60 leading-relaxed max-w-xl mx-auto">
            Why protecting your future income matters more than most people realize.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/deck">
              <Button size="lg" variant="primary">
                View Interactive Deck
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
            <Link href="/assessment">
              <Button size="lg" variant="secondary">
                Start Discovery
              </Button>
            </Link>
          </div>

          <p className="text-xs text-white/30 max-w-md mx-auto leading-relaxed pt-4">
            This tool is for educational guidance only. Product suitability, eligibility, coverage, and premiums
            must be validated through an official Sun Life proposal and licensed advisor consultation.
          </p>
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
    </main>
  )
}
