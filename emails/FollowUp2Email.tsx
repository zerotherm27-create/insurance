import {
  Html, Head, Body, Container, Section, Text, Button, Hr,
} from '@react-email/components'
import type { FunnelAIReport } from '@/types/funnel'

interface FollowUp2EmailProps {
  firstName: string
  report: FunnelAIReport
  calendlyUrl: string
  fbUrl: string
}

export function FollowUp2Email({ firstName, report, calendlyUrl, fbUrl }: FollowUp2EmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0A1628', fontFamily: 'Inter, Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 16px' }}>
          <Text style={{ color: '#F6B21A', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 24px' }}>
            A quick tip for you, {firstName}
          </Text>

          <Text style={{ color: '#ffffff', fontSize: '20px', fontFamily: 'Georgia, serif', margin: '0 0 16px', lineHeight: '1.4' }}>
            The #1 mistake Filipinos make with their finances 📋
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 16px' }}>
            It&apos;s not about not saving enough. It&apos;s about <strong style={{ color: '#ffffff' }}>saving before protecting</strong>.
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 16px' }}>
            Here&apos;s the reality: if a medical emergency or income loss hits before you have protection in place, it can wipe out months or even years of savings in a single event.
          </Text>

          <Section style={{ backgroundColor: '#1A2F57', borderRadius: '10px', padding: '16px 20px', marginBottom: '16px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              💡 <strong>The right order:</strong> Protect first → build emergency fund → then grow wealth. In that sequence, each layer supports the next.
            </Text>
          </Section>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 24px' }}>
            Your score of <strong style={{ color: '#F6B21A' }}>{report.protectionScore}/100</strong> tells me there&apos;s a gap worth closing. The good news: {report.recommendation}
          </Text>

          <Section style={{ textAlign: 'center', marginBottom: '12px' }}>
            <Button
              href={calendlyUrl}
              style={{ backgroundColor: '#F6B21A', color: '#0A1628', borderRadius: '10px', padding: '14px 28px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}
            >
              Let&apos;s talk about your plan →
            </Button>
          </Section>

          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', textAlign: 'center', margin: '0 0 24px' }}>
            Or message me on{' '}
            <a href={fbUrl} style={{ color: '#F6B21A', textDecoration: 'none' }}>Facebook Messenger</a>
            {' '}if that&apos;s easier.
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontWeight: '600', lineHeight: '1.6', margin: '0 0 2px' }}>
            Jojo
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', lineHeight: '1.6', margin: '0' }}>
            Licensed Insurance Advisor | Sun Life
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
