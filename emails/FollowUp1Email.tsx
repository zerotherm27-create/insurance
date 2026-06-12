import {
  Html, Head, Body, Container, Section, Text, Button, Hr,
} from '@react-email/components'
import type { FunnelAIReport } from '@/types/funnel'
import { topGapFromReport } from '@/lib/coverage-benefits'

interface FollowUp1EmailProps {
  firstName: string
  report: FunnelAIReport
  calendlyUrl: string
  fbUrl: string
}

export function FollowUp1Email({ firstName, report, calendlyUrl, fbUrl }: FollowUp1EmailProps) {
  const topGap = topGapFromReport(report)
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0A1628', fontFamily: 'Inter, Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 16px' }}>
          <Text style={{ color: '#F6B21A', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 24px' }}>
            Safety Margin
          </Text>

          <Text style={{ color: '#ffffff', fontSize: '20px', fontFamily: 'Georgia, serif', margin: '0 0 16px', lineHeight: '1.4' }}>
            Hi {firstName}, did you get a chance to review your results?
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 16px' }}>
            Yesterday you got your Financial Protection Score: <strong style={{ color: '#F6B21A' }}>{report.protectionScore}/100</strong> ({report.scoreLabel}).
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 16px' }}>
            The biggest thing I noticed: {report.biggestGap}
          </Text>

          {report.coverageBenefits && report.coverageBenefits.length > 0 && (
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 24px' }}>
              For {topGap.name}, the ideal level for your profile is{' '}
              <strong style={{ color: '#F6B21A' }}>{topGap.ideal}</strong>. You don&apos;t have to start there.
              A starter level of <strong style={{ color: '#F6B21A' }}>{topGap.starter}</strong> already puts real protection in place.
            </Text>
          )}

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 24px' }}>
            If you have 15 minutes this week, I&apos;d love to walk you through what this means for your situation. Completely free, no pressure. Just real talk about your options.
          </Text>

          <Section style={{ textAlign: 'center', marginBottom: '12px' }}>
            <Button
              href={calendlyUrl}
              style={{ backgroundColor: '#F6B21A', color: '#0A1628', borderRadius: '10px', padding: '14px 28px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}
            >
              Book a Free 15-min Call →
            </Button>
          </Section>

          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', textAlign: 'center', margin: '0 0 24px' }}>
            Or message me on{' '}
            <a href={fbUrl} style={{ color: '#F6B21A', textDecoration: 'none' }}>Facebook Messenger</a>
            {' '}if that&apos;s easier.
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: '1.6', margin: '0 0 8px' }}>
            Or just reply to this email. I read every message. 😊
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
