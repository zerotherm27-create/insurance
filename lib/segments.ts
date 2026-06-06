import type { FunnelSegment } from '@/types/funnel'

export interface SegmentConfig {
  badge: string
  headline: string
  accent: string
  sub: string
  cta: string
  metaTitle: string
  metaDescription: string
}

export const SEGMENTS: Record<FunnelSegment, SegmentConfig> = {
  pro: {
    badge: 'Para sa Young Professionals · 2 minutes · Free',
    headline: 'Nagtatayo ka ng sarili mong pundasyon.',
    accent: "But who covers your family's expenses kung may mangyari sa'yo?",
    sub: 'A free 2-minute Protection Check. Find out the one gap most young Filipinos building their future miss.',
    cta: 'Check My Protection →',
    metaTitle: 'Financial Protection Check for Young Professionals',
    metaDescription: 'Working hard to build your future? Find out the one protection gap most young Filipinos miss. Free 2-minute check.',
  },
  family: {
    badge: 'Para sa mga Magulang · 2 minutes · Free',
    headline: 'Your kids trust you completely.',
    accent: 'They believe you have a plan. This is the 2-minute check to make sure you do.',
    sub: 'Find out if your family would be okay even if something happened to you tomorrow.',
    cta: "Check My Family's Protection →",
    metaTitle: 'Financial Protection Check for Parents & Providers',
    metaDescription: 'Would your family be okay if something happened to you tomorrow? Free 2-minute financial check for Filipino parents and providers.',
  },
  ofw: {
    badge: 'Para sa mga OFW · 2 minutes · Free',
    headline: 'You left home because you love them.',
    accent: 'Make sure that love has a plan, even from the other side of the world.',
    sub: 'A free 2-minute check to find out if your family is fully covered, not just financially supported.',
    cta: 'Check My Protection →',
    metaTitle: 'Financial Protection Check for OFWs',
    metaDescription: 'Working abroad and want to make sure your family is fully protected? Free 2-minute financial check for Overseas Filipino Workers.',
  },
  entrepreneur: {
    badge: 'Para sa mga Negosyante · 2 minutes · Free',
    headline: 'You built the business. You ARE the business.',
    accent: "Who protects everything you've built if you're suddenly out of the picture?",
    sub: 'Most entrepreneurs insure their assets. Almost none insure their most important one. Find out where you stand.',
    cta: 'Check My Protection →',
    metaTitle: 'Financial Protection Check for Self-Employed Filipinos',
    metaDescription: 'Freelancer or solo business owner? Find out if you and your livelihood are truly protected. Free 2-minute check.',
  },
  business: {
    badge: 'Para sa Business Owners · 2 minutes · Free',
    headline: 'Your employees show up every day because they trust you will too.',
    accent: "What happens to your payroll, your partners, your bank guarantees if you suddenly can't be there?",
    sub: 'A free 2-minute check for business owners who have people and obligations depending on them.',
    cta: 'Check My Business Protection →',
    metaTitle: 'Financial Protection Check for Business Owners in the Philippines',
    metaDescription: "You have employees, partners, and bank loans with your name on them. Find out if they're all protected. Free 2-minute check.",
  },
  hnw: {
    badge: 'Private · 2 minutes',
    headline: 'What you leave behind is not just wealth.',
    accent: 'In the Philippines, probate can freeze your estate for years. And your heirs must still pay 6% estate tax in cash within one year.',
    sub: 'A confidential 2-minute assessment to find out if your estate bypasses probate, or risks years of delay, public exposure, and forced asset sales.',
    cta: 'Start My Assessment →',
    metaTitle: 'Legacy & Estate Protection Assessment for Established Filipino Families',
    metaDescription: 'Probate can freeze your estate for years. Is your legacy structured to bypass probate and settle estate tax without forced asset sales? Confidential 2-minute assessment.',
  },
}

export const VALID_SEGMENTS = new Set<string>(Object.keys(SEGMENTS))
