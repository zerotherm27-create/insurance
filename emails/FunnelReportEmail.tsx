import { Html, Head, Body, Container, Text, Hr, Link } from '@react-email/components'
import type { FunnelAIReport } from '@/types/funnel'

interface FunnelReportEmailProps {
  firstName: string
  report: FunnelAIReport
  reportUrl: string
  calendlyUrl: string
  fbUrl: string
}

/**
 * Deliberately plain, personal-note style (no branded hero, no buttons, one
 * primary text link). Plain-looking 1:1 emails land in Gmail Primary far more
 * often than designed HTML, and this email is the only path to the full report.
 */
export function FunnelReportEmail({ firstName, report, reportUrl, calendlyUrl, fbUrl }: FunnelReportEmailProps) {
  const p = {
    color: '#222222',
    fontSize: '15px',
    lineHeight: '1.7',
    margin: '0 0 18px',
  } as const

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '540px', margin: '0 auto', padding: '28px 20px' }}>
          <Text style={p}>Hi {firstName},</Text>

          <Text style={p}>
            Thank you for taking the Financial Protection Check. I went through what you shared,
            and your complete report is ready, with all your identified benefits and the coverage
            amounts I would aim for in your situation:
          </Text>

          <Text style={{ ...p, fontSize: '16px' }}>
            <Link href={reportUrl} style={{ color: '#1a56db', fontWeight: 700, textDecoration: 'underline' }}>
              Read your full report here
            </Link>
          </Text>

          <Text style={p}>Before anything else, here is the one finding I want you to see:</Text>

          <Text style={{ ...p, fontWeight: 700 }}>{report.biggestGap}</Text>

          <Text style={p}>
            That is not meant to alarm you. It is a starting point. Most people I talk to have the
            same gap, and the ones who close it all started the same way: they simply knew where
            they stood first.
          </Text>

          <Hr style={{ borderColor: '#e5e5e5', margin: '8px 0 22px', width: '60px', marginLeft: 0 }} />

          <Text style={p}>
            If you want, we can go through your report together. I set aside free 30-minute
            consultations for everyone who takes the check. No pressure and nothing to bring,
            since I already have your answers.{' '}
            <Link href={calendlyUrl} style={{ color: '#1a56db', textDecoration: 'underline' }}>
              You can pick a time that works for you here
            </Link>
            .
          </Text>

          <Text style={{ ...p, margin: '0 0 4px' }}>Ingat,</Text>
          <Text style={{ ...p, fontWeight: '600', margin: '0 0 2px' }}>Jojo</Text>
          <Text style={{ ...p, fontSize: '12px', color: '#888888', margin: '0 0 24px' }}>Licensed Insurance Advisor | Sun Life</Text>

          <Text style={{ ...p, fontSize: '13px', color: '#555555' }}>
            P.S. Keep this email. Your report link works anytime, even months from now. And if this
            landed in Spam or Promotions, move it to your inbox so my follow-ups reach you. Mas mabilis
            ka rin makaka-reply sa akin{' '}
            <Link href={fbUrl} style={{ color: '#1a56db', textDecoration: 'underline' }}>
              through Messenger
            </Link>{' '}
            if that is easier for you.
          </Text>

          <Hr style={{ borderColor: '#eeeeee', margin: '24px 0 12px' }} />
          <Text style={{ color: '#999999', fontSize: '11px', lineHeight: '1.6', margin: 0 }}>
            Your report is educational and not an official insurance proposal. Exact amounts must be
            validated through an official proposal and consultation with a licensed advisor.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
