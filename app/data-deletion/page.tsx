import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data Deletion Policy — Safety Margin Advisor',
  description: 'How to request deletion of your personal data collected by the Safety Margin Advisor tool.',
}

export default function DataDeletionPage() {
  return (
    <main className="relative min-h-screen flex flex-col bg-navy-gradient">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center" aria-hidden="true">
            <span className="text-navy-dark font-serif font-bold text-sm">S</span>
          </div>
          <span className="font-sans text-sm text-white/60 tracking-widest uppercase">
            Safety Margin Advisor
          </span>
        </Link>
      </header>

      {/* Content */}
      <section className="relative z-10 flex-1 px-6 py-16 md:px-12">
        <div className="max-w-2xl mx-auto space-y-10">

          <div className="space-y-3">
            <p className="font-sans text-xs text-gold/70 tracking-widest uppercase">Last updated: May 30, 2026</p>
            <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">
              Data Deletion Policy
            </h1>
            <p className="font-sans text-white/60 text-lg leading-relaxed">
              Your privacy matters. This page explains what personal data we collect, why we collect it,
              and exactly how to have it permanently deleted.
            </p>
          </div>

          <hr className="border-white/10" />

          <div className="space-y-8 font-sans text-white/70 leading-relaxed">

            <section className="space-y-3">
              <h2 className="font-serif text-xl text-white">What data we collect</h2>
              <p>When you complete the free protection check, we may collect:</p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-white/60">
                <li>First name</li>
                <li>Mobile number</li>
                <li>Email address (optional)</li>
                <li>Questionnaire answers (age range, income range, employment type, insurance status, family status, biggest financial worry)</li>
                <li>AI-generated protection analysis tied to your answers</li>
                <li>Submission timestamp</li>
              </ul>
              <p className="text-white/50 text-sm">
                We do not collect payment information, government IDs, or sensitive financial documents.
                All questionnaire answers are categorical (multiple-choice) — no free-text responses are stored.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl text-white">Why we collect it</h2>
              <p>
                Data is collected solely to generate your personalised protection report and,
                if you opt in, to follow up with educational content relevant to your situation.
                We do not sell or share your data with third parties for marketing purposes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl text-white">How to request deletion</h2>
              <p>
                You can request full deletion of all personal data associated with your submission at any time.
                We will permanently remove your record within <span className="text-white">7 business days</span> of receiving your request.
              </p>
              <p>To submit a deletion request, email us with your:</p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-white/60">
                <li>Full name as submitted</li>
                <li>Mobile number or email used during sign-up</li>
                <li>Request: "Please delete all my data"</li>
              </ul>
              <a
                href="mailto:privacy@safetymarginadvisor.com?subject=Data%20Deletion%20Request&body=Hi%2C%0A%0APlease%20delete%20all%20personal%20data%20associated%20with%20my%20submission.%0A%0AName%3A%20%0AMobile%3A%20%0AEmail%3A%20"
                className="inline-flex items-center gap-2 mt-2 px-5 py-3 rounded-xl text-sm font-semibold bg-gold text-navy-dark hover:bg-gold-soft transition-colors duration-200"
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
                <li>Any associated AI-generated report is also removed</li>
                <li>You will receive a confirmation email once deletion is complete</li>
                <li>Deletion is irreversible — your report cannot be recovered afterwards</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl text-white">Data retention</h2>
              <p>
                If no deletion is requested, we retain submission data for up to{' '}
                <span className="text-white">24 months</span> from the date of submission,
                after which it is automatically purged. You may request early deletion at any time.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl text-white">Questions</h2>
              <p>
                For any privacy-related concerns, contact us at{' '}
                <a
                  href="mailto:privacy@safetymarginadvisor.com"
                  className="text-gold hover:text-gold-soft underline underline-offset-2 transition-colors"
                >
                  privacy@safetymarginadvisor.com
                </a>
                .
              </p>
            </section>

          </div>

          <hr className="border-white/10" />

          <div className="text-center">
            <Link
              href="/"
              className="font-sans text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              ← Back to Safety Margin Advisor
            </Link>
          </div>

        </div>
      </section>
    </main>
  )
}
