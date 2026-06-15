'use client'
import { useRouter } from 'next/navigation'
import { useDeckSegment, discoveryHref } from '@/components/deck/DeckContext'

// Beat 6 — The Step. Confidential framing. Soft hand-off to the assessment
// (carries ?from=hnw, which selects the estate-based discovery track). Each
// goal id maps to an HNW plan in lib/discovery.ts.
const choices = [
  { id: 'estate_liquidity', label: 'Making sure the estate tax is covered in cash' },
  { id: 'clean_transfer', label: 'Passing wealth cleanly to my heirs' },
  { id: 'preservation', label: 'Growing and preserving the estate' },
  { id: 'legacy', label: 'Providing for a continuing legacy' },
  { id: 'confidential', label: 'I would like a confidential review' },
]

export function Slide6Goal() {
  const router = useRouter()
  const segment = useDeckSegment()

  return (
    <div className="max-w-2xl mx-auto w-full space-y-8">
      <div className="text-center space-y-3">
        <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
          Where should your
          <br />
          <span className="text-gold">private review begin?</span>
        </h2>
      </div>
      <div className="space-y-2">
        {choices.map((choice, i) => (
          <button
            key={i}
            type="button"
            onClick={() => router.push(discoveryHref(segment, choice.id))}
            className="w-full text-left rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-white/80 hover:border-gold/40 hover:bg-gold/5 hover:text-white transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
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
