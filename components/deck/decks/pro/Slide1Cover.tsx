import { Badge } from '@/components/ui/Badge'

export function Slide1Cover() {
  return (
    <div className="max-w-4xl mx-auto text-center space-y-8">
      <Badge variant="gold">Financial Education Series</Badge>
      <h1 className="font-serif text-5xl md:text-7xl text-white leading-tight">
        The Financial Advantage
        <br />
        <span className="text-gold italic">Most Young Professionals</span>
        <br />
        Ignore
      </h1>
      <p className="font-sans text-xl text-white/60 max-w-lg mx-auto">
        Why starting early matters more than earning more later.
      </p>
      <div className="w-16 h-px bg-gold/40 mx-auto" />
    </div>
  )
}
