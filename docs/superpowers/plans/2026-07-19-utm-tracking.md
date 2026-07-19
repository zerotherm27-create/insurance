# UTM / Traffic-Source Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capture which marketing channel (UTM params) brought each lead, persist it with the lead record, and surface it in the admin panel and CSV export.

**Architecture:** A Next.js `proxy.ts` (the renamed `middleware.ts` convention in Next 16) sets a first-touch, 30-day, httpOnly cookie the first time it sees `utm_*` query params on any request. `/api/funnel/analyze` reads that cookie server-side at submission time (via `next/headers` `cookies()`) and stores the values on the `funnel_leads` row — never overwriting an already-attributed lead. Admin surfaces (`LeadDetailsPanel`, CSV export) read the new columns.

**Tech Stack:** Next.js 16.2.6 (App Router), TypeScript strict, Supabase (Postgres), no test runner in this repo (verification is via `tsc`/`build`/`curl` and, for the final task, a real production smoke test).

## Global Constraints

- No em dashes in any user-facing copy. (N/A to this feature — no new copy.)
- No company/insurance brand names in funnel-facing code or copy. (N/A — this feature has no lead-facing copy.)
- Local `.env.local` is all placeholders; Supabase/OpenAI/Resend are unreachable locally. DB-touching behavior can only be truly verified against production (`https://safetymargin.app`), per the project's existing testing convention.
- DB schema changes go in `supabase/migrations/NNN_name.sql` and must be applied by Jojo via the Supabase SQL editor (project `xcifmbfxatkunsjoozyv`) — the MCP connector is read-denied.
- Follow existing code conventions exactly: DB/admin-facing objects use snake_case field names (`utm_source`, not `utmSource`) to match the Postgres columns, consistent with every other field on `funnel_leads`.

---

### Task 1: Database migration

**Files:**
- Create: `supabase/migrations/015_utm_tracking.sql`

**Interfaces:**
- Produces: 5 new nullable text columns on `public.funnel_leads` — `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` — that Task 3 (insert/update), Task 4 (select), and Task 5 (CSV) all depend on existing before their code can work against a real database.

- [ ] **Step 1: Write the migration file**

```sql
-- 015_utm_tracking.sql
-- Adds first-touch marketing-attribution columns to funnel_leads.
-- Nullable: organic/direct leads have no UTM params.

alter table public.funnel_leads
  add column utm_source text,
  add column utm_medium text,
  add column utm_campaign text,
  add column utm_content text,
  add column utm_term text;
```

- [ ] **Step 2: Verify the file reads correctly**

Run: `cat supabase/migrations/015_utm_tracking.sql`
Expected: the exact SQL above, no typos, matches the numbering of the existing `014_segment_email_templates.sql` (i.e. this is `015`).

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/015_utm_tracking.sql
git commit -m "feat: add UTM attribution columns to funnel_leads"
```

**Note for the human operator:** this migration must be applied in the Supabase SQL editor (project `xcifmbfxatkunsjoozyv`) before Task 3's inserts will actually persist UTM data in production. Flag this explicitly when this task lands.

---

### Task 2: Attribution capture (`lib/attribution.ts` + `proxy.ts`)

**Files:**
- Create: `lib/attribution.ts`
- Create: `proxy.ts` (project root — sibling to `app/`, not inside `app/`)

**Interfaces:**
- Consumes: nothing (no dependency on Task 1 — this task only sets/reads a cookie, no DB access).
- Produces:
  - `ATTRIBUTION_COOKIE_NAME: string` — the cookie name `'sma_attribution'`
  - `ATTRIBUTION_COOKIE_MAX_AGE: number` — `2592000` (30 days in seconds)
  - `UTM_PARAM_KEYS: readonly ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']`
  - `type UtmParamKey = (typeof UTM_PARAM_KEYS)[number]`
  - `type AttributionCookie = Partial<Record<UtmParamKey, string>>`
  - `function parseAttributionCookie(raw: string | undefined): AttributionCookie` — safely parses the cookie value, returns `{}` on anything malformed
  - These are consumed by Task 3's route handler.

- [ ] **Step 1: Write `lib/attribution.ts`**

```ts
// lib/attribution.ts
export const ATTRIBUTION_COOKIE_NAME = 'sma_attribution'
export const ATTRIBUTION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export const UTM_PARAM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const

export type UtmParamKey = (typeof UTM_PARAM_KEYS)[number]
export type AttributionCookie = Partial<Record<UtmParamKey, string>>

// Parses the sma_attribution cookie value. Returns {} for any malformed,
// missing, or unexpected-shape input rather than throwing, since a bad
// cookie should never break the funnel.
export function parseAttributionCookie(raw: string | undefined): AttributionCookie {
  if (!raw) return {}
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return {}
  }
  if (typeof parsed !== 'object' || parsed === null) return {}

  const result: AttributionCookie = {}
  for (const key of UTM_PARAM_KEYS) {
    const value = (parsed as Record<string, unknown>)[key]
    if (typeof value === 'string' && value.length > 0) {
      result[key] = value
    }
  }
  return result
}
```

- [ ] **Step 2: Write `proxy.ts`**

```ts
// proxy.ts
// Next.js 16 renamed the `middleware.ts` convention to `proxy.ts`
// (exports `proxy` instead of `middleware`). See:
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  ATTRIBUTION_COOKIE_MAX_AGE,
  ATTRIBUTION_COOKIE_NAME,
  UTM_PARAM_KEYS,
} from '@/lib/attribution'

export function proxy(request: NextRequest) {
  // First-touch: never overwrite an existing attribution cookie.
  if (request.cookies.has(ATTRIBUTION_COOKIE_NAME)) {
    return NextResponse.next()
  }

  const params = request.nextUrl.searchParams
  const attribution: Record<string, string> = {}
  for (const key of UTM_PARAM_KEYS) {
    const value = params.get(key)
    if (value) attribution[key] = value
  }

  if (Object.keys(attribution).length === 0) {
    return NextResponse.next()
  }

  const response = NextResponse.next()
  response.cookies.set(ATTRIBUTION_COOKIE_NAME, JSON.stringify(attribution), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ATTRIBUTION_COOKIE_MAX_AGE,
  })
  return response
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
}
```

- [ ] **Step 3: Verify type-checking passes**

Run: `npx tsc --noEmit`
Expected: no errors referencing `lib/attribution.ts` or `proxy.ts`.

- [ ] **Step 4: Start the dev server and verify first-touch capture**

Run: `npm run dev` (leave running), then in a separate terminal:

```bash
curl -sD - "http://localhost:3000/funnel/ofw?utm_source=facebook&utm_medium=cpc&utm_campaign=ofw-group-promo" -o /dev/null | grep -i "set-cookie"
```

Expected: a line containing `set-cookie: sma_attribution=%7B%22utm_source%22%3A%22facebook%22...` (URL-encoded JSON with all three params), `HttpOnly`, `Max-Age=2592000`, `Path=/`.

- [ ] **Step 5: Verify first-touch is never overwritten**

```bash
curl -sD - -b "sma_attribution=%7B%22utm_source%22%3A%22facebook%22%7D" "http://localhost:3000/?utm_source=tiktok&utm_medium=organic" -o /dev/null | grep -i "set-cookie"
```

Expected: **no output** (no `Set-Cookie` header) — confirms a request that already carries the cookie is never re-stamped, even with different UTM params in the URL.

- [ ] **Step 6: Verify organic traffic sets nothing**

```bash
curl -sD - "http://localhost:3000/" -o /dev/null | grep -i "set-cookie"
```

Expected: **no output**.

- [ ] **Step 7: Commit**

```bash
git add lib/attribution.ts proxy.ts
git commit -m "feat: capture first-touch UTM attribution via proxy cookie"
```

---

### Task 3: Persist attribution on lead submission

**Files:**
- Modify: `app/api/funnel/analyze/route.ts`

**Interfaces:**
- Consumes: `ATTRIBUTION_COOKIE_NAME`, `UTM_PARAM_KEYS`, `parseAttributionCookie`, `type AttributionCookie` from `lib/attribution.ts` (Task 2). Depends on Task 1's migration being applied in production for the DB writes to actually persist (locally this is unverifiable since Supabase is unreachable — see Testing below).
- Produces: `funnel_leads.utm_source/medium/campaign/content/term` populated on both the new-lead insert path and the repeat-submission update path (only filling currently-null fields on the update path, never overwriting).

- [ ] **Step 1: Add the attribution imports and cookie read**

Modify `app/api/funnel/analyze/route.ts` — add imports at the top:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase'
import { generateFunnelReport, generateDeterministicReport } from '@/lib/funnel-ai'
import { validateAnswers } from '@/lib/funnel-questions'
import { firstNameOf } from '@/lib/name'
import { ATTRIBUTION_COOKIE_NAME, UTM_PARAM_KEYS, parseAttributionCookie } from '@/lib/attribution'
import type { FunnelAnswers, FunnelAIReport } from '@/types/funnel'
```

Then, immediately after the existing email-validation block (after the `if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))` block and before the `validateAnswers` call), add:

```ts
  const cookieStore = await cookies()
  const attribution = parseAttributionCookie(cookieStore.get(ATTRIBUTION_COOKIE_NAME)?.value)
```

- [ ] **Step 2: Include attribution columns in the repeat-submission `existing` lookups**

Find the two `.select('id, ai_report, created_at')` calls inside the repeat-submission `try` block and replace both with:

```ts
      .select('id, ai_report, created_at, utm_source, utm_medium, utm_campaign, utm_content, utm_term')
```

Also update the local `existing` variable's type annotation from:

```ts
    let existing: { id: string; ai_report: unknown; created_at: string } | null = null
```

to:

```ts
    let existing: {
      id: string
      ai_report: unknown
      created_at: string
      utm_source: string | null
      utm_medium: string | null
      utm_campaign: string | null
      utm_content: string | null
      utm_term: string | null
    } | null = null
```

- [ ] **Step 3: Fill only currently-null attribution fields on the repeat-submission update**

In the `if (existing?.ai_report) { ... }` block, before the `.update({ ... })` call, add:

```ts
      const attributionUpdate: AttributionCookie = {}
      for (const key of UTM_PARAM_KEYS) {
        const value = attribution[key]
        if (!existing[key] && value) attributionUpdate[key] = value
      }
```

(Using a local `value` const rather than re-indexing `attribution[key]` inside the assignment — TypeScript narrows a `const` from a truthiness check reliably, but does not narrow a second index expression keyed by a loop variable, so `attribution[key] = attribution[key]` directly would fail `tsc --noEmit` with a `string | undefined` not assignable to `string` error.)

Then spread it into the update payload — change:

```ts
        .update({
          first_name: firstName,
          segment: answers.segment ?? null,
          answers,
          protection_score: refreshed.protectionScore,
          ai_report: refreshed,
        })
```

to:

```ts
        .update({
          first_name: firstName,
          segment: answers.segment ?? null,
          answers,
          protection_score: refreshed.protectionScore,
          ai_report: refreshed,
          ...attributionUpdate,
        })
```

- [ ] **Step 4: Include attribution on the new-lead insert**

Find the new-lead `.insert({ ... })` call and change:

```ts
      .insert({
        first_name: firstName,
        mobile,
        email: email ?? null,
        segment: answers.segment ?? null,
        answers,
        protection_score: report.protectionScore,
        ai_report: report,
        status: 'new',
        sequence_step: 0,
      })
```

to:

```ts
      .insert({
        first_name: firstName,
        mobile,
        email: email ?? null,
        segment: answers.segment ?? null,
        answers,
        protection_score: report.protectionScore,
        ai_report: report,
        status: 'new',
        sequence_step: 0,
        utm_source: attribution.utm_source ?? null,
        utm_medium: attribution.utm_medium ?? null,
        utm_campaign: attribution.utm_campaign ?? null,
        utm_content: attribution.utm_content ?? null,
        utm_term: attribution.utm_term ?? null,
      })
```

- [ ] **Step 5: Verify type-checking and build pass**

Run: `npx tsc --noEmit && npm run build`
Expected: both succeed with no errors. This is the strongest local verification available — the actual DB write cannot be tested locally because `.env.local` holds placeholder Supabase credentials (see project conventions). Real persistence is verified in Task 6 against production.

- [ ] **Step 6: Commit**

```bash
git add app/api/funnel/analyze/route.ts
git commit -m "feat: persist UTM attribution on lead submission"
```

---

### Task 4: Admin surface — lead list select + detail panel

**Files:**
- Modify: `app/api/admin/funnel-leads/route.ts`
- Modify: `components/admin/LeadDetailsPanel.tsx`

**Interfaces:**
- Consumes: the 5 DB columns from Task 1.
- Produces: no new exports — this is a leaf UI change.

- [ ] **Step 1: Add the UTM columns to the admin leads select**

In `app/api/admin/funnel-leads/route.ts`, change:

```ts
    .select(
      'id, created_at, first_name, mobile, email, segment, answers, protection_score, ai_report, advisor_playbook, status, sequence_step, last_emailed_at, email_events(event_type)'
    )
```

to:

```ts
    .select(
      'id, created_at, first_name, mobile, email, segment, answers, protection_score, ai_report, advisor_playbook, status, sequence_step, last_emailed_at, utm_source, utm_medium, utm_campaign, utm_content, utm_term, email_events(event_type)'
    )
```

- [ ] **Step 2: Add the new fields to `LeadDetailsPanel`'s local `Lead` interface**

In `components/admin/LeadDetailsPanel.tsx`, change:

```ts
interface Lead {
  id: string
  created_at: string
  first_name: string
  mobile: string
  email?: string | null
  segment?: string | null
  answers?: Record<string, string> | null
  protection_score: number
  ai_report?: FunnelAIReport | null
  advisor_playbook?: AdvisorPlaybook | null
  status: LeadStatus
  sequence_step: number
  last_emailed_at?: string | null
}
```

to:

```ts
interface Lead {
  id: string
  created_at: string
  first_name: string
  mobile: string
  email?: string | null
  segment?: string | null
  answers?: Record<string, string> | null
  protection_score: number
  ai_report?: FunnelAIReport | null
  advisor_playbook?: AdvisorPlaybook | null
  status: LeadStatus
  sequence_step: number
  last_emailed_at?: string | null
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_content?: string | null
  utm_term?: string | null
}
```

- [ ] **Step 3: Render a Source line, only when attribution data exists**

In `components/admin/LeadDetailsPanel.tsx`, find the closing of the "Contact + score" grid section:

```tsx
            <section className="grid grid-cols-2 gap-3">
              <div className="bg-navy-card border border-white/5 rounded-lg p-3">
                <p className="font-sans text-[10px] uppercase tracking-wider text-white/40">Mobile</p>
                <p className="font-sans text-sm text-white mt-1">{lead.mobile}</p>
              </div>
              <div className="bg-navy-card border border-white/5 rounded-lg p-3">
                <p className="font-sans text-[10px] uppercase tracking-wider text-white/40">Email</p>
                <p className="font-sans text-sm text-white mt-1 truncate">{lead.email ?? '—'}</p>
              </div>
              <div className="bg-navy-card border border-white/5 rounded-lg p-3">
                <p className="font-sans text-[10px] uppercase tracking-wider text-white/40">Protection Score</p>
                <p className="font-serif text-2xl text-gold mt-1">{lead.protection_score}</p>
              </div>
              <div className="bg-navy-card border border-white/5 rounded-lg p-3">
                <p className="font-sans text-[10px] uppercase tracking-wider text-white/40">Sequence Step</p>
                <p className="font-sans text-sm text-white mt-1">
                  Step {lead.sequence_step}
                  {lead.last_emailed_at && (
                    <span className="block text-xs text-white/40">
                      Last emailed {new Date(lead.last_emailed_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </p>
              </div>
            </section>
```

Replace it with the same block plus a conditional Source box appended inside the grid:

```tsx
            <section className="grid grid-cols-2 gap-3">
              <div className="bg-navy-card border border-white/5 rounded-lg p-3">
                <p className="font-sans text-[10px] uppercase tracking-wider text-white/40">Mobile</p>
                <p className="font-sans text-sm text-white mt-1">{lead.mobile}</p>
              </div>
              <div className="bg-navy-card border border-white/5 rounded-lg p-3">
                <p className="font-sans text-[10px] uppercase tracking-wider text-white/40">Email</p>
                <p className="font-sans text-sm text-white mt-1 truncate">{lead.email ?? '—'}</p>
              </div>
              <div className="bg-navy-card border border-white/5 rounded-lg p-3">
                <p className="font-sans text-[10px] uppercase tracking-wider text-white/40">Protection Score</p>
                <p className="font-serif text-2xl text-gold mt-1">{lead.protection_score}</p>
              </div>
              <div className="bg-navy-card border border-white/5 rounded-lg p-3">
                <p className="font-sans text-[10px] uppercase tracking-wider text-white/40">Sequence Step</p>
                <p className="font-sans text-sm text-white mt-1">
                  Step {lead.sequence_step}
                  {lead.last_emailed_at && (
                    <span className="block text-xs text-white/40">
                      Last emailed {new Date(lead.last_emailed_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </p>
              </div>
              {(lead.utm_source || lead.utm_medium || lead.utm_campaign) && (
                <div className="bg-navy-card border border-white/5 rounded-lg p-3 col-span-2">
                  <p className="font-sans text-[10px] uppercase tracking-wider text-white/40">Source</p>
                  <p className="font-sans text-sm text-white mt-1">
                    {[lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(' / ')}
                  </p>
                </div>
              )}
            </section>
```

- [ ] **Step 4: Verify type-checking and lint pass**

Run: `npx tsc --noEmit && npm run lint`
Expected: both succeed with no errors or new warnings.

- [ ] **Step 5: Verify visually in the browser**

Run: `npm run dev`, open `http://localhost:3000/admin` in the Browser pane, log in (this will fail past login since `ADMIN_SECRET` is a placeholder locally — that's expected; local verification stops at confirming the page compiles and the login form renders without console errors). Full visual confirmation of the Source line happens in Task 6 against production.

- [ ] **Step 6: Commit**

```bash
git add app/api/admin/funnel-leads/route.ts components/admin/LeadDetailsPanel.tsx
git commit -m "feat: show UTM source in admin lead detail panel"
```

---

### Task 5: CSV export columns

**Files:**
- Modify: `lib/csv-export.ts`

**Interfaces:**
- Consumes: the 5 DB columns from Task 1.
- Produces: no new exports — `leadsToCsv()` signature is unchanged, just emits more columns.

- [ ] **Step 1: Add the fields to the local `Lead` interface**

In `lib/csv-export.ts`, change:

```ts
interface Lead {
  id: string
  created_at: string
  first_name: string
  mobile: string
  email?: string | null
  segment?: string | null
  answers?: Record<string, string> | null
  protection_score: number
  ai_report?: FunnelAIReport | null
  status: LeadStatus
  sequence_step: number
  last_emailed_at?: string | null
}
```

to:

```ts
interface Lead {
  id: string
  created_at: string
  first_name: string
  mobile: string
  email?: string | null
  segment?: string | null
  answers?: Record<string, string> | null
  protection_score: number
  ai_report?: FunnelAIReport | null
  status: LeadStatus
  sequence_step: number
  last_emailed_at?: string | null
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_content?: string | null
  utm_term?: string | null
}
```

- [ ] **Step 2: Add the columns to the headers and row mapping**

Change:

```ts
  const headers = [
    'Date', 'Name', 'Mobile', 'Email', 'Segment', 'Status',
    'Protection Score', 'Score Label', 'Sequence Step', 'Last Emailed',
    'Biggest Gap', 'Recommendation', 'Estimated Range', 'Next Step',
    'Answers (Q → A)',
  ]
```

to:

```ts
  const headers = [
    'Date', 'Name', 'Mobile', 'Email', 'Segment', 'Status',
    'Protection Score', 'Score Label', 'Sequence Step', 'Last Emailed',
    'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content', 'UTM Term',
    'Biggest Gap', 'Recommendation', 'Estimated Range', 'Next Step',
    'Answers (Q → A)',
  ]
```

And change the row array — insert the 5 new values after `l.last_emailed_at ...` and before `l.ai_report?.biggestGap`:

```ts
    return [
      new Date(l.created_at).toISOString(),
      l.first_name,
      l.mobile,
      l.email ?? '',
      segment ? SEGMENT_LABELS[segment] : 'General',
      STATUS_LABEL[l.status],
      l.protection_score,
      l.ai_report?.scoreLabel ?? '',
      l.sequence_step,
      l.last_emailed_at ? new Date(l.last_emailed_at).toISOString() : '',
      l.utm_source ?? '',
      l.utm_medium ?? '',
      l.utm_campaign ?? '',
      l.utm_content ?? '',
      l.utm_term ?? '',
      l.ai_report?.biggestGap ?? '',
      l.ai_report?.recommendation ?? '',
      l.ai_report?.estimatedRange ?? '',
      l.ai_report?.nextStep ?? '',
      answersText,
    ]
```

- [ ] **Step 3: Verify type-checking passes**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/csv-export.ts
git commit -m "feat: include UTM attribution columns in lead CSV export"
```

---

### Task 6: Production verification

**Files:** none (verification only).

**Interfaces:** none.

This task requires the Task 1 migration to have been applied in the Supabase SQL editor first — flag this to Jojo and wait for confirmation before running it. It also sends one real email via Resend and makes one real OpenAI call, per this project's existing E2E testing convention (see `CLAUDE.md`'s Development Workflow section) — confirm with Jojo before running.

- [ ] **Step 1: Confirm migration applied**

Ask Jojo to confirm `015_utm_tracking.sql` has been run in the Supabase SQL editor for project `xcifmbfxatkunsjoozyv`.

- [ ] **Step 2: Push and deploy**

```bash
git push origin main
```

Wait for the Vercel deployment to finish (direct-to-main auto-deploy per project convention).

- [ ] **Step 3: Smoke-test first-touch capture and submission**

In a real browser, visit:

```
https://safetymargin.app/funnel/ofw?utm_source=facebook&utm_medium=cpc&utm_campaign=smoke-test
```

Complete the quiz using a unique `+alias` of `jolemar.cruzado@gmail.com` (e.g. `jolemar.cruzado+utmtest1@gmail.com`) and a unique test mobile number, per the project's existing test-lead convention.

- [ ] **Step 4: Confirm attribution landed on the lead**

Ask Jojo to open `/admin`, find the new test lead, and confirm the detail panel shows a "Source" line reading `facebook / cpc / smoke-test`. Alternatively, export CSV and check the `UTM Source`/`UTM Medium`/`UTM Campaign` columns for that row.

- [ ] **Step 5: Confirm first-touch is preserved on a repeat visit**

Within 24h, revisit with different UTM params, e.g.:

```
https://safetymargin.app/funnel/pro?utm_source=tiktok&utm_medium=organic
```

using the same browser (so the existing `sma_attribution` cookie is still present), and resubmit the quiz with the **same** email/mobile as Step 3 (triggering the repeat-submission path). Confirm in admin that the lead's Source line is unchanged (`facebook / cpc / smoke-test`), not overwritten with `tiktok`.

- [ ] **Step 6: Clean up the test lead**

Ask Jojo to mark the test lead `closed_lost` in admin so the 8 PM daily cron doesn't drip it.
