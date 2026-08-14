import Image from 'next/image'
import type { FunnelSegment } from '@/types/funnel'

const CALENDLY_URL = process.env.NEXT_PUBLIC_ADVISOR_CALENDLY_URL ?? '#'
const FB_URL = process.env.NEXT_PUBLIC_ADVISOR_FB_URL ?? '#'

const CALLOUT: Record<'default' | 'hnw', { title: string; body: string }> = {
  default: {
    title: "I know exactly where a lot of you are right now. I've been there.",
    body: 'Earning good money, feeling behind, not knowing where to start. This tool exists so you can see your real picture in 2 minutes, for free. No pressure. No sales pitch. Just clarity.',
  },
  hnw: {
    title: 'I work with families who have built something worth protecting.',
    body: 'You have spent years building this. This confidential assessment exists so you can see, in 2 minutes, exactly where your estate is exposed, before it becomes your family\'s problem. No pressure. Just clarity.',
  },
}

/**
 * Jojo's full story section (photo + bio + booking buttons) and the closing
 * callout. Shared by the landing page and the segment pages so they never
 * drift. Only the callout copy varies by segment (HNW gets a peer-level line).
 */
export function AdvisorStory({ segment }: { segment?: FunnelSegment }) {
  const callout = segment === 'hnw' ? CALLOUT.hnw : CALLOUT.default

  return (
    <section className="relative z-10 border-t border-white/5 px-6 py-20 md:px-12">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Photo + bio side by side */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-10 md:gap-14 items-start">
          {/* Photo */}
          <div className="w-full max-w-[300px] mx-auto md:mx-0">
            <Image
              src="/jojo.jpeg"
              alt="Jojo Cruzado, Safety Margin"
              width={300}
              height={380}
              className="w-full rounded-2xl object-cover object-top shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
            />
          </div>

          {/* Bio */}
          <div className="space-y-5">
            <h2 className="font-serif text-2xl md:text-3xl text-white leading-tight">
              A real advisor who built this because he kept seeing the same gaps.
            </h2>

            <p className="font-sans text-white/60 leading-relaxed">
              When I arrived in Singapore as a Field Service Engineer, I thought the hard part was over. Good salary. Better life ahead.
            </p>
            <p className="font-sans text-white/60 leading-relaxed">
              I was wrong. Like a lot of OFWs, the high income didn&apos;t go where it should have. Lifestyle went up. Savings didn&apos;t. My whole family was with me in Singapore, and at one point we were just surviving. Earning well, working hard, and still had nothing to show for it. No savings. No investments. Just bills.
            </p>
            <p className="font-sans text-white/60 leading-relaxed">
              That was the wake-up call. We found a community of people with the same mindset, Filipinos asking the same hard questions about money. Together we learned investing, business, economics, and the one thing that made all the difference: personal development. When you change how you think about money, everything else follows.
            </p>
            <p className="font-sans text-white/60 leading-relaxed">
              Slowly, things started to take shape. Real estate, a laundry business, a design and build company, and a few other ventures. What started as a desperate attempt to recover became something we were genuinely proud of.
            </p>
            <p className="font-sans text-white/60 leading-relaxed">
              When things got better, I sent my family back home to the Philippines first. A year later, I followed. That was 2018. Coming home not just to the country, but to my family, and to help my wife run everything we had built together.
            </p>
            <p className="font-sans text-white/60 leading-relaxed">
              I joined Sun Life as an insurance advisor because insurance was the one piece I kept seeing missing, even in people already doing the right things. One health crisis. One death in the family. Without protection in place, everything you built can disappear.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-gold text-navy-dark font-sans font-semibold text-sm hover:bg-gold-soft transition-[background-color,transform] duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              >
                Book a Free Call with Jojo
              </a>
              <a
                href={FB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-white/10 text-white/60 font-sans text-sm hover:border-white/20 hover:text-white transition-[border-color,color,transform] duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                Message on Facebook
              </a>
            </div>
          </div>
        </div>

        {/* Closing callout */}
        <div className="bg-gold/5 border border-gold/20 rounded-2xl px-8 py-7 space-y-3">
          <p className="font-serif text-xl md:text-2xl text-white leading-snug">
            {callout.title}
          </p>
          <p className="font-sans text-white/60 leading-relaxed">
            {callout.body}
          </p>
        </div>
      </div>
    </section>
  )
}
