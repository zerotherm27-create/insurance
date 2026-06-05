import Image from 'next/image'
import { MessageCircleIcon, CalendarIcon } from '@/components/ui/icons'

export function AdvisorTrustStrip() {
  const calendlyUrl = process.env.NEXT_PUBLIC_ADVISOR_CALENDLY_URL ?? '#'
  const fbUrl = process.env.NEXT_PUBLIC_ADVISOR_FB_URL ?? '#'

  return (
    <div className="flex items-center gap-3 bg-navy-card border border-white/8 rounded-xl px-4 py-3">
      <Image
        src="/jojo.jpeg"
        alt="Jojo Cruzado"
        width={40}
        height={40}
        className="rounded-full object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-sans text-sm font-medium text-white leading-tight">Jojo Cruzado</p>
        <p className="font-sans text-xs text-white/40 leading-tight mt-0.5">Licensed Insurance Advisor</p>
        <p className="font-sans text-xs text-white/25 leading-tight mt-0.5">Sun Life of Canada Phils. Inc.</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <a
          href={fbUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message Jojo on Facebook"
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 transition-[background-color,color]"
        >
          <MessageCircleIcon size={15} />
        </a>
        <a
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Book a call with Jojo"
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 transition-[background-color,color]"
        >
          <CalendarIcon size={15} />
        </a>
      </div>
    </div>
  )
}
