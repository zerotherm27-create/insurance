import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean
}

export function Card({ className, glow = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-card-gradient backdrop-blur-sm',
        glow && 'shadow-[0_0_30px_rgba(246,178,26,0.08)] border-gold/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
