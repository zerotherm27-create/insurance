import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'
import { matchFlowForLead, type ActiveFlowRow } from '@/lib/flow-match'
import { TERMINAL_STATUSES } from '@/lib/lead-status'

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

  const { data: lead, error: leadErr } = await supabase
    .from('funnel_leads')
    .select('id, segment, profession, event_tag, source, status, email')
    .eq('id', id)
    .single()
  if (leadErr || !lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  if (!lead.email) return NextResponse.json({ error: 'Lead has no email address' }, { status: 400 })
  if (TERMINAL_STATUSES.includes(lead.status)) {
    return NextResponse.json({ error: 'Lead is closed, so no emails are sent' }, { status: 400 })
  }

  const { data: flows } = await supabase
    .from('automation_flows')
    .select('id, segments, professions, event_tags, sources, updated_at, flow_json')
    .eq('is_active', true)
  const activeFlows = (flows ?? []) as ActiveFlowRow[]

  // Stay on the flow the lead is already tracked against, else match one.
  const { data: state } = await supabase
    .from('lead_flow_state')
    .select('flow_id')
    .eq('lead_id', id)
    .maybeSingle()
  const flow =
    activeFlows.find((f) => f.id === state?.flow_id) ??
    matchFlowForLead(activeFlows, {
      segment: lead.segment ?? null,
      profession: lead.profession ?? null,
      eventTag: lead.event_tag ?? null,
      source: lead.source ?? null,
    })
  if (!flow) return NextResponse.json({ error: 'No active flow covers this lead' }, { status: 409 })

  const { nodes, edges } = flow.flow_json
  const finalNode = nodes.find((n) => n.type !== 'trigger' && !edges.some((e) => e.source === n.id))
  if (!finalNode) return NextResponse.json({ error: 'Flow has no final step' }, { status: 409 })

  const now = new Date().toISOString()
  const { error } = await supabase.from('lead_flow_state').upsert(
    { lead_id: id, flow_id: flow.id, current_node_id: finalNode.id, entered_node_at: now, updated_at: now },
    { onConflict: 'lead_id' }
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
