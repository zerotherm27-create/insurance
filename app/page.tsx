import Link from 'next/link'
import Image from 'next/image'
import { SegmentGrid } from '@/components/landing/SegmentGrid'

const CALENDLY_URL = process.env.NEXT_PUBLIC_ADVISOR_CALENDLY_URL ?? '#'
const FB_URL = process.env.NEXT_PUBLIC_ADVISOR_FB_URL ?? '#'

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

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center" aria-hidden="true">
            <span className="text-navy-dark font-serif font-bold text-sm">S</span>
          </div>
          <span className="font-sans text-sm text-white/60 tracking-widest uppercase">
            Safety Margin
          </span>
        </div>
      </header>

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
      <section className="relative z-10 border-t border-white/5 px-6 py-16 md:px-12">
        <div className="max-w-3xl mx-auto">
          <p className="font-sans text-xs text-gold/70 tracking-widest uppercase text-center mb-8">
            How it works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Answer 6 quick questions',
                desc: 'Takes 2 minutes. Multiple choice, specific to your life stage.',
              },
              {
                step: '02',
                title: 'Get your Protection Score',
                desc: 'See your score out of 100, your biggest gap, and a personalized analysis.',
              },
              {
                step: '03',
                title: 'Jojo walks you through it',
                desc: 'A free 30-minute call to review your results. No commitment, no pressure.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col gap-3">
                <span className="font-serif text-3xl text-gold/40 leading-none">{step}</span>
                <h3 className="font-serif text-lg text-white leading-snug">{title}</h3>
                <p className="font-sans text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — Who is Jojo */}
      <section className="relative z-10 border-t border-white/5 px-6 py-16 md:px-12">
        <div className="max-w-5xl mx-auto space-y-10">

          <p className="font-sans text-xs text-gold/70 tracking-widest uppercase">
            Who is Jojo?
          </p>

          {/* Photo + bio side by side */}
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-10 md:gap-14 items-start">

            {/* Photo */}
            <div className="w-full max-w-[300px] mx-auto md:mx-0">
              <Image
                src="/jojo.jpeg"
                alt="Jojo Cruzado — Safety Margin"
                width={300}
                height={380}
                className="w-full rounded-2xl object-cover object-top shadow-lg"
                priority
              />
            </div>

            {/* Bio */}
            <div className="space-y-5">
              <h2 className="font-serif text-2xl md:text-3xl text-white leading-tight">
                A real advisor who built this because he kept seeing the same gaps.
              </h2>

              <p className="font-sans text-white/60 leading-relaxed">
                When I arrived in Singapore as a Field Service Engineer, I thought the hard part was over. Good salary. Better life ahead.
              </p>
              <p className="font-sans text-white/60 leading-relaxed">
                I was wrong. Like a lot of OFWs, the high income didn&apos;t go where it should have. Lifestyle went up. Savings didn&apos;t. My whole family was with me in Singapore, and at one point we were just surviving — earning well, working hard, and still had nothing to show for it. No savings. No investments. Just bills.
              </p>
              <p className="font-sans text-white/60 leading-relaxed">
                That was the wake-up call. We found a community of people with the same mindset — Filipinos asking the same hard questions about money. Together we learned investing, business, economics, and the one thing that made all the difference: personal development. When you change how you think about money, everything else follows.
              </p>
              <p className="font-sans text-white/60 leading-relaxed">
                Slowly, things started to take shape. Real estate, a laundry business, a design and build company, and a few other ventures. What started as a desperate attempt to recover became something we were genuinely proud of.
              </p>
              <p className="font-sans text-white/60 leading-relaxed">
                When things got better, I sent my family back home to the Philippines first. A year later, I followed. That was 2018. Coming home not just to the country, but to my family, and to help my wife run everything we had built together.
              </p>
              <p className="font-sans text-white/60 leading-relaxed">
                I joined Sun Life as an insurance advisor because insurance was the one piece I kept seeing missing — even in people already doing the right things. One health crisis. One death in the family. Without protection in place, everything you built can disappear.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-gold text-navy-dark font-sans font-semibold text-sm hover:bg-gold-soft transition-[background-color] duration-150"
                >
                  Book a Free Call with Jojo
                </a>
                <a
                  href={FB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-white/10 text-white/60 font-sans text-sm hover:border-white/20 hover:text-white transition-[border-color,color] duration-150"
                >
                  Message on Facebook
                </a>
              </div>
            </div>
          </div>

          {/* Why I built Safety Margin */}
          <div className="bg-gold/5 border border-gold/20 rounded-2xl px-8 py-7 space-y-3">
            <p className="font-sans text-xs text-gold/70 tracking-widest uppercase">
              Why I built Safety Margin
            </p>
            <p className="font-serif text-xl md:text-2xl text-white leading-snug">
              I know exactly where a lot of you are right now. I&apos;ve been there.
            </p>
            <p className="font-sans text-white/60 leading-relaxed">
              Earning good money, feeling behind, not knowing where to start. This tool exists so you can see your real picture in 2 minutes, for free. No pressure. No sales pitch. Just clarity.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-4 md:px-12">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-sans text-xs text-white/25">
            © {new Date().getFullYear()} Safety Margin. Educational use only.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="font-sans text-xs text-white/30 hover:text-white/60 transition-colors underline underline-offset-2"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="font-sans text-xs text-white/30 hover:text-white/60 transition-colors underline underline-offset-2"
            >
              Terms of Use
            </Link>
            <Link
              href="/data-deletion"
              className="font-sans text-xs text-white/30 hover:text-white/60 transition-colors underline underline-offset-2"
            >
              Data Deletion
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
