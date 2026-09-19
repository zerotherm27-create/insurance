import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'
import { applyNurtureSkip, loadNurtureContext, resolveLead } from '@/lib/nurture-skip'

// Which nurture emails this lead can start from. No writes.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const { id } = await params
  const supabase = createServiceClient()
  const r = await resolveLead(supabase, await loadNurtureContext(supabase), id)
  if ('error' in r) return NextResponse.json({ error: r.error }, { status: r.status })
  return NextResponse.json(r.nurture)
}

// Skip the rest of a lead's follow-up flow and start the nurture series at the
// chosen email (see applyNurtureSkip).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const { id } = await params
  const supabase = createServiceClient()
  const r = await resolveLead(supabase, await loadNurtureContext(supabase), id)
  if ('error' in r) return NextResponse.json({ error: r.error }, { status: r.status })

  const body = await req.json().catch(() => ({}))
  const position = Number(body.position)
  if (!r.nurture.options.some((o) => o.position === position)) {
    return NextResponse.json({ error: 'Choose a nurture email this lead qualifies for' }, { status: 400 })
  }

  const failure = await applyNurtureSkip(supabase, id, r, position)
  if (failure) return NextResponse.json({ error: failure }, { status: 500 })
  return NextResponse.json({ ok: true })
}
