import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
}

interface QuestionCardProps {
  question: string
  options: Option[]
  // Single-select
  onSelect: (value: string) => void
  selected?: string
  // Multi-select
  multiSelect?: boolean
  exclusiveNoneValue?: string
  selectedValues?: string[]
  onToggle?: (values: string[]) => void
  onConfirm?: () => void
}

export function QuestionCard({
  question,
  options,
  onSelect,
  selected,
  multiSelect,
  exclusiveNoneValue,
  selectedValues = [],
  onToggle,
  onConfirm,
}: QuestionCardProps) {
  function handleToggle(value: string) {
    if (!onToggle) return
    let next: string[]
    if (exclusiveNoneValue) {
      if (value === exclusiveNoneValue) {
        next = selectedValues.includes(value) ? [] : [value]
      } else {
        const without = selectedValues.filter((v) => v !== exclusiveNoneValue)
        next = without.includes(value)
          ? without.filter((v) => v !== value)
          : [...without, value]
      }
    } else {
      next = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value]
    }
    onToggle(next)
  }

  if (multiSelect) {
    return (
      <div className="max-w-lg mx-auto w-full px-6 space-y-6">
        <div className="space-y-1">
          <h2 className="font-serif text-2xl md:text-3xl text-white text-center leading-snug">
            {question}
          </h2>
          <p className="font-sans text-xs text-white/40 text-center">Select all that apply</p>
        </div>
        <div className="space-y-3">
          {options.map((opt) => {
            const isSelected = selectedValues.includes(opt.value)
            return (
              <button
                key={opt.value}
                onClick={() => handleToggle(opt.value)}
                className={cn(
                  'w-full text-left px-6 py-4 rounded-xl border font-sans text-base',
                  'transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98]',
                  'min-h-[52px] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60',
                  'flex items-center justify-between gap-3',
                  isSelected
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-white/10 bg-navy-card text-white/80 hover:border-gold/40 hover:bg-navy-light'
                )}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
        <button
          onClick={onConfirm}
          disabled={selectedValues.length === 0}
          className={cn(
            'w-full py-4 rounded-xl font-sans text-base font-medium',
            'transition-[background-color,color,transform] duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60',
            selectedValues.length > 0
              ? 'bg-gold text-navy-dark hover:bg-gold-soft cursor-pointer active:scale-[0.98]'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          )}
        >
          Continue
        </button>
      </div>
    )
  }

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
              'w-full text-left px-6 py-4 rounded-xl border font-sans text-base',
              'transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98]',
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
