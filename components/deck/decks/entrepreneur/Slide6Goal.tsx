'use client'
import { useRouter } from 'next/navigation'
import { useDeckSegment, discoveryHref } from '@/components/deck/DeckContext'

// Beat 6 — The Step. Entrepreneur-voiced soft close into discovery (?from=entrepreneur).
const choices = [
  { id: 'income', label: 'Keeping income coming if I cannot work' },
  { id: 'health', label: 'Protecting against a major illness' },
  { id: 'growth', label: 'Building my own retirement fund' },
  { id: 'starter', label: 'Starting lean and affordable now' },
  { id: 'figuring', label: "I'm still figuring things out" },
]

export function Slide6Goal() {
  const router = useRouter()
  const segment = useDeckSegment()

  return (
    <div className="max-w-2xl mx-auto w-full space-y-8">
      <div className="text-center space-y-3">
        <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
          What would protect
          <br />
          <span className="text-gold">your livelihood best?</span>
        </h2>
      </div>
      <div className="space-y-2">
        {choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            onClick={() => router.push(discoveryHref(segment, choice.id))}
            className="w-full text-left rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-white/80 hover:border-gold/40 hover:bg-gold/5 hover:text-white transition-[background-color,border-color,color] duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="font-sans text-sm">{choice.label}</span>
              <span className="text-gold/0 group-hover:text-gold/60 transition-colors">→</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
