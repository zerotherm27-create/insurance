import type { NurtureTemplate } from '@/types/nurture'
import { usesQuizVars } from '@/types/email-template'

export interface NurtureLead {
  segment: string | null
  source: string | null
  event_tag: string | null
  ai_report: unknown
  nurture_step: number | null
}

// Templates this lead qualifies for, in send order, ignoring how far they have
// progressed. Without a quiz report, templates that use score/gap variables are
// skipped.
export function eligibleNurtureTemplates(
  templates: NurtureTemplate[],
  lead: Omit<NurtureLead, 'nurture_step'>
): NurtureTemplate[] {
  return templates.filter((t) => {
    if (!lead.ai_report && usesQuizVars(t.subject, t.heading, t.cta_text, ...t.paragraphs)) return false
    const segs = t.segments ?? []
    const segMatch = segs.length === 0 || (!!lead.segment && segs.includes(lead.segment))
    const srcs = t.sources ?? []
    const srcMatch = srcs.length === 0 || srcs.includes(lead.source ?? 'quiz')
    const evts = t.event_tags ?? []
    const evtMatch = evts.length === 0 || (!!lead.event_tag && evts.includes(lead.event_tag))
    return segMatch && srcMatch && evtMatch
  })
}

// The next nurture template a lead is due: first eligible one past their last
// sent position.
export function pickNextNurtureTemplate(
  templates: NurtureTemplate[],
  lead: NurtureLead
): NurtureTemplate | null {
  return eligibleNurtureTemplates(templates, lead).find((t) => t.position > (lead.nurture_step ?? 0)) ?? null
}
