import type { NurtureTemplate } from '@/types/nurture'
import { usesQuizVars } from '@/types/email-template'

export interface NurtureLead {
  segment: string | null
  source: string | null
  event_tag: string | null
  ai_report: unknown
  nurture_step: number | null
}

// The next nurture template a lead is due: first one past their last sent
// position that passes the segment, source and event filters. Without a quiz
// report, templates that use score/gap variables are skipped.
export function pickNextNurtureTemplate(
  templates: NurtureTemplate[],
  lead: NurtureLead
): NurtureTemplate | null {
  return (
    templates.find((t) => {
      if (t.position <= (lead.nurture_step ?? 0)) return false
      if (!lead.ai_report && usesQuizVars(t.subject, t.heading, t.cta_text, ...t.paragraphs)) return false
      const segs = t.segments ?? []
      const segMatch = segs.length === 0 || (!!lead.segment && segs.includes(lead.segment))
      const srcs = t.sources ?? []
      const srcMatch = srcs.length === 0 || srcs.includes(lead.source ?? 'quiz')
      const evts = t.event_tags ?? []
      const evtMatch = evts.length === 0 || (!!lead.event_tag && evts.includes(lead.event_tag))
      return segMatch && srcMatch && evtMatch
    }) ?? null
  )
}
