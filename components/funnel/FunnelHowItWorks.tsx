import type { FunnelSegment } from '@/types/funnel'

interface Step {
  step: string
  title: string
  desc: string
}

const DEFAULT_STEPS: Step[] = [
  {
    step: '01',
    title: 'Answer 7 quick questions',
    desc: 'Takes 2 minutes. Multiple choice, specific to your life stage.',
  },
  {
    step: '02',
    title: 'Get your Protection Score',
    desc: 'See your score out of 100, your biggest gap, and a personalized analysis.',
  },
  {
    step: '03',
    title: 'Jojo walks you through it',
    desc: 'A free 30-minute call to review your results. No commitment, no pressure.',
  },
]

const HNW_STEPS: Step[] = [
  {
    step: '01',
    title: 'Answer a few private questions',
    desc: 'Takes 2 minutes. Confidential, focused on your estate and legacy.',
  },
  {
    step: '02',
    title: 'Get your Legacy assessment',
    desc: 'See where your estate is exposed to probate delays and the 6% estate tax.',
  },
  {
    step: '03',
    title: 'A private consultation with Jojo',
    desc: 'A confidential 30-minute review of your results. No obligation.',
  },
]

/**
 * Reusable "how it works" 3-step sequence. Renders only the stepped list so
 * each caller controls its own width and section wrapper. Single source of
 * truth shared by the landing page and the segment hook pages. HNW gets a
 * private, estate-framed variant (never "Free").
 */
export function FunnelHowItWorks({ segment }: { segment?: FunnelSegment }) {
  const steps = segment === 'hnw' ? HNW_STEPS : DEFAULT_STEPS

  return (
    <div className="flex flex-col border-l border-gold/15 pl-6">
      {steps.map(({ step, title, desc }) => (
        <div key={step} className="pb-8 last:pb-0">
          <span className="block font-serif text-sm text-gold/30 leading-none mb-2 tabular-nums">{step}</span>
          <h3 className="font-serif text-lg text-white leading-snug mb-1.5">{title}</h3>
          <p className="font-sans text-sm text-white/50 leading-relaxed max-w-xs">{desc}</p>
        </div>
      ))}
    </div>
  )
}
