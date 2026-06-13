'use client'
import { useRouter } from 'next/navigation'
import { useDeckSegment, discoveryHref } from '@/components/deck/DeckContext'

const choices = [
  { id: 'health', label: 'I want health protection' },
  { id: 'starter', label: 'I want affordable starter coverage' },
  { id: 'income', label: 'I want future guaranteed income' },
  { id: 'growth', label: 'I want long-term growth' },
  { id: 'figuring', label: "I'm still figuring things out" },
]

export function Slide8() {
  const router = useRouter()
  const segment = useDeckSegment()

  const handleSelect = (id: string) => {
    router.push(discoveryHref(segment, id))
  }

  return (
    <div className="max-w-2xl mx-auto w-full space-y-8">
      <div className="text-center space-y-3">
        <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
          Which Financial Goal Sounds
          <br />
          <span className="text-gold">Most Like You?</span>
        </h2>
      </div>
      <div className="space-y-2">
        {choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            onClick={() => handleSelect(choice.id)}
            className="w-full text-left rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-white/80 hover:border-gold/40 hover:bg-gold/5 hover:text-white transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
          >
            <span className="flex items-center justify-between">
              <span className="font-sans text-sm">{choice.label}</span>
              <span className="text-gold/0 group-hover:text-gold/60 transition-colors">→</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
