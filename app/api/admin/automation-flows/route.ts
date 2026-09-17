import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('automation_flows')
    .select('id, name, is_active, segments, professions, event_tags, sources, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ flows: data })
}

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  let body: { name?: string; flow_json?: unknown; segments?: string[]; professions?: string[]; event_tags?: string[]; sources?: string[] }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('automation_flows')
    .insert({
      name: body.name ?? 'New Flow',
      flow_json: body.flow_json ?? { nodes: [], edges: [] },
      segments: body.segments ?? [],
      professions: body.professions ?? [],
      event_tags: body.event_tags ?? [],
      sources: body.sources ?? [],
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ flow: data }, { status: 201 })
}
