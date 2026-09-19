import type { createServiceClient } from '@/lib/supabase'
import { matchFlowForLead, type ActiveFlowRow } from '@/lib/flow-match'
import { eligibleNurtureTemplates } from '@/lib/nurture-match'
import { TERMINAL_STATUSES } from '@/lib/lead-status'
import type { NurtureTemplate } from '@/types/nurture'

type Db = ReturnType<typeof createServiceClient>
type NamedFlow = ActiveFlowRow & { name: string }

export interface NurtureOption {
  position: number
  label: string
  subject: string
  waitDays: number
}

export interface NurtureInfo {
  flowName: string
  // Nurture emails this lead qualifies for, in send order
  options: NurtureOption[]
  // Position of the last nurture email already sent (0 = none)
  sentThrough: number
}

export interface NurtureContext {
  flows: NamedFlow[]
  templates: NurtureTemplate[]
}

export type ResolvedLead =
  | { error: string; status: number }
  | { flow: NamedFlow; finalNodeId: string; nurture: NurtureInfo }

// Flows and templates are the same for every lead, so load them once per request.
export async function loadNurtureContext(supabase: Db): Promise<NurtureContext> {
  const [{ data: flows }, { data: templates }] = await Promise.all([
    supabase
      .from('automation_flows')
      .select('id, name, segments, professions, event_tags, sources, updated_at, flow_json')
      .eq('is_active', true),
    supabase.from('nurture_templates').select('*').order('position'),
  ])
  return { flows: (flows ?? []) as NamedFlow[], templates: (templates ?? []) as NurtureTemplate[] }
}

// Work out which flow the lead is on, where its last step is, and which nurture
// emails they qualify for.
export async function resolveLead(supabase: Db, ctx: NurtureContext, id: string): Promise<ResolvedLead> {
  const { data: lead, error: leadErr } = await supabase
    .from('funnel_leads')
    .select('id, segment, profession, event_tag, source, status, email, ai_report, nurture_step')
    .eq('id', id)
    .single()
  if (leadErr || !lead) return { error: 'Lead not found', status: 404 }
  if (!lead.email) return { error: 'Lead has no email address', status: 400 }
  if (TERMINAL_STATUSES.includes(lead.status)) {
    return { error: 'Lead is closed, so no emails are sent', status: 400 }
  }

  // Stay on the flow the lead is already tracked against, else match one.
  const { data: state } = await supabase
    .from('lead_flow_state')
    .select('flow_id')
    .eq('lead_id', id)
    .maybeSingle()
  const flow =
    ctx.flows.find((f) => f.id === state?.flow_id) ??
    (matchFlowForLead(ctx.flows, {
      segment: lead.segment ?? null,
      profession: lead.profession ?? null,
      eventTag: lead.event_tag ?? null,
      source: lead.source ?? null,
    }) as NamedFlow | null)
  if (!flow) return { error: 'No active flow covers this lead', status: 409 }

  const { nodes, edges } = flow.flow_json
  const finalNode = nodes.find((n) => n.type !== 'trigger' && !edges.some((e) => e.source === n.id))
  if (!finalNode) return { error: 'Flow has no final step', status: 409 }

  const options = eligibleNurtureTemplates(ctx.templates, lead).map((t) => ({
    position: t.position,
    label: t.label,
    subject: t.subject,
    waitDays: t.wait_days,
  }))

  return { flow, finalNodeId: finalNode.id, nurture: { flowName: flow.name, options, sentThrough: lead.nurture_step ?? 0 } }
}

// Skip the rest of a lead's follow-up flow and start the nurture series at the
// given email: park them on the flow's final node and rewind their nurture
// position so that email is the next one the cron sends. The cron treats a lead
// resting on a send node as already sent, so nothing is re-sent on the way.
export async function applyNurtureSkip(
  supabase: Db,
  leadId: string,
  r: Extract<ResolvedLead, { flow: unknown }>,
  position: number
): Promise<string | null> {
  const now = new Date().toISOString()
  const { error } = await supabase.from('lead_flow_state').upsert(
    { lead_id: leadId, flow_id: r.flow.id, current_node_id: r.finalNodeId, entered_node_at: now, updated_at: now },
    { onConflict: 'lead_id' }
  )
  if (error) return error.message

  // The cron sends the first eligible template past nurture_step, so stepping
  // back one makes the chosen email the next; clearing last_nurtured_at skips
  // its wait period.
  const { error: leadErr } = await supabase
    .from('funnel_leads')
    .update({ nurture_step: position - 1, last_nurtured_at: null })
    .eq('id', leadId)
  return leadErr?.message ?? null
}
