import { render } from '@react-email/render'
import { FunnelReportEmail } from '@/emails/FunnelReportEmail'
import { FollowUp1Email } from '@/emails/FollowUp1Email'
import { FollowUp2Email } from '@/emails/FollowUp2Email'
import { FollowUp3Email } from '@/emails/FollowUp3Email'
import { FollowUp4Email } from '@/emails/FollowUp4Email'
import { FlowEmail } from '@/emails/FlowEmail'
import { Resend } from 'resend'
import type { FunnelAIReport } from '@/types/funnel'
import { substituteVars } from '@/types/email-template'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}
function getFrom() { return process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev' }
function getCalendly() { return process.env.NEXT_PUBLIC_ADVISOR_CALENDLY_URL ?? '#' }
function getFb() { return process.env.NEXT_PUBLIC_ADVISOR_FB_URL ?? '#' }

export async function sendFunnelReport({
  leadId,
  firstName,
  email,
  report,
}: {
  leadId: string
  firstName: string
  email: string
  report: FunnelAIReport
}) {
  void leadId // reserved for future tracing
  const html = await render(
    <FunnelReportEmail firstName={firstName} report={report} calendlyUrl={getCalendly()} fbUrl={getFb()} />
  )
  const { error } = await getResend().emails.send({
    from: `Jojo from Sun Life <${getFrom()}>`,
    to: email,
    subject: `${firstName}, here is your Financial Protection Report 🛡️`,
    html,
  })
  if (error) throw new Error(`Resend error: ${error.message}`)
}

export async function sendSequenceEmail({
  step,
  firstName,
  email,
  report,
}: {
  step: 1 | 2 | 3 | 4
  firstName: string
  email: string
  report: FunnelAIReport
}) {
  const configs: Record<1 | 2 | 3 | 4, { element: React.ReactNode; subject: string }> = {
    1: {
      element: <FollowUp1Email firstName={firstName} report={report} calendlyUrl={getCalendly()} fbUrl={getFb()} />,
      subject: `${firstName}, did you review your results?`,
    },
    2: {
      element: <FollowUp2Email firstName={firstName} report={report} calendlyUrl={getCalendly()} fbUrl={getFb()} />,
      subject: 'The #1 mistake Filipinos make with insurance 📋',
    },
    3: {
      element: <FollowUp3Email firstName={firstName} report={report} calendlyUrl={getCalendly()} fbUrl={getFb()} />,
      subject: `${firstName}, ready to close your protection gaps?`,
    },
    4: {
      element: <FollowUp4Email firstName={firstName} report={report} calendlyUrl={getCalendly()} fbUrl={getFb()} />,
      subject: 'A quick story about someone in your situation 💛',
    },
  }

  const { element, subject } = configs[step]
  const html = await render(element)
  const { error } = await getResend().emails.send({
    from: `Jojo from Sun Life <${getFrom()}>`,
    to: email,
    subject,
    html,
  })
  if (error) throw new Error(`Resend error: ${error.message}`)
}


export async function sendFlowEmail({
  leadId,
  firstName,
  email,
  protectionScore,
  aiReport,
  templateId,
}: {
  leadId: string
  firstName: string
  email: string
  protectionScore: number
  aiReport: FunnelAIReport | null
  templateId: string
}): Promise<void> {
  void leadId
  const { createServiceClient } = await import('@/lib/supabase')
  const supabase = createServiceClient()

  const { data: template, error: tErr } = await supabase
    .from('email_templates')
    .select('subject,heading,paragraphs,cta_text')
    .eq('id', templateId)
    .single()

  if (tErr || !template) throw new Error(`Template not found: ${templateId}`)

  const vars: Record<string, string> = {
    firstName,
    score: String(protectionScore ?? 0),
    scoreLabel: aiReport?.scoreLabel ?? '',
    gap: aiReport?.biggestGap ?? '',
    recommendation: aiReport?.recommendation ?? '',
    nextStep: aiReport?.nextStep ?? '',
  }

  const subject = substituteVars(template.subject as string, vars)
  const heading = substituteVars(template.heading as string, vars)
  const paragraphs = (template.paragraphs as string[]).map((p) => substituteVars(p, vars))
  const ctaText = substituteVars(template.cta_text as string, vars)

  const html = await render(
    <FlowEmail
      firstName={firstName}
      heading={heading}
      paragraphs={paragraphs}
      ctaText={ctaText}
      calendlyUrl={getCalendly()}
      fbUrl={getFb()}
    />
  )

  const { error: sendError } = await getResend().emails.send({
    from: `Jojo from Sun Life <${getFrom()}>`,
    to: email,
    subject,
    html,
  })
  if (sendError) throw new Error(`Resend error: ${sendError.message}`)
}
