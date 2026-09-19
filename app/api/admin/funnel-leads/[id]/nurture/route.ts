import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'
import { matchFlowForLead, type ActiveFlowRow } from '@/lib/flow-match'
import { pickNextNurtureTemplate } from '@/lib/nurture-match'
import { TERMINAL_STATUSES } from '@/lib/lead-status'
import type { NurtureTemplate } from '@/types/nurture'

type Db = ReturnType<typeof createServiceClient>
type Resolved =
  | { error: string; status: number }
  | { flow: ActiveFlowRow & { name: string }; finalNodeId: string; nurture: NurtureInfo }

interface NurtureInfo {
  flowName: string
  // null when the lead has no nurture email left (or none matching them)
  next: { position: number; label: string; subject: string; waitDays: number; readyAt: string | null } | null
}

// Work out which flow the lead is on, where its last step is, and which nurture
// email they would receive next.
async function resolve(supabase: Db, id: string): Promise<Resolved> {
  const { data: lead, error: leadErr } = await supabase
    .from('funnel_leads')
    .select('id, segment, profession, event_tag, source, status, email, ai_report, nurture_step, last_nurtured_at')
    .eq('id', id)
    .single()
  if (leadErr || !lead) return { error: 'Lead not found', status: 404 }
  if (!lead.email) return { error: 'Lead has no email address', status: 400 }
  if (TERMINAL_STATUSES.includes(lead.status)) {
    return { error: 'Lead is closed, so no emails are sent', status: 400 }
  }

  const { data: flows } = await supabase
    .from('automation_flows')
    .select('id, name, segments, professions, event_tags, sources, updated_at, flow_json')
    .eq('is_active', true)
  const activeFlows = (flows ?? []) as (ActiveFlowRow & { name: string })[]

  // Stay on the flow the lead is already tracked against, else match one.
  const { data: state } = await supabase
    .from('lead_flow_state')
    .select('flow_id')
    .eq('lead_id', id)
    .maybeSingle()
  const flow =
    activeFlows.find((f) => f.id === state?.flow_id) ??
    (matchFlowForLead(activeFlows, {
      segment: lead.segment ?? null,
      profession: lead.profession ?? null,
      eventTag: lead.event_tag ?? null,
      source: lead.source ?? null,
    }) as (ActiveFlowRow & { name: string }) | null)
  if (!flow) return { error: 'No active flow covers this lead', status: 409 }

  const { nodes, edges } = flow.flow_json
  const finalNode = nodes.find((n) => n.type !== 'trigger' && !edges.some((e) => e.source === n.id))
  if (!finalNode) return { error: 'Flow has no final step', status: 409 }

  const { data: templates } = await supabase.from('nurture_templates').select('*').order('position')
  const t = pickNextNurtureTemplate((templates ?? []) as NurtureTemplate[], lead)

  let next: NurtureInfo['next'] = null
  if (t) {
    // The cron waits wait_days after the last nurture email before sending the next.
    const readyMs = lead.last_nurtured_at
      ? new Date(lead.last_nurtured_at).getTime() + t.wait_days * 24 * 60 * 60 * 1000
      : 0
    next = {
      position: t.position,
      label: t.label,
      subject: t.subject,
      waitDays: t.wait_days,
      readyAt: readyMs > Date.now() ? new Date(readyMs).toISOString() : null,
    }
  }

  return { flow, finalNodeId: finalNode.id, nurture: { flowName: flow.name, next } }
}

// Preview only: which nurture email this lead would start with. No writes.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const { id } = await params
  const r = await resolve(createServiceClient(), id)
  if ('error' in r) return NextResponse.json({ error: r.error }, { status: r.status })
  return NextResponse.json(r.nurture)
}

// Skip the rest of a lead's follow-up flow: park them on the flow's final node
// so the next cron run starts the nurture series. The cron treats a lead resting
// on a send node as already sent, so nothing is re-sent on the way.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const { id } = await params
  const supabase = createServiceClient()
  const r = await resolve(supabase, id)
  if ('error' in r) return NextResponse.json({ error: r.error }, { status: r.status })

  const now = new Date().toISOString()
  const { error } = await supabase.from('lead_flow_state').upsert(
    { lead_id: id, flow_id: r.flow.id, current_node_id: r.finalNodeId, entered_node_at: now, updated_at: now },
    { onConflict: 'lead_id' }
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, ...r.nurture })
}
