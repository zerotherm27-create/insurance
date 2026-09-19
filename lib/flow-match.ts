import type { FlowDefinition } from '@/types/automation-flow'

export interface ActiveFlowRow {
  id: string
  segments: string[]
  professions: string[]
  event_tags: string[]
  sources: string[]
  updated_at: string
  flow_json: FlowDefinition
}

// A flow matches a lead only when ALL of its non-empty facets (segments,
// professions, event_tags, sources) pass (each a no-op when empty). Score =
// how many of those four facets are non-empty and matched, so a flow scoped
// to more facets (e.g. profession=Doctor + event_tag=Sept Webinar) outranks
// one scoped to fewer, which in turn outranks the all-empty catch-all. Ties
// break toward whichever flow was activated more recently.
function facetScore(target: string[], value: string | null): number | null {
  if (target.length === 0) return 0
  if (!value || !target.includes(value)) return null
  return 1
}

export function matchFlowForLead(
  flows: ActiveFlowRow[],
  lead: { segment: string | null; profession: string | null; eventTag: string | null; source: string | null }
): ActiveFlowRow | null {
  let best: ActiveFlowRow | null = null
  let bestScore = -1
  for (const f of flows) {
    const segScore = facetScore(f.segments, lead.segment)
    const profScore = facetScore(f.professions, lead.profession)
    const eventScore = facetScore(f.event_tags, lead.eventTag)
    const sourceScore = facetScore(f.sources, lead.source)
    if (segScore === null || profScore === null || eventScore === null || sourceScore === null) continue
    const score = segScore + profScore + eventScore + sourceScore
    if (score > bestScore || (score === bestScore && best && f.updated_at > best.updated_at)) {
      best = f
      bestScore = score
    }
  }
  return best
}
