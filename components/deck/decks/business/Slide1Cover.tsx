import { Badge } from '@/components/ui/Badge'

// Beat 1 — Mirror, peer to peer. Name what quietly rests on the owner.
export function Slide1Cover() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Badge variant="gold">For Business Owners</Badge>
      <h1 className="font-serif text-5xl md:text-7xl text-white leading-[1.05]">
        They show up because
        <br />
        <span className="text-gold italic">they trust you will too.</span>
      </h1>
      <p className="font-sans text-xl text-white/60 max-w-xl leading-relaxed">
        Your payroll, your partners, the loans that carry your name. All of it runs through one person. The work is making sure it still stands on a day you cannot.
      </p>
      <div className="w-16 h-px bg-gold/40" />
    </div>
  )
}
