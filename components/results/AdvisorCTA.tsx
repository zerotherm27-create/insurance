import { Card } from '@/components/ui/Card'
import Link from 'next/link'

export function AdvisorCTA() {
  return (
    <Card className="p-8 text-center space-y-4 border-gold/20">
      <p className="text-xs text-gold/70 uppercase tracking-widest">Optional Next Step</p>
      <h3 className="font-serif text-2xl text-white">
        Ready to Validate Your Profile?
      </h3>
      <p className="text-sm text-white/60 max-w-md mx-auto leading-relaxed">
        This analysis is educational. A licensed Sun Life advisor can review your full financial picture,
        check eligibility, and prepare an official proposal.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <a
          href="https://www.sunlife.com.ph/en/get-advice/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gold text-navy font-semibold text-sm hover:bg-gold-soft transition-colors"
        >
          Connect with an Advisor
        </a>
        <a
          href="https://www.sunlife.com.ph"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-gold/40 text-gold text-sm font-medium hover:bg-gold/10 transition-colors"
        >
          Learn More About Sun Life
        </a>
      </div>
      <p className="text-xs text-white/20 pt-2">
        This tool is for educational guidance only. Product suitability, eligibility, coverage,
        and premiums must be validated through an official Sun Life proposal and licensed advisor consultation.
      </p>
    </Card>
  )
}
