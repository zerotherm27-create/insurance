'use client'
import { useRouter } from 'next/navigation'
import { useDeckSegment, discoveryHref } from '@/components/deck/DeckContext'

// Beat 7 — The Step. Soft close: the parent self-selects what matters most, and
// the deck hands off to their own numbers in discovery (carrying ?from=family).
const choices = [
  { id: 'income', label: 'Making sure my family keeps going if I cannot' },
  { id: 'health', label: 'Protecting us from a major illness' },
  { id: 'growth', label: 'Building my children a future' },
  { id: 'starter', label: 'Starting with something affordable now' },
  { id: 'figuring', label: "I'm still figuring things out" },
]

export function Slide7Goal() {
  const router = useRouter()
  const segment = useDeckSegment()

  return (
    <div className="max-w-2xl mx-auto w-full space-y-8">
      <div className="text-center space-y-3">
        <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
          What matters most to
          <br />
          <span className="text-gold">your family right now?</span>
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
