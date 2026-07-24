import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DeckRunner } from '@/components/deck/DeckRunner'
import { getDeck } from '@/lib/deck/registry'
import type { FunnelSegment } from '@/types/funnel'

type Props = { params: Promise<{ segment: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segment } = await params
  const deck = getDeck(segment)
  if (!deck) return {}
  const title = `${deck.title} — Safety Margin Deck`
  const description = `Private presentation deck for ${deck.title} — Safety Margin.`
  return {
    title,
    description,
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      title,
      description,
      images: ['/og-image.jpg'],
    },
  }
}

export default async function SegmentDeckPage({ params }: Props) {
  const { segment } = await params
  if (!getDeck(segment)) notFound()

  return <DeckRunner segment={segment as FunnelSegment} />
}
