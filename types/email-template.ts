export interface EmailTemplate {
  id: 'report' | 'followup_1' | 'followup_2' | 'followup_3' | 'followup_4'
  label: string
  timing: string
  subject: string
  heading: string
  paragraphs: string[]
  cta_text: string
  updated_at: string
}

// Template variable substitution for preview/display
export function substituteVars(text: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (out, [key, val]) => out.replaceAll(`{${key}}`, val),
    text
  )
}

export const PREVIEW_VARS: Record<string, string> = {
  firstName: 'Maria',
  score: '42',
  scoreLabel: 'Needs Attention',
  gap: 'No life insurance coverage — family has no income replacement if income stops',
  recommendation: 'A life insurance plan with health riders would close your two biggest gaps immediately.',
  nextStep: 'Book a free 15-minute call to see exactly what this would cost for your situation.',
}

export const EMAIL_ORDER: EmailTemplate['id'][] = [
  'report',
  'followup_1',
  'followup_2',
  'followup_3',
  'followup_4',
]
