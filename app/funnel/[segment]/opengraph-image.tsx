import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Free Financial Protection Check'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const CARDS: Record<string, { tag: string; line1: string; line2: string; sub: string }> = {
  pro: {
    tag: 'FOR YOUNG PROFESSIONALS',
    line1: 'You earn well.',
    line2: 'But are you protected?',
    sub: 'Free 2-minute check — find the one gap most professionals miss.',
  },
  family: {
    tag: 'FOR PARENTS & PROVIDERS',
    line1: 'Your family trusts you.',
    line2: 'Make sure they are covered.',
    sub: 'Free 2-minute check — see exactly where your family stands.',
  },
  ofw: {
    tag: 'PARA SA MGA OFW',
    line1: 'You left home for them.',
    line2: 'Give that love a plan.',
    sub: 'Free 2-minute check — is your family fully protected back home?',
  },
  entrepreneur: {
    tag: 'FOR THE SELF-EMPLOYED',
    line1: 'You are the business.',
    line2: 'Who protects you?',
    sub: 'Free 2-minute check — your safety net when you cannot work.',
  },
  business: {
    tag: 'FOR BUSINESS OWNERS',
    line1: 'You built something real.',
    line2: 'Could it survive without you?',
    sub: 'Free 2-minute check — continuity, succession & key-person gaps.',
  },
  hnw: {
    tag: 'FOR ESTABLISHED FAMILIES',
    line1: 'Wealth is not the legacy.',
    line2: 'The plan to keep it is.',
    sub: 'A private 2-minute assessment of your legacy & estate gaps.',
  },
}

const FALLBACK = {
  tag: 'FREE FINANCIAL PROTECTION CHECK',
  line1: "What's Your",
  line2: 'Financial Protection Score?',
  sub: 'A free 2-minute check — at any stage of life.',
}

export default async function SegmentOgImage({
  params,
}: {
  params: Promise<{ segment: string }>
}) {
  const { segment } = await params
  const c = CARDS[segment] ?? FALLBACK

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #0A1628 0%, #0F1F3D 50%, #162B52 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #F6B21A 0%, #D9A441 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0A1628',
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            S
          </div>
          <div style={{ color: '#F6B21A', fontSize: 22, letterSpacing: 4 }}>{c.tag}</div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            color: '#ffffff',
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.08,
          }}
        >
          <span>{c.line1}</span>
          <span style={{ color: '#F6B21A' }}>{c.line2}</span>
        </div>

        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 28, marginTop: 32, maxWidth: 950 }}>
          {c.sub}
        </div>

        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 20, marginTop: 48 }}>
          Safety Margin Advisor · Sun Life — Neem Tree Branch
        </div>
      </div>
    ),
    { ...size }
  )
}
