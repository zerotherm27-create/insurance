import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const { id } = await params

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('automation_flows')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ flow: data })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const authError = checkAdminAuth(req)
  if (authError) return authError

  let body: { name?: string; flow_json?: unknown; is_active?: boolean; segments?: string[] }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // If activating: multiple flows can be active at once, each targeting its
  // own segment(s). Only deactivate OTHER active flows whose target segments
  // overlap this one — an empty segments array (catch-all) only conflicts
  // with other catch-all flows, since segment-specific flows take priority
  // over the catch-all at cron time.
  if (body.is_active === true) {
    const { data: thisFlow } = await supabase
      .from('automation_flows')
      .select('segments')
      .eq('id', id)
      .single()
    const targetSegments: string[] = body.segments ?? thisFlow?.segments ?? []

    const { data: activeFlows } = await supabase
      .from('automation_flows')
      .select('id, segments')
      .eq('is_active', true)
      .neq('id', id)

    const toDeactivate = (activeFlows ?? []).filter((f) => {
      const fSegs: string[] = f.segments ?? []
      if (targetSegments.length === 0) return fSegs.length === 0
      if (fSegs.length === 0) return false
      return fSegs.some((s) => targetSegments.includes(s))
    })

    if (toDeactivate.length > 0) {
      await supabase
        .from('automation_flows')
        .update({ is_active: false })
        .in('id', toDeactivate.map((f) => f.id))
    }

    // Reset this flow's own lead positions — they restart from its trigger.
    // Leads tracked under a flow being deactivated above get re-matched to
    // whichever active flow now covers their segment on the next cron run.
    await supabase.from('lead_flow_state').delete().eq('flow_id', id)
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.name !== undefined) update.name = body.name
  if (body.flow_json !== undefined) update.flow_json = body.flow_json
  if (body.is_active !== undefined) update.is_active = body.is_active
  if (body.segments !== undefined) update.segments = body.segments

  const { data, error } = await supabase
    .from('automation_flows')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ flow: data })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const supabase = createServiceClient()

  // Cannot delete the active flow
  const { data: existing } = await supabase
    .from('automation_flows')
    .select('is_active')
    .eq('id', id)
    .single()

  if (existing?.is_active) {
    return NextResponse.json({ error: 'Cannot delete the active flow. Deactivate it first.' }, { status: 400 })
  }

  const { error } = await supabase.from('automation_flows').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
