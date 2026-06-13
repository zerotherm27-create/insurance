import { Badge } from '@/components/ui/Badge'

// Beat 1 — Mirror. Reflect the parent's world back so they feel seen before any
// risk is raised.
export function Slide1Cover() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Badge variant="gold">For Parents and Providers</Badge>
      <h1 className="font-serif text-5xl md:text-7xl text-white leading-[1.05]">
        You provide.
        <br />
        <span className="text-gold italic">They never worry.</span>
      </h1>
      <p className="font-sans text-xl text-white/60 max-w-xl leading-relaxed">
        That is the quiet promise you keep every single day. The question is whether the promise holds even on a day you are not there.
      </p>
      <div className="w-16 h-px bg-gold/40" />
    </div>
  )
}
