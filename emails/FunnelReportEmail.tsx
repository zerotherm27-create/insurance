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
 * text link). Plain-looking 1:1 emails land in Gmail Primary far more often
 * than designed HTML, and this email is the only path to the full report.
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
          <Text style={p}>Hello, {firstName} 👋</Text>

          <Text style={p}>
            Here is your full Coverage Report. I&apos;m sending it here so you can open it anytime,
            even after you close your browser:
          </Text>

          <Text style={{ ...p, fontSize: '16px' }}>
            👉{' '}
            <Link href={reportUrl} style={{ color: '#1a56db', fontWeight: 700, textDecoration: 'underline' }}>
              [{firstName} — Full Coverage Report]
            </Link>
          </Text>

          <Text style={p}>Based on what you shared, here is what stood out:</Text>

          <Text style={{ ...p, fontWeight: 700 }}>⚠️ {report.biggestGap}</Text>

          <Hr style={{ borderColor: '#e5e5e5', margin: '8px 0 22px', width: '60px', marginLeft: 0 }} />

          <Text style={p}>
            Whenever you&apos;re ready to turn those numbers into an actual plan built around your
            budget and priorities, that&apos;s what the free consultation is for.
          </Text>

          <Text style={p}>
            It&apos;s free for everyone who took the check. 30 minutes. And I&apos;ll already have your
            answers to work from:{' '}
            <Link href={calendlyUrl} style={{ color: '#1a56db', textDecoration: 'underline' }}>
              pick a time here
            </Link>
            .
          </Text>

          <Text style={{ ...p, margin: '0 0 4px' }}>Your advisor,</Text>
          <Text style={{ ...p, margin: '0 0 24px' }}>Jojo · Safety Margin</Text>

          <Text style={{ ...p, fontSize: '13px', color: '#555555' }}>
            P.S. If this email landed in your Spam or Promotions folder, move it to your inbox so you
            don&apos;t miss my follow-ups. And if it&apos;s easier, you can also{' '}
            <Link href={fbUrl} style={{ color: '#1a56db', textDecoration: 'underline' }}>
              message me on Facebook
            </Link>
            .
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
