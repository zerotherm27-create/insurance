'use client'
import { createContext, useContext } from 'react'
import type { FunnelSegment } from '@/types/funnel'

// Lets any slide (goal pickers, nav) know which segment deck it lives in, so the
// discovery handoff can carry ?from=<segment> and return the client to the right
// deck. Set once by DeckRunner; read via useDeckSegment().
const DeckSegmentContext = createContext<FunnelSegment>('pro')

export const DeckSegmentProvider = DeckSegmentContext.Provider

export function useDeckSegment(): FunnelSegment {
  return useContext(DeckSegmentContext)
}

/** Build the discovery handoff URL for the current deck. */
export function discoveryHref(segment: FunnelSegment, goal?: string): string {
  const params = new URLSearchParams({ from: segment })
  if (goal) params.set('goal', goal)
  return `/discovery?${params.toString()}`
}
