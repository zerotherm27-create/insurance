import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
}

interface QuestionCardProps {
  question: string
  options: Option[]
  onSelect: (value: string) => void
  selected?: string
}

export function QuestionCard({ question, options, onSelect, selected }: QuestionCardProps) {
  return (
    <div className="max-w-lg mx-auto w-full px-6 space-y-6">
      <h2 className="font-serif text-2xl md:text-3xl text-white text-center leading-snug">
        {question}
      </h2>
      <div className="space-y-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={cn(
              'w-full text-left px-6 py-4 rounded-xl border font-sans text-base transition-all duration-150',
              'min-h-[52px] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60',
              selected === opt.value
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-white/10 bg-navy-card text-white/80 hover:border-gold/40 hover:bg-navy-light'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
