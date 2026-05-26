import {
  Html, Head, Body, Container, Section, Text, Button, Hr,
} from '@react-email/components'
import type { FunnelAIReport } from '@/types/funnel'

interface FollowUp3EmailProps {
  firstName: string
  report: FunnelAIReport
  calendlyUrl: string
  fbUrl: string
}

export function FollowUp3Email({ firstName, report, calendlyUrl, fbUrl }: FollowUp3EmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0A1628', fontFamily: 'Inter, Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 16px' }}>
          <Text style={{ color: '#F6B21A', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 24px' }}>
            Still thinking about it, {firstName}?
          </Text>

          <Text style={{ color: '#ffffff', fontSize: '20px', fontFamily: 'Georgia, serif', margin: '0 0 16px', lineHeight: '1.4' }}>
            Ready to close your protection gaps? 🛡️
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 16px' }}>
            It&apos;s been a week since you took the Financial Protection Check. Your score was <strong style={{ color: '#F6B21A' }}>{report.protectionScore}/100</strong> — and the gap we identified was: <em>{report.biggestGap}</em>
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 24px' }}>
            A free 30-minute conversation can give you a clear picture of what protection looks like for your exact situation — income, family, goals. No sales pitch. Just clarity.
          </Text>

          <Section style={{ backgroundColor: '#1A2F57', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              ⏱️ 30 minutes. Free. No commitment required.
            </Text>
          </Section>

          <Section style={{ textAlign: 'center', marginBottom: '12px' }}>
            <Button
              href={calendlyUrl}
              style={{ backgroundColor: '#F6B21A', color: '#0A1628', borderRadius: '10px', padding: '14px 32px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}
            >
              Book My Free Consultation →
            </Button>
          </Section>

          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', textAlign: 'center', margin: '0 0 24px' }}>
            Or message me on{' '}
            <a href={fbUrl} style={{ color: '#F6B21A', textDecoration: 'none' }}>Facebook Messenger</a>
            {' '}if that&apos;s easier.
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: '1.6', margin: '0' }}>
            — Jojo, Sun Life of Canada Philippines, Inc.
          </Text>

          <Hr style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '24px 0' }} />
          <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', textAlign: 'center', lineHeight: '1.6', margin: 0 }}>
            This is not financial advice. For personalized recommendations, please consult a licensed advisor.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
