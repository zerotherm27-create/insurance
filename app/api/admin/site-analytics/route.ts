import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase'

// This is a single-advisor, Philippines-only app — the cron job already
// hardcodes its schedule around PHT, so the analytics day-buckets do too.
const REPORT_TIMEZONE = 'Asia/Manila'
const dayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: REPORT_TIMEZONE })

function dayKey(iso: string): string {
  return dayFormatter.format(new Date(iso))
}

const RANGE_DAYS: Record<string, number> = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 }

interface Session {
  created_at: string
  duration_seconds: number
  page_count: number
  device_type: string
  os: string | null
  browser: string | null
  country: string | null
  referrer: string | null
  utm_source: string | null
}

interface Pageview {
  path: string
  occurred_at: string
}

function countBy<T>(items: T[], keyFn: (item: T) => string | null): { key: string; count: number }[] {
  const map = new Map<string, number>()
  for (const item of items) {
    const key = keyFn(item) ?? 'Unknown'
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return [...map.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count)
}

function hostnameOf(url: string | null): string | null {
  if (!url) return null
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const authError = checkAdminAuth(req)
  if (authError) return authError

  const rangeParam = req.nextUrl.searchParams.get('range') ?? '30d'
  const days = RANGE_DAYS[rangeParam] ?? RANGE_DAYS['30d']
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const supabase = createServiceClient()
  const [sessionsRes, pageviewsRes] = await Promise.all([
    supabase
      .from('site_sessions')
      .select('created_at, duration_seconds, page_count, device_type, os, browser, country, referrer, utm_source')
      .gte('created_at', since),
    supabase.from('site_pageviews').select('path, occurred_at').gte('occurred_at', since),
  ])

  if (sessionsRes.error || pageviewsRes.error) {
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }

  const sessions: Session[] = sessionsRes.data ?? []
  const pageviews: Pageview[] = pageviewsRes.data ?? []

  const totalSessions = sessions.length
  const totalPageviews = pageviews.length
  const avgDurationSeconds =
    totalSessions === 0
      ? 0
      : Math.round(sessions.reduce((sum, s) => sum + s.duration_seconds, 0) / totalSessions)
  // Bounce = a single-pageview session. Simpler than GA4's "engaged session"
  // definition, deliberately, and cheap to change later if needed.
  const bounces = sessions.filter((s) => s.page_count === 1).length
  const bounceRate = totalSessions === 0 ? 0 : Math.round((bounces / totalSessions) * 100)

  const seriesMap = new Map<string, { date: string; sessions: number; pageviews: number }>()
  for (const s of sessions) {
    const key = dayKey(s.created_at)
    const entry = seriesMap.get(key) ?? { date: key, sessions: 0, pageviews: 0 }
    entry.sessions += 1
    seriesMap.set(key, entry)
  }
  for (const p of pageviews) {
    const key = dayKey(p.occurred_at)
    const entry = seriesMap.get(key) ?? { date: key, sessions: 0, pageviews: 0 }
    entry.pageviews += 1
    seriesMap.set(key, entry)
  }
  const timeseries = [...seriesMap.values()].sort((a, b) => a.date.localeCompare(b.date))

  return NextResponse.json({
    range: rangeParam,
    totals: { sessions: totalSessions, pageviews: totalPageviews, avgDurationSeconds, bounceRate },
    timeseries,
    deviceBreakdown: countBy(sessions, (s) => s.device_type),
    osBreakdown: countBy(sessions, (s) => s.os),
    browserBreakdown: countBy(sessions, (s) => s.browser),
    topPages: countBy(pageviews, (p) => p.path).slice(0, 10),
    topCountries: countBy(sessions, (s) => s.country).slice(0, 10),
    trafficSources: countBy(sessions, (s) => s.utm_source ?? hostnameOf(s.referrer) ?? 'direct').slice(0, 10),
  })
}
