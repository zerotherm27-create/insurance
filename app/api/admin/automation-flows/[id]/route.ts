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

  let body: { name?: string; flow_json?: unknown; is_active?: boolean; segments?: string[]; professions?: string[]; event_tags?: string[]; sources?: string[] }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // A flow matches a lead only when ALL of its non-empty facets (segments,
  // professions, event_tags, sources) pass — each is a no-op when empty.
  // Two flows "conflict" — and activating one deactivates the other — only
  // when they could both match the exact same leads on EVERY facet: an
  // empty facet only conflicts with another empty facet, and a non-empty
  // facet only conflicts with another non-empty facet that shares a value.
  // A flow scoped to segment=ofw+profession=Doctor does NOT conflict with a
  // broader segment=ofw flow (that one still owns every other OFW lead) —
  // cron resolves the overlap by picking whichever flow matches more
  // specifically.
  function facetConflicts(a: string[], b: string[]): boolean {
    if (a.length === 0) return b.length === 0
    if (b.length === 0) return false
    return a.some((v) => b.includes(v))
  }

  if (body.is_active === true) {
    const { data: thisFlow } = await supabase
      .from('automation_flows')
      .select('segments, professions, event_tags, sources')
      .eq('id', id)
      .single()
    const targetSegments: string[] = body.segments ?? thisFlow?.segments ?? []
    const targetProfessions: string[] = body.professions ?? thisFlow?.professions ?? []
    const targetEventTags: string[] = body.event_tags ?? thisFlow?.event_tags ?? []
    const targetSources: string[] = body.sources ?? thisFlow?.sources ?? []

    const { data: activeFlows } = await supabase
      .from('automation_flows')
      .select('id, segments, professions, event_tags, sources')
      .eq('is_active', true)
      .neq('id', id)

    const toDeactivate = (activeFlows ?? []).filter((f) =>
      facetConflicts(targetSegments, f.segments ?? []) &&
      facetConflicts(targetProfessions, f.professions ?? []) &&
      facetConflicts(targetEventTags, f.event_tags ?? []) &&
      facetConflicts(targetSources, f.sources ?? [])
    )

    if (toDeactivate.length > 0) {
      await supabase
        .from('automation_flows')
        .update({ is_active: false })
        .in('id', toDeactivate.map((f) => f.id))
    }

    // Reset this flow's own lead positions — they restart from its trigger.
    // Leads tracked under a flow being deactivated above get re-matched to
    // whichever active flow now covers them on the next cron run.
    await supabase.from('lead_flow_state').delete().eq('flow_id', id)
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.name !== undefined) update.name = body.name
  if (body.flow_json !== undefined) update.flow_json = body.flow_json
  if (body.is_active !== undefined) update.is_active = body.is_active
  if (body.segments !== undefined) update.segments = body.segments
  if (body.professions !== undefined) update.professions = body.professions
  if (body.event_tags !== undefined) update.event_tags = body.event_tags
  if (body.sources !== undefined) update.sources = body.sources

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
