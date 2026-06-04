@AGENTS.md

# Safety Margin — Project Guide for Claude

## What this project is

A personal lead-generation and advisor-management platform for **Jojo Cruzado**, a licensed insurance advisor.

**Brand: Safety Margin** — Jojo's personal brand and Facebook page. This funnel is entirely independent and is not affiliated with, endorsed by, or a product of any insurance company. Do not associate the funnel, UI, emails, or copy with any insurance company name.

Two surfaces:
1. **Public funnel** (`/funnel`) — lead-facing quiz that scores financial protection gaps and generates a personalized AI report. Leads provide contact info to unlock their full report.
2. **Advisor dashboard** (`/admin`) — private, password-protected CRM for Jojo to manage leads through a 6-stage pipeline with kanban/table views, AI-generated advisor playbooks, segment analytics, CSV export, and a visual email automation flow builder.

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
- **OpenAI gpt-4o-mini** — three AI uses: lead report, advisor playbook, flow generation
- **Resend** — transactional + drip email. From name: `Jojo from Safety Margin`
- **@xyflow/react** — drag-and-drop flow canvas for the automation builder
- **framer-motion** — AnimatePresence slide-ins (config panel, modals)
- **Vercel** — hosting + daily cron job

---

## Design system

Colors (Tailwind tokens):
- `navy-dark` `#0A1628` · `navy` `#0F1F3D` · `navy-light` `#162B52` · `navy-card` `#1A2F57`
- `gold` `#F6B21A` · `gold-soft` `#D9A441` · `gold-muted` `#B8892E` · `gold-pale` `#F6E9C4`

Gradients: `bg-navy-gradient` · `bg-gold-gradient` · `bg-card-gradient`

Fonts: `font-serif` (Playfair Display) for headings, `font-sans` (Inter) for body.

No emojis in UI — use the SVG icon system in `components/ui/icons.tsx`. Emails are the one exception (emojis improve open rates).

**Copy rules:**
- No em dashes (—) in user-facing copy. Use periods, commas, or colons instead.
- No company or insurance brand names anywhere in the funnel, emails, or UI copy.
- Email signatures: `Jojo · Safety Margin`
- Disclaimers: "must be validated through an official proposal and consultation with a licensed advisor" (no brand names)

---

## Key files

### Types
- `types/funnel.ts` — `FunnelSegment`, `FunnelAnswers`, `FunnelAIReport`, `AdvisorPlaybook`, `FunnelLead`
- `types/automation-flow.ts` — `FlowNode`, `FlowEdge`, `FlowDefinition`, `AutomationFlow`, all node data types
- `types/email-template.ts` — `EmailTemplate`, `substituteVars()`, `PREVIEW_VARS`, `EMAIL_ORDER`
- `types/index.ts` — older assessment flow types (mostly legacy)

### Library
- `lib/funnel-questions.ts` — 6 segment question sets + `answerSummary()` + `validateAnswers()`
- `lib/funnel-ai.ts` — `generateFunnelReport()` — lead-facing AI report (no product names, no company names)
- `lib/advisor-playbook-ai.ts` — `generateAdvisorPlaybook()` — private advisor coaching + product recommendations
- `lib/products.ts` — the 9 insurance products Jojo actively sells (source of truth for AI recommendations)
- `lib/lead-status.ts` — 6-stage pipeline enum, labels, colors, terminal statuses
- `lib/email.tsx` — `sendFunnelReport()`, `sendSequenceEmail()`, `sendFlowEmail()` via Resend
- `lib/csv-export.ts` — `leadsToCsv()` / `downloadCsv()` for admin export
- `lib/supabase.ts` — `createServiceClient()` (server-only) + anon client
- `lib/scoring.ts` — legacy scoring (older assessment flow)

### API routes
- `app/api/funnel/preview/route.ts` — generate report preview (no DB write, no name)
- `app/api/funnel/analyze/route.ts` — full submission: generate report + save lead + optional email
- `app/api/funnel/report/[id]/route.ts` — GET shareable report by UUID; returns `{ id, firstName, report }`; used as sessionStorage fallback for shared links
- `app/api/funnel/cron/sequence/route.ts` — daily drip cron; walks flow graph if active flow exists, falls back to hardcoded steps
- `app/api/admin/funnel-leads/route.ts` — GET all leads (auth: `ADMIN_SECRET`)
- `app/api/admin/funnel-leads/[id]/status/route.ts` — PATCH lead status
- `app/api/admin/funnel-leads/[id]/playbook/route.ts` — POST generate + persist advisor playbook
- `app/api/admin/email-templates/route.ts` — GET all 5 email templates
- `app/api/admin/email-templates/[id]/route.ts` — PATCH update template content
- `app/api/admin/email-templates/generate/route.ts` — POST: GPT-4o-mini generates subject/heading/paragraphs/cta_text for a given templateId + optional hint
- `app/api/admin/automation-flows/route.ts` — GET list + POST create flow
- `app/api/admin/automation-flows/[id]/route.ts` — GET + PUT + DELETE; activating a flow resets all lead_flow_state rows
- `app/api/admin/automation-flows/generate/route.ts` — POST: GPT-4o-mini generates a FlowDefinition from a plain-English prompt

### Pages
- `app/page.tsx` — landing page
- `app/funnel/page.tsx` — segment selector ("Which best describes you?")
- `app/funnel/[segment]/page.tsx` — segment-specific hook page (server component); uses `SegmentCTAButton.tsx` client island for CTA interactivity
- `app/funnel/[segment]/SegmentCTAButton.tsx` — client island; stores segment to sessionStorage, navigates to step 1
- `app/funnel/step/[n]/page.tsx` — quiz step pages
- `app/funnel/preview/page.tsx` — preview page (score visible, report blurred until capture)
- `app/funnel/capture/page.tsx` — lead capture form page
- `app/funnel/report/[id]/page.tsx` — full report page; reads from sessionStorage, falls back to `/api/funnel/report/[id]` for shared links
- `app/privacy/page.tsx` — Privacy Policy (Philippine DPA compliant)
- `app/terms/page.tsx` — Terms of Use (12 sections, Philippine governing law)
- `app/data-deletion/page.tsx` — Data Deletion Policy with mailto CTA
- `app/sitemap.ts` — includes landing, /funnel, 6 segments, /privacy, /terms, /data-deletion
- `public/robots.txt` — allows funnel pages, blocks /admin, /api/, step pages

### Admin page tabs
`app/admin/page.tsx` has two main tabs:
- **Leads** — kanban/table view, stage counts, segment analytics, CSV export
- **Email Automation** — two sub-tabs:
  - **Flow Builder** → `<FlowBuilderTab>` (drag-and-drop canvas)
  - **Email Content** → `<EmailTemplatesTab>` (edit template text)

### Admin components
- `components/admin/FunnelLeadsTable.tsx` — table view (clickable rows open detail panel)
- `components/admin/KanbanBoard.tsx` — kanban view (drag-and-drop + dropdown per card)
- `components/admin/LeadDetailsPanel.tsx` — slide-over panel with full lead data
- `components/admin/AdvisorPlaybookCard.tsx` — generate/display advisor playbook
- `components/admin/StatusBadge.tsx` — colored pill per status
- `components/admin/SegmentStats.tsx` — per-segment lead count chips
- `components/admin/ConversionStats.tsx` — funnel conversion rate widget
- `components/admin/EmailTemplatesTab.tsx` — sidebar list + edit + live preview for all 5 templates
- `components/admin/FlowBuilderTab.tsx` — top-level flow builder; wraps everything in `<ReactFlowProvider>`

### Flow builder components (`components/admin/flow/`)
- `FlowCanvas.tsx` — ReactFlow wrapper with drag-drop, `@xyflow/react/dist/style.css` imported here
- `FlowToolbar.tsx` — flow selector, name input, Save/Activate buttons, AI Generate modal
- `NodePalette.tsx` — draggable node type chips (Trigger, Send Email, Wait, Condition)
- `hooks/useFlowState.ts` — all flow state: nodes, edges, dirty flag, save/activate/load
- `nodes/TriggerNode.tsx` — gold border, pulsing dot, single bottom handle
- `nodes/SendEmailNode.tsx` — navy-card, gold left stripe, shows templateId
- `nodes/WaitNode.tsx` — navy-card, blue accents, shows days
- `nodes/ConditionNode.tsx` — navy-card, purple accents, Yes (green) + No (red) bottom handles
- `panels/TriggerNodePanel.tsx` — read-only info
- `panels/SendEmailNodePanel.tsx` — template `<select>` dropdown
- `panels/WaitNodePanel.tsx` — days number input (1–90)
- `panels/ConditionNodePanel.tsx` — radio: status vs engagement; checkbox list of 6 statuses

### Email components (`emails/`)

All email components use `@react-email/components` and are rendered server-side via `render()` from `@react-email/render`.

- `FunnelReportEmail.tsx` — sent on form submission with the lead's full AI report
- `FollowUp1-4Email.tsx` — used by the **legacy** linear drip sequence (`sendSequenceEmail`); hardcoded copy with inline `{report.*}` variables
- `FlowEmail.tsx` — used by `sendFlowEmail()` for the **flow-based** drip; accepts `heading`, `paragraphs: string[]`, `ctaText` from the `email_templates` DB row (content is editable by Jojo in the admin Email Content tab)

All email signatures use: `Jojo · Safety Margin`
All email from fields use: `Jojo from Safety Margin <${RESEND_FROM_EMAIL}>`

### Funnel components
- `components/funnel/` — step UI, lead capture form, report card, preview
- `components/funnel/LeadCaptureForm.tsx` — email field is **required** (not optional)
- `components/ui/icons.tsx` — SVG icon system (no emoji in UI)

---

## Database

### `public.funnel_leads`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `created_at` | timestamptz | auto |
| `updated_at` | timestamptz | trigger: `handle_updated_at()` |
| `first_name` | text | |
| `mobile` | text | |
| `email` | text | nullable in DB but required by the form |
| `segment` | text | `FunnelSegment` or null |
| `answers` | jsonb | full `FunnelAnswers` object |
| `protection_score` | int | 1–100 |
| `ai_report` | jsonb | `FunnelAIReport` |
| `advisor_playbook` | jsonb | `AdvisorPlaybook` — admin-only, never sent to lead |
| `status` | text | `new \| contacted \| engaged \| decision_pending \| closed_won \| closed_lost` |
| `sequence_step` | int | used by legacy cron fallback only |
| `last_emailed_at` | timestamptz | nullable |

### `public.email_templates`

5 rows seeded by migration 006. IDs: `report`, `followup_1`, `followup_2`, `followup_3`, `followup_4`. Columns: `id`, `label`, `timing`, `subject`, `heading`, `paragraphs` (jsonb array), `cta_text`, `updated_at`. Template variables use `{firstName}`, `{score}`, etc. — substituted by `substituteVars()`.

### `public.automation_flows`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | display name |
| `is_active` | boolean | partial unique index — only one can be true |
| `flow_json` | jsonb | `FlowDefinition` (nodes + edges) |
| `created_at` / `updated_at` | timestamptz | |

Activating a flow via `PUT /api/admin/automation-flows/[id]` with `is_active: true` deactivates all others and deletes all `lead_flow_state` rows (leads restart).

### `public.lead_flow_state`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `lead_id` | uuid | FK → `funnel_leads`, unique (one row per lead) |
| `flow_id` | uuid | FK → `automation_flows` |
| `current_node_id` | text | which node the lead is currently on |
| `entered_node_at` | timestamptz | used by Wait nodes for countdown |
| `updated_at` | timestamptz | |

Migrations live in `supabase/migrations/` — run them in Supabase SQL editor (project `xcifmbfxatkunsjoozyv`) in order when setting up a fresh project.

---

## Lead pipeline (6 stages)

`new` → `contacted` → `engaged` → `decision_pending` → `closed_won` → `closed_lost`

Terminal statuses: `closed_won`, `closed_lost` — drip emails stop here.

---

## Email automation

### Cron (`app/api/funnel/cron/sequence/route.ts`)

Runs daily at 09:00 UTC via `vercel.json`. Protected by `Authorization: Bearer ${CRON_SECRET}`.

**Flow mode** (when an active flow exists):
1. Load active `automation_flows` row
2. Load all non-terminal leads with emails (up to 100)
3. For each lead: load or create `lead_flow_state` (new leads enroll at the trigger node)
4. Walk the graph (max 20 steps):
   - `trigger` → advance immediately
   - `wait` → check `(now - entered_node_at) >= days`; stop if not ready
   - `send_email` → call `sendFlowEmail()`, advance
   - `condition` → check `lead.status` against `statusValues`; take `yes` or `no` edge
5. Persist updated `lead_flow_state`

**Legacy fallback** (no active flow): uses the hardcoded `SEQUENCE_STEPS` array with `sequence_step` column.

### `sendFlowEmail()` (`lib/email.tsx`)

Fetches the `email_templates` row by `templateId`, substitutes `{firstName}`, `{score}`, `{scoreLabel}`, `{gap}`, `{recommendation}`, `{nextStep}` from lead data, renders `<FlowEmail />` (React Email component) for the final HTML, sends via Resend. The legacy `sendSequenceEmail()` is a separate path using the hardcoded `FollowUp1-4Email` components.

### AI flow generation (`app/api/admin/automation-flows/generate/route.ts`)

POST `{ prompt: string }` → GPT-4o-mini with a structured system prompt listing all node types, available template IDs, and layout rules → returns `{ flow: FlowDefinition }`. The UI loads this into the canvas via a `window.__aiFlow` + `CustomEvent` bridge.

---

## Flow node types

| Type | Purpose | Key data fields |
|---|---|---|
| `trigger` | Entry point (exactly one per flow) | `triggerType: 'new_lead'` |
| `wait` | Pause before next step | `days: number` (1–90) |
| `send_email` | Send a template email | `templateId: string` (one of the 5 template IDs) |
| `condition` | Yes/No branch | `conditionType`, `statusValues?: LeadStatus[]` |

Condition `statusValues` = statuses that route to the Yes (green) handle. Everything else goes to No (red).

Available template IDs: `followup_1`, `followup_2`, `followup_3`, `followup_4` (not `report` — that's sent on form submission).

---

## Insurance products (`lib/products.ts`)

The 9 products Jojo actively sells — **do not add, rename, or remove without Jojo's input**. These are real product names used only in the admin-side advisor playbook AI — never shown to leads or mentioned in any public-facing copy:

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
- NO product names
- NO company names
- Coverage types only ("life coverage", "health insurance plan", "estate liquidity")
- Warm, Filipino-friendly English, phone-readable length

**Advisor playbook** (`lib/advisor-playbook-ai.ts`):
- Products from `lib/products.ts` only — use `productId` verbatim
- Written to Jojo in second person ("you", "your call")
- Never shown to leads

**Flow generation** (`app/api/admin/automation-flows/generate/route.ts`):
- Must only reference template IDs that exist (`followup_1`–`followup_4`)
- Output is raw JSON `FlowDefinition` — no markdown, no explanation

**Email content generation** (`app/api/admin/email-templates/generate/route.ts`):
- NO product names, NO company or brand names in the email body
- Use `{variable}` tokens for personalization (`{firstName}`, `{score}`, etc.)
- Filipino-friendly English, short paragraphs (2–3 sentences max, mobile-first)
- Output is raw JSON `{ subject, heading, paragraphs[], cta_text }` — no markdown

---

## Segment pages (`/funnel/[segment]`)

Each segment has a unique persona-specific hook. The copy is intentional — do not genericize it. Key rules:
- No em dashes in copy
- Taglish is intentional for `pro` segment
- `hnw` badge uses "Private" not "Free" — HNW audience responds to exclusivity, not price

| Segment | Target persona |
|---|---|
| `pro` | Young professionals building their financial foundation |
| `family` | Parents and providers responsible for dependants |
| `ofw` | Overseas Filipino Workers working abroad for their families |
| `entrepreneur` | Freelancers and solo business owners |
| `business` | Established business owners with employees and obligations |
| `hnw` | High-net-worth individuals focused on legacy and estate planning |

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

Pushing to `main` on GitHub auto-deploys to Vercel (production). The repo uses a direct-to-main workflow — no feature branches.

When making DB schema changes:
1. Write migration SQL in `supabase/migrations/NNN_name.sql`
2. Apply via Supabase Management API or SQL editor (project `xcifmbfxatkunsjoozyv`)
3. Commit and push

---

## Compliance notes

- This tool is **educational only** — not a licensed insurance proposal
- Disclaimers must always say "official proposal and consultation with a licensed advisor" — no brand names
- Legal pages: `/privacy`, `/terms`, `/data-deletion` — all linked from the landing page footer
- All data collected is disclosed in `/data-deletion`
- Advisor playbook data is admin-only — never exposed to leads or included in public API responses
- Contact email for all legal pages: `jolemar.cruzado@gmail.com`
