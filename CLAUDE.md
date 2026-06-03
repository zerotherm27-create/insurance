@AGENTS.md

# Safety Margin Advisor — Project Guide for Claude

## What this project is

A Sun Life Philippines insurance lead-generation and advisor-management platform for **Jojo Cruzado**, a licensed Sun Life of Canada Philippines, Inc. advisor.

Two surfaces:
1. **Public funnel** (`/funnel`) — lead-facing quiz that scores financial protection gaps and generates a personalized AI report. Leads provide contact info to unlock their full report.
2. **Advisor dashboard** (`/admin`) — private, password-protected CRM for Jojo to manage leads through a 6-stage pipeline with kanban/table views, AI-generated advisor playbooks, segment analytics, and CSV export.

Production URL: **https://safetymargin.app**
GitHub: `zerotherm27-create/insurance` (public repo)
Vercel project: `insurance` under `zerotherm27-8336s-projects`
Supabase project ID: `xcifmbfxatkunsjoozyv`

---

## Tech stack

- **Next.js 16** (App Router, Turbopack) — read `node_modules/next/dist/docs/` before writing Next.js code
- **TypeScript** (strict)
- **Tailwind CSS** — navy/gold design system (see tokens below)
- **Supabase** (Postgres + service-role client for server, anon for public)
- **OpenAI gpt-4o-mini** — two separate AI calls: lead report + advisor playbook
- **Resend** — transactional + drip email
- **Vercel** — hosting + daily cron job

---

## Design system

Colors (Tailwind tokens):
- `navy-dark` `#0A1628` · `navy` `#0F1F3D` · `navy-light` `#162B52` · `navy-card` `#1A2F57`
- `gold` `#F6B21A` · `gold-soft` `#D9A441` · `gold-muted` `#B8892E` · `gold-pale` `#F6E9C4`

Gradients: `bg-navy-gradient` · `bg-gold-gradient` · `bg-card-gradient`

Fonts: `font-serif` (Playfair Display) for headings, `font-sans` (Inter) for body.

No emojis in UI — use the SVG icon system in `components/ui/icons.tsx`. Emails are the one exception (emojis improve open rates).

---

## Key files

### Types
- `types/funnel.ts` — `FunnelSegment`, `FunnelAnswers`, `FunnelAIReport`, `AdvisorPlaybook`, `FunnelLead`
- `types/index.ts` — older assessment flow types (mostly legacy)

### Library
- `lib/funnel-questions.ts` — 6 segment question sets + `answerSummary()` + `validateAnswers()`
- `lib/funnel-ai.ts` — `generateFunnelReport()` — lead-facing AI report (no product names, no company names)
- `lib/advisor-playbook-ai.ts` — `generateAdvisorPlaybook()` — private advisor coaching + product recommendations
- `lib/products.ts` — the 9 active Sun Life products Jojo sells (source of truth for AI recommendations)
- `lib/lead-status.ts` — 6-stage pipeline enum, labels, colors, terminal statuses
- `lib/email.tsx` — Resend email templates (report + 4 follow-up sequence)
- `lib/csv-export.ts` — `leadsToCsv()` / `downloadCsv()` for admin export
- `lib/supabase.ts` — `createServiceClient()` (server-only) + anon client
- `lib/scoring.ts` — legacy scoring (older assessment flow)

### API routes
- `app/api/funnel/preview/route.ts` — generate report preview (no DB write, no name)
- `app/api/funnel/analyze/route.ts` — full submission: generate report + save lead + optional email
- `app/api/funnel/cron/sequence/route.ts` — daily drip email cron (protected by `CRON_SECRET`)
- `app/api/admin/funnel-leads/route.ts` — GET all leads (auth: `ADMIN_SECRET`)
- `app/api/admin/funnel-leads/[id]/status/route.ts` — PATCH lead status
- `app/api/admin/funnel-leads/[id]/playbook/route.ts` — POST generate + persist advisor playbook

### Admin components
- `components/admin/FunnelLeadsTable.tsx` — table view (clickable rows open detail panel)
- `components/admin/KanbanBoard.tsx` — kanban view (drag-and-drop + dropdown per card)
- `components/admin/LeadDetailsPanel.tsx` — slide-over panel with full lead data
- `components/admin/AdvisorPlaybookCard.tsx` — generate/display advisor playbook
- `components/admin/StatusBadge.tsx` — colored pill per status
- `components/admin/SegmentStats.tsx` — per-segment lead count chips
- `components/admin/ConversionStats.tsx` — funnel conversion rate widget

### Funnel components
- `components/funnel/` — step UI, lead capture form, report card, preview
- `components/ui/icons.tsx` — SVG icon system (no emoji in UI)

---

## Database (Supabase `public.funnel_leads`)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `created_at` | timestamptz | auto |
| `updated_at` | timestamptz | trigger: `handle_updated_at()` |
| `first_name` | text | |
| `mobile` | text | |
| `email` | text | nullable |
| `segment` | text | `FunnelSegment` or null |
| `answers` | jsonb | full `FunnelAnswers` object |
| `protection_score` | int | 1–100 |
| `ai_report` | jsonb | `FunnelAIReport` |
| `advisor_playbook` | jsonb | `AdvisorPlaybook` — admin-only, never sent to lead |
| `status` | text | CHECK: `new \| contacted \| engaged \| decision_pending \| closed_won \| closed_lost` |
| `sequence_step` | int | 0 = not started, 1–5 = emails sent |
| `last_emailed_at` | timestamptz | nullable |

Migrations live in `supabase/migrations/` — run them in Supabase SQL editor in order when setting up a fresh project.

---

## Lead pipeline (6 stages)

`new` → `contacted` → `engaged` → `decision_pending` → `closed_won` → `closed_lost`

Terminal statuses: `closed_won`, `closed_lost` — drip emails stop here.

---

## Email sequence (Resend)

| Step | When | Trigger |
|---|---|---|
| Immediate | On submission (if email provided) | `app/api/funnel/analyze` |
| Step 2 | Day 1 | Cron |
| Step 3 | Day 3 | Cron |
| Step 4 | Day 7 | Cron |
| Step 5 | Day 14 | Cron |

Cron runs daily at 09:00 UTC via `vercel.json`. Protected by `Authorization: Bearer ${CRON_SECRET}`.

---

## Sun Life products (lib/products.ts)

The 9 products Jojo actively sells — **do not add, rename, or remove without Jojo's input**:

1. Sun Fit and Well Advantage 10
2. Sun Easylink 10
3. Sun Safer Life 10
4. Sun Secure Income 10
5. Sun Smarter Life Classic 10
6. Sun Smarter Life Elite 10
7. Sun MaxiLink Prime
8. Sun MaxiLink 100
9. Sun Life Premier Legacy

The advisor playbook AI is restricted to this list — it cannot invent products.

---

## AI rules

**Lead-facing report** (`lib/funnel-ai.ts`):
- ❌ NO product names
- ❌ NO company names (not even "Sun Life")
- ✅ Coverage types only ("life coverage", "health insurance plan", "estate liquidity")
- Warm, Filipino-friendly English, phone-readable length

**Advisor playbook** (`lib/advisor-playbook-ai.ts`):
- ✅ Products from `lib/products.ts` only — use `productId` verbatim
- Written to Jojo in second person ("you", "your call")
- Never shown to leads

---

## Environment variables

Required in Vercel (and `.env.local` for local dev):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL
ADMIN_SECRET           # dashboard password
CRON_SECRET            # protects /api/funnel/cron/sequence
NEXT_PUBLIC_ADVISOR_CALENDLY_URL
NEXT_PUBLIC_ADVISOR_FB_URL
```

OpenAI and Resend clients are lazy-initialized (no env at build time) — see pattern in `lib/funnel-ai.ts`.

---

## Development workflow

```bash
npm run dev        # starts on :3000 with Turbopack
```

Pushing to `main` on GitHub auto-deploys to Vercel (production).

When making DB schema changes:
1. Write migration SQL in `supabase/migrations/NNN_name.sql`
2. Apply in Supabase SQL editor (project `xcifmbfxatkunsjoozyv`)
3. Commit and push

---

## Compliance notes

- This tool is **educational only** — not a licensed insurance proposal
- The footer and disclaimer copy must always include the educational disclaimer
- All data collected is disclosed in `/data-deletion` (linked in footer)
- Advisor playbook data is admin-only — never exposed to leads or included in public API responses
