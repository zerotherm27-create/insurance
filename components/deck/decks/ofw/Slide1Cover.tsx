import { Badge } from '@/components/ui/Badge'

// Beat 1 — Mirror. Acknowledge the sacrifice before raising any risk.
export function Slide1Cover() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Badge variant="gold">For Overseas Filipino Workers</Badge>
      <h1 className="font-serif text-5xl md:text-7xl text-white leading-[1.05]">
        You left so they
        <br />
        <span className="text-gold italic">would not have to.</span>
      </h1>
      <p className="font-sans text-xl text-white/60 max-w-xl leading-relaxed">
        Every peso you send home is love, carried across an ocean. The question is whether that love still arrives on a day you cannot send it.
      </p>
      <div className="w-16 h-px bg-gold/40" />
    </div>
  )
}
