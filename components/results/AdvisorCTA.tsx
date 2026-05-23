import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

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
        <Button variant="primary" size="md">
          Connect with an Advisor
        </Button>
        <Button variant="secondary" size="md">
          Learn More About Sun Life
        </Button>
      </div>
      <p className="text-xs text-white/20 pt-2">
        This tool is for educational guidance only. Product suitability, eligibility, coverage,
        and premiums must be validated through an official Sun Life proposal and licensed advisor consultation.
      </p>
    </Card>
  )
}
