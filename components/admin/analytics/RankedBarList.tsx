interface Item {
  key: string
  count: number
}

const LABEL_OVERRIDES: Record<string, string> = {
  Unknown: 'Unknown',
  direct: 'Direct',
}

export function RankedBarList({
  title,
  items,
  emptyLabel = 'No data yet',
  formatLabel,
}: {
  title: string
  items: Item[]
  emptyLabel?: string
  formatLabel?: (key: string) => string
}) {
  const top = items.slice(0, 8)
  const max = top.reduce((m, i) => Math.max(m, i.count), 0) || 1

  return (
    <div className="bg-navy-card border border-white/5 rounded-xl p-4">
      <p className="font-sans text-[10px] uppercase tracking-wider text-white/40 mb-3">{title}</p>
      {top.length === 0 ? (
        <p className="font-sans text-xs text-white/20">{emptyLabel}</p>
      ) : (
        <div className="space-y-1.5">
          {top.map((item) => (
            <div key={item.key} className="relative rounded-md overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gold/15"
                style={{ width: `${Math.round((item.count / max) * 100)}%` }}
              />
              <div className="relative flex items-center justify-between gap-3 px-2 py-1.5">
                <span className="font-sans text-xs text-white/70 truncate">
                  {formatLabel ? formatLabel(item.key) : (LABEL_OVERRIDES[item.key] ?? item.key)}
                </span>
                <span className="font-sans text-xs text-gold font-medium tabular-nums shrink-0">
                  {item.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
