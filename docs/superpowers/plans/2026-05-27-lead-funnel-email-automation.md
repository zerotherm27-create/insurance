# Lead Funnel + Email Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public lead-generation funnel (7 one-question screens → lead capture → short AI report) with automated email follow-up sequences and an admin dashboard — all inside the existing Safety Margin Advisor Next.js app.

**Architecture:** New `/funnel` routes share the existing app's Supabase instance and OpenAI client but write to a separate `funnel_leads` table. Session answers travel via `sessionStorage`. Resend sends a transactional report email on submission plus a 4-email nurture sequence. A daily Vercel Cron job at `/api/funnel/cron/sequence` advances each lead through the sequence based on `created_at`. The `/admin` page uses the existing `ADMIN_SECRET` as a Bearer token — no new auth infrastructure.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS, OpenAI `gpt-4o-mini`, Supabase (PostgreSQL), Resend, `@react-email/components`, Vercel Cron

---

## File Map

**New files to create:**
```
types/funnel.ts
lib/funnel-questions.ts
lib/funnel-ai.ts
lib/email.ts
supabase/migrations/002_funnel_leads.sql
app/funnel/page.tsx
app/funnel/step/[n]/page.tsx
app/funnel/capture/page.tsx
app/funnel/report/[id]/page.tsx
app/api/funnel/analyze/route.ts
app/api/funnel/cron/sequence/route.ts
app/api/admin/funnel-leads/route.ts
app/api/admin/funnel-leads/[id]/status/route.ts
app/admin/page.tsx
components/funnel/FunnelProgress.tsx
components/funnel/QuestionCard.tsx
components/funnel/LeadCaptureForm.tsx
components/funnel/ReportCard.tsx
components/funnel/AdvisorBookingCTA.tsx
components/admin/FunnelLeadsTable.tsx
components/admin/StatusBadge.tsx
emails/FunnelReportEmail.tsx
emails/FollowUp1Email.tsx
emails/FollowUp2Email.tsx
emails/FollowUp3Email.tsx
emails/FollowUp4Email.tsx
vercel.json
```

**Files to modify:**
```
app/page.tsx          — add funnel link to landing page
.env.local            — add 5 new env vars
```

---

## Task 1: Types + Supabase Migration + Env Vars

**Files:**
- Create: `types/funnel.ts`
- Create: `supabase/migrations/002_funnel_leads.sql`
- Modify: `.env.local`

- [ ] **Step 1: Create `types/funnel.ts`**

```typescript
export interface FunnelAnswers {
  ageRange: '18-25' | '26-35' | '36-45' | '46+'
  familyStatus: 'single_no_deps' | 'single_supporting' | 'married_no_kids' | 'married_with_kids'
  incomeRange: 'below_15k' | '15k_30k' | '30k_60k' | '60k_100k' | '100k_plus'
  lifeInsurance: 'none' | 'have_unsure' | 'active_policy'
  healthCoverage: 'none' | 'hmo_only' | 'personal_insurance' | 'both'
  biggestWorry: 'medical_emergency' | 'family_if_die' | 'retirement' | 'education' | 'emergency_savings'
  employment: 'employed_private' | 'government' | 'self_employed' | 'business_owner' | 'ofw'
}

export interface FunnelAIReport {
  protectionScore: number
  scoreLabel: 'Critical Gaps' | 'Needs Attention' | 'Partially Protected' | 'Well Protected' | 'Strongly Protected'
  snapshot: Array<{ icon: '✅' | '❌' | '⚠️'; text: string }>
  biggestGap: string
  recommendation: string
  estimatedRange: string
  nextStep: string
}

export interface FunnelLead {
  id: string
  createdAt: string
  firstName: string
  mobile: string
  email?: string | null
  ageRange: string
  familyStatus: string
  incomeRange: string
  lifeInsurance: string
  healthCoverage: string
  biggestWorry: string
  employment: string
  protectionScore: number
  aiReport: FunnelAIReport
  status: 'new' | 'contacted' | 'converted'
  sequenceStep: number
  lastEmailedAt?: string | null
}
```

- [ ] **Step 2: Create `supabase/migrations/002_funnel_leads.sql`**

```sql
-- Lead Funnel: stores submissions from the public /funnel flow
create table if not exists public.funnel_leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc', now()) not null,
  first_name text not null,
  mobile text not null,
  email text,
  age_range text not null,
  family_status text not null,
  income_range text not null,
  life_insurance text not null,
  health_coverage text not null,
  biggest_worry text not null,
  employment text not null,
  protection_score integer check (protection_score >= 0 and protection_score <= 100),
  ai_report jsonb,
  status text not null default 'new' check (status in ('new', 'contacted', 'converted')),
  sequence_step integer not null default 0,
  last_emailed_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc', now()) not null
);

create index if not exists funnel_leads_created_at_idx on public.funnel_leads (created_at desc);
create index if not exists funnel_leads_status_idx on public.funnel_leads (status);
create index if not exists funnel_leads_sequence_step_idx on public.funnel_leads (sequence_step);

alter table public.funnel_leads enable row level security;

create policy "Allow anonymous insert" on public.funnel_leads
  for insert to anon with check (true);

create policy "Service role full access" on public.funnel_leads
  to service_role using (true) with check (true);

-- Reuse the handle_updated_at function defined in migration 001
create trigger funnel_leads_updated_at
  before update on public.funnel_leads
  for each row execute function public.handle_updated_at();
```

- [ ] **Step 3: Add env vars to `.env.local`**

Append these five lines to `.env.local`:
```
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
NEXT_PUBLIC_ADVISOR_CALENDLY_URL=https://calendly.com/your-link-here
NEXT_PUBLIC_ADVISOR_FB_URL=https://m.me/your-facebook-page-here
CRON_SECRET=pick-a-random-secret-string-here
```

> **Note:** `RESEND_FROM_EMAIL` can stay as `onboarding@resend.dev` for testing. For production, replace it with a verified domain email (e.g., `jojo@yourdomain.com`) configured in the Resend dashboard.

- [ ] **Step 4: Apply migration to Supabase**

When Supabase is configured, run:
```bash
# Option A — via Supabase dashboard SQL editor: paste contents of 002_funnel_leads.sql
# Option B — via CLI if installed:
npx supabase db push
```

- [ ] **Step 5: Commit**

```bash
git add types/funnel.ts supabase/migrations/002_funnel_leads.sql .env.local
git commit -m "feat: add funnel types, DB migration, and env vars"
```

---

## Task 2: Install Resend + React Email

**Files:** `package.json` (modified by npm)

- [ ] **Step 1: Install packages**

```bash
npm install resend @react-email/components @react-email/render
```

- [ ] **Step 2: Verify install**

```bash
npm ls resend @react-email/components @react-email/render
```

Expected: three packages listed with version numbers, no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install resend and react-email"
```

---

## Task 3: Funnel Question Definitions

**Files:**
- Create: `lib/funnel-questions.ts`

- [ ] **Step 1: Create `lib/funnel-questions.ts`**

```typescript
import type { FunnelAnswers } from '@/types/funnel'

export const TOTAL_STEPS = 7

export interface FunnelQuestion {
  step: number
  question: string
  field: keyof FunnelAnswers
  options: Array<{ value: string; label: string }>
}

export const FUNNEL_QUESTIONS: FunnelQuestion[] = [
  {
    step: 1,
    question: 'How old are you?',
    field: 'ageRange',
    options: [
      { value: '18-25', label: '18–25' },
      { value: '26-35', label: '26–35' },
      { value: '36-45', label: '36–45' },
      { value: '46+', label: '46 and above' },
    ],
  },
  {
    step: 2,
    question: 'What is your current family situation?',
    field: 'familyStatus',
    options: [
      { value: 'single_no_deps', label: 'Single, no dependents' },
      { value: 'single_supporting', label: 'Single, supporting family members' },
      { value: 'married_no_kids', label: 'Married, no kids yet' },
      { value: 'married_with_kids', label: 'Married with children' },
    ],
  },
  {
    step: 3,
    question: 'What is your approximate monthly income?',
    field: 'incomeRange',
    options: [
      { value: 'below_15k', label: 'Below ₱15,000' },
      { value: '15k_30k', label: '₱15,000 – ₱30,000' },
      { value: '30k_60k', label: '₱30,000 – ₱60,000' },
      { value: '60k_100k', label: '₱60,000 – ₱100,000' },
      { value: '100k_plus', label: '₱100,000 and above' },
    ],
  },
  {
    step: 4,
    question: 'Do you currently have life insurance?',
    field: 'lifeInsurance',
    options: [
      { value: 'none', label: 'None at all' },
      { value: 'have_unsure', label: "I have one but I'm not sure if it's enough" },
      { value: 'active_policy', label: 'Yes, I have an active and updated policy' },
    ],
  },
  {
    step: 5,
    question: 'What health coverage do you currently have?',
    field: 'healthCoverage',
    options: [
      { value: 'none', label: 'None' },
      { value: 'hmo_only', label: 'HMO only (company-provided)' },
      { value: 'personal_insurance', label: 'Personal health insurance' },
      { value: 'both', label: 'Both HMO and personal insurance' },
    ],
  },
  {
    step: 6,
    question: 'What is your biggest financial concern right now?',
    field: 'biggestWorry',
    options: [
      { value: 'medical_emergency', label: 'Medical emergency / hospitalization costs' },
      { value: 'family_if_die', label: 'What happens to my family if I pass away' },
      { value: 'retirement', label: 'Not having enough money for retirement' },
      { value: 'education', label: "Funding my children's education" },
      { value: 'emergency_savings', label: 'Building emergency savings' },
    ],
  },
  {
    step: 7,
    question: 'What best describes your work situation?',
    field: 'employment',
    options: [
      { value: 'employed_private', label: 'Employed (private company)' },
      { value: 'government', label: 'Government employee' },
      { value: 'self_employed', label: 'Self-employed / freelancer' },
      { value: 'business_owner', label: 'Business owner' },
      { value: 'ofw', label: 'OFW (Overseas Filipino Worker)' },
    ],
  },
]

// Human-readable labels for use in AI prompts
export const LABEL_MAP: Record<keyof FunnelAnswers, Record<string, string>> = {
  ageRange: {
    '18-25': '18–25 years old',
    '26-35': '26–35 years old',
    '36-45': '36–45 years old',
    '46+': '46 and above',
  },
  familyStatus: {
    single_no_deps: 'Single, no dependents',
    single_supporting: 'Single, supporting family members',
    married_no_kids: 'Married, no kids yet',
    married_with_kids: 'Married with children',
  },
  incomeRange: {
    below_15k: 'Below ₱15,000/month',
    '15k_30k': '₱15,000 – ₱30,000/month',
    '30k_60k': '₱30,000 – ₱60,000/month',
    '60k_100k': '₱60,000 – ₱100,000/month',
    '100k_plus': '₱100,000+/month',
  },
  lifeInsurance: {
    none: 'No life insurance',
    have_unsure: 'Has life insurance but unsure if adequate',
    active_policy: 'Active and updated life insurance policy',
  },
  healthCoverage: {
    none: 'No health coverage',
    hmo_only: 'Company HMO only',
    personal_insurance: 'Personal health insurance',
    both: 'Both HMO and personal health insurance',
  },
  biggestWorry: {
    medical_emergency: 'Medical emergency / hospitalization costs',
    family_if_die: 'Financial security for family if I pass away',
    retirement: 'Not having enough for retirement',
    education: "Funding children's education",
    emergency_savings: 'Building emergency savings',
  },
  employment: {
    employed_private: 'Employed at a private company',
    government: 'Government employee',
    self_employed: 'Self-employed or freelancer',
    business_owner: 'Business owner',
    ofw: 'Overseas Filipino Worker (OFW)',
  },
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/funnel-questions.ts
git commit -m "feat: add funnel question definitions and label map"
```

---

## Task 4: Funnel UI Components

**Files:**
- Create: `components/funnel/FunnelProgress.tsx`
- Create: `components/funnel/QuestionCard.tsx`

- [ ] **Step 1: Create `components/funnel/FunnelProgress.tsx`**

```tsx
interface FunnelProgressProps {
  currentStep: number
  totalSteps: number
}

export function FunnelProgress({ currentStep, totalSteps }: FunnelProgressProps) {
  const pct = Math.round((currentStep / totalSteps) * 100)
  return (
    <div className="w-full px-6 pb-8 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-2">
        <span className="font-sans text-xs text-white/40 uppercase tracking-wider">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="font-sans text-xs text-white/30">{pct}%</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gold rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `components/funnel/QuestionCard.tsx`**

```tsx
import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
}

interface QuestionCardProps {
  question: string
  options: Option[]
  onSelect: (value: string) => void
  selected?: string
}

export function QuestionCard({ question, options, onSelect, selected }: QuestionCardProps) {
  return (
    <div className="max-w-lg mx-auto w-full px-6 space-y-6">
      <h2 className="font-serif text-2xl md:text-3xl text-white text-center leading-snug">
        {question}
      </h2>
      <div className="space-y-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={cn(
              'w-full text-left px-6 py-4 rounded-xl border font-sans text-base transition-all duration-150',
              'min-h-[52px] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60',
              selected === opt.value
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-white/10 bg-navy-card text-white/80 hover:border-gold/40 hover:bg-navy-light'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/funnel/FunnelProgress.tsx components/funnel/QuestionCard.tsx
git commit -m "feat: add funnel progress bar and question card components"
```

---

## Task 5: Funnel Landing + Question Step Pages

**Files:**
- Create: `app/funnel/page.tsx`
- Create: `app/funnel/step/[n]/page.tsx`

- [ ] **Step 1: Create `app/funnel/page.tsx`**

```tsx
import Link from 'next/link'

export default function FunnelLandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-navy-gradient px-6 py-16 text-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md mx-auto space-y-8">
        {/* Badge */}
        <div className="inline-block px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-sans uppercase tracking-widest">
          Free · 2 minutes · No commitment
        </div>

        {/* Headline */}
        <div className="space-y-4">
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight">
            Kung mawala ka bukas,{' '}
            <span className="text-gold">kaya ba ng pamilya mo?</span>
          </h1>
          <p className="font-sans text-base text-white/50 leading-relaxed">
            Take this free 2-minute Financial Protection Check and find out exactly where you stand — no sign-up required.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/funnel/step/1"
          className="inline-flex items-center justify-center w-full px-8 py-4 text-lg rounded-xl font-sans font-semibold tracking-wide bg-gold text-navy-dark hover:bg-gold-soft shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          START THE CHECK →
        </Link>

        <p className="text-xs text-white/25 leading-relaxed">
          Powered by Sun Life of Canada Philippines, Inc. — Neem Tree Branch
        </p>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create `app/funnel/step/[n]/page.tsx`**

```tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FUNNEL_QUESTIONS, TOTAL_STEPS } from '@/lib/funnel-questions'
import { FunnelProgress } from '@/components/funnel/FunnelProgress'
import { QuestionCard } from '@/components/funnel/QuestionCard'
import type { FunnelAnswers } from '@/types/funnel'

export default function FunnelStepPage() {
  const params = useParams()
  const router = useRouter()
  const stepNum = Number(params.n)
  const question = FUNNEL_QUESTIONS.find((q) => q.step === stepNum)

  const [answers, setAnswers] = useState<Partial<FunnelAnswers>>({})

  useEffect(() => {
    if (!question || isNaN(stepNum) || stepNum < 1 || stepNum > TOTAL_STEPS) {
      router.replace('/funnel/step/1')
      return
    }
    try {
      const stored = sessionStorage.getItem('sma_funnel_answers')
      if (stored) setAnswers(JSON.parse(stored))
    } catch {
      // ignore
    }
  }, [stepNum]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleAnswer(value: string) {
    if (!question) return
    const updated = { ...answers, [question.field]: value }
    try {
      sessionStorage.setItem('sma_funnel_answers', JSON.stringify(updated))
    } catch {
      // ignore storage errors
    }
    setAnswers(updated)
    if (stepNum < TOTAL_STEPS) {
      router.push(`/funnel/step/${stepNum + 1}`)
    } else {
      router.push('/funnel/capture')
    }
  }

  if (!question) return null

  const selectedValue = answers[question.field] as string | undefined

  return (
    <main className="relative min-h-screen flex flex-col bg-navy-gradient">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between">
        <span className="font-sans text-xs text-white/30 tracking-widest uppercase">
          Financial Protection Check
        </span>
        <button
          onClick={() => router.push('/funnel')}
          className="font-sans text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          ✕ Exit
        </button>
      </header>

      {/* Progress */}
      <div className="px-0 pt-4">
        <FunnelProgress currentStep={stepNum} totalSteps={TOTAL_STEPS} />
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <QuestionCard
          question={question.question}
          options={question.options}
          onSelect={handleAnswer}
          selected={selectedValue}
        />
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Start dev server and test question flow manually**

```bash
npm run dev
```

Open `http://localhost:3000/funnel` → click START → verify step 1 loads → click any option → verify it advances to step 2 → continue through all 7 steps → verify redirect to `/funnel/capture` after step 7.

- [ ] **Step 4: Commit**

```bash
git add app/funnel/page.tsx app/funnel/step/
git commit -m "feat: add funnel landing page and 7-step question flow"
```

---

## Task 6: Lead Capture Gate

**Files:**
- Create: `components/funnel/LeadCaptureForm.tsx`
- Create: `app/funnel/capture/page.tsx`

- [ ] **Step 1: Create `components/funnel/LeadCaptureForm.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FunnelAnswers } from '@/types/funnel'

export function LeadCaptureForm() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName: '', mobile: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    let answers: FunnelAnswers
    try {
      const stored = sessionStorage.getItem('sma_funnel_answers')
      if (!stored) throw new Error('missing')
      answers = JSON.parse(stored)
    } catch {
      setError('Your answers were not found. Please restart the check.')
      return
    }

    if (!/^09\d{9}$/.test(form.mobile)) {
      setError('Please enter a valid Philippine mobile number — e.g. 09171234567.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/funnel/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          mobile: form.mobile.trim(),
          email: form.email.trim() || undefined,
          answers,
        }),
      })

      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(typeof body.error === 'string' ? body.error : 'Something went wrong. Please try again.')
      }

      sessionStorage.setItem('sma_funnel_report', JSON.stringify(body))
      sessionStorage.removeItem('sma_funnel_answers')
      router.push(`/funnel/report/${body.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-md mx-auto w-full px-6 space-y-4">
      <div>
        <label htmlFor="firstName" className="block font-sans text-sm text-white/50 mb-1.5">
          First Name <span className="text-gold">*</span>
        </label>
        <input
          id="firstName"
          type="text"
          required
          autoComplete="given-name"
          value={form.firstName}
          onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
          placeholder="Maria"
          className="w-full px-4 py-3 rounded-xl bg-navy-card border border-white/10 text-white font-sans placeholder:text-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus:border-gold/40 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="mobile" className="block font-sans text-sm text-white/50 mb-1.5">
          Mobile Number <span className="text-gold">*</span>
        </label>
        <input
          id="mobile"
          type="tel"
          required
          autoComplete="tel"
          value={form.mobile}
          onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
          placeholder="09171234567"
          className="w-full px-4 py-3 rounded-xl bg-navy-card border border-white/10 text-white font-sans placeholder:text-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus:border-gold/40 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="email" className="block font-sans text-sm text-white/50 mb-1.5">
          Email <span className="text-white/30 font-normal">(optional — receive your report by email)</span>
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="maria@email.com"
          className="w-full px-4 py-3 rounded-xl bg-navy-card border border-white/10 text-white font-sans placeholder:text-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus:border-gold/40 transition-colors"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400 leading-relaxed">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !form.firstName || !form.mobile}
        className="w-full px-6 py-4 rounded-xl bg-gold text-navy-dark font-sans font-semibold text-base tracking-wide hover:bg-gold-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px]"
      >
        {loading ? 'Generating your report…' : 'SEE MY RESULTS →'}
      </button>

      <p className="text-center text-xs text-white/25 leading-relaxed">
        🔒 Your information is safe. A licensed Sun Life advisor will reach out within 24 hours — no spam, no pressure.
      </p>
    </form>
  )
}
```

- [ ] **Step 2: Create `app/funnel/capture/page.tsx`**

```tsx
import { Suspense } from 'react'
import { LeadCaptureForm } from '@/components/funnel/LeadCaptureForm'

export default function FunnelCapturePage() {
  return (
    <main className="relative min-h-screen flex flex-col bg-navy-gradient">
      <header className="px-6 py-6">
        <span className="font-sans text-xs text-white/30 tracking-widest uppercase">
          Financial Protection Check
        </span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center py-8 space-y-8">
        <div className="text-center space-y-3 px-6">
          <div className="text-3xl">🎉</div>
          <h1 className="font-serif text-2xl md:text-3xl text-white">
            Your personalized protection report is ready!
          </h1>
          <p className="font-sans text-sm text-white/50">
            Where should we send it?
          </p>
        </div>

        <Suspense fallback={null}>
          <LeadCaptureForm />
        </Suspense>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Test capture gate manually**

In browser at `http://localhost:3000/funnel/capture`:
- Verify the form renders with three fields
- Try submitting with invalid mobile (e.g. `12345`) → verify error message appears
- Leave email blank — verify it's accepted (optional field)

(The submit will fail because the API doesn't exist yet — that's expected.)

- [ ] **Step 4: Commit**

```bash
git add components/funnel/LeadCaptureForm.tsx app/funnel/capture/
git commit -m "feat: add lead capture gate with mobile validation"
```

---

## Task 7: Funnel AI + API Endpoint

**Files:**
- Create: `lib/funnel-ai.ts`
- Create: `app/api/funnel/analyze/route.ts`

- [ ] **Step 1: Create `lib/funnel-ai.ts`**

```typescript
import OpenAI from 'openai'
import type { FunnelAnswers, FunnelAIReport } from '@/types/funnel'
import { LABEL_MAP } from '@/lib/funnel-questions'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `You are a warm, responsible financial protection advisor for Filipinos.
Generate a short, personalized Financial Protection Report based on the user's profile.

Rules:
- Do NOT mention specific insurance product names or company names. Use coverage types only (e.g., "life coverage", "health insurance plan", "emergency fund").
- Be warm, use simple Filipino-friendly English.
- Keep the report concise — it will be read on a phone.

Return ONLY valid JSON matching this schema exactly — no markdown, no extra text:
{
  "protectionScore": number (1-100, based on their coverage gaps and risk level),
  "scoreLabel": one of exactly: "Critical Gaps" | "Needs Attention" | "Partially Protected" | "Well Protected" | "Strongly Protected",
  "snapshot": [
    { "icon": "✅" or "❌" or "⚠️", "text": string }
  ],
  "biggestGap": string (1 sentence identifying the single most urgent protection need),
  "recommendation": string (1-2 sentences, coverage type only, no product or company names),
  "estimatedRange": string (e.g. "₱1,500 – ₱3,000/month", base on their income range),
  "nextStep": string (warm, 1 sentence, encourages booking a free consultation)
}

The snapshot array must have exactly 4 items. Use ✅ for protections they have, ❌ for missing, ⚠️ for partial or uncertain.`

export async function generateFunnelReport(
  firstName: string,
  answers: FunnelAnswers
): Promise<FunnelAIReport> {
  const userMessage = `
Client: ${firstName}
Age range: ${LABEL_MAP.ageRange[answers.ageRange]}
Family situation: ${LABEL_MAP.familyStatus[answers.familyStatus]}
Monthly income: ${LABEL_MAP.incomeRange[answers.incomeRange]}
Life insurance: ${LABEL_MAP.lifeInsurance[answers.lifeInsurance]}
Health coverage: ${LABEL_MAP.healthCoverage[answers.healthCoverage]}
Biggest financial worry: ${LABEL_MAP.biggestWorry[answers.biggestWorry]}
Employment type: ${LABEL_MAP.employment[answers.employment]}

Generate their personalized Financial Protection Report.`

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 600,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
  })

  const text = completion.choices[0]?.message?.content ?? ''
  if (!text) throw new Error('Empty response from OpenAI')
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in OpenAI response')
  return JSON.parse(jsonMatch[0]) as FunnelAIReport
}
```

- [ ] **Step 2: Create `app/api/funnel/analyze/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { generateFunnelReport } from '@/lib/funnel-ai'
import type { FunnelAnswers } from '@/types/funnel'

export async function POST(req: NextRequest) {
  let body: { firstName: string; mobile: string; email?: string; answers: FunnelAnswers }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { firstName, mobile, email, answers } = body

  if (!firstName || !mobile || !answers) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Generate AI report
  let report
  try {
    report = await generateFunnelReport(firstName, answers)
  } catch (err) {
    console.error('Funnel AI generation failed:', err)
    return NextResponse.json(
      { error: 'Report generation failed. Please try again.' },
      { status: 500 }
    )
  }

  // Save to Supabase — isolated, non-blocking on failure
  let leadId = 'local'
  try {
    const supabase = createServiceClient()
    const { data, error: dbError } = await supabase
      .from('funnel_leads')
      .insert({
        first_name: firstName,
        mobile,
        email: email ?? null,
        age_range: answers.ageRange,
        family_status: answers.familyStatus,
        income_range: answers.incomeRange,
        life_insurance: answers.lifeInsurance,
        health_coverage: answers.healthCoverage,
        biggest_worry: answers.biggestWorry,
        employment: answers.employment,
        protection_score: report.protectionScore,
        ai_report: report,
        status: 'new',
        sequence_step: 0,
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('Supabase funnel insert error (non-fatal):', dbError.message)
    } else {
      leadId = data?.id ?? 'local'
    }
  } catch (storageErr) {
    console.error('Supabase unavailable (non-fatal):', storageErr)
  }

  // Send immediate email if provided — runs after response is built
  // Email errors are non-fatal: we return the report regardless
  if (email && leadId !== 'local') {
    try {
      const { sendFunnelReport } = await import('@/lib/email')
      await sendFunnelReport({ leadId, firstName, email, report })

      // Mark sequence step 1 (immediate email sent)
      try {
        const supabase = createServiceClient()
        await supabase
          .from('funnel_leads')
          .update({ sequence_step: 1, last_emailed_at: new Date().toISOString() })
          .eq('id', leadId)
      } catch {
        // non-fatal
      }
    } catch (emailErr) {
      console.error('Immediate email failed (non-fatal):', emailErr)
    }
  }

  return NextResponse.json({ id: leadId, firstName, report })
}
```

- [ ] **Step 3: Test the endpoint (with Supabase + OpenAI configured)**

Start dev server (`npm run dev`) and run in a separate terminal:

```bash
curl -X POST http://localhost:3000/api/funnel/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Maria",
    "mobile": "09171234567",
    "email": "test@example.com",
    "answers": {
      "ageRange": "26-35",
      "familyStatus": "single_no_deps",
      "incomeRange": "30k_60k",
      "lifeInsurance": "none",
      "healthCoverage": "hmo_only",
      "biggestWorry": "medical_emergency",
      "employment": "employed_private"
    }
  }'
```

Expected: JSON response with `id`, `firstName`, and `report` object containing `protectionScore`, `scoreLabel`, `snapshot` (4 items), `biggestGap`, `recommendation`, `estimatedRange`, `nextStep`.

> **If OpenAI returns 429:** Add billing at `platform.openai.com/settings/billing`. If Supabase is not yet configured, the response will still return with `id: "local"` — that's correct fallback behavior.

- [ ] **Step 4: Commit**

```bash
git add lib/funnel-ai.ts app/api/funnel/analyze/
git commit -m "feat: add funnel AI engine and analyze API endpoint"
```

---

## Task 8: Funnel Report Page

**Files:**
- Create: `components/funnel/ReportCard.tsx`
- Create: `components/funnel/AdvisorBookingCTA.tsx`
- Create: `app/funnel/report/[id]/page.tsx`

- [ ] **Step 1: Create `components/funnel/ReportCard.tsx`**

```tsx
import { getTierColor } from '@/lib/scoring'
import type { FunnelAIReport } from '@/types/funnel'

interface ReportCardProps {
  firstName: string
  report: FunnelAIReport
}

export function ReportCard({ firstName, report }: ReportCardProps) {
  const scoreColor = getTierColor(report.protectionScore)

  return (
    <div className="max-w-lg mx-auto w-full px-6 space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <p className="font-sans text-white/40 text-sm">Hi {firstName}! Here is your</p>
        <h2 className="font-serif text-2xl text-white">Financial Protection Report 🛡️</h2>
      </div>

      {/* Score */}
      <div className="bg-navy-card border border-white/5 rounded-2xl p-6 text-center space-y-2">
        <p className="font-sans text-xs text-white/40 uppercase tracking-widest">Protection Score</p>
        <p className="font-serif text-6xl leading-none" style={{ color: scoreColor }}>
          {report.protectionScore}
        </p>
        <p className="font-sans text-sm text-white/30">/ 100</p>
        <div
          className="inline-block mt-1 px-4 py-1 rounded-full text-xs font-sans font-medium"
          style={{
            backgroundColor: `${scoreColor}1a`,
            color: scoreColor,
            border: `1px solid ${scoreColor}40`,
          }}
        >
          {report.scoreLabel}
        </div>
      </div>

      {/* Snapshot */}
      <div className="bg-navy-card border border-white/5 rounded-2xl p-5 space-y-3">
        <p className="font-sans text-xs text-white/40 uppercase tracking-widest">
          Your Protection Snapshot
        </p>
        {report.snapshot.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-lg leading-none mt-0.5 flex-shrink-0">{item.icon}</span>
            <p className="font-sans text-sm text-white/75 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>

      {/* What You Need Most */}
      <div className="bg-navy-card border border-white/5 rounded-2xl p-5 space-y-2">
        <p className="font-sans text-xs text-white/40 uppercase tracking-widest">What You Need Most</p>
        <p className="font-sans text-sm text-white/80 leading-relaxed">{report.biggestGap}</p>
        <p className="font-sans text-sm text-white/55 leading-relaxed">{report.recommendation}</p>
        <p className="font-sans text-xs text-gold/80 mt-1">
          Estimated monthly cost for your profile: {report.estimatedRange}
        </p>
      </div>

      {/* Next Step */}
      <div className="bg-navy-card border border-white/5 rounded-2xl p-5">
        <p className="font-sans text-xs text-white/40 uppercase tracking-widest mb-2">Next Step</p>
        <p className="font-sans text-sm text-white/75 leading-relaxed">{report.nextStep}</p>
      </div>

      {/* Legal */}
      <p className="text-center text-xs text-white/20 leading-relaxed px-2">
        This assessment is for informational purposes only and does not constitute financial advice.
        Please consult a licensed advisor for personalized recommendations.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Create `components/funnel/AdvisorBookingCTA.tsx`**

```tsx
interface AdvisorBookingCTAProps {
  calendlyUrl: string
  fbUrl: string
}

export function AdvisorBookingCTA({ calendlyUrl, fbUrl }: AdvisorBookingCTAProps) {
  return (
    <div className="max-w-lg mx-auto w-full px-6 space-y-4 pb-16">
      <div className="bg-navy-card border border-gold/10 rounded-2xl p-6 text-center space-y-2">
        <h3 className="font-serif text-xl text-white leading-snug">
          Want a FREE 30-minute consultation to fix these gaps?
        </h3>
        <p className="font-sans text-sm text-white/45">
          No pressure. No commitment. Just clarity on what you and your family need.
        </p>
      </div>

      <a
        href={calendlyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-full px-6 py-4 rounded-xl bg-gold text-navy-dark font-sans font-semibold text-base tracking-wide hover:bg-gold-soft transition-colors min-h-[52px]"
      >
        BOOK A FREE CALL WITH JOJO →
      </a>

      <a
        href={fbUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-full px-6 py-4 rounded-xl border border-white/10 text-white/60 font-sans text-base hover:border-white/20 hover:text-white transition-colors min-h-[52px]"
      >
        Message me on Facebook →
      </a>

      <p className="text-center text-xs text-white/20">
        Powered by Sun Life of Canada Philippines, Inc. — Neem Tree Branch
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/funnel/report/[id]/page.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ReportCard } from '@/components/funnel/ReportCard'
import { AdvisorBookingCTA } from '@/components/funnel/AdvisorBookingCTA'
import type { FunnelAIReport } from '@/types/funnel'

interface StoredReport {
  id: string
  firstName: string
  report: FunnelAIReport
}

export default function FunnelReportPage() {
  const params = useParams()
  const [data, setData] = useState<StoredReport | null>(null)
  const [loading, setLoading] = useState(true)

  const calendlyUrl = process.env.NEXT_PUBLIC_ADVISOR_CALENDLY_URL ?? '#'
  const fbUrl = process.env.NEXT_PUBLIC_ADVISOR_FB_URL ?? '#'

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('sma_funnel_report')
      if (stored) {
        const parsed = JSON.parse(stored) as StoredReport
        // Only use if it matches the current ID
        if (parsed.id === params.id || params.id === 'local') {
          setData(parsed)
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [params.id])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-navy-gradient">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </main>
    )
  }

  if (!data) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-navy-gradient px-6 text-center">
        <p className="font-sans text-white/50 mb-4">Report not found.</p>
        <a href="/funnel" className="text-gold underline font-sans text-sm">
          Take the check again
        </a>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen bg-navy-gradient">
      <header className="px-6 py-6 text-center">
        <span className="font-sans text-xs text-white/30 tracking-widest uppercase">
          Financial Protection Check
        </span>
      </header>

      <div className="space-y-4 py-4">
        <ReportCard firstName={data.firstName} report={data.report} />
        <div className="pt-4">
          <AdvisorBookingCTA calendlyUrl={calendlyUrl} fbUrl={fbUrl} />
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Test the full funnel flow end-to-end**

```bash
npm run dev
```

1. Go to `http://localhost:3000/funnel`
2. Click START → answer all 7 questions
3. Fill in name + mobile on capture page → submit
4. Verify you land on `/funnel/report/[id]` with the score, snapshot, and booking CTAs

- [ ] **Step 5: Commit**

```bash
git add components/funnel/ReportCard.tsx components/funnel/AdvisorBookingCTA.tsx app/funnel/report/
git commit -m "feat: add funnel report page with score, snapshot, and booking CTAs"
```

---

## Task 9: Email Templates

**Files:**
- Create: `emails/FunnelReportEmail.tsx`
- Create: `emails/FollowUp1Email.tsx`
- Create: `emails/FollowUp2Email.tsx`
- Create: `emails/FollowUp3Email.tsx`
- Create: `emails/FollowUp4Email.tsx`

- [ ] **Step 1: Create `emails/FunnelReportEmail.tsx`**

This is the immediate report email sent right after submission.

```tsx
import {
  Html, Head, Body, Container, Section, Heading, Text, Button, Hr,
} from '@react-email/components'
import type { FunnelAIReport } from '@/types/funnel'

interface FunnelReportEmailProps {
  firstName: string
  report: FunnelAIReport
  calendlyUrl: string
  fbUrl: string
}

export function FunnelReportEmail({ firstName, report, calendlyUrl, fbUrl }: FunnelReportEmailProps) {
  const scoreColor =
    report.protectionScore >= 80 ? '#22c55e'
    : report.protectionScore >= 60 ? '#84cc16'
    : report.protectionScore >= 40 ? '#F6B21A'
    : report.protectionScore >= 20 ? '#f97316'
    : '#ef4444'

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0A1628', fontFamily: 'Inter, Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 16px' }}>

          {/* Header */}
          <Section style={{ textAlign: 'center', paddingBottom: '24px' }}>
            <Text style={{ color: '#F6B21A', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 12px' }}>
              Safety Margin Advisor
            </Text>
            <Heading style={{ color: '#ffffff', fontSize: '22px', margin: 0, fontFamily: 'Georgia, serif', lineHeight: '1.3' }}>
              Your Financial Protection Report 🛡️
            </Heading>
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', margin: '8px 0 0' }}>
              Hi {firstName}! Here's what we found based on your answers.
            </Text>
          </Section>

          {/* Score block */}
          <Section style={{ backgroundColor: '#1A2F57', borderRadius: '12px', padding: '24px 20px', textAlign: 'center', marginBottom: '12px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 8px' }}>
              PROTECTION SCORE
            </Text>
            <Text style={{ color: scoreColor, fontSize: '60px', fontFamily: 'Georgia, serif', margin: 0, lineHeight: '1' }}>
              {report.protectionScore}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: '4px 0 10px' }}>
              / 100
            </Text>
            <Text style={{ display: 'inline-block', backgroundColor: `${scoreColor}22`, color: scoreColor, border: `1px solid ${scoreColor}55`, borderRadius: '999px', padding: '4px 18px', fontSize: '12px', margin: 0 }}>
              {report.scoreLabel}
            </Text>
          </Section>

          {/* Snapshot */}
          <Section style={{ backgroundColor: '#1A2F57', borderRadius: '12px', padding: '20px', marginBottom: '12px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 12px' }}>
              YOUR PROTECTION SNAPSHOT
            </Text>
            {report.snapshot.map((item, i) => (
              <Text key={i} style={{ color: 'rgba(255,255,255,0.78)', fontSize: '14px', margin: '0 0 10px', lineHeight: '1.5' }}>
                {item.icon} {item.text}
              </Text>
            ))}
          </Section>

          {/* Gap + Recommendation */}
          <Section style={{ backgroundColor: '#1A2F57', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 10px' }}>
              WHAT YOU NEED MOST
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '0 0 8px', lineHeight: '1.6' }}>
              {report.biggestGap}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', margin: '0 0 10px', lineHeight: '1.6' }}>
              {report.recommendation}
            </Text>
            <Text style={{ color: '#F6B21A', fontSize: '13px', margin: 0 }}>
              Estimated monthly cost for your profile: {report.estimatedRange}
            </Text>
          </Section>

          {/* CTA */}
          <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', margin: '0 0 16px', lineHeight: '1.6' }}>
              {report.nextStep}
            </Text>
            <Button
              href={calendlyUrl}
              style={{ backgroundColor: '#F6B21A', color: '#0A1628', borderRadius: '10px', padding: '14px 32px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}
            >
              Book a Free Call with Jojo →
            </Button>
          </Section>

          <Hr style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '24px 0' }} />

          <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', textAlign: 'center', lineHeight: '1.7', margin: 0 }}>
            This assessment is for informational purposes only and does not constitute financial advice.
            Please consult a licensed advisor for personalized recommendations.{'\n'}
            Sun Life of Canada Philippines, Inc. — Neem Tree Branch · Jojo
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 2: Create `emails/FollowUp1Email.tsx`** (Day 1 — soft check-in)

```tsx
import {
  Html, Head, Body, Container, Section, Text, Button, Hr,
} from '@react-email/components'
import type { FunnelAIReport } from '@/types/funnel'

interface FollowUp1EmailProps {
  firstName: string
  report: FunnelAIReport
  calendlyUrl: string
  fbUrl: string
}

export function FollowUp1Email({ firstName, report, calendlyUrl, fbUrl }: FollowUp1EmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0A1628', fontFamily: 'Inter, Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 16px' }}>
          <Text style={{ color: '#F6B21A', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 24px' }}>
            Safety Margin Advisor
          </Text>

          <Text style={{ color: '#ffffff', fontSize: '20px', fontFamily: 'Georgia, serif', margin: '0 0 16px', lineHeight: '1.4' }}>
            Hi {firstName}, did you get a chance to review your results?
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 16px' }}>
            Yesterday you got your Financial Protection Score — <strong style={{ color: '#F6B21A' }}>{report.protectionScore}/100</strong> ({report.scoreLabel}).
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 24px' }}>
            The biggest thing I noticed: {report.biggestGap}
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 24px' }}>
            If you have 15 minutes this week, I'd love to walk you through what this means for your situation — completely free, no pressure. Just real talk about your options.
          </Text>

          <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Button
              href={calendlyUrl}
              style={{ backgroundColor: '#F6B21A', color: '#0A1628', borderRadius: '10px', padding: '14px 28px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}
            >
              Book a Free 15-min Call →
            </Button>
          </Section>

          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: '1.6', margin: '0 0 0' }}>
            Or just reply to this email — I read every message. 😊{'\n\n'}
            — Jojo{'\n'}
            Sun Life of Canada Philippines, Inc.
          </Text>

          <Hr style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '24px 0' }} />
          <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', textAlign: 'center', lineHeight: '1.6', margin: 0 }}>
            This is not financial advice. For personalized recommendations, please consult a licensed advisor.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 3: Create `emails/FollowUp2Email.tsx`** (Day 3 — educational tip)

```tsx
import {
  Html, Head, Body, Container, Section, Text, Button, Hr,
} from '@react-email/components'
import type { FunnelAIReport } from '@/types/funnel'

interface FollowUp2EmailProps {
  firstName: string
  report: FunnelAIReport
  calendlyUrl: string
  fbUrl: string
}

export function FollowUp2Email({ firstName, report, calendlyUrl, fbUrl }: FollowUp2EmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0A1628', fontFamily: 'Inter, Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 16px' }}>
          <Text style={{ color: '#F6B21A', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 24px' }}>
            A quick tip for you, {firstName}
          </Text>

          <Text style={{ color: '#ffffff', fontSize: '20px', fontFamily: 'Georgia, serif', margin: '0 0 16px', lineHeight: '1.4' }}>
            The #1 mistake Filipinos make with their finances 📋
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 16px' }}>
            It's not about not saving enough. It's about <strong style={{ color: '#ffffff' }}>saving before protecting</strong>.
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 16px' }}>
            Here's the reality: if a medical emergency or income loss hits before you have protection in place, it can wipe out months — even years — of savings in a single event.
          </Text>

          <Section style={{ backgroundColor: '#1A2F57', borderRadius: '10px', padding: '16px 20px', marginBottom: '16px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              💡 <strong>The right order:</strong> Protect first → build emergency fund → then grow wealth. In that sequence, each layer supports the next.
            </Text>
          </Section>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 24px' }}>
            Your score of <strong style={{ color: '#F6B21A' }}>{report.protectionScore}/100</strong> tells me there's a gap worth closing. The good news: {report.recommendation}
          </Text>

          <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Button
              href={calendlyUrl}
              style={{ backgroundColor: '#F6B21A', color: '#0A1628', borderRadius: '10px', padding: '14px 28px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}
            >
              Let's talk about your plan →
            </Button>
          </Section>

          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: '1.6' }}>
            — Jojo{'\n'}
            Sun Life of Canada Philippines, Inc.
          </Text>

          <Hr style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '24px 0' }} />
          <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', textAlign: 'center', lineHeight: '1.6', margin: 0 }}>
            This is not financial advice. For personalized recommendations, please consult a licensed advisor.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 4: Create `emails/FollowUp3Email.tsx`** (Day 7 — direct ask)

```tsx
import {
  Html, Head, Body, Container, Section, Text, Button, Hr,
} from '@react-email/components'
import type { FunnelAIReport } from '@/types/funnel'

interface FollowUp3EmailProps {
  firstName: string
  report: FunnelAIReport
  calendlyUrl: string
  fbUrl: string
}

export function FollowUp3Email({ firstName, report, calendlyUrl, fbUrl }: FollowUp3EmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0A1628', fontFamily: 'Inter, Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 16px' }}>
          <Text style={{ color: '#F6B21A', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 24px' }}>
            Still thinking about it, {firstName}?
          </Text>

          <Text style={{ color: '#ffffff', fontSize: '20px', fontFamily: 'Georgia, serif', margin: '0 0 16px', lineHeight: '1.4' }}>
            Ready to close your protection gaps? 🛡️
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 16px' }}>
            It's been a week since you took the Financial Protection Check. Your score was <strong style={{ color: '#F6B21A' }}>{report.protectionScore}/100</strong> — and the gap we identified was: <em>{report.biggestGap}</em>
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 24px' }}>
            A free 30-minute conversation can give you a clear picture of what protection looks like for your exact situation — income, family, goals. No sales pitch. Just clarity.
          </Text>

          <Section style={{ backgroundColor: '#1A2F57', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              ⏱️ 30 minutes. Free. No commitment required.
            </Text>
          </Section>

          <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Button
              href={calendlyUrl}
              style={{ backgroundColor: '#F6B21A', color: '#0A1628', borderRadius: '10px', padding: '14px 32px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}
            >
              Book My Free Consultation →
            </Button>
          </Section>

          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: '1.6' }}>
            — Jojo{'\n'}
            Sun Life of Canada Philippines, Inc.
          </Text>

          <Hr style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '24px 0' }} />
          <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', textAlign: 'center', lineHeight: '1.6', margin: 0 }}>
            This is not financial advice. For personalized recommendations, please consult a licensed advisor.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 5: Create `emails/FollowUp4Email.tsx`** (Day 14 — social proof story)

```tsx
import {
  Html, Head, Body, Container, Section, Text, Button, Hr,
} from '@react-email/components'
import type { FunnelAIReport } from '@/types/funnel'

interface FollowUp4EmailProps {
  firstName: string
  report: FunnelAIReport
  calendlyUrl: string
  fbUrl: string
}

export function FollowUp4Email({ firstName, report, calendlyUrl, fbUrl }: FollowUp4EmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0A1628', fontFamily: 'Inter, Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 16px' }}>
          <Text style={{ color: '#F6B21A', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 24px' }}>
            A story for you, {firstName} 💛
          </Text>

          <Text style={{ color: '#ffffff', fontSize: '20px', fontFamily: 'Georgia, serif', margin: '0 0 16px', lineHeight: '1.4' }}>
            She almost didn't do it. Then one phone call changed everything.
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 16px' }}>
            Ana was 29, working in Makati, and kept telling herself she'd "deal with insurance later." She wasn't sick, she had her HMO, and money was tight after rent.
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 16px' }}>
            Then her dad had a stroke.
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 16px' }}>
            No life insurance. No emergency fund. Suddenly she was the one holding everything together — her family, her job, and a hospital bill that wiped out two years of savings.
          </Text>

          <Section style={{ backgroundColor: '#1A2F57', borderRadius: '10px', padding: '16px 20px', marginBottom: '16px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              "I wish I had taken that 30-minute call seriously. I kept thinking I had time."
            </Text>
          </Section>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 24px' }}>
            {firstName}, you already took the first step — you know your score. The next step is just a conversation. Let's make sure you're not in Ana's situation.
          </Text>

          <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Button
              href={calendlyUrl}
              style={{ backgroundColor: '#F6B21A', color: '#0A1628', borderRadius: '10px', padding: '14px 32px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}
            >
              Book Your Free Call →
            </Button>
          </Section>

          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: '1.6' }}>
            — Jojo{'\n'}
            Sun Life of Canada Philippines, Inc.{'\n\n'}
            P.S. This is the last email in this series. I won't keep bugging you — but I'm always here if you need a trusted friend in finance. 😊
          </Text>

          <Hr style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '24px 0' }} />
          <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', textAlign: 'center', lineHeight: '1.6', margin: 0 }}>
            This is not financial advice. For personalized recommendations, please consult a licensed advisor.
            Story used for illustrative purposes. Details changed for privacy.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 6: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add emails/
git commit -m "feat: add 5 email templates (report + 4 follow-ups)"
```

---

## Task 10: Email Sending Library

**Files:**
- Create: `lib/email.ts`

- [ ] **Step 1: Create `lib/email.ts`**

```typescript
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { FunnelReportEmail } from '@/emails/FunnelReportEmail'
import { FollowUp1Email } from '@/emails/FollowUp1Email'
import { FollowUp2Email } from '@/emails/FollowUp2Email'
import { FollowUp3Email } from '@/emails/FollowUp3Email'
import { FollowUp4Email } from '@/emails/FollowUp4Email'
import type { FunnelAIReport } from '@/types/funnel'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
const CALENDLY = process.env.NEXT_PUBLIC_ADVISOR_CALENDLY_URL ?? '#'
const FB = process.env.NEXT_PUBLIC_ADVISOR_FB_URL ?? '#'

export async function sendFunnelReport({
  leadId,
  firstName,
  email,
  report,
}: {
  leadId: string
  firstName: string
  email: string
  report: FunnelAIReport
}) {
  const html = await render(
    FunnelReportEmail({ firstName, report, calendlyUrl: CALENDLY, fbUrl: FB }) as React.ReactElement
  )
  const { error } = await resend.emails.send({
    from: `Jojo from Sun Life <${FROM}>`,
    to: email,
    subject: `${firstName}, here is your Financial Protection Report 🛡️`,
    html,
  })
  if (error) throw new Error(`Resend error: ${error.message}`)
}

export async function sendSequenceEmail({
  step,
  firstName,
  email,
  report,
}: {
  step: 1 | 2 | 3 | 4
  firstName: string
  email: string
  report: FunnelAIReport
}) {
  const configs: Record<
    1 | 2 | 3 | 4,
    { component: React.ReactElement; subject: string }
  > = {
    1: {
      component: FollowUp1Email({ firstName, report, calendlyUrl: CALENDLY, fbUrl: FB }) as React.ReactElement,
      subject: `${firstName}, did you review your results?`,
    },
    2: {
      component: FollowUp2Email({ firstName, report, calendlyUrl: CALENDLY, fbUrl: FB }) as React.ReactElement,
      subject: 'The #1 mistake Filipinos make with insurance 📋',
    },
    3: {
      component: FollowUp3Email({ firstName, report, calendlyUrl: CALENDLY, fbUrl: FB }) as React.ReactElement,
      subject: `${firstName}, ready to close your protection gaps?`,
    },
    4: {
      component: FollowUp4Email({ firstName, report, calendlyUrl: CALENDLY, fbUrl: FB }) as React.ReactElement,
      subject: 'A quick story about someone in your situation 💛',
    },
  }

  const { component, subject } = configs[step]
  const html = await render(component)
  const { error } = await resend.emails.send({
    from: `Jojo from Sun Life <${FROM}>`,
    to: email,
    subject,
    html,
  })
  if (error) throw new Error(`Resend error: ${error.message}`)
}
```

- [ ] **Step 2: Add React import to lib/email.ts** (top of file, before other imports)

```typescript
import React from 'react'
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/email.ts
git commit -m "feat: add email sending library with Resend + React Email"
```

---

## Task 11: Email Sequence Cron Job

**Files:**
- Create: `app/api/funnel/cron/sequence/route.ts`
- Create: `vercel.json`

- [ ] **Step 1: Create `app/api/funnel/cron/sequence/route.ts`**

The cron runs daily at 9am. It checks leads whose `created_at` is old enough for the next step, sends the email, and advances `sequence_step`.

Timing: sequence_step 1 = immediate done. Cron sends: step 2 at day 1, step 3 at day 3, step 4 at day 7, step 5 at day 14.

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendSequenceEmail } from '@/lib/email'
import type { FunnelAIReport } from '@/types/funnel'

// Each entry: { fromStep, toStep, minDaysAfterCreation }
// Leads at fromStep whose created_at is >= minDays old get the next email
const SEQUENCE_STEPS: Array<{
  fromStep: number
  toStep: number
  emailStep: 1 | 2 | 3 | 4
  minDays: number
}> = [
  { fromStep: 1, toStep: 2, emailStep: 1, minDays: 1 },
  { fromStep: 2, toStep: 3, emailStep: 2, minDays: 3 },
  { fromStep: 3, toStep: 4, emailStep: 3, minDays: 7 },
  { fromStep: 4, toStep: 5, emailStep: 4, minDays: 14 },
]

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const supabase = createServiceClient()
  const now = new Date()
  const results: Record<string, number> = {}

  for (const { fromStep, toStep, emailStep, minDays } of SEQUENCE_STEPS) {
    const cutoff = new Date(now.getTime() - minDays * 24 * 60 * 60 * 1000)

    const { data: leads, error } = await supabase
      .from('funnel_leads')
      .select('id, first_name, email, ai_report')
      .eq('sequence_step', fromStep)
      .not('email', 'is', null)
      .lte('created_at', cutoff.toISOString())
      .limit(50)

    if (error) {
      console.error(`Cron step ${emailStep} query error:`, error.message)
      results[`step${emailStep}_error`] = 1
      continue
    }

    let sent = 0
    for (const lead of leads ?? []) {
      try {
        await sendSequenceEmail({
          step: emailStep,
          firstName: lead.first_name,
          email: lead.email as string,
          report: lead.ai_report as FunnelAIReport,
        })
        await supabase
          .from('funnel_leads')
          .update({ sequence_step: toStep, last_emailed_at: now.toISOString() })
          .eq('id', lead.id)
        sent++
      } catch (err) {
        console.error(`Failed step ${emailStep} for lead ${lead.id}:`, err)
      }
    }
    results[`step${emailStep}_sent`] = sent
  }

  return NextResponse.json({ ok: true, timestamp: now.toISOString(), results })
}
```

- [ ] **Step 2: Create `vercel.json`**

```json
{
  "crons": [
    {
      "path": "/api/funnel/cron/sequence",
      "schedule": "0 9 * * *"
    }
  ]
}
```

> **Note:** Vercel Cron is available on all plans including Hobby. The cron fires daily at 9:00 AM UTC. To test manually in dev, hit `GET /api/funnel/cron/sequence` with `Authorization: Bearer <CRON_SECRET>`. In production on Vercel, the platform calls the endpoint automatically — no auth header needed if `CRON_SECRET` is not set, so keep the env var set.

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Test cron endpoint manually (dev)**

```bash
curl -H "Authorization: Bearer your-cron-secret" \
  http://localhost:3000/api/funnel/cron/sequence
```

Expected response: `{ "ok": true, "timestamp": "...", "results": { "step1_sent": 0, "step2_sent": 0, "step3_sent": 0, "step4_sent": 0 } }`

(All zeros is correct if no leads exist yet.)

- [ ] **Step 5: Commit**

```bash
git add app/api/funnel/cron/ vercel.json
git commit -m "feat: add email sequence cron job and Vercel cron config"
```

---

## Task 12: Admin Dashboard

**Files:**
- Create: `components/admin/StatusBadge.tsx`
- Create: `components/admin/FunnelLeadsTable.tsx`
- Create: `app/api/admin/funnel-leads/route.ts`
- Create: `app/admin/page.tsx`

- [ ] **Step 1: Create `components/admin/StatusBadge.tsx`**

```tsx
import { cn } from '@/lib/utils'

type Status = 'new' | 'contacted' | 'converted'

const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  contacted: { label: 'Contacted', className: 'bg-gold/15 text-gold border-gold/30' },
  converted: { label: 'Converted ✓', className: 'bg-green-500/15 text-green-400 border-green-500/30' },
}

export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-block px-3 py-1 rounded-full text-xs font-sans font-medium border',
        className
      )}
    >
      {label}
    </span>
  )
}
```

- [ ] **Step 2: Create `app/api/admin/funnel-leads/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  if (!process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('funnel_leads')
    .select(
      'id, created_at, first_name, mobile, email, age_range, income_range, life_insurance, health_coverage, biggest_worry, protection_score, status, sequence_step, last_emailed_at'
    )
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ leads: data })
}
```

- [ ] **Step 3: Create `components/admin/FunnelLeadsTable.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { StatusBadge } from './StatusBadge'

type Status = 'new' | 'contacted' | 'converted'

interface Lead {
  id: string
  created_at: string
  first_name: string
  mobile: string
  email?: string | null
  age_range: string
  income_range: string
  protection_score: number
  status: Status
  sequence_step: number
  last_emailed_at?: string | null
}

interface FunnelLeadsTableProps {
  leads: Lead[]
  token: string
}

export function FunnelLeadsTable({ leads: initialLeads, token }: FunnelLeadsTableProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [updating, setUpdating] = useState<string | null>(null)

  async function updateStatus(id: string, status: Status) {
    setUpdating(id)
    try {
      const res = await fetch(`/api/admin/funnel-leads/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status } : l))
        )
      }
    } finally {
      setUpdating(null)
    }
  }

  if (leads.length === 0) {
    return (
      <p className="font-sans text-white/40 text-center py-16">
        No funnel leads yet. Share your funnel link to start collecting!
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/5">
      <table className="w-full font-sans text-sm">
        <thead>
          <tr className="border-b border-white/5">
            {['Name', 'Mobile', 'Email', 'Score', 'Age', 'Income', 'Status', 'Sequence', 'Date', 'Actions'].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-white/30 text-xs uppercase tracking-wider font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
              <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{lead.first_name}</td>
              <td className="px-4 py-3 text-white/60 whitespace-nowrap">{lead.mobile}</td>
              <td className="px-4 py-3 text-white/50 whitespace-nowrap">{lead.email ?? '—'}</td>
              <td className="px-4 py-3 text-gold font-medium">{lead.protection_score}</td>
              <td className="px-4 py-3 text-white/50 whitespace-nowrap">{lead.age_range}</td>
              <td className="px-4 py-3 text-white/50 whitespace-nowrap">{lead.income_range.replace('_', '–').replace('k', 'k')}</td>
              <td className="px-4 py-3">
                <StatusBadge status={lead.status} />
              </td>
              <td className="px-4 py-3 text-white/40 text-xs">
                Step {lead.sequence_step}
                {lead.last_emailed_at && (
                  <span className="block text-white/25">
                    {new Date(lead.last_emailed_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                {new Date(lead.created_at).toLocaleDateString('en-PH', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </td>
              <td className="px-4 py-3">
                <select
                  value={lead.status}
                  disabled={updating === lead.id}
                  onChange={(e) => updateStatus(lead.id, e.target.value as Status)}
                  className="bg-navy-card border border-white/10 text-white/70 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/40 disabled:opacity-50 cursor-pointer"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 4: Create `app/admin/page.tsx`**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { FunnelLeadsTable } from '@/components/admin/FunnelLeadsTable'

interface Lead {
  id: string
  created_at: string
  first_name: string
  mobile: string
  email?: string | null
  age_range: string
  income_range: string
  protection_score: number
  status: 'new' | 'contacted' | 'converted'
  sequence_step: number
  last_emailed_at?: string | null
}

export default function AdminPage() {
  const [token, setToken] = useState('')
  const [inputToken, setInputToken] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Restore token from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('sma_admin_token')
      if (stored) {
        setToken(stored)
        fetchLeads(stored)
      }
    } catch {
      // ignore
    }
  }, [])

  async function fetchLeads(t: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/funnel-leads', {
        headers: { Authorization: `Bearer ${t}` },
      })
      if (res.status === 401) {
        setToken('')
        sessionStorage.removeItem('sma_admin_token')
        setError('Incorrect password.')
        return
      }
      if (!res.ok) throw new Error('Failed to fetch leads.')
      const data = await res.json()
      setLeads(data.leads ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    sessionStorage.setItem('sma_admin_token', inputToken)
    setToken(inputToken)
    await fetchLeads(inputToken)
  }

  // Not authenticated — show password gate
  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-navy-gradient px-6">
        <div className="max-w-sm w-full space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-serif text-2xl text-white">Admin Dashboard</h1>
            <p className="font-sans text-sm text-white/40">Enter your admin password to continue.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              required
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              placeholder="Admin password"
              className="w-full px-4 py-3 rounded-xl bg-navy-card border border-white/10 text-white font-sans placeholder:text-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              className="w-full px-6 py-3 rounded-xl bg-gold text-navy-dark font-sans font-semibold hover:bg-gold-soft transition-colors"
            >
              Enter Dashboard
            </button>
          </form>
        </div>
      </main>
    )
  }

  const newCount = leads.filter((l) => l.status === 'new').length
  const contactedCount = leads.filter((l) => l.status === 'contacted').length
  const convertedCount = leads.filter((l) => l.status === 'converted').length

  return (
    <main className="min-h-screen bg-navy-gradient px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-white">Funnel Leads</h1>
            <p className="font-sans text-sm text-white/40 mt-1">{leads.length} total submissions</p>
          </div>
          <button
            onClick={() => { setToken(''); sessionStorage.removeItem('sma_admin_token') }}
            className="font-sans text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'New Leads', value: newCount, color: 'text-blue-400' },
            { label: 'Contacted', value: contactedCount, color: 'text-gold' },
            { label: 'Converted', value: convertedCount, color: 'text-green-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-navy-card border border-white/5 rounded-xl p-5 text-center">
              <p className={`font-serif text-3xl ${stat.color}`}>{stat.value}</p>
              <p className="font-sans text-xs text-white/40 uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : (
          <FunnelLeadsTable leads={leads} token={token} />
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Test admin page manually**

```bash
npm run dev
```

Go to `http://localhost:3000/admin`:
- Verify the password gate appears
- Enter a wrong password → verify "Incorrect password." error
- Enter the correct `ADMIN_SECRET` value from `.env.local` → verify leads table loads
- Refresh → verify it re-authenticates from sessionStorage

- [ ] **Step 7: Commit**

```bash
git add components/admin/ app/api/admin/funnel-leads/route.ts app/admin/
git commit -m "feat: add admin dashboard with funnel leads table and auth gate"
```

---

## Task 13: Lead Status Update Endpoint

**Files:**
- Create: `app/api/admin/funnel-leads/[id]/status/route.ts`

- [ ] **Step 1: Create `app/api/admin/funnel-leads/[id]/status/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { status: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { status } = body
  if (!['new', 'contacted', 'converted'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('funnel_leads')
    .update({ status })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Test status update manually**

With the dev server running and a lead in the DB:

```bash
curl -X PATCH http://localhost:3000/api/admin/funnel-leads/SOME_LEAD_UUID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-admin-secret" \
  -d '{"status": "contacted"}'
```

Expected: `{ "ok": true }`

Then open `/admin`, verify the lead shows "Contacted" status.

Also test the dropdown in the admin UI — select a different status, verify the badge updates immediately without page reload.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/funnel-leads/
git commit -m "feat: add lead status PATCH endpoint"
```

---

## Task 14: Landing Page Link + Final Wiring

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add funnel link to the existing landing page**

In `app/page.tsx`, find the two existing buttons ("View Interactive Deck" and "Start Discovery") and add a third link above them:

Replace the `<div className="flex flex-col sm:flex-row ...">` block with:

```tsx
<div className="space-y-4 pt-4">
  {/* Primary funnel CTA */}
  <Link
    href="/funnel"
    className="inline-flex items-center justify-center w-full px-8 py-4 text-lg rounded-xl font-sans font-semibold tracking-wide bg-gold text-navy-dark hover:bg-gold-soft shadow-lg hover:shadow-gold/20 hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
  >
    Take the Free Protection Check
    <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </Link>

  {/* Secondary advisor-tool links */}
  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
    <Link
      href="/deck"
      className="inline-flex items-center justify-center px-6 py-3 text-sm rounded-xl font-sans font-medium tracking-wide border border-gold/30 text-gold/80 bg-transparent hover:bg-gold/10 hover:border-gold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
    >
      View Interactive Deck
    </Link>
    <Link
      href="/assessment"
      className="inline-flex items-center justify-center px-6 py-3 text-sm rounded-xl font-sans font-medium tracking-wide border border-white/10 text-white/50 bg-transparent hover:border-white/20 hover:text-white/70 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
    >
      Advisor Deep Dive
    </Link>
  </div>
</div>
```

- [ ] **Step 2: Verify landing page**

```bash
npm run dev
```

Go to `http://localhost:3000`:
- Verify "Take the Free Protection Check" is the main gold button
- Verify clicking it goes to `/funnel`
- Verify the two secondary links still work

- [ ] **Step 3: Verify complete end-to-end funnel**

Walk through the entire user journey:
1. `http://localhost:3000` → click "Take the Free Protection Check"
2. `/funnel` → click START THE CHECK
3. Steps 1–7 → answer all questions
4. `/funnel/capture` → enter name, valid PH mobile, optional email
5. Submit → wait for AI report
6. `/funnel/report/[id]` → verify score, snapshot (4 items), biggest gap, recommendation, estimated range
7. Verify booking CTAs are visible (Calendly + Facebook buttons)
8. Go to `/admin` → verify the lead appears in the table

- [ ] **Step 4: Final TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Final commit**

```bash
git add app/page.tsx
git commit -m "feat: promote funnel CTA on landing page — lead funnel complete"
```

---

## Post-Build Checklist

Before sharing the funnel link publicly:

- [ ] **Resend account:** Sign up at `resend.com`, get API key, add to `.env.local` as `RESEND_API_KEY`
- [ ] **Resend domain:** For production, verify your domain in Resend dashboard and update `RESEND_FROM_EMAIL` from `onboarding@resend.dev` to your email
- [ ] **Calendly:** Create a free Calendly account, get your booking link, set `NEXT_PUBLIC_ADVISOR_CALENDLY_URL`
- [ ] **Facebook:** Set `NEXT_PUBLIC_ADVISOR_FB_URL` to your Messenger link (e.g. `https://m.me/your.page`)
- [ ] **Supabase:** Apply migration `002_funnel_leads.sql`, set all 3 Supabase env vars in `.env.local`
- [ ] **Deploy to Vercel:** Run `vercel --prod` — Vercel Cron will activate automatically from `vercel.json`
- [ ] **Set env vars on Vercel:** Use `vercel env add` or the Vercel dashboard to set all env vars from `.env.local` in production

---

*Plan saved: `docs/superpowers/plans/2026-05-27-lead-funnel-email-automation.md`*
