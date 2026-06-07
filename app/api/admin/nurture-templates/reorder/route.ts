import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  let body: { id: string; direction: 'up' | 'down' }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: target } = await supabase
    .from('nurture_templates')
    .select('id, position')
    .eq('id', body.id)
    .single()

  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const swapPosition = body.direction === 'up' ? target.position - 1 : target.position + 1

  const { data: neighbor } = await supabase
    .from('nurture_templates')
    .select('id, position')
    .eq('position', swapPosition)
    .single()

  if (!neighbor) return NextResponse.json({ error: 'Cannot move further' }, { status: 400 })

  // Swap positions
  await supabase.from('nurture_templates').update({ position: swapPosition }).eq('id', target.id)
  await supabase.from('nurture_templates').update({ position: target.position }).eq('id', neighbor.id)

  const { data: updated } = await supabase
    .from('nurture_templates')
    .select('*')
    .order('position')

  return NextResponse.json({ templates: updated ?? [] })
}
