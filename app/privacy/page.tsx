import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Safety Margin collects, uses, and protects your personal information under the Philippine Data Privacy Act of 2012.',
  alternates: { canonical: '/privacy' },
}

const CONTACT_EMAIL = 'support@safetymargin.app'

export default function PrivacyPolicyPage() {
  return (
    <main className="relative min-h-screen flex flex-col bg-navy-gradient">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Safety Margin" width={36} height={36} className="object-contain" />
          <span className="font-sans text-sm text-white/60 tracking-widest uppercase">
            Safety Margin
          </span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6">
          <Link href="/data-deletion" className="font-sans text-xs text-white/30 hover:text-white/60 transition-colors">Data Deletion</Link>
          <Link href="/terms" className="font-sans text-xs text-white/30 hover:text-white/60 transition-colors">Terms</Link>
        </nav>
      </header>

      {/* Content */}
      <section className="relative z-10 flex-1 px-6 py-16 md:px-12">
        <div className="max-w-2xl mx-auto space-y-10">

          <div className="space-y-3">
            <p className="font-sans text-xs text-gold/70 tracking-widest uppercase">Last updated: June 4, 2026</p>
            <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">
              Privacy Policy
            </h1>
            <p className="font-sans text-white/60 text-lg leading-relaxed">
              This Privacy Policy describes how Safety Margin collects, uses, and protects your
              personal information. It is written in compliance with the Philippine Data Privacy Act of 2012
              (Republic Act No. 10173) and its Implementing Rules and Regulations.
            </p>
          </div>

          <hr className="border-white/10" />

          <div className="space-y-8 font-sans text-white/70 leading-relaxed">

            <section className="space-y-3">
              <h2 className="font-serif text-xl text-white">1. Who we are</h2>
              <p>
                Safety Margin is operated by <span className="text-white">Jojo Cruzado</span>, a licensed
                insurance advisor. This is an independent personal platform and is not affiliated with any insurance company.
              </p>
              <p className="text-sm text-white/50">
                Contact: <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold underline underline-offset-2">{CONTACT_EMAIL}</a>
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-xl text-white">2. Information we collect</h2>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white/80">Information you provide</h3>
                <ul className="list-disc list-inside space-y-1 pl-2 text-white/60 text-sm">
                  <li>First name</li>
                  <li>Mobile number</li>
                  <li>Email address</li>
                  <li>Life stage segment (e.g. Young Professional, OFW, Parent)</li>
                  <li>Quiz answers — categorical only (multiple-choice, no free text)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white/80">Information we generate</h3>
                <ul className="list-disc list-inside space-y-1 pl-2 text-white/60 text-sm">
                  <li>AI-generated Financial Protection Report (score, label, gap analysis, recommendation)</li>
                  <li>Lead status (advisor-updated: new, contacted, engaged, etc.)</li>
                  <li>Submission timestamp and email activity</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white/80">Information we do NOT collect</h3>
                <ul className="list-disc list-inside space-y-1 pl-2 text-white/60 text-sm">
                  <li>Payment information or financial account numbers</li>
                  <li>Government IDs or tax identification numbers</li>
                  <li>Free-text responses or sensitive personal information as defined under the DPA</li>
                  <li>Browser cookies or cross-site tracking data</li>
                  <li>Device identifiers or IP addresses</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-xl text-white">3. How we use your information</h2>
              <p>We use the information collected for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-white/60">
                <li>
                  <span className="text-white/80">To generate your report.</span>{' '}
                  Your name and quiz answers are processed by our AI system (OpenAI API) to produce
                  a personalised Financial Protection Report tailored to your life stage.
                </li>
                <li>
                  <span className="text-white/80">To deliver your report by email.</span>{' '}
                  Your report is sent to your email address immediately after submission, along with
                  follow-up educational content over a short automated sequence (typically 2–3 emails
                  over 14 days).
                </li>
                <li>
                  <span className="text-white/80">To facilitate advisor follow-up.</span>{' '}
                  Jojo Cruzado, your licensed advisor, may contact you using the mobile number
                  or email you provided to discuss your results and answer questions.
                </li>
                <li>
                  <span className="text-white/80">To improve the tool.</span>{' '}
                  Aggregated, anonymised data may be used to improve quiz accuracy and report quality.
                </li>
              </ul>
              <p className="text-sm text-white/50">
                We do not use your data for advertising, profiling, or any purpose other than those listed above.
                We do not sell or transfer your personal information to any third party for commercial purposes.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-xl text-white">4. Third-party service providers</h2>
              <p className="text-sm">
                We share your data with the following sub-processors strictly to operate the service.
                Each is contractually bound to process your data only as instructed and to maintain
                appropriate security measures.
              </p>
              <div className="bg-navy-card border border-white/5 rounded-xl divide-y divide-white/5 text-sm">
                {[
                  {
                    name: 'Supabase',
                    role: 'Database storage',
                    location: 'AWS (Singapore / US)',
                    data: 'Name, mobile, email, quiz answers, AI report',
                    link: 'https://supabase.com/privacy',
                  },
                  {
                    name: 'OpenAI',
                    role: 'AI report generation',
                    location: 'United States',
                    data: 'First name and quiz answers only',
                    link: 'https://openai.com/policies/privacy-policy',
                  },
                  {
                    name: 'Resend',
                    role: 'Email delivery',
                    location: 'United States',
                    data: 'Email address and email content',
                    link: 'https://resend.com/privacy',
                  },
                  {
                    name: 'Vercel',
                    role: 'Web hosting',
                    location: 'United States',
                    data: 'HTTP request metadata only (no personal data stored)',
                    link: 'https://vercel.com/legal/privacy-policy',
                  },
                ].map((p) => (
                  <div key={p.name} className="p-4 space-y-1">
                    <p className="font-semibold text-white/80">{p.name} — {p.role}</p>
                    <p className="text-white/50">Data shared: {p.data}</p>
                    <p className="text-white/40">Location: {p.location}</p>
                    <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-gold/70 hover:text-gold text-xs underline underline-offset-2 transition-colors">
                      Privacy policy →
                    </a>
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/50">
                OpenAI processes your name and quiz answers to generate your report. Under our API agreement,
                OpenAI does not use API-submitted data to train or improve its models.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl text-white">5. Data security</h2>
              <p>
                We implement technical and organisational measures to protect your data, including:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-white/60 text-sm">
                <li>HTTPS encryption for all data in transit</li>
                <li>Row-level security on database tables</li>
                <li>Service-role key access restricted to server-side API routes only</li>
                <li>No personal data stored in client-side cookies or localStorage</li>
                <li>Admin dashboard protected by a separate secret key</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl text-white">6. Data retention</h2>
              <p>
                Your personal data is retained for <span className="text-white">24 months</span> from submission,
                after which it is automatically deleted. You may request earlier deletion at any time — see
                our <Link href="/data-deletion" className="text-gold underline underline-offset-2">Data Deletion Policy</Link>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-xl text-white">7. Your rights under the Philippine DPA</h2>
              <p className="text-sm">Under Republic Act No. 10173, you have the right to:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-white/60 text-sm">
                <li><span className="text-white/80">Access</span> — request a copy of the personal data we hold about you</li>
                <li><span className="text-white/80">Correction</span> — have inaccurate or incomplete data corrected</li>
                <li><span className="text-white/80">Erasure or blocking</span> — request deletion or suspension of processing</li>
                <li><span className="text-white/80">Object</span> — oppose processing on legitimate grounds</li>
                <li><span className="text-white/80">Data portability</span> — receive your data in a structured, machine-readable format</li>
                <li><span className="text-white/80">Withdraw consent</span> — at any time, without detriment</li>
                <li><span className="text-white/80">Lodge a complaint</span> — with the National Privacy Commission (NPC) at <a href="https://www.privacy.gov.ph" target="_blank" rel="noopener noreferrer" className="text-gold underline underline-offset-2">privacy.gov.ph</a></li>
              </ul>
              <p className="text-sm text-white/50">
                To exercise any of these rights, email us at{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold underline underline-offset-2">{CONTACT_EMAIL}</a>.
                We will respond within 15 business days in accordance with NPC guidelines.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl text-white">8. Children's privacy</h2>
              <p>
                This service is intended for individuals 18 years of age or older. We do not knowingly
                collect personal information from minors. If you believe a minor has submitted data, please
                contact us immediately for prompt deletion.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl text-white">9. Changes to this policy</h2>
              <p>
                We may update this policy from time to time. Material changes will be reflected in the
                "Last updated" date at the top of this page. Continued use of the service after an update
                constitutes acceptance of the revised policy.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl text-white">10. Contact us</h2>
              <p>
                For privacy inquiries, exercise of data rights, or any concerns about this policy:
              </p>
              <div className="bg-navy-card border border-white/5 rounded-xl p-4 space-y-1 text-sm">
                <p className="text-white/80 font-semibold">Jojo Cruzado</p>
                <p className="text-white/50">Licensed Insurance Advisor</p>
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold underline underline-offset-2 hover:text-gold-soft transition-colors">
                  {CONTACT_EMAIL}
                </a>
              </div>
            </section>

          </div>

          <hr className="border-white/10" />

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/data-deletion" className="font-sans text-white/40 hover:text-gold transition-colors">
              Data Deletion Policy
            </Link>
            <Link href="/terms" className="font-sans text-white/40 hover:text-gold transition-colors">
              Terms of Use
            </Link>
            <Link href="/" className="font-sans text-white/40 hover:text-white/70 transition-colors">
              ← Back to Safety Margin
            </Link>
          </div>

        </div>
      </section>
    </main>
  )
}
