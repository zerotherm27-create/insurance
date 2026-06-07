import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { checkAdminAuth } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('nurture_templates')
    .select('*')
    .order('position')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ templates: data ?? [] })
}

export async function POST(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const supabase = createServiceClient()

  // Find next position
  const { data: last } = await supabase
    .from('nurture_templates')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = (last?.position ?? 0) + 1

  const { data, error } = await supabase
    .from('nurture_templates')
    .insert({
      position,
      label: `Nurture ${position}`,
      subject: 'A story for {firstName}',
      heading: 'Something I want to share with you',
      paragraphs: ['Write your nurture content here.'],
      cta_text: 'Book a Free Call',
      wait_days: 3,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ template: data }, { status: 201 })
}
