import type { FunnelSegment } from '@/types/funnel'

// PRO deck (the original Safety Margin deck).
import { Slide1Cover } from '@/components/deck/decks/pro/Slide1Cover'
import { Slide2 as ProSlide2 } from '@/components/deck/decks/pro/Slide2'
import { Slide3 as ProSlide3 } from '@/components/deck/decks/pro/Slide3'
import { Slide4 as ProSlide4 } from '@/components/deck/decks/pro/Slide4'
import { Slide5 as ProSlide5 } from '@/components/deck/decks/pro/Slide5'
import { Slide6 as ProSlide6 } from '@/components/deck/decks/pro/Slide6'
import { Slide7 as ProSlide7 } from '@/components/deck/decks/pro/Slide7'
import { Slide8 as ProSlide8 } from '@/components/deck/decks/pro/Slide8'

// FAMILY deck.
import { Slide1Cover as FamCover } from '@/components/deck/decks/family/Slide1Cover'
import { Slide2Web as FamWeb } from '@/components/deck/decks/family/Slide2Web'
import { Slide3Runway as FamRunway } from '@/components/deck/decks/family/Slide3Runway'
import { Slide4Now as FamNow } from '@/components/deck/decks/family/Slide4Now'
import { Slide5Foundation as FamFoundation } from '@/components/deck/decks/family/Slide5Foundation'
import { Slide6Fit as FamFit } from '@/components/deck/decks/family/Slide6Fit'
import { Slide7Goal as FamGoal } from '@/components/deck/decks/family/Slide7Goal'

// OFW deck.
import { Slide1Cover as OfwCover } from '@/components/deck/decks/ofw/Slide1Cover'
import { Slide2Lifeline as OfwLifeline } from '@/components/deck/decks/ofw/Slide2Lifeline'
import { Slide3Gap as OfwGap } from '@/components/deck/decks/ofw/Slide3Gap'
import { Slide4Contract as OfwContract } from '@/components/deck/decks/ofw/Slide4Contract'
import { Slide5Fit as OfwFit } from '@/components/deck/decks/ofw/Slide5Fit'
import { Slide6Goal as OfwGoal } from '@/components/deck/decks/ofw/Slide6Goal'

export interface DeckDefinition {
  /** Display title, used for the admin dashboard label. */
  title: string
  /** Ordered, self-contained slide components for this segment. */
  slides: React.ComponentType[]
}

// Each segment maps to its own authored deck. Decks are independent — they share
// only the DeckRunner shell, never slide content. Segments without a deck yet are
// omitted; app/deck/[segment]/page.tsx 404s on a missing entry.
export const DECKS: Partial<Record<FunnelSegment, DeckDefinition>> = {
  pro: {
    title: 'Presentation Deck for PRO',
    slides: [Slide1Cover, ProSlide2, ProSlide3, ProSlide4, ProSlide5, ProSlide6, ProSlide7, ProSlide8],
  },
  family: {
    title: 'Family / Breadwinner Deck',
    slides: [FamCover, FamWeb, FamRunway, FamNow, FamFoundation, FamFit, FamGoal],
  },
  ofw: {
    title: 'OFW Deck',
    slides: [OfwCover, OfwLifeline, OfwGap, OfwContract, OfwFit, OfwGoal],
  },
}

export function getDeck(segment: string): DeckDefinition | undefined {
  return DECKS[segment as FunnelSegment]
}
