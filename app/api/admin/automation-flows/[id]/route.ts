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

  let body: { name?: string; flow_json?: unknown; is_active?: boolean }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // If activating, deactivate all others first, then reset lead flow state
  if (body.is_active === true) {
    await supabase.from('automation_flows').update({ is_active: false }).neq('id', id)
    // Reset all lead positions — they restart the new flow
    await supabase.from('lead_flow_state').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.name !== undefined) update.name = body.name
  if (body.flow_json !== undefined) update.flow_json = body.flow_json
  if (body.is_active !== undefined) update.is_active = body.is_active

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
