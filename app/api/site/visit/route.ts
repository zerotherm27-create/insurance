import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase'
import { parseAttributionCookie, ATTRIBUTION_COOKIE_NAME } from '@/lib/attribution'
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_MAX_AGE,
  parseUserAgent,
  getGeoFromHeaders,
} from '@/lib/site-session'

// Records a pageview and upserts the visit's session. Public, unauthenticated
// (called from every public page via SiteAnalyticsTracker) — never trust
// client-provided device/location data, always derive it server-side.
export async function POST(req: NextRequest) {
  let body: { path?: string; referrer?: string }
  try {
    body = await req.json()
  } catch {
    return new NextResponse(null, { status: 204 })
  }

  const path = typeof body.path === 'string' ? body.path.split('?')[0].slice(0, 500) : null
  if (!path) return new NextResponse(null, { status: 204 })

  const ua = parseUserAgent(req.headers.get('user-agent'))
  if (ua.isBot) return new NextResponse(null, { status: 204 })

  try {
    const cookieStore = await cookies()
    const geo = getGeoFromHeaders(req.headers)
    const attribution = parseAttributionCookie(cookieStore.get(ATTRIBUTION_COOKIE_NAME)?.value)
    const referrer = (body.referrer || req.headers.get('referer') || null)?.slice(0, 500) ?? null

    const supabase = createServiceClient()
    const existingId = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null

    let sessionId = existingId
    if (existingId) {
      const { data: existing } = await supabase
        .from('site_sessions')
        .select('id, created_at, page_count')
        .eq('id', existingId)
        .maybeSingle()

      if (existing) {
        const now = new Date()
        const durationSeconds = Math.max(
          0,
          Math.round((now.getTime() - new Date(existing.created_at).getTime()) / 1000)
        )
        await supabase
          .from('site_sessions')
          .update({
            last_seen_at: now.toISOString(),
            page_count: existing.page_count + 1,
            duration_seconds: durationSeconds,
          })
          .eq('id', existingId)
      } else {
        sessionId = null // cookie pointed at a row that no longer exists — start fresh
      }
    }

    if (!sessionId) {
      sessionId = crypto.randomUUID()
      await supabase.from('site_sessions').insert({
        id: sessionId,
        landing_path: path,
        device_type: ua.deviceType,
        os: ua.os,
        browser: ua.browser,
        country: geo.country,
        region: geo.region,
        city: geo.city,
        referrer,
        utm_source: attribution.utm_source ?? null,
        utm_medium: attribution.utm_medium ?? null,
        utm_campaign: attribution.utm_campaign ?? null,
        utm_content: attribution.utm_content ?? null,
        utm_term: attribution.utm_term ?? null,
      })
    }

    await supabase.from('site_pageviews').insert({ session_id: sessionId, path })

    const res = new NextResponse(null, { status: 204 })
    res.cookies.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_COOKIE_MAX_AGE,
    })
    return res
  } catch (err) {
    console.error('Site analytics visit tracking failed (non-fatal):', err)
    return new NextResponse(null, { status: 204 })
  }
}
