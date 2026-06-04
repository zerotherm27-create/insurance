import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

function auth(req: NextRequest) {
  return req.headers.get('authorization') === `Bearer ${process.env.ADMIN_SECRET}`
}

export async function GET(req: NextRequest) {
  if (!process.env.ADMIN_SECRET) return NextResponse.json({ error: 'Misconfigured' }, { status: 500 })
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('automation_flows')
    .select('id, name, is_active, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ flows: data })
}

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_SECRET) return NextResponse.json({ error: 'Misconfigured' }, { status: 500 })
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { name?: string; flow_json?: unknown }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('automation_flows')
    .insert({ name: body.name ?? 'New Flow', flow_json: body.flow_json ?? { nodes: [], edges: [] } })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ flow: data }, { status: 201 })
}
