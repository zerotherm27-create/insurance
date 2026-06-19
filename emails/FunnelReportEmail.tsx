import {
  Html, Head, Body, Container, Section, Text, Button, Hr, Link,
} from '@react-email/components'
import type { FunnelAIReport } from '@/types/funnel'

interface FunnelReportEmailProps {
  firstName: string
  report: FunnelAIReport
  reportUrl: string
  calendlyUrl: string
  fbUrl: string
}

export function FunnelReportEmail({ firstName, report, reportUrl, calendlyUrl, fbUrl }: FunnelReportEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0A1628', fontFamily: 'Inter, Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 16px' }}>

          {/* Wordmark */}
          <Text style={{ color: '#F6B21A', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 28px' }}>
            Safety Margin
          </Text>

          {/* Heading */}
          <Text style={{ color: '#ffffff', fontSize: '22px', fontFamily: 'Georgia, serif', margin: '0 0 8px', lineHeight: '1.35' }}>
            Hi {firstName}, your report is ready.
          </Text>

          {/* Score callout */}
          <Section style={{ backgroundColor: '#162B52', border: '1px solid rgba(246,178,26,0.2)', borderRadius: '10px', padding: '16px 20px', margin: '20px 0' }}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 6px' }}>
              Your Protection Score
            </Text>
            <Text style={{ color: '#F6B21A', fontSize: '36px', fontFamily: 'Georgia, serif', fontWeight: '700', margin: '0 0 4px', lineHeight: 1 }}>
              {report.protectionScore}
              <span style={{ color: 'rgba(246,178,26,0.4)', fontSize: '20px', fontWeight: '400' }}>/100</span>
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>
              {report.scoreLabel}
            </Text>
          </Section>

          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 16px' }}>
            Thank you for taking the Financial Protection Check. Your complete report is ready, with your identified coverage gaps and the amounts I would aim for in your situation.
          </Text>

          {/* Primary CTA */}
          <Section style={{ textAlign: 'center', margin: '24px 0 8px' }}>
            <Button
              href={reportUrl}
              style={{ backgroundColor: '#F6B21A', color: '#0A1628', borderRadius: '10px', padding: '14px 32px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}
            >
              Read your full report →
            </Button>
          </Section>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textAlign: 'center', margin: '0 0 28px' }}>
            Check Spam or Promotions if you don&apos;t see follow-up emails from me.
          </Text>

          {/* Biggest gap */}
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 8px' }}>
            The one finding I want you to see
          </Text>
          <Text style={{ color: '#ffffff', fontSize: '15px', lineHeight: '1.65', margin: '0 0 16px', fontWeight: '500' }}>
            {report.biggestGap}
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 28px' }}>
            That is not meant to alarm you. It is a starting point. Most people I talk to have the same gap, and the ones who close it all started the same way: they simply knew where they stood first.
          </Text>

          <Hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '0 0 24px' }} />

          {/* Consult CTA */}
          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 20px' }}>
            If you want, we can go through your report together. I set aside free 30-minute consultations for everyone who takes the check. No pressure, nothing to bring.
          </Text>

          <Section style={{ textAlign: 'center', margin: '0 0 12px' }}>
            <Button
              href={calendlyUrl}
              style={{ backgroundColor: 'transparent', color: '#F6B21A', border: '1px solid rgba(246,178,26,0.4)', borderRadius: '10px', padding: '12px 28px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', display: 'inline-block' }}
            >
              Book a free consultation
            </Button>
          </Section>

          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textAlign: 'center', margin: '0 0 32px' }}>
            Or{' '}
            <Link href={fbUrl} style={{ color: '#F6B21A', textDecoration: 'none' }}>message me on Messenger</Link>
            {' '}— whichever is easier for you.
          </Text>

          {/* Signature */}
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', lineHeight: '1.6', margin: '0 0 2px' }}>
            Ingat,
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: '600', margin: '0 0 2px' }}>
            Jojo
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: '0 0 32px' }}>
            Safety Margin · Licensed Insurance Advisor
          </Text>

          <Hr style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '0 0 16px' }} />
          <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', textAlign: 'center', lineHeight: '1.6', margin: 0 }}>
            Your report is educational and not an official insurance proposal. Exact amounts must be validated through an official proposal and consultation with a licensed advisor.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
