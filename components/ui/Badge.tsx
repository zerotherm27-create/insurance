import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'gold' | 'navy' | 'white'
}

export function Badge({ className, variant = 'gold', children, ...props }: BadgeProps) {
  const variants = {
    gold: 'bg-gold/15 text-gold border border-gold/30',
    navy: 'bg-navy-light text-white/70 border border-white/10',
    white: 'bg-white/10 text-white border border-white/20',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
