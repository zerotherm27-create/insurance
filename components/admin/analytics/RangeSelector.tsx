export type AnalyticsRange = '24h' | '7d' | '30d' | '90d'

const RANGES: [AnalyticsRange, string][] = [
  ['24h', '24H'],
  ['7d', '7D'],
  ['30d', '30D'],
  ['90d', '90D'],
]

export function RangeSelector({
  value,
  onChange,
}: {
  value: AnalyticsRange
  onChange: (range: AnalyticsRange) => void
}) {
  return (
    <div className="inline-flex bg-navy-card border border-white/10 rounded-lg p-1" role="tablist">
      {RANGES.map(([id, label]) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={value === id}
          onClick={() => onChange(id)}
          className={`px-3 py-1.5 rounded-md font-sans text-xs uppercase tracking-wider transition-colors ${
            value === id ? 'bg-gold text-navy-dark font-semibold' : 'text-white/50 hover:text-white/80'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
