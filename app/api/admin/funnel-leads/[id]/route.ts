import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'

const VALID_SEGMENTS = ['pro', 'family', 'ofw', 'entrepreneur', 'business', 'hnw']

// Lets the admin fill in segment/event/age after the fact — e.g. for leads
// bulk-imported or captured without those columns.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const { id } = await params

  let body: { segment?: unknown; event_tag?: unknown; age?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const update: Record<string, unknown> = {}

  if ('segment' in body) {
    const segment = typeof body.segment === 'string' ? body.segment.trim().toLowerCase() : ''
    if (segment && !VALID_SEGMENTS.includes(segment)) {
      return NextResponse.json({ error: `Unrecognized segment "${segment}".` }, { status: 400 })
    }
    update.segment = segment || null
  }

  if ('event_tag' in body) {
    const eventTag = typeof body.event_tag === 'string' ? body.event_tag.trim() : ''
    update.event_tag = eventTag || null
  }

  if ('age' in body) {
    if (body.age === null || body.age === '') {
      update.age = null
    } else {
      const age = typeof body.age === 'number' ? body.age : Number(body.age)
      if (!Number.isInteger(age) || age < 18 || age > 120) {
        return NextResponse.json({ error: 'Age must be a whole number between 18 and 120.' }, { status: 400 })
      }
      update.age = age
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('funnel_leads')
    .update(update)
    .eq('id', id)
    .select('id, segment, event_tag, age')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ lead: data })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const { id } = await params

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('funnel_leads')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
