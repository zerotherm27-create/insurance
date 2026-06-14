import { Badge } from '@/components/ui/Badge'

// Beat 1 — Mirror, discreet and private. No mention of budgets or price. Frame the
// estate as order versus chaos, not size.
export function Slide1Cover() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Badge variant="gold">Private Assessment</Badge>
      <h1 className="font-serif text-5xl md:text-7xl text-white leading-[1.05]">
        What you leave behind
        <br />
        <span className="text-gold italic">is not just wealth.</span>
      </h1>
      <p className="font-sans text-xl text-white/60 max-w-xl leading-relaxed">
        It is the order, or the chaos, your family inherits. The difference is rarely the size of the estate. It is whether it was structured before it was needed.
      </p>
      <div className="w-16 h-px bg-gold/40" />
    </div>
  )
}
