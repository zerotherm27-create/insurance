import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

function auth(req: NextRequest) {
  return req.headers.get('authorization') === `Bearer ${process.env.ADMIN_SECRET}`
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.ADMIN_SECRET) return NextResponse.json({ error: 'Misconfigured' }, { status: 500 })
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('email_events')
    .select('id, event_type, template_id, occurred_at')
    .eq('lead_id', id)
    .order('occurred_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ events: data ?? [] })
}
