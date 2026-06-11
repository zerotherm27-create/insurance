import {
  Html, Head, Body, Container, Section, Heading, Text, Button, Hr,
} from '@react-email/components'
import type { FunnelAIReport } from '@/types/funnel'

interface FunnelReportEmailProps {
  firstName: string
  report: FunnelAIReport
  calendlyUrl: string
  fbUrl: string
}

export function FunnelReportEmail({ firstName, report, calendlyUrl, fbUrl }: FunnelReportEmailProps) {
  const scoreColor =
    report.protectionScore >= 80 ? '#22c55e'
    : report.protectionScore >= 60 ? '#84cc16'
    : report.protectionScore >= 40 ? '#F6B21A'
    : report.protectionScore >= 20 ? '#f97316'
    : '#ef4444'

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0A1628', fontFamily: 'Inter, Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 16px' }}>

          {/* Header */}
          <Section style={{ textAlign: 'center', paddingBottom: '24px' }}>
            <Text style={{ color: '#F6B21A', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 12px' }}>
              Safety Margin
            </Text>
            <Heading style={{ color: '#ffffff', fontSize: '22px', margin: 0, fontFamily: 'Georgia, serif', lineHeight: '1.3' }}>
              Your Financial Protection Report 🛡️
            </Heading>
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', margin: '8px 0 0' }}>
              Hi {firstName}! Here&apos;s what we found based on your answers.
            </Text>
          </Section>

          {/* Score block */}
          <Section style={{ backgroundColor: '#1A2F57', borderRadius: '12px', padding: '24px 20px', textAlign: 'center', marginBottom: '12px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 8px' }}>
              PROTECTION SCORE
            </Text>
            <Text style={{ color: scoreColor, fontSize: '60px', fontFamily: 'Georgia, serif', margin: 0, lineHeight: '1' }}>
              {report.protectionScore}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: '4px 0 10px' }}>
              / 100
            </Text>
            <Text style={{ display: 'inline-block', backgroundColor: `${scoreColor}22`, color: scoreColor, border: `1px solid ${scoreColor}55`, borderRadius: '999px', padding: '4px 18px', fontSize: '12px', margin: 0 }}>
              {report.scoreLabel}
            </Text>
          </Section>

          {/* Coverage benefits (new reports) or legacy snapshot */}
          {report.coverageBenefits && report.coverageBenefits.length > 0 ? (
            <Section style={{ backgroundColor: '#1A2F57', borderRadius: '12px', padding: '20px', marginBottom: '12px' }}>
              <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 12px' }}>
                YOUR COVERAGE BENEFITS
              </Text>
              {report.coverageBenefits.map((b, i) => {
                const statusIcon = b.status === 'have' ? '✅' : b.status === 'partial' ? '⚠️' : '❌'
                const statusLabel = b.status === 'have' ? 'You have this' : b.status === 'partial' ? 'Worth reviewing' : 'Gap detected'
                const statusColor = b.status === 'have' ? '#34d399' : b.status === 'partial' ? '#fbbf24' : '#f87171'
                return (
                  <Section key={b.id} style={{ marginBottom: i === report.coverageBenefits!.length - 1 ? '0' : '16px' }}>
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '600', margin: '0 0 2px', lineHeight: '1.4' }}>
                      {statusIcon} {b.name}{' '}
                      <span style={{ color: statusColor, fontSize: '12px', fontWeight: '400' }}>· {statusLabel}</span>
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 2px', lineHeight: '1.5' }}>
                      <span style={{ color: '#F6B21A' }}>{b.idealLabel ?? 'Ideal coverage'}:</span> {b.idealAmount}
                    </Text>
                    {b.starterAmount && (
                      <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 2px', lineHeight: '1.5' }}>
                        <span style={{ color: 'rgba(246,178,26,0.6)' }}>{b.starterLabel ?? 'Starter coverage'}:</span> {b.starterAmount}
                      </Text>
                    )}
                    {b.whyItMatters && (
                      <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: '2px 0 0', lineHeight: '1.5' }}>
                        {b.whyItMatters}
                      </Text>
                    )}
                  </Section>
                )
              })}
            </Section>
          ) : (
            <Section style={{ backgroundColor: '#1A2F57', borderRadius: '12px', padding: '20px', marginBottom: '12px' }}>
              <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 12px' }}>
                YOUR PROTECTION SNAPSHOT
              </Text>
              {report.snapshot.map((item, i) => (
                <Text key={i} style={{ color: 'rgba(255,255,255,0.78)', fontSize: '14px', margin: '0 0 10px', lineHeight: '1.5' }}>
                  {item.icon} {item.text}
                </Text>
              ))}
            </Section>
          )}

          {/* Gap + Recommendation */}
          <Section style={{ backgroundColor: '#1A2F57', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 10px' }}>
              WHAT YOU NEED MOST
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '0 0 8px', lineHeight: '1.6' }}>
              {report.biggestGap}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', margin: '0 0 10px', lineHeight: '1.6' }}>
              {report.recommendation}
            </Text>
            <Text style={{ color: '#F6B21A', fontSize: '13px', margin: 0 }}>
              {report.coverageBenefits && report.coverageBenefits.length > 0
                ? report.estimatedRange
                : `Estimated monthly cost for your profile: ${report.estimatedRange}`}
            </Text>
          </Section>

          {/* CTA */}
          <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', margin: '0 0 16px', lineHeight: '1.6' }}>
              {report.nextStep}
            </Text>
            <Button
              href={calendlyUrl}
              style={{ backgroundColor: '#F6B21A', color: '#0A1628', borderRadius: '10px', padding: '14px 32px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}
            >
              Book a Free Call with Jojo →
            </Button>
          </Section>

          <Hr style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '24px 0' }} />

          <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', textAlign: 'center', lineHeight: '1.7', margin: 0 }}>
            This assessment is for informational purposes only and does not constitute financial advice.
            Please consult a licensed advisor for personalized recommendations.{'\n'}
            Jojo · Safety Margin
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
