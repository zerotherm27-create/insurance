import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'
import { matchFlowForLead, type ActiveFlowRow } from '@/lib/flow-match'
import { eligibleNurtureTemplates } from '@/lib/nurture-match'
import { TERMINAL_STATUSES } from '@/lib/lead-status'
import type { NurtureTemplate } from '@/types/nurture'

type Db = ReturnType<typeof createServiceClient>
type Resolved =
  | { error: string; status: number }
  | { flow: ActiveFlowRow & { name: string }; finalNodeId: string; nurture: NurtureInfo }

interface NurtureOption {
  position: number
  label: string
  subject: string
  waitDays: number
}

interface NurtureInfo {
  flowName: string
  // Nurture emails this lead qualifies for, in send order
  options: NurtureOption[]
  // Position of the last nurture email already sent (0 = none)
  sentThrough: number
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
  const options = eligibleNurtureTemplates((templates ?? []) as NurtureTemplate[], lead).map((t) => ({
    position: t.position,
    label: t.label,
    subject: t.subject,
    waitDays: t.wait_days,
  }))

  return { flow, finalNodeId: finalNode.id, nurture: { flowName: flow.name, options, sentThrough: lead.nurture_step ?? 0 } }
}

// Which nurture emails this lead can start from. No writes.
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

// Skip the rest of a lead's follow-up flow and start the nurture series at the
// chosen email: park them on the flow's final node and rewind their nurture
// position so that email is the next one the cron sends. The cron treats a lead
// resting on a send node as already sent, so nothing is re-sent on the way.
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

  const body = await req.json().catch(() => ({}))
  const position = Number(body.position)
  if (!r.nurture.options.some((o) => o.position === position)) {
    return NextResponse.json({ error: 'Choose a nurture email this lead qualifies for' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const { error } = await supabase.from('lead_flow_state').upsert(
    { lead_id: id, flow_id: r.flow.id, current_node_id: r.finalNodeId, entered_node_at: now, updated_at: now },
    { onConflict: 'lead_id' }
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // The cron sends the first eligible template past nurture_step, so stepping
  // back one makes the chosen email the next; clearing last_nurtured_at skips
  // its wait period.
  const { error: leadErr } = await supabase
    .from('funnel_leads')
    .update({ nurture_step: position - 1, last_nurtured_at: null })
    .eq('id', id)
  if (leadErr) return NextResponse.json({ error: leadErr.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
