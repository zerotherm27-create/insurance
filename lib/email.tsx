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
import { topGapFromReport } from '@/lib/coverage-benefits'
import type { NurtureTemplate } from '@/types/nurture'

// Single source of truth for template {variable} values, shared by the flow
// drip and the nurture series. Keep in sync with PREVIEW_VARS in
// types/email-template.ts and the AI generation prompts.
function buildTemplateVars(
  firstName: string,
  protectionScore: number,
  aiReport: FunnelAIReport | null
): Record<string, string> {
  const topGap = topGapFromReport(aiReport)
  return {
    firstName,
    score: String(protectionScore ?? 0),
    scoreLabel: aiReport?.scoreLabel ?? '',
    gap: aiReport?.biggestGap ?? '',
    recommendation: aiReport?.recommendation ?? '',
    nextStep: aiReport?.nextStep ?? '',
    topGapName: topGap.name,
    topGapIdeal: topGap.ideal,
    topGapStarter: topGap.starter,
  }
}

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
  const html = await render(
    <FunnelReportEmail firstName={firstName} report={report} calendlyUrl={getCalendly()} fbUrl={getFb()} />
  )
  const { error } = await getResend().emails.send({
    from: `Jojo from Safety Margin <${getFrom()}>`,
    to: email,
    subject: `${firstName}, here is your Financial Protection Report 🛡️`,
    html,
    tags: [
      { name: 'lead_id', value: leadId },
      { name: 'template_id', value: 'report' },
    ],
  })
  if (error) throw new Error(`Resend error: ${error.message}`)
}

export async function sendSequenceEmail({
  leadId,
  step,
  firstName,
  email,
  report,
}: {
  leadId: string
  step: 1 | 2 | 3 | 4
  firstName: string
  email: string
  report: FunnelAIReport
}) {
  const templateId = `followup_${step}`
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
    from: `Jojo from Safety Margin <${getFrom()}>`,
    to: email,
    subject,
    html,
    tags: [
      { name: 'lead_id', value: leadId },
      { name: 'template_id', value: templateId },
    ],
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

  const vars = buildTemplateVars(firstName, protectionScore, aiReport)

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
    from: `Jojo from Safety Margin <${getFrom()}>`,
    to: email,
    subject,
    html,
    tags: [
      { name: 'lead_id', value: leadId },
      { name: 'template_id', value: templateId },
    ],
  })
  if (sendError) throw new Error(`Resend error: ${sendError.message}`)
}

export async function sendNurtureEmail({
  leadId,
  firstName,
  email,
  protectionScore,
  aiReport,
  template,
}: {
  leadId: string
  firstName: string
  email: string
  protectionScore: number
  aiReport: FunnelAIReport | null
  template: Pick<NurtureTemplate, 'position' | 'subject' | 'heading' | 'paragraphs' | 'cta_text'>
}): Promise<void> {
  const vars = buildTemplateVars(firstName, protectionScore, aiReport)

  const subject = substituteVars(template.subject, vars)
  const heading = substituteVars(template.heading, vars)
  const paragraphs = template.paragraphs.map((p) => substituteVars(p, vars))
  const ctaText = substituteVars(template.cta_text, vars)

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

  const { error } = await getResend().emails.send({
    from: `Jojo from Safety Margin <${getFrom()}>`,
    to: email,
    subject,
    html,
    tags: [
      { name: 'lead_id', value: leadId },
      { name: 'template_id', value: `nurture_${template.position}` },
    ],
  })
  if (error) throw new Error(`Resend error: ${error.message}`)
}
