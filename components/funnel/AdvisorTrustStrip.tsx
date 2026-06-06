'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircleIcon, CalendarIcon, XIcon } from '@/components/ui/icons'

interface Props {
  interactive?: boolean
  cta?: string
  segment?: string
}

export function AdvisorTrustStrip({ interactive = false, cta, segment }: Props) {
  const router = useRouter()
  const calendlyUrl = process.env.NEXT_PUBLIC_ADVISOR_CALENDLY_URL ?? '#'
  const fbUrl = process.env.NEXT_PUBLIC_ADVISOR_FB_URL ?? '#'
  const [open, setOpen] = useState(false)

  function handleCta() {
    if (segment) {
      try {
        sessionStorage.setItem('sma_funnel_answers', JSON.stringify({ segment }))
      } catch { /* ignore */ }
    }
    setOpen(false)
    router.push('/funnel/step/1')
  }

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const infoSection = (
    <div className="flex items-center gap-3 flex-1 min-w-0">
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
        <p className="font-sans text-xs text-white/25 leading-tight mt-0.5">Sun Life</p>
      </div>
    </div>
  )

  return (
    <>
      <div className="flex items-center gap-3 bg-navy-card border border-white/8 rounded-xl px-4 py-3">
        {interactive ? (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-3 flex-1 min-w-0 text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 hover:opacity-80 transition-[opacity] duration-150"
            aria-label="Learn more about Jojo Cruzado"
          >
            {infoSection}
          </button>
        ) : (
          infoSection
        )}

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

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="card"
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="fixed inset-0 z-50 flex items-center justify-center px-6 pointer-events-none"
            >
              <div
                className="bg-navy-card border border-white/10 rounded-2xl p-6 max-w-sm w-full pointer-events-auto shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <Image
                      src="/jojo.jpeg"
                      alt="Jojo Cruzado"
                      width={72}
                      height={72}
                      className="rounded-full object-cover shrink-0"
                    />
                    <div>
                      <p className="font-serif text-lg text-white leading-tight">Jojo Cruzado</p>
                      <p className="font-sans text-sm text-white/60 leading-tight mt-0.5">Licensed Insurance Advisor</p>
                      <p className="font-sans text-xs text-white/30 leading-tight mt-0.5">Sun Life of Canada Phils. Inc.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-white/30 hover:text-white/60 transition-[color] duration-150 shrink-0 ml-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 rounded"
                    aria-label="Close"
                  >
                    <XIcon size={16} />
                  </button>
                </div>

                <p className="font-sans text-sm text-white/60 leading-relaxed mb-5">
                  Former OFW and engineer in Singapore. Jojo came home in 2018 after realizing the one piece most hardworking Filipinos miss is not income. It is protection. Now he helps Filipino families find the gaps before life does.
                </p>

                <div className="flex flex-col gap-2.5">
                  {cta && (
                    <button
                      onClick={handleCta}
                      className="flex items-center justify-center px-5 py-3 rounded-xl bg-gold text-navy-dark font-sans font-semibold text-sm hover:bg-gold-soft transition-[background-color] duration-150"
                    >
                      {cta}
                    </button>
                  )}
                  <a
                    href={calendlyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-5 py-3 rounded-xl border border-white/10 text-white/60 font-sans text-sm hover:border-white/20 hover:text-white transition-[border-color,color] duration-150"
                  >
                    Book a Free Call
                  </a>
                  <a
                    href={fbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-5 py-3 rounded-xl border border-white/10 text-white/60 font-sans text-sm hover:border-white/20 hover:text-white transition-[border-color,color] duration-150"
                  >
                    Message on Facebook
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
