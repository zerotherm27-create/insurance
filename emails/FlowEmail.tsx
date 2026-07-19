import {
  Html, Head, Body, Container, Section, Text, Button, Hr,
} from '@react-email/components'

interface FlowEmailProps {
  firstName: string
  heading: string
  paragraphs: string[]
  ctaText: string
  calendlyUrl: string
  fbUrl: string
}

export function FlowEmail({ firstName, heading, paragraphs, ctaText, calendlyUrl, fbUrl }: FlowEmailProps) {
  void firstName // available for future use in footer or pre-header
  return (
    <Html>
      <Head />
      <Body {...({ bgcolor: '#0A1628' } as any)} style={{ backgroundColor: '#0A1628', fontFamily: 'Inter, Arial, sans-serif', margin: 0, padding: 0 }}>
        <table width="100%" cellPadding="0" cellSpacing="0" bgcolor="#0A1628" style={{ backgroundColor: '#0A1628' }}><tbody><tr><td>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 16px' }}>
          <Text style={{ color: '#F6B21A', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 24px' }}>
            Safety Margin
          </Text>

          <Text style={{ color: '#ffffff', fontSize: '20px', fontFamily: 'Georgia, serif', margin: '0 0 20px', lineHeight: '1.4' }}>
            {heading}
          </Text>

          {paragraphs.map((p, i) => (
            <Text key={i} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 16px' }}>
              {p}
            </Text>
          ))}

          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', lineHeight: '1.6', margin: '0 0 4px' }}>
            Ingat,
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', fontWeight: '600', margin: '0 0 2px' }}>
            Jojo
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: '0 0 28px' }}>
            Licensed Insurance Advisor | Sun Life
          </Text>

          <Section style={{ textAlign: 'center', marginBottom: '12px' }}>
            <Button
              href={calendlyUrl}
              style={{ backgroundColor: '#F6B21A', color: '#0A1628', borderRadius: '10px', padding: '14px 28px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}
            >
              {ctaText}
            </Button>
          </Section>

          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', textAlign: 'center', margin: '0 0 28px' }}>
            Or{' '}
            <a href={fbUrl} style={{ color: '#F6B21A', textDecoration: 'none' }}>message me on Messenger</a>
            {' '}— whichever is easier for you.
          </Text>

          <Hr style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '24px 0' }} />
          <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', textAlign: 'center', lineHeight: '1.6', margin: 0 }}>
            This is not financial advice. For personalized recommendations, please consult a licensed advisor.
          </Text>
        </Container>
        </td></tr></tbody></table>
      </Body>
    </Html>
  )
}
