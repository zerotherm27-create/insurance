import { notFound } from 'next/navigation'
import { DeckRunner } from '@/components/deck/DeckRunner'
import { getDeck } from '@/lib/deck/registry'
import type { FunnelSegment } from '@/types/funnel'

export default async function SegmentDeckPage({
  params,
}: {
  params: Promise<{ segment: string }>
}) {
  const { segment } = await params
  if (!getDeck(segment)) notFound()

  return <DeckRunner segment={segment as FunnelSegment} />
}
