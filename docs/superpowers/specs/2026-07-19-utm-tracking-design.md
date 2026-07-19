# UTM / Traffic-Source Tracking — Design

Source: `safetymargin-improvements-handoff.md`, item #4 (P0, first priority per the handoff's own ordering).

## Problem

The funnel converts, but there is no way to tell which distribution channel (OFW Facebook groups, remittance-center partnerships, recruitment agencies, paid FB/TikTok ads, etc.) drove a given lead. No UTM or referral data is captured anywhere today.

## Non-goal

A full analytics dashboard. This round only makes the data captured and attributable. Reporting is a spreadsheet pull off CSV export (existing `lib/csv-export.ts` flow) — no new admin UI widget.

## Scope decisions (confirmed with Jojo)

- Capture applies **site-wide**, not just funnel entry pages — ad destinations can be the root landing page, `/funnel`, or a direct segment hook page (e.g. `/funnel/ofw`).
- Attribution window is **30 days**, first-touch (the first UTM values seen win; later visits without UTM params, or with different ones, do not overwrite an already-attributed lead).
- Leads with no UTM params at all are left **null** in the DB/CSV — no `"direct"` fallback string.
- No admin breakdown widget this round — CSV export + lead detail panel only.

## Approach

Next.js **middleware** sets a first-touch attribution cookie on first sight of any `utm_*` param; the `/api/funnel/analyze` route reads that cookie server-side at submission time and persists it to the lead row. No client-side state threading through the multi-step funnel is needed — the cookie rides along on every request automatically.

Rejected alternatives:
- **Client-side capture + sessionStorage threading** (mirroring the existing report-data pattern): requires wiring through every step page, doesn't survive a session gap (violates the 30-day requirement), and misses users before hydration.
- **Query-param forwarding through internal links**: fragile, breaks silently whenever a link is added without remembering to forward params.

## Changes

### 1. Database — `supabase/migrations/015_utm_tracking.sql`

Add nullable text columns to `public.funnel_leads`:

```sql
alter table public.funnel_leads
  add column utm_source text,
  add column utm_medium text,
  add column utm_campaign text,
  add column utm_content text,
  add column utm_term text;
```

Jojo applies this via the Supabase SQL editor (project `xcifmbfxatkunsjoozyv`) after the commit lands, per standard project workflow.

### 2. Middleware — `middleware.ts` (new file, project root)

- Runs on every request (matcher excludes `/api/*`, `/_next/*`, static assets — no reason to run on those).
- Reads `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` from the request's search params.
- If none are present, or an `sma_attribution` cookie already exists, no-op (first-touch: never overwrite).
- If at least one UTM param is present and no cookie exists yet, set a cookie `sma_attribution` = JSON-stringified `{ utm_source, utm_medium, utm_campaign, utm_content, utm_term }` (only the present keys), `httpOnly: true`, `maxAge: 60 * 60 * 24 * 30`, `sameSite: 'lax'`, `path: '/'`.

### 3. API — `app/api/funnel/analyze/route.ts`

- At the top of the handler, read the `sma_attribution` cookie via `cookies()` from `next/headers` and `JSON.parse` it (guard against malformed/missing cookie — treat as no attribution).
- On the **new-lead insert path**: include the 5 UTM fields (whatever was parsed, `undefined`/absent keys stay null) in the `funnel_leads` insert.
- On the **repeat-submission update path** (existing lead within 24h): only set a UTM field if the existing row's value for it is currently null — never overwrite an already-attributed lead's source with a later visit's params. If the existing row already has UTM data, leave it untouched entirely.

### 4. Types

- `types/funnel.ts` — add optional `utmSource?`, `utmMedium?`, `utmCampaign?`, `utmContent?`, `utmTerm?` to `FunnelLead` (or the DB row shape used by the admin API), matching existing naming convention in that file.

### 5. Admin surface

- `components/admin/LeadDetailsPanel.tsx` — add a small "Source" line showing `utm_source / utm_medium / utm_campaign` (only rendered when at least one is present; omit the row entirely for organic leads, consistent with the "leave null" decision).
- `lib/csv-export.ts` — add `UTM Source`, `UTM Medium`, `UTM Campaign`, `UTM Content`, `UTM Term` columns to `leadsToCsv()`.
- `app/api/admin/funnel-leads/route.ts` — confirm the existing `select` already returns `*` (or explicitly include the new columns) so the admin table/panel receives them without a separate change.

## Testing

- Local dev cannot reach Supabase (placeholder env), so this is verified in production per the project's existing end-to-end testing convention: hit `https://safetymargin.app/funnel/ofw?utm_source=facebook&utm_medium=cpc&utm_campaign=ofw-group-promo` in a real browser, complete the quiz with a unique `+alias` Gmail, and confirm the resulting lead in `/admin` shows the source line and the CSV export includes it. Mark the test lead `closed_lost` afterward per existing convention.
- Confirm a second visit to a different UTM'd URL from the same browser (simulating clicking a second ad before converting) does **not** overwrite the already-set cookie.
- Confirm a lead with zero UTM params (organic) shows blank source fields and no "Source" row in the detail panel.
