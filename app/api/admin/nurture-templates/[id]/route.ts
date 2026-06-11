import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const { id } = await params
  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('nurture_templates')
    .update({
      label: body.label,
      subject: body.subject,
      heading: body.heading,
      paragraphs: body.paragraphs,
      cta_text: body.cta_text,
      wait_days: body.wait_days,
      segments: body.segments ?? [],
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ template: data })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const { id } = await params
  const supabase = createServiceClient()

  // Get the position of the template being deleted
  const { data: target } = await supabase
    .from('nurture_templates')
    .select('position')
    .eq('id', id)
    .single()

  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabase.from('nurture_templates').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Repack positions: shift everything after the deleted position down by 1
  const { data: remaining } = await supabase
    .from('nurture_templates')
    .select('id, position')
    .gt('position', target.position)
    .order('position')

  for (const row of remaining ?? []) {
    await supabase
      .from('nurture_templates')
      .update({ position: row.position - 1 })
      .eq('id', row.id)
  }

  return NextResponse.json({ ok: true })
}
