import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase'
import { SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE } from '@/lib/site-session'

// Keep-alive ping from SiteAnalyticsTracker (interval + sendBeacon on unload)
// so session duration reflects time actually spent, not just page loads.
export async function POST() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value
    if (!sessionId) return new NextResponse(null, { status: 204 })

    const supabase = createServiceClient()
    const { data: existing } = await supabase
      .from('site_sessions')
      .select('created_at')
      .eq('id', sessionId)
      .maybeSingle()

    if (existing) {
      const now = new Date()
      const durationSeconds = Math.max(
        0,
        Math.round((now.getTime() - new Date(existing.created_at).getTime()) / 1000)
      )
      await supabase
        .from('site_sessions')
        .update({ last_seen_at: now.toISOString(), duration_seconds: durationSeconds })
        .eq('id', sessionId)
    }

    const res = new NextResponse(null, { status: 204 })
    res.cookies.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_COOKIE_MAX_AGE,
    })
    return res
  } catch (err) {
    console.error('Site analytics heartbeat failed (non-fatal):', err)
    return new NextResponse(null, { status: 204 })
  }
}
