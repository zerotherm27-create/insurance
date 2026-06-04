import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data Deletion Policy',
  description: 'How to request deletion of your personal data collected by the Safety Margin tool.',
  alternates: { canonical: '/data-deletion' },
}

const CONTACT_EMAIL = 'support@safetymargin.app'
const MAILTO = `mailto:${CONTACT_EMAIL}?subject=Data%20Deletion%20Request&body=Hi%20Jojo%2C%0A%0APlease%20delete%20all%20personal%20data%20associated%20with%20my%20submission.%0A%0AName%3A%20%0AMobile%3A%20%0AEmail%3A%20%0A%0AThank%20you.`

export default function DataDeletionPage() {
  return (
    <main className="relative min-h-screen flex flex-col bg-navy-gradient">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center" aria-hidden="true">
            <span className="text-navy-dark font-serif font-bold text-sm">S</span>
          </div>
          <span className="font-sans text-sm text-white/60 tracking-widest uppercase">
            Safety Margin
          </span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6">
          <Link href="/privacy" className="font-sans text-xs text-white/30 hover:text-white/60 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="font-sans text-xs text-white/30 hover:text-white/60 transition-colors">Terms</Link>
        </nav>
      </header>

      {/* Content */}
      <section className="relative z-10 flex-1 px-6 py-16 md:px-12">
        <div className="max-w-2xl mx-auto space-y-10">

          <div className="space-y-3">
            <p className="font-sans text-xs text-gold/70 tracking-widest uppercase">Last updated: June 4, 2026</p>
            <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">
              Data Deletion Policy
            </h1>
            <p className="font-sans text-white/60 text-lg leading-relaxed">
              Your privacy matters. This page explains what personal data we collect, how we collect it,
              and exactly how to have it permanently deleted.
            </p>
          </div>

          <hr className="border-white/10" />

          <div className="space-y-8 font-sans text-white/70 leading-relaxed">

            <section className="space-y-3">
              <h2 className="font-serif text-xl text-white">What data we collect</h2>
              <p>When you complete the free Financial Protection Check, we collect:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-white/60">
                <li>First name</li>
                <li>Mobile number</li>
                <li>Email address</li>
                <li>Segment selection (e.g. "Young Professional", "OFW")</li>
                <li>Questionnaire answers — categorical only (multiple-choice, no free-text)</li>
                <li>Your AI-generated Financial Protection Report, including score and recommendations</li>
                <li>Submission timestamp</li>
                <li>Lead status as updated by the advisor (e.g. contacted, engaged)</li>
              </ul>
              <p className="text-white/50 text-sm">
                We do not collect payment information, government IDs, sensitive financial documents, or free-text responses.
                We do not use browser cookies or third-party tracking pixels.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-xl text-white">How we collect it</h2>

              <div className="space-y-2">
                <h3 className="font-sans text-sm font-semibold text-white/80">1. Quiz form submission</h3>
                <p className="text-sm">
                  Your name, mobile number, email, and questionnaire answers are submitted directly through the
                  form at the end of the quiz. Data is transmitted securely over HTTPS and stored in our
                  database (Supabase, hosted on AWS infrastructure).
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-sans text-sm font-semibold text-white/80">2. AI-generated report</h3>
                <p className="text-sm">
                  Your first name and questionnaire answers are sent to OpenAI&apos;s API (GPT-4o mini) to generate
                  your personalised protection report. OpenAI does not use this data to train future models
                  under our API agreement. The generated report is stored alongside your submission record.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-sans text-sm font-semibold text-white/80">3. Email communications</h3>
                <p className="text-sm">
                  If you provide your email, we use Resend (a transactional email service) to send your
                  report and follow-up educational emails. Resend receives only your email address and the
                  message content. Your report is sent to your inbox immediately after submission, and you
                  may receive additional emails over the following two weeks as part of an automated nurture sequence.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-sans text-sm font-semibold text-white/80">4. Session storage (temporary)</h3>
                <p className="text-sm">
                  Your answers are temporarily held in your browser&apos;s session storage while you complete
                  the quiz. This data is local to your device and is cleared automatically when you close
                  your browser tab. It is never sent to any server until you submit the form.
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl text-white">Why we collect it</h2>
              <p>
                Data is collected solely to: (1) generate your personalised protection report,
                (2) allow Jojo Cruzado to follow up with you,
                and (3) send educational follow-up emails relevant to your situation.
                We do not sell, rent, or share your data with third parties for marketing purposes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl text-white">How to request deletion</h2>
              <p>
                You can request full deletion of all personal data associated with your submission at any time.
                We will permanently remove your record within <span className="text-white">7 business days</span>.
              </p>
              <p>Include in your request:</p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-white/60">
                <li>Full name as submitted</li>
                <li>Mobile number or email used during sign-up</li>
                <li>The phrase: "Please delete all my data"</li>
              </ul>
              <a
                href={MAILTO}
                className="inline-flex items-center gap-2 mt-2 px-5 py-3 rounded-xl text-sm font-semibold bg-gold text-navy-dark hover:bg-gold-soft transition-[background-color] duration-150"
              >
                Send Deletion Request
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl text-white">What happens after deletion</h2>
              <ul className="list-disc list-inside space-y-1 pl-2 text-white/60">
                <li>All records matching your name and contact are permanently deleted from our database</li>
                <li>Your AI-generated report is also removed</li>
                <li>Any pending automated emails are cancelled</li>
                <li>You will receive a confirmation email once deletion is complete</li>
                <li>Deletion is irreversible — your report cannot be recovered afterwards</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl text-white">Data retention</h2>
              <p>
                If no deletion is requested, we retain submission data for up to{' '}
                <span className="text-white">24 months</span> from the date of submission,
                after which it is automatically purged.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl text-white">Contact</h2>
              <p>
                For any privacy-related questions, contact Jojo Cruzado at{' '}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-gold hover:text-gold-soft underline underline-offset-2 transition-colors"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </section>

          </div>

          <hr className="border-white/10" />

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/privacy" className="font-sans text-white/40 hover:text-gold transition-colors">
              Privacy Policy
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
