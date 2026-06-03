import { cn } from '@/lib/utils'
import { STATUS_LABEL, STATUS_COLOR, type LeadStatus } from '@/lib/lead-status'

export function StatusBadge({ status }: { status: LeadStatus }) {
  const c = STATUS_COLOR[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-medium border whitespace-nowrap',
        c.bg, c.text, c.border
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', c.dot)} />
      {STATUS_LABEL[status]}
    </span>
  )
}
