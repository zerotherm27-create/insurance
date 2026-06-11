import { SegmentGrid } from '@/components/landing/SegmentGrid'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { AdvisorStory } from '@/components/landing/AdvisorStory'
import { FunnelHowItWorks } from '@/components/funnel/FunnelHowItWorks'

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col bg-navy-gradient">
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <SiteHeader />

      {/* Section 1 — Minimal hero */}
      <section className="relative z-10 px-6 pt-12 pb-8 md:px-12 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-sans uppercase tracking-widest mb-2">
            Free · 2 minutes · No sign-up to begin
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white leading-tight tracking-tight">
            Most Filipinos think
            <br />
            <span className="text-gold">they&apos;re covered.</span>
            <br />
            Most aren&apos;t.
          </h1>
          <p className="font-sans text-lg text-white/50 leading-relaxed pt-2">
            Find out where you actually stand. Which of these sounds like you?
          </p>
        </div>
      </section>

      {/* Section 2 — Persona grid (primary CTA) */}
      <section className="relative z-10 px-6 pb-16 md:px-12">
        <SegmentGrid />
        <p className="text-center font-sans text-xs text-white/25 mt-6">
          This tool is for educational guidance only. Results must be validated through an official proposal and consultation with a licensed advisor.
        </p>
      </section>

      {/* Section 3 — How it works */}
      <section className="relative z-10 border-t border-white/5 px-6 py-12 md:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="md:ml-[12%]">
            <FunnelHowItWorks />
          </div>
        </div>
      </section>

      {/* Section 4 — Who is Jojo */}
      <AdvisorStory />

      <SiteFooter />
    </main>
  )
}
