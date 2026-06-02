import { cn } from '@/lib/utils'

type Status = 'new' | 'contacted' | 'converted'

const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  contacted: { label: 'Contacted', className: 'bg-gold/15 text-gold border-gold/30' },
  converted: { label: 'Converted', className: 'bg-green-500/15 text-green-400 border-green-500/30' },
}

export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-block px-3 py-1 rounded-full text-xs font-sans font-medium border',
        className
      )}
    >
      {label}
    </span>
  )
}
