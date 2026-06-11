/**
 * Client testimonials section. Renders nothing until TESTIMONIALS is filled,
 * so the page structure is ready the moment Jojo has real quotes or
 * anonymized chat screenshots to drop in. Keep quotes verbatim and short;
 * first name only.
 */
const TESTIMONIALS: Array<{ name: string; quote: string }> = [
  // { name: 'Maria', quote: 'Walang pilitan na nangyari. Sobrang clear ng explanation.' },
]

export function SocialProofSection() {
  if (TESTIMONIALS.length === 0) return null

  return (
    <div className="max-w-lg mx-auto w-full px-6">
      <div className="space-y-3">
        <p className="text-center font-sans text-xs text-white/40 uppercase tracking-widest">
          What clients say after we talked
        </p>
        <div className="space-y-2">
          {TESTIMONIALS.map((t) => (
            <div key={t.name + t.quote.slice(0, 12)} className="bg-navy-card border border-white/5 rounded-2xl p-4">
              <p className="font-serif text-sm text-white/75 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <p className="font-sans text-xs text-gold/60 mt-2">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
