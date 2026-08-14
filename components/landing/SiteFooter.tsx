import Link from 'next/link'

/** Shared legal footer: copyright + Privacy / Terms / Data Deletion links. */
export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/5 px-6 py-4 md:px-12">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="font-sans text-xs text-white/50">
          © {new Date().getFullYear()} Safety Margin. Educational use only.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/privacy"
            className="font-sans text-xs text-white/50 hover:text-white/60 transition-colors underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 rounded"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="font-sans text-xs text-white/50 hover:text-white/60 transition-colors underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 rounded"
          >
            Terms of Use
          </Link>
          <Link
            href="/data-deletion"
            className="font-sans text-xs text-white/50 hover:text-white/60 transition-colors underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 rounded"
          >
            Data Deletion
          </Link>
        </div>
      </div>
    </footer>
  )
}
