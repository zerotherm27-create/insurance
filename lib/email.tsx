import { render } from '@react-email/render'
import { FunnelReportEmail } from '@/emails/FunnelReportEmail'
import { FollowUp1Email } from '@/emails/FollowUp1Email'
import { FollowUp2Email } from '@/emails/FollowUp2Email'
import { FollowUp3Email } from '@/emails/FollowUp3Email'
import { FollowUp4Email } from '@/emails/FollowUp4Email'
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

function buildFlowEmailHtml({
  heading,
  paragraphs,
  ctaText,
  calendlyUrl,
}: {
  heading: string
  paragraphs: string[]
  ctaText: string
  calendlyUrl: string
}): string {
  const paraHtml = paragraphs
    .map((p) => `<p style="margin:0 0 16px;color:#e2e8f0;font-size:15px;line-height:1.7;">${p}</p>`)
    .join('')
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A1628;font-family:'Inter',Arial,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#1A2F57;border-radius:16px;overflow:hidden;">
  <div style="padding:32px 32px 0;border-bottom:1px solid rgba(246,178,26,0.2);">
    <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#F6B21A;">Sun Life Philippines</p>
    <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">${heading}</h1>
  </div>
  <div style="padding:28px 32px;">
    ${paraHtml}
    <div style="margin-top:24px;">
      <a href="${calendlyUrl}" style="display:inline-block;background:#F6B21A;color:#0A1628;font-weight:700;font-size:14px;padding:14px 28px;border-radius:10px;text-decoration:none;">${ctaText}</a>
    </div>
  </div>
  <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);">
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);">Jojo Cruzado · Sun Life of Canada Philippines, Inc. · This is an educational tool, not a licensed insurance proposal. <a href="https://safetymargin.app/data-deletion" style="color:rgba(246,178,26,0.6);">Unsubscribe</a></p>
  </div>
</div>
</body></html>`
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

  const html = buildFlowEmailHtml({ heading, paragraphs, ctaText, calendlyUrl: getCalendly() })

  const { error: sendError } = await getResend().emails.send({
    from: `Jojo from Sun Life <${getFrom()}>`,
    to: email,
    subject,
    html,
  })
  if (sendError) throw new Error(`Resend error: ${sendError.message}`)
}
