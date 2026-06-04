import { Card } from '@/components/ui/Card'

export function AdvisorCTA() {
  return (
    <Card className="p-8 text-center space-y-4 border-gold/20">
      <p className="text-xs text-gold/70 uppercase tracking-widest">Optional Next Step</p>
      <h3 className="font-serif text-2xl text-white">
        Ready to Validate Your Profile?
      </h3>
      <p className="text-sm text-white/60 max-w-md mx-auto leading-relaxed">
        This analysis is educational. Jojo can review your full financial picture,
        check eligibility, and prepare an official proposal tailored to your situation.
      </p>
      <p className="text-xs text-white/20 pt-2">
        This tool is for educational guidance only. Product suitability, eligibility, coverage,
        and premiums must be validated through an official proposal and consultation with a licensed advisor.
      </p>
    </Card>
  )
}
