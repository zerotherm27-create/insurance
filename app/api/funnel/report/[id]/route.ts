import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id || id === 'local') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('funnel_leads')
    .select('id, first_name, ai_report')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(
    { id: data.id, firstName: data.first_name, report: data.ai_report },
    {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    }
  )
}
