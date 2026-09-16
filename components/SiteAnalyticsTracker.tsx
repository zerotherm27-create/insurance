'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const HEARTBEAT_INTERVAL_MS = 15_000

function sendVisit(path: string) {
  fetch('/api/site/visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, referrer: document.referrer }),
    keepalive: true,
  }).catch(() => {})
}

function sendHeartbeat() {
  navigator.sendBeacon?.('/api/site/heartbeat')
}

// First-party visit/duration tracking for public pages only. Admin usage is
// excluded so Jojo's own dashboard visits never skew visitor stats.
export function SiteAnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return
    sendVisit(pathname)
  }, [pathname])

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') sendHeartbeat()
    }, HEARTBEAT_INTERVAL_MS)

    const onHide = () => {
      if (document.visibilityState === 'hidden') sendHeartbeat()
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', sendHeartbeat)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', sendHeartbeat)
    }
  }, [pathname])

  return null
}
