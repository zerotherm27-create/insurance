// funnel_leads.source distinguishes the quiz (this app) from the two intake
// paths on the separate jojocruzado.safetymargin.app site that write into the
// same shared table (the /contact form and the /card digital business card),
// plus 'manual' for leads Jojo adds himself from the admin dashboard.
// 'protection_gap_calculator' and 'chatbot' are written by the same site.
export type LeadSource = 'quiz' | 'contact_form' | 'business_card' | 'manual' | 'protection_gap_calculator' | 'chatbot'

export const SOURCE_LABEL: Record<LeadSource, string> = {
  quiz: 'Quiz',
  contact_form: 'Contact Form',
  business_card: 'Business Card',
  manual: 'Manual',
  protection_gap_calculator: 'Gap Calculator',
  chatbot: 'Chatbot',
}

export const SOURCE_COLOR: Record<LeadSource, string> = {
  quiz: 'bg-white/5 text-white/50 border-white/10',
  contact_form: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  business_card: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  manual: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  protection_gap_calculator: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  chatbot: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
}

export function sourceLabel(source?: string | null): string {
  return SOURCE_LABEL[source as LeadSource] ?? SOURCE_LABEL.quiz
}

export function sourceColor(source?: string | null): string {
  return SOURCE_COLOR[source as LeadSource] ?? SOURCE_COLOR.quiz
}
