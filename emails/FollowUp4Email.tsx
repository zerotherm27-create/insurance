import {
  Html, Head, Body, Container, Section, Text, Button, Hr,
} from '@react-email/components'
import type { FunnelAIReport } from '@/types/funnel'

interface FollowUp4EmailProps {
  firstName: string
  report: FunnelAIReport
  calendlyUrl: string
  fbUrl: string
}

export function FollowUp4Email({ firstName, report, calendlyUrl, fbUrl }: FollowUp4EmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0A1628', fontFamily: 'Inter, Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 16px' }}>
          <Text style={{ color: '#F6B21A', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 24px' }}>
            A story for you, {firstName} 💛
          </Text>

          <Text style={{ color: '#ffffff', fontSize: '20px', fontFamily: 'Georgia, serif', margin: '0 0 16px', lineHeight: '1.4' }}>
            She almost didn&apos;t do it. Then one phone call changed everything.
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 16px' }}>
            Ana was 29, working in Makati, and kept telling herself she&apos;d &quot;deal with insurance later.&quot; She wasn&apos;t sick, she had her HMO, and money was tight after rent.
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 16px' }}>
            Then her dad had a stroke.
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 16px' }}>
            No life insurance. No emergency fund. Suddenly she was the one holding everything together — her family, her job, and a hospital bill that wiped out two years of savings.
          </Text>

          <Section style={{ backgroundColor: '#1A2F57', borderRadius: '10px', padding: '16px 20px', marginBottom: '16px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              &quot;I wish I had taken that 30-minute call seriously. I kept thinking I had time.&quot;
            </Text>
          </Section>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 24px' }}>
            {firstName}, you already took the first step — you know your score. The next step is just a conversation. Let&apos;s make sure you&apos;re not in Ana&apos;s situation.
          </Text>

          <Section style={{ textAlign: 'center', marginBottom: '12px' }}>
            <Button
              href={calendlyUrl}
              style={{ backgroundColor: '#F6B21A', color: '#0A1628', borderRadius: '10px', padding: '14px 32px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}
            >
              Book Your Free Call →
            </Button>
          </Section>

          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', textAlign: 'center', margin: '0 0 24px' }}>
            Or message me on{' '}
            <a href={fbUrl} style={{ color: '#F6B21A', textDecoration: 'none' }}>Facebook Messenger</a>
            {' '}if that&apos;s easier.
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: '1.6', margin: '0 0 8px' }}>
            — Jojo, Sun Life of Canada Philippines, Inc.
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: '1.6', margin: '0' }}>
            P.S. This is the last email in this series. I won&apos;t keep bugging you — but I&apos;m always here if you need a trusted friend in finance. 😊
          </Text>

          <Hr style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '24px 0' }} />
          <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', textAlign: 'center', lineHeight: '1.6', margin: 0 }}>
            This is not financial advice. For personalized recommendations, please consult a licensed advisor.
            Story used for illustrative purposes. Details changed for privacy.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
