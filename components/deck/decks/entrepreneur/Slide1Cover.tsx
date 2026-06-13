import { Badge } from '@/components/ui/Badge'

// Beat 1 — Mirror. Meet the pride of building something, then name the exposure.
export function Slide1Cover() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Badge variant="gold">For the Self-Employed</Badge>
      <h1 className="font-serif text-5xl md:text-7xl text-white leading-[1.05]">
        You built it.
        <br />
        <span className="text-gold italic">You are it.</span>
      </h1>
      <p className="font-sans text-xl text-white/60 max-w-xl leading-relaxed">
        No boss, no ceiling, and no safety net underneath. Most entrepreneurs insure their equipment and their shop. Almost none insure the one asset everything runs on. You.
      </p>
      <div className="w-16 h-px bg-gold/40" />
    </div>
  )
}
