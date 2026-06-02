import { ImageResponse } from 'next/og'

// Dynamic Open Graph image — shown when the site is shared on Facebook,
// Messenger, Viber, LinkedIn, etc. Branded navy + gold, on-message hook.
export const runtime = 'edge'
export const alt = "What's Your Financial Protection Score? — Free 2-minute check"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #F6B21A 0%, #D9A441 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0A1628',
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            S
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 24, letterSpacing: 4 }}>
            SAFETY MARGIN ADVISOR
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', color: '#ffffff', fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>
          <span>What&apos;s Your</span>
          <span style={{ color: '#F6B21A' }}>Financial Protection Score?</span>
        </div>

        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 30, marginTop: 36, maxWidth: 900 }}>
          A free 2-minute check — see exactly where you and your family stand, at any stage of life.
        </div>
      </div>
    ),
    { ...size }
  )
}
