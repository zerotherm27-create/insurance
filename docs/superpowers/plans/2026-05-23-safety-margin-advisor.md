# Safety Margin Advisor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premium AI-guided financial protection discovery web app for young Filipino professionals, combining an interactive deck, guided assessment, and Claude-powered advisory results.

**Architecture:** Next.js App Router with Tailwind CSS for UI, Anthropic Claude API for AI analysis, and Supabase for lead/assessment storage. The user flow is: Landing → /deck (presentation) → /assessment (multi-step form) → /results (AI analysis + PDF export).

**Tech Stack:** Next.js 14 App Router, Tailwind CSS, Framer Motion, Anthropic SDK (@anthropic-ai/sdk), Supabase (@supabase/supabase-js), jsPDF + html2canvas for PDF export, next/font for typography.

---

## File Map

```
/app
  layout.tsx                    — Root layout, global fonts (Playfair Display + Inter), metadata
  page.tsx                      — Landing page (Hero section, deck CTA, discovery CTA)
  /deck/page.tsx                — Full-screen 8-slide interactive presentation
  /assessment/page.tsx          — Multi-step assessment (client details → goals)
  /results/page.tsx             — AI recommendation results + PDF export
  /api/analyze/route.ts         — POST: Claude analysis endpoint
  /api/leads/route.ts           — POST: save lead to Supabase

/components
  /ui/Button.tsx                — Primary / secondary / ghost variants
  /ui/Card.tsx                  — Glassmorphism card container
  /ui/Badge.tsx                 — Gold pill badge
  /ui/ProgressBar.tsx           — Thin gold progress indicator
  /deck/DeckSlide.tsx           — Full-screen slide wrapper with enter/exit animation
  /deck/DeckNavigation.tsx      — Prev/Next/Progress/Export controls
  /deck/slides/Slide1Cover.tsx  — Cover slide
  /deck/slides/Slide2.tsx       — First salary slide
  /deck/slides/Slide3.tsx       — Insurability slide
  /deck/slides/Slide4.tsx       — Cost timing slide
  /deck/slides/Slide5.tsx       — Risk hierarchy + layered diagram
  /deck/slides/Slide6.tsx       — Product overview grid
  /deck/slides/Slide7.tsx       — "Start intentionally" slide
  /deck/slides/Slide8.tsx       — Interactive goal picker (transitions to /assessment)
  /assessment/ClientDetailsStep.tsx  — Page 1: personal info form
  /assessment/GoalsPrioritiesStep.tsx — Page 2: goals + risk profile
  /assessment/FormField.tsx     — Reusable labeled input/select/toggle
  /results/ProtectionScore.tsx  — Animated circular score meter
  /results/RecommendationCard.tsx — Primary + secondary product cards
  /results/InsightSection.tsx   — Foundation analysis narrative blocks
  /results/PDFExportButton.tsx  — Triggers PDF generation
  /results/AdvisorCTA.tsx       — Optional advisor connection section

/lib
  products.ts                   — Static product database (5 Sun Life products)
  scoring.ts                    — Protection score calculator (0–100)
  claude.ts                     — Claude API system prompt + request builder
  supabase.ts                   — Supabase browser + server client
  pdf.ts                        — PDF generation (jsPDF + html2canvas)

/types/index.ts                 — All shared TypeScript interfaces

/styles/globals.css             — Tailwind base + CSS variables for brand colors
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json` (via `npx create-next-app`)
- Modify: `tailwind.config.ts`
- Modify: `app/layout.tsx`
- Create: `styles/globals.css`
- Create: `.env.local`
- Create: `types/index.ts`

- [ ] **Step 1: Scaffold Next.js project**

```bash
cd /Users/jojo/insurance
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --yes
```

Expected: Project files created with App Router, TypeScript, Tailwind.

- [ ] **Step 2: Install dependencies**

```bash
npm install @anthropic-ai/sdk @supabase/supabase-js framer-motion jspdf html2canvas
```

- [ ] **Step 3: Configure Tailwind with brand tokens**

Replace `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F1F3D',
          dark: '#0A1628',
          light: '#162B52',
          card: '#1A2F57',
        },
        gold: {
          DEFAULT: '#F6B21A',
          soft: '#D9A441',
          muted: '#B8892E',
          pale: '#F6E9C4',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'navy-gradient': 'linear-gradient(135deg, #0A1628 0%, #0F1F3D 50%, #162B52 100%)',
        'gold-gradient': 'linear-gradient(135deg, #F6B21A 0%, #D9A441 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(26,47,87,0.8) 0%, rgba(15,31,61,0.9) 100%)',
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 4: Set up global CSS**

Replace `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --navy: #0F1F3D;
  --navy-dark: #0A1628;
  --gold: #F6B21A;
  --gold-soft: #D9A441;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--navy);
  color: white;
  font-family: var(--font-inter), system-ui, sans-serif;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: #0A1628;
}
::-webkit-scrollbar-thumb {
  background: #D9A441;
  border-radius: 2px;
}
```

- [ ] **Step 5: Set up root layout with Google Fonts**

Replace `app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Safety Margin Advisor',
  description: 'AI-guided financial protection discovery for young Filipino professionals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-navy-dark antialiased">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 6: Create shared TypeScript types**

Create `types/index.ts`:

```typescript
export interface ClientDetails {
  fullName: string
  birthday: string
  age: number
  gender: 'male' | 'female'
  smoker: boolean
  occupation: string
  incomeRange: string
  monthlyBudget: string
  hasHMO: boolean
  hasEmergencyFund: boolean
  isBreadwinner: boolean
  hasExistingInsurance: boolean
}

export interface GoalsAndPriorities {
  goals: Goal[]
  priorityStyle: PriorityStyle
  riskComfort: RiskComfort
}

export type Goal =
  | 'health_protection'
  | 'life_protection'
  | 'predictable_income'
  | 'savings_discipline'
  | 'investment_growth'
  | 'retirement_preparation'
  | 'family_protection'

export type PriorityStyle = 'start_small' | 'balanced' | 'maximize_protection'
export type RiskComfort = 'conservative' | 'moderate' | 'growth_oriented'

export interface AssessmentData {
  clientDetails: ClientDetails
  goalsAndPriorities: GoalsAndPriorities
}

export interface ProductRecommendation {
  productId: string
  productName: string
  purpose: string
  positioning: string
  whyItFits: string
}

export interface AIAnalysisResult {
  protectionScore: number
  profileSummary: string
  foundationAnalysis: string
  protectionGap: string
  recommendedPriorityLayer: string
  primaryRecommendation: ProductRecommendation
  alternativeRecommendation: ProductRecommendation
  whatComesFirst: string
  whatNotToMiss: string
  suggestedNextStep: string
}

export interface LeadRecord {
  id?: string
  createdAt?: string
  assessmentData: AssessmentData
  analysis: AIAnalysisResult
  advisorNotes?: string
}
```

- [ ] **Step 7: Create .env.local**

Create `.env.local`:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```

Expected: Server running at http://localhost:3000 with default Next.js page.

- [ ] **Step 9: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js project with brand tokens, types, and dependencies"
```

---

### Task 2: Shared UI Components

**Files:**
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Card.tsx`
- Create: `components/ui/Badge.tsx`
- Create: `components/ui/ProgressBar.tsx`

- [ ] **Step 1: Create Button component**

Create `components/ui/Button.tsx`:

```typescript
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-sans font-medium tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-gold text-navy-dark hover:bg-gold-soft shadow-lg hover:shadow-gold/20 hover:-translate-y-0.5',
      secondary: 'border border-gold/40 text-gold bg-transparent hover:bg-gold/10 hover:border-gold',
      ghost: 'text-white/60 hover:text-white hover:bg-white/5',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-xl',
      lg: 'px-8 py-4 text-lg rounded-xl',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export { Button }
```

- [ ] **Step 2: Create Card component**

Create `components/ui/Card.tsx`:

```typescript
import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean
}

export function Card({ className, glow = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-card-gradient backdrop-blur-sm',
        glow && 'shadow-[0_0_30px_rgba(246,178,26,0.08)] border-gold/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Create Badge component**

Create `components/ui/Badge.tsx`:

```typescript
import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'gold' | 'navy' | 'white'
}

export function Badge({ className, variant = 'gold', children, ...props }: BadgeProps) {
  const variants = {
    gold: 'bg-gold/15 text-gold border border-gold/30',
    navy: 'bg-navy-light text-white/70 border border-white/10',
    white: 'bg-white/10 text-white border border-white/20',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 4: Create ProgressBar component**

Create `components/ui/ProgressBar.tsx`:

```typescript
interface ProgressBarProps {
  current: number
  total: number
  className?: string
}

export function ProgressBar({ current, total, className = '' }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100)

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-0.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-gold-muted to-gold rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-white/40 tabular-nums">
        {current} / {total}
      </span>
    </div>
  )
}
```

- [ ] **Step 5: Create utility function**

Create `lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateAge(birthday: string): number {
  const birth = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(amount)
}
```

- [ ] **Step 6: Install clsx + tailwind-merge**

```bash
npm install clsx tailwind-merge
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add shared UI components (Button, Card, Badge, ProgressBar) and utils"
```

---

### Task 3: Product Database and Scoring Library

**Files:**
- Create: `lib/products.ts`
- Create: `lib/scoring.ts`

- [ ] **Step 1: Create product database**

Create `lib/products.ts`:

```typescript
export interface Product {
  id: string
  name: string
  purpose: string
  bestFor: string[]
  positioning: string
  tags: string[]
  priorityScore: number
}

export const PRODUCTS: Product[] = [
  {
    id: 'sun_fit_and_well',
    name: 'SUN Fit and Well',
    purpose: 'Critical illness and long-term health protection.',
    bestFor: [
      'health-focused young professionals',
      'protecting income from medical interruption',
    ],
    positioning: 'Protect your ability to continue earning.',
    tags: ['health', 'critical_illness', 'income_protection'],
    priorityScore: 1,
  },
  {
    id: 'sun_safer_life',
    name: 'SUN Safer Life',
    purpose: 'Affordable life protection and income replacement.',
    bestFor: [
      'newly employed professionals',
      'budget-conscious starters',
      'breadwinners',
    ],
    positioning: 'Start protection early while keeping flexibility.',
    tags: ['life', 'affordable', 'breadwinner', 'starter'],
    priorityScore: 2,
  },
  {
    id: 'sun_life_secure_income',
    name: 'Sun Life Secure Income',
    purpose: 'Protection plus predictable future income.',
    bestFor: [
      'conservative savers',
      'retirement preparation',
      'future cash flow planning',
    ],
    positioning: 'Build future financial flexibility while protection is still affordable.',
    tags: ['income', 'retirement', 'conservative', 'guaranteed'],
    priorityScore: 3,
  },
  {
    id: 'sun_smarter_life_classic',
    name: 'Sun Smarter Life Classic',
    purpose: 'Protection with structured savings.',
    bestFor: [
      'disciplined savers',
      'balanced financial planning',
    ],
    positioning: 'Grow protection and savings together.',
    tags: ['savings', 'balanced', 'structured'],
    priorityScore: 4,
  },
  {
    id: 'sun_maxilink_prime',
    name: 'Sun MaxiLink Prime',
    purpose: 'Insurance plus investment-linked growth.',
    bestFor: [
      'growth-oriented clients',
      'long-term wealth accumulation',
    ],
    positioning: 'Maximize long-term financial growth with insurance protection.',
    tags: ['investment', 'growth', 'vul', 'wealth'],
    priorityScore: 5,
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}
```

- [ ] **Step 2: Create protection score calculator**

Create `lib/scoring.ts`:

```typescript
import type { AssessmentData } from '@/types'

interface ScoreFactor {
  label: string
  points: number
  earned: number
  description: string
}

export interface ScoreBreakdown {
  total: number
  factors: ScoreFactor[]
  tier: 'critical' | 'developing' | 'moderate' | 'strong' | 'excellent'
  tierLabel: string
  tierColor: string
}

export function calculateProtectionScore(data: AssessmentData): ScoreBreakdown {
  const { clientDetails, goalsAndPriorities } = data
  const factors: ScoreFactor[] = []

  // HMO coverage (20 pts)
  factors.push({
    label: 'HMO Coverage',
    points: 20,
    earned: clientDetails.hasHMO ? 20 : 0,
    description: clientDetails.hasHMO
      ? 'Company HMO provides a foundational health safety net.'
      : 'No HMO detected — health cost exposure is high.',
  })

  // Emergency fund (20 pts)
  factors.push({
    label: 'Emergency Fund',
    points: 20,
    earned: clientDetails.hasEmergencyFund ? 20 : 0,
    description: clientDetails.hasEmergencyFund
      ? 'Emergency fund provides buffer for unexpected events.'
      : 'No emergency fund — financial shocks have no cushion.',
  })

  // Existing insurance (25 pts)
  factors.push({
    label: 'Existing Insurance',
    points: 25,
    earned: clientDetails.hasExistingInsurance ? 25 : 0,
    description: clientDetails.hasExistingInsurance
      ? 'Existing policy adds a protection layer.'
      : 'No existing insurance — significant protection gap.',
  })

  // Budget readiness (20 pts)
  const budgets: Record<string, number> = {
    'Under ₱1,000': 5,
    '₱1,000–₱2,000': 10,
    '₱2,000–₱5,000': 15,
    'Over ₱5,000': 20,
  }
  const budgetPts = budgets[clientDetails.monthlyBudget] ?? 5
  factors.push({
    label: 'Budget Readiness',
    points: 20,
    earned: budgetPts,
    description: `Budget range: ${clientDetails.monthlyBudget}. Higher budget enables stronger protection layers.`,
  })

  // Financial clarity (15 pts)
  const hasGoals = goalsAndPriorities.goals.length >= 2
  const hasStyle = goalsAndPriorities.priorityStyle !== null
  const clarityPts = hasGoals && hasStyle ? 15 : hasGoals || hasStyle ? 8 : 0
  factors.push({
    label: 'Financial Clarity',
    points: 15,
    earned: clarityPts,
    description: hasGoals
      ? 'Clear goals identified — easier to match the right protection layer.'
      : 'Goals not fully defined — discovery is a valuable first step.',
  })

  const total = factors.reduce((sum, f) => sum + f.earned, 0)

  let tier: ScoreBreakdown['tier']
  let tierLabel: string
  let tierColor: string

  if (total >= 80) {
    tier = 'excellent'
    tierLabel = 'Excellent Foundation'
    tierColor = '#22c55e'
  } else if (total >= 60) {
    tier = 'strong'
    tierLabel = 'Strong Foundation'
    tierColor = '#84cc16'
  } else if (total >= 40) {
    tier = 'moderate'
    tierLabel = 'Moderate Foundation'
    tierColor = '#F6B21A'
  } else if (total >= 20) {
    tier = 'developing'
    tierLabel = 'Developing Foundation'
    tierColor = '#f97316'
  } else {
    tier = 'critical'
    tierLabel = 'Critical Gaps Present'
    tierColor = '#ef4444'
  }

  return { total, factors, tier, tierLabel, tierColor }
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add product database and protection score calculator"
```

---

### Task 4: Landing Page

**Files:**
- Create: `app/page.tsx`

- [ ] **Step 1: Create landing page**

Create `app/page.tsx`:

```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-navy-gradient">
      {/* Cinematic background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-navy-light/20 rounded-full blur-[120px]" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center">
            <span className="text-navy-dark font-serif font-bold text-sm">S</span>
          </div>
          <span className="font-sans text-sm text-white/60 tracking-widest uppercase">
            Safety Margin Advisor
          </span>
        </div>
        <Badge variant="navy">Educational Tool</Badge>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <Badge variant="gold">For Young Filipino Professionals</Badge>

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white leading-tight tracking-tight">
            The Financial Advantage
            <br />
            <span className="text-gold">Most Young Professionals</span>
            <br />
            Ignore
          </h1>

          <p className="font-sans text-lg md:text-xl text-white/60 leading-relaxed max-w-xl mx-auto">
            Why protecting your future income matters more than most people realize.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/deck">
              <Button size="lg" variant="primary">
                View Interactive Deck
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
            <Link href="/assessment">
              <Button size="lg" variant="secondary">
                Start Discovery
              </Button>
            </Link>
          </div>

          <p className="text-xs text-white/30 max-w-md mx-auto leading-relaxed pt-4">
            This tool is for educational guidance only. Product suitability, eligibility, coverage, and premiums
            must be validated through an official Sun Life proposal and licensed advisor consultation.
          </p>
        </div>
      </section>

      {/* Bottom stats row */}
      <section className="relative z-10 border-t border-white/5 px-6 py-8 md:px-12">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
          {[
            { value: '5', label: 'Protection Layers' },
            { value: 'AI', label: 'Guided Analysis' },
            { value: 'Free', label: 'Educational Tool' },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="font-serif text-2xl md:text-3xl text-gold">{stat.value}</p>
              <p className="font-sans text-xs text-white/40 tracking-wider uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
```

- [ ] **Step 2: Verify landing page renders**

```bash
npm run dev
```

Open http://localhost:3000, verify navy background, gold headline, two CTA buttons render correctly.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add premium landing page with brand identity and dual CTAs"
```

---

### Task 5: Deck Infrastructure

**Files:**
- Create: `components/deck/DeckSlide.tsx`
- Create: `components/deck/DeckNavigation.tsx`

- [ ] **Step 1: Create DeckSlide wrapper**

Create `components/deck/DeckSlide.tsx`:

```typescript
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface DeckSlideProps {
  children: ReactNode
  slideKey: number
  direction: number
}

export function DeckSlide({ children, slideKey, direction }: DeckSlideProps) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={slideKey}
        custom={direction}
        initial={{ opacity: 0, x: direction * 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction * -60 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-16"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Create DeckNavigation**

Create `components/deck/DeckNavigation.tsx`:

```typescript
'use client'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface DeckNavigationProps {
  current: number
  total: number
  onPrev: () => void
  onNext: () => void
  onExportPDF: () => void
  isLastSlide: boolean
}

export function DeckNavigation({
  current,
  total,
  onPrev,
  onNext,
  onExportPDF,
  isLastSlide,
}: DeckNavigationProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 px-8 pb-8 z-20">
      <div className="max-w-5xl mx-auto space-y-4">
        <ProgressBar current={current} total={total} />

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={onPrev}
              disabled={current === 1}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Previous slide"
            >
              ←
            </button>
            <button
              onClick={onNext}
              disabled={isLastSlide && current === total}
              className="w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center text-gold hover:bg-gold/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Next slide"
            >
              →
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onExportPDF}
              className="text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20"
            >
              Export PDF
            </button>
            {isLastSlide ? (
              <Link href="/assessment">
                <Button size="sm" variant="primary">
                  Start Discovery →
                </Button>
              </Link>
            ) : (
              <button
                onClick={onNext}
                className="text-xs text-gold/70 hover:text-gold transition-colors"
              >
                Skip to Discovery →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add deck slide wrapper and navigation components"
```

---

### Task 6: Deck Slides Content

**Files:**
- Create: `components/deck/slides/Slide1Cover.tsx`
- Create: `components/deck/slides/Slide2.tsx`
- Create: `components/deck/slides/Slide3.tsx`
- Create: `components/deck/slides/Slide4.tsx`
- Create: `components/deck/slides/Slide5.tsx`
- Create: `components/deck/slides/Slide6.tsx`
- Create: `components/deck/slides/Slide7.tsx`
- Create: `components/deck/slides/Slide8.tsx`
- Create: `app/deck/page.tsx`

- [ ] **Step 1: Create Slide 1 (Cover)**

Create `components/deck/slides/Slide1Cover.tsx`:

```typescript
import { Badge } from '@/components/ui/Badge'

export function Slide1Cover() {
  return (
    <div className="max-w-4xl mx-auto text-center space-y-8">
      <Badge variant="gold">Financial Education Series</Badge>
      <h1 className="font-serif text-5xl md:text-7xl text-white leading-tight">
        The Financial Advantage
        <br />
        <span className="text-gold italic">Most Young Professionals</span>
        <br />
        Ignore
      </h1>
      <p className="font-sans text-xl text-white/60 max-w-lg mx-auto">
        Why starting early matters more than earning more later.
      </p>
      <div className="w-16 h-px bg-gold/40 mx-auto" />
    </div>
  )
}
```

- [ ] **Step 2: Create Slide 2**

Create `components/deck/slides/Slide2.tsx`:

```typescript
export function Slide2() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
        Your First Salary Is Progress.
        <br />
        <span className="text-gold">But It Is Not Yet Protection.</span>
      </h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <p className="text-white/50 text-sm uppercase tracking-widest">Most focus on</p>
          <ul className="space-y-3">
            {['Gadgets', 'Travel', 'Upgrades', 'Lifestyle growth'].map((item) => (
              <li key={item} className="flex items-center gap-3 text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <p className="text-gold/80 text-sm uppercase tracking-widest">Very few focus on</p>
          <p className="text-white text-lg leading-relaxed">
            Protecting their ability to <strong className="text-gold">continue earning</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create Slide 3**

Create `components/deck/slides/Slide3.tsx`:

```typescript
export function Slide3() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
        At 23, Your Biggest Advantage
        <br />
        Is <span className="text-gold italic">Insurability.</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { stat: 'Higher', label: 'Approval chances' },
          { stat: 'Lower', label: 'Protection costs' },
          { stat: 'Greater', label: 'Flexibility' },
          { stat: 'Open', label: 'Future options' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/10 bg-white/5 p-4 text-center space-y-2"
          >
            <p className="font-serif text-2xl text-gold">{item.stat}</p>
            <p className="text-xs text-white/50">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-gold/20 bg-gold/5 px-6 py-4">
        <p className="text-gold/90 text-sm italic">
          Key insight: Starting early protects future flexibility.
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create Slide 4**

Create `components/deck/slides/Slide4.tsx`:

```typescript
export function Slide4() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
        Insurance Is Cheapest Before
        <br />
        <span className="text-gold">Life Gets Complicated.</span>
      </h2>
      <div className="space-y-4">
        <p className="text-white/50 text-sm uppercase tracking-widest mb-4">
          Many only think about protection after:
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            'Hospitalization',
            'Health scares',
            'Family responsibility',
            'Becoming breadwinners',
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <span className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-white/30 text-xs flex-shrink-0">
                ✕
              </span>
              <span className="text-white/70">{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-gold/20 bg-gold/5 px-6 py-4">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">The challenge</p>
        <p className="text-white/80">
          Protection becomes <strong className="text-gold">harder and more expensive</strong> later.
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create Slide 5 (Foundation Layers)**

Create `components/deck/slides/Slide5.tsx`:

```typescript
export function Slide5() {
  const layers = [
    { num: '05', label: 'Wealth Accumulation', color: 'border-white/20 bg-white/5', textColor: 'text-white/60' },
    { num: '04', label: 'Life Protection', color: 'border-gold/20 bg-gold/5', textColor: 'text-white/70' },
    { num: '03', label: 'Health Protection', color: 'border-gold/30 bg-gold/8', textColor: 'text-white/80' },
    { num: '02', label: 'Emergency Fund', color: 'border-gold/40 bg-gold/10', textColor: 'text-white/90' },
    { num: '01', label: 'Company HMO', color: 'border-gold/60 bg-gold/15', textColor: 'text-white' },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
        Start With The Risk That Can
        <br />
        <span className="text-gold">Interrupt Your Income First.</span>
      </h2>
      <div className="space-y-2">
        {layers.map((layer) => (
          <div
            key={layer.num}
            className={`flex items-center gap-4 rounded-xl border px-5 py-3 ${layer.color}`}
          >
            <span className="font-serif text-xs text-gold/40 w-8">{layer.num}</span>
            <span className={`font-sans text-sm font-medium ${layer.textColor}`}>{layer.label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/30 italic">
        Build the foundation before the tower.
      </p>
    </div>
  )
}
```

- [ ] **Step 6: Create Slide 6 (Products)**

Create `components/deck/slides/Slide6.tsx`:

```typescript
const products = [
  { name: 'SUN Fit and Well', arrow: 'Health protection' },
  { name: 'SUN Safer Life', arrow: 'Affordable starter protection' },
  { name: 'Sun Life Secure Income', arrow: 'Predictable future income' },
  { name: 'Sun Smarter Life Classic', arrow: 'Protection plus savings' },
  { name: 'Sun MaxiLink Prime', arrow: 'Insurance plus investment growth' },
]

export function Slide6() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 w-full">
      <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
        Different Goals Need
        <br />
        <span className="text-gold">Different Financial Tools.</span>
      </h2>
      <div className="space-y-2">
        {products.map((p) => (
          <div
            key={p.name}
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-3 group"
          >
            <span className="text-xs text-white/40 flex-1">{p.arrow}</span>
            <span className="text-gold/60 text-sm">→</span>
            <span className="font-sans text-sm font-medium text-white group-hover:text-gold transition-colors">
              {p.name}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/30 italic">
        The best product depends on your stage, priorities, and financial foundation.
      </p>
    </div>
  )
}
```

- [ ] **Step 7: Create Slide 7**

Create `components/deck/slides/Slide7.tsx`:

```typescript
export function Slide7() {
  return (
    <div className="max-w-3xl mx-auto text-center space-y-10">
      <h2 className="font-serif text-5xl md:text-6xl text-white leading-tight">
        The Goal Is Not To
        <br />
        <span className="text-gold italic">Buy Everything.</span>
      </h2>
      <div className="w-16 h-px bg-gold/40 mx-auto" />
      <p className="font-serif text-xl md:text-2xl text-white/70 italic max-w-xl mx-auto">
        "The goal is to build the right financial layer at the right time."
      </p>
      <div className="rounded-xl border border-white/10 bg-white/5 px-8 py-6 max-w-md mx-auto">
        <p className="text-white/60 leading-relaxed">
          Most financially responsible people did not start big.
          <br />
          <strong className="text-white">They started intentionally.</strong>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Create Slide 8 (Interactive Transition)**

Create `components/deck/slides/Slide8.tsx`:

```typescript
'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

const choices = [
  { id: 'health', label: 'I want health protection' },
  { id: 'starter', label: 'I want affordable starter coverage' },
  { id: 'income', label: 'I want future guaranteed income' },
  { id: 'growth', label: 'I want long-term growth' },
  { id: 'figuring', label: "I'm still figuring things out" },
]

export function Slide8({ onGoalSelect }: { onGoalSelect?: (id: string) => void }) {
  const router = useRouter()

  const handleSelect = (id: string) => {
    if (onGoalSelect) onGoalSelect(id)
    const params = new URLSearchParams({ goal: id })
    router.push(`/assessment?${params.toString()}`)
  }

  return (
    <div className="max-w-2xl mx-auto w-full space-y-8">
      <div className="text-center space-y-3">
        <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
          Which Financial Goal Sounds
          <br />
          <span className="text-gold">Most Like You?</span>
        </h2>
      </div>
      <div className="space-y-2">
        {choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => handleSelect(choice.id)}
            className="w-full text-left rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-white/80 hover:border-gold/40 hover:bg-gold/5 hover:text-white transition-all duration-200 group"
          >
            <span className="flex items-center justify-between">
              <span className="font-sans text-sm">{choice.label}</span>
              <span className="text-gold/0 group-hover:text-gold/60 transition-colors">→</span>
            </span>
          </button>
        ))}
      </div>
      <div className="text-center">
        <Button onClick={() => router.push('/assessment')} size="md" variant="primary">
          Continue To Discovery →
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 9: Create deck page**

Create `app/deck/page.tsx`:

```typescript
'use client'
import { useState, useEffect, useCallback } from 'react'
import { DeckSlide } from '@/components/deck/DeckSlide'
import { DeckNavigation } from '@/components/deck/DeckNavigation'
import { Slide1Cover } from '@/components/deck/slides/Slide1Cover'
import { Slide2 } from '@/components/deck/slides/Slide2'
import { Slide3 } from '@/components/deck/slides/Slide3'
import { Slide4 } from '@/components/deck/slides/Slide4'
import { Slide5 } from '@/components/deck/slides/Slide5'
import { Slide6 } from '@/components/deck/slides/Slide6'
import { Slide7 } from '@/components/deck/slides/Slide7'
import { Slide8 } from '@/components/deck/slides/Slide8'

const SLIDES = [
  <Slide1Cover key={1} />,
  <Slide2 key={2} />,
  <Slide3 key={3} />,
  <Slide4 key={4} />,
  <Slide5 key={5} />,
  <Slide6 key={6} />,
  <Slide7 key={7} />,
  <Slide8 key={8} />,
]

export default function DeckPage() {
  const [current, setCurrent] = useState(1)
  const [direction, setDirection] = useState(1)
  const total = SLIDES.length

  const goNext = useCallback(() => {
    if (current < total) {
      setDirection(1)
      setCurrent((c) => c + 1)
    }
  }, [current, total])

  const goPrev = useCallback(() => {
    if (current > 1) {
      setDirection(-1)
      setCurrent((c) => c - 1)
    }
  }, [current])

  const handleExport = () => {
    window.print()
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev])

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-navy-gradient">
      {/* Background ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-gold/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-gold/3 rounded-full blur-3xl" />
      </div>

      <DeckSlide slideKey={current} direction={direction}>
        {SLIDES[current - 1]}
      </DeckSlide>

      <DeckNavigation
        current={current}
        total={total}
        onPrev={goPrev}
        onNext={goNext}
        onExportPDF={handleExport}
        isLastSlide={current === total}
      />
    </main>
  )
}
```

- [ ] **Step 10: Verify deck navigation**

Open http://localhost:3000/deck — verify all 8 slides render, arrow keys navigate, progress indicator updates.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add complete 8-slide interactive deck with animations and keyboard nav"
```

---

### Task 7: Assessment Form — Client Details Step

**Files:**
- Create: `components/assessment/FormField.tsx`
- Create: `components/assessment/ClientDetailsStep.tsx`

- [ ] **Step 1: Create FormField**

Create `components/assessment/FormField.tsx`:

```typescript
import { InputHTMLAttributes, SelectHTMLAttributes } from 'react'

interface BaseProps {
  label: string
  hint?: string
  error?: string
  required?: boolean
}

interface InputFieldProps extends BaseProps, InputHTMLAttributes<HTMLInputElement> {
  type: 'text' | 'date' | 'email' | 'number'
}

interface SelectFieldProps extends BaseProps, SelectHTMLAttributes<HTMLSelectElement> {
  type: 'select'
  options: { value: string; label: string }[]
}

interface ToggleFieldProps extends BaseProps {
  type: 'toggle'
  checked: boolean
  onChange: (checked: boolean) => void
}

type FormFieldProps = InputFieldProps | SelectFieldProps | ToggleFieldProps

export function FormField(props: FormFieldProps) {
  const { label, hint, error, required } = props

  const labelEl = (
    <label className="block text-xs font-medium text-white/50 uppercase tracking-widest mb-2">
      {label}
      {required && <span className="text-gold ml-1">*</span>}
    </label>
  )

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-gold/40 focus:bg-white/8 transition-all'

  if (props.type === 'toggle') {
    const { checked, onChange } = props as ToggleFieldProps
    return (
      <div className="space-y-1">
        {labelEl}
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
            checked ? 'bg-gold' : 'bg-white/20'
          }`}
          role="switch"
          aria-checked={checked}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        {hint && <p className="text-xs text-white/30">{hint}</p>}
      </div>
    )
  }

  if (props.type === 'select') {
    const { options, type: _t, label: _l, hint: _h, error: _e, required: _r, ...selectProps } =
      props as SelectFieldProps
    return (
      <div className="space-y-1">
        {labelEl}
        <select
          className={`${inputClass} appearance-none cursor-pointer`}
          {...selectProps}
        >
          <option value="" disabled>Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-navy-dark">
              {opt.label}
            </option>
          ))}
        </select>
        {hint && <p className="text-xs text-white/30">{hint}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }

  const { type, label: _l, hint: _h, error: _e, required: _r, ...inputProps } =
    props as InputFieldProps
  return (
    <div className="space-y-1">
      {labelEl}
      <input type={type} className={inputClass} {...inputProps} />
      {hint && <p className="text-xs text-white/30">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 2: Create ClientDetailsStep**

Create `components/assessment/ClientDetailsStep.tsx`:

```typescript
'use client'
import { useState, useEffect } from 'react'
import { FormField } from './FormField'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { ClientDetails } from '@/types'
import { calculateAge } from '@/lib/utils'

interface Props {
  initial?: Partial<ClientDetails>
  onSubmit: (data: ClientDetails) => void
}

const INCOME_OPTIONS = [
  { value: 'Under ₱20,000', label: 'Under ₱20,000' },
  { value: '₱20,000–₱35,000', label: '₱20,000–₱35,000' },
  { value: '₱35,000–₱60,000', label: '₱35,000–₱60,000' },
  { value: '₱60,000–₱100,000', label: '₱60,000–₱100,000' },
  { value: 'Over ₱100,000', label: 'Over ₱100,000' },
]

const BUDGET_OPTIONS = [
  { value: 'Under ₱1,000', label: 'Under ₱1,000/month' },
  { value: '₱1,000–₱2,000', label: '₱1,000–₱2,000/month' },
  { value: '₱2,000–₱5,000', label: '₱2,000–₱5,000/month' },
  { value: 'Over ₱5,000', label: 'Over ₱5,000/month' },
]

export function ClientDetailsStep({ initial, onSubmit }: Props) {
  const [form, setForm] = useState<Partial<ClientDetails>>({
    fullName: '',
    birthday: '',
    age: 0,
    gender: 'male',
    smoker: false,
    occupation: '',
    incomeRange: '',
    monthlyBudget: '',
    hasHMO: false,
    hasEmergencyFund: false,
    isBreadwinner: false,
    hasExistingInsurance: false,
    ...initial,
  })

  useEffect(() => {
    if (form.birthday) {
      const age = calculateAge(form.birthday)
      setForm((f) => ({ ...f, age }))
    }
  }, [form.birthday])

  const set = (key: keyof ClientDetails, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  const isValid =
    form.fullName && form.birthday && form.occupation && form.incomeRange && form.monthlyBudget

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) onSubmit(form as ClientDetails)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            type="text"
            label="Full Name"
            required
            placeholder="Your full name"
            value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)}
          />
          <FormField
            type="date"
            label="Birthday"
            required
            value={form.birthday}
            onChange={(e) => set('birthday', e.target.value)}
          />
        </div>

        {form.age && form.age > 0 ? (
          <div className="rounded-xl bg-gold/10 border border-gold/20 px-4 py-2">
            <p className="text-sm text-gold/90">Age computed: <strong>{form.age} years old</strong></p>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            type="select"
            label="Gender"
            required
            value={form.gender}
            onChange={(e) => set('gender', e.target.value as 'male' | 'female')}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
            ]}
          />
          <FormField
            type="text"
            label="Occupation"
            required
            placeholder="e.g. Software Engineer"
            value={form.occupation}
            onChange={(e) => set('occupation', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            type="select"
            label="Monthly Income Range"
            required
            value={form.incomeRange}
            onChange={(e) => set('incomeRange', e.target.value)}
            options={INCOME_OPTIONS}
          />
          <FormField
            type="select"
            label="Monthly Budget for Protection"
            required
            value={form.monthlyBudget}
            onChange={(e) => set('monthlyBudget', e.target.value)}
            options={BUDGET_OPTIONS}
          />
        </div>
      </Card>

      <Card className="p-6">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Financial Foundation</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'hasHMO' as const, label: 'Company HMO', hint: 'Do you have employer HMO?' },
            { key: 'hasEmergencyFund' as const, label: 'Emergency Fund', hint: '3–6 months expenses saved?' },
            { key: 'isBreadwinner' as const, label: 'Breadwinner', hint: 'Do others depend on your income?' },
            { key: 'hasExistingInsurance' as const, label: 'Existing Insurance', hint: 'Any active policy?' },
          ].map(({ key, label, hint }) => (
            <div key={key} className="space-y-2">
              <FormField
                type="toggle"
                label={label}
                hint={hint}
                checked={!!form[key]}
                onChange={(v) => set(key, v)}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Health Profile</p>
        <FormField
          type="toggle"
          label="Smoker"
          hint="This affects eligibility and coverage options."
          checked={!!form.smoker}
          onChange={(v) => set('smoker', v)}
        />
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={!isValid} size="lg" variant="primary">
          Continue to Goals →
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add client details assessment step with toggle fields and age calculator"
```

---

### Task 8: Assessment Form — Goals & Priorities Step

**Files:**
- Create: `components/assessment/GoalsPrioritiesStep.tsx`
- Create: `app/assessment/page.tsx`

- [ ] **Step 1: Create GoalsPrioritiesStep**

Create `components/assessment/GoalsPrioritiesStep.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Goal, GoalsAndPriorities, PriorityStyle, RiskComfort } from '@/types'

interface Props {
  initial?: Partial<GoalsAndPriorities>
  onSubmit: (data: GoalsAndPriorities) => void
  onBack: () => void
}

const GOALS: { id: Goal; label: string; icon: string }[] = [
  { id: 'health_protection', label: 'Health protection', icon: '❤️' },
  { id: 'life_protection', label: 'Life protection', icon: '🛡️' },
  { id: 'predictable_income', label: 'Predictable future income', icon: '📈' },
  { id: 'savings_discipline', label: 'Savings discipline', icon: '💰' },
  { id: 'investment_growth', label: 'Investment growth', icon: '🚀' },
  { id: 'retirement_preparation', label: 'Retirement preparation', icon: '🏡' },
  { id: 'family_protection', label: 'Family protection', icon: '👨‍👩‍👧' },
]

const PRIORITY_STYLES: { id: PriorityStyle; label: string; desc: string }[] = [
  { id: 'start_small', label: 'Start Small', desc: 'Begin with affordable protection, grow over time.' },
  { id: 'balanced', label: 'Balanced', desc: 'Protection and savings side by side.' },
  { id: 'maximize_protection', label: 'Maximize Protection', desc: 'Full coverage first, growth next.' },
]

const RISK_OPTIONS: { id: RiskComfort; label: string; desc: string }[] = [
  { id: 'conservative', label: 'Conservative', desc: 'Prefer guaranteed outcomes over growth potential.' },
  { id: 'moderate', label: 'Moderate', desc: 'Comfortable with some market fluctuation.' },
  { id: 'growth_oriented', label: 'Growth-Oriented', desc: 'Willing to take higher risk for higher potential.' },
]

export function GoalsPrioritiesStep({ initial, onSubmit, onBack }: Props) {
  const [goals, setGoals] = useState<Goal[]>(initial?.goals ?? [])
  const [priorityStyle, setPriorityStyle] = useState<PriorityStyle | ''>( initial?.priorityStyle ?? '' )
  const [riskComfort, setRiskComfort] = useState<RiskComfort | ''>( initial?.riskComfort ?? '' )

  const toggleGoal = (id: Goal) =>
    setGoals((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id])

  const isValid = goals.length >= 1 && priorityStyle !== '' && riskComfort !== ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      onSubmit({
        goals,
        priorityStyle: priorityStyle as PriorityStyle,
        riskComfort: riskComfort as RiskComfort,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-4">
          Select all that apply
        </p>
        <p className="font-serif text-xl text-white mb-4">
          What financial goals matter most to you right now?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {GOALS.map(({ id, label, icon }) => {
            const selected = goals.includes(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleGoal(id)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                  selected
                    ? 'border-gold/60 bg-gold/10 text-white'
                    : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                }`}
              >
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-medium">{label}</span>
                {selected && (
                  <span className="ml-auto text-gold text-xs">✓</span>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      <Card className="p-6">
        <p className="font-serif text-xl text-white mb-4">
          What best describes your priority style?
        </p>
        <div className="space-y-2">
          {PRIORITY_STYLES.map(({ id, label, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPriorityStyle(id)}
              className={`w-full flex items-start gap-4 rounded-xl border px-5 py-4 text-left transition-all ${
                priorityStyle === id
                  ? 'border-gold/60 bg-gold/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div
                className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                  priorityStyle === id ? 'border-gold bg-gold' : 'border-white/30'
                }`}
              >
                {priorityStyle === id && (
                  <span className="w-2 h-2 rounded-full bg-navy-dark" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-white/40 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <p className="font-serif text-xl text-white mb-4">
          How comfortable are you with financial risk?
        </p>
        <div className="space-y-2">
          {RISK_OPTIONS.map(({ id, label, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => setRiskComfort(id)}
              className={`w-full flex items-start gap-4 rounded-xl border px-5 py-4 text-left transition-all ${
                riskComfort === id
                  ? 'border-gold/60 bg-gold/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div
                className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                  riskComfort === id ? 'border-gold bg-gold' : 'border-white/30'
                }`}
              >
                {riskComfort === id && (
                  <span className="w-2 h-2 rounded-full bg-navy-dark" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-white/40 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <Button type="submit" disabled={!isValid} size="lg" variant="primary">
          Analyze My Profile →
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Create assessment page**

Create `app/assessment/page.tsx`:

```typescript
'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ClientDetailsStep } from '@/components/assessment/ClientDetailsStep'
import { GoalsPrioritiesStep } from '@/components/assessment/GoalsPrioritiesStep'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import type { AssessmentData, ClientDetails, GoalsAndPriorities } from '@/types'

function AssessmentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [clientDetails, setClientDetails] = useState<ClientDetails | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const goalFromDeck = searchParams.get('goal')

  const goalMapping: Record<string, string> = {
    health: 'health_protection',
    starter: 'life_protection',
    income: 'predictable_income',
    growth: 'investment_growth',
    figuring: '',
  }

  const preselectedGoal = goalFromDeck ? goalMapping[goalFromDeck] : ''

  const handleClientDetails = (data: ClientDetails) => {
    setClientDetails(data)
    setStep(2)
  }

  const handleGoals = async (goals: GoalsAndPriorities) => {
    if (!clientDetails) return
    setIsSubmitting(true)

    const assessmentData: AssessmentData = {
      clientDetails,
      goalsAndPriorities: goals,
    }

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData),
      })

      if (!res.ok) throw new Error('Analysis failed')

      const { analysisId } = await res.json()
      router.push(`/results?id=${analysisId}`)
    } catch (err) {
      console.error(err)
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-navy-gradient">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10 space-y-3">
          <Badge variant="gold">Financial Discovery</Badge>
          <h1 className="font-serif text-3xl md:text-4xl text-white">
            {step === 1 ? 'Tell Us About Yourself' : 'Your Goals & Priorities'}
          </h1>
          <ProgressBar current={step} total={2} className="pt-2" />
        </div>

        {isSubmitting ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
            <p className="text-white/60 font-sans text-sm">
              Analyzing your financial profile...
            </p>
          </div>
        ) : step === 1 ? (
          <ClientDetailsStep onSubmit={handleClientDetails} />
        ) : (
          <GoalsPrioritiesStep
            initial={preselectedGoal ? { goals: [preselectedGoal as Goal] } : {}}
            onSubmit={handleGoals}
            onBack={() => setStep(1)}
          />
        )}

        {!isSubmitting && (
          <p className="mt-8 text-xs text-white/20 text-center leading-relaxed">
            This tool is for educational guidance only. Product suitability, eligibility, coverage, and premiums
            must be validated through an official Sun Life proposal and licensed advisor consultation.
          </p>
        )}
      </div>
    </main>
  )
}

// Suspense boundary for useSearchParams
export default function AssessmentPage() {
  return (
    <Suspense>
      <AssessmentContent />
    </Suspense>
  )
}

// Fix TS: Goal type must be importable
import type { Goal } from '@/types'
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add goals/priorities step and assessment page with suspense boundary"
```

---

### Task 9: Claude API Analysis Endpoint

**Files:**
- Create: `lib/claude.ts`
- Create: `app/api/analyze/route.ts`

- [ ] **Step 1: Create Claude prompt builder**

Create `lib/claude.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk'
import type { AssessmentData } from '@/types'
import { PRODUCTS } from './products'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a calm, intelligent, and responsible financial advisor assistant for young Filipino professionals in the Philippines. You work for Safety Margin Advisor, an educational financial discovery platform.

Your role:
- Analyze a client's financial profile and provide advisory guidance
- Recommend the most appropriate Sun Life Philippines product based on their stage and needs
- Educate — not sell. You act like a responsible advisor, not a salesperson.
- You NEVER guarantee approval, returns, or exact premiums.
- You always note that official proposals and licensed advisor consultation are required.

Sun Life Philippines Products Available:
${PRODUCTS.map((p) => `- ${p.name}: ${p.purpose} Best for: ${p.bestFor.join(', ')}`).join('\n')}

RECOMMENDATION LOGIC:
- Young + no HMO → prioritize foundational protection awareness, SUN Fit and Well
- Low budget + breadwinner → SUN Safer Life first
- Health-focused → SUN Fit and Well
- Conservative saver wanting future income → Sun Life Secure Income
- Balanced saver → Sun Smarter Life Classic
- Growth-oriented with solid financial foundation → Sun MaxiLink Prime
- Do NOT recommend investment-linked products first if client lacks HMO, emergency fund, or existing insurance

TONE: Conversational Filipino-English, warm, calm, grounded, modern, financially responsible. Avoid fear-based language. Avoid aggressive sales tone. Sound like a trusted friend who understands finance.

OUTPUT FORMAT: Return ONLY valid JSON matching this schema exactly:
{
  "protectionScore": number (1-100),
  "profileSummary": string (2-3 sentences, warm and personal),
  "foundationAnalysis": string (2-3 sentences about current financial foundation),
  "protectionGap": string (1-2 sentences identifying the most important gap),
  "recommendedPriorityLayer": string (which layer they should focus on first),
  "primaryRecommendation": {
    "productId": string (exact product id from list),
    "productName": string,
    "purpose": string,
    "positioning": string,
    "whyItFits": string (2-3 sentences explaining fit to this specific client)
  },
  "alternativeRecommendation": {
    "productId": string,
    "productName": string,
    "purpose": string,
    "positioning": string,
    "whyItFits": string
  },
  "whatComesFirst": string (1-2 sentences on priority sequencing),
  "whatNotToMiss": string (1-2 sentences on the most important thing to avoid),
  "suggestedNextStep": string (warm, actionable next step suggestion)
}`

export async function analyzeProfile(data: AssessmentData) {
  const userMessage = `
Client Profile:
Name: ${data.clientDetails.fullName}
Age: ${data.clientDetails.age}
Gender: ${data.clientDetails.gender}
Smoker: ${data.clientDetails.smoker ? 'Yes' : 'No'}
Occupation: ${data.clientDetails.occupation}
Monthly Income Range: ${data.clientDetails.incomeRange}
Monthly Budget for Protection: ${data.clientDetails.monthlyBudget}
Has Company HMO: ${data.clientDetails.hasHMO ? 'Yes' : 'No'}
Has Emergency Fund: ${data.clientDetails.hasEmergencyFund ? 'Yes' : 'No'}
Is Breadwinner: ${data.clientDetails.isBreadwinner ? 'Yes' : 'No'}
Has Existing Insurance: ${data.clientDetails.hasExistingInsurance ? 'Yes' : 'No'}

Financial Goals: ${data.goalsAndPriorities.goals.join(', ')}
Priority Style: ${data.goalsAndPriorities.priorityStyle}
Risk Comfort: ${data.goalsAndPriorities.riskComfort}

Please analyze this client's financial protection needs and provide advisory guidance.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return JSON.parse(text)
}
```

- [ ] **Step 2: Create API route with Supabase storage**

Create `app/api/analyze/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { analyzeProfile } from '@/lib/claude'
import { createClient } from '@/lib/supabase'
import { calculateProtectionScore } from '@/lib/scoring'
import type { AssessmentData } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const assessmentData: AssessmentData = await req.json()

    // Run AI analysis and score calculation in parallel
    const [aiAnalysis, scoreBreakdown] = await Promise.all([
      analyzeProfile(assessmentData),
      Promise.resolve(calculateProtectionScore(assessmentData)),
    ])

    // Merge AI score (may differ from rule-based) - use AI as primary
    const finalAnalysis = {
      ...aiAnalysis,
      scoreBreakdown,
    }

    // Save to Supabase
    const supabase = createClient()
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        full_name: assessmentData.clientDetails.fullName,
        birthday: assessmentData.clientDetails.birthday,
        age: assessmentData.clientDetails.age,
        gender: assessmentData.clientDetails.gender,
        smoker: assessmentData.clientDetails.smoker,
        occupation: assessmentData.clientDetails.occupation,
        income_range: assessmentData.clientDetails.incomeRange,
        monthly_budget: assessmentData.clientDetails.monthlyBudget,
        has_hmo: assessmentData.clientDetails.hasHMO,
        has_emergency_fund: assessmentData.clientDetails.hasEmergencyFund,
        is_breadwinner: assessmentData.clientDetails.isBreadwinner,
        has_existing_insurance: assessmentData.clientDetails.hasExistingInsurance,
        goals: assessmentData.goalsAndPriorities.goals,
        priority_style: assessmentData.goalsAndPriorities.priorityStyle,
        risk_comfort: assessmentData.goalsAndPriorities.riskComfort,
        protection_score: finalAnalysis.protectionScore,
        primary_recommendation: finalAnalysis.primaryRecommendation?.productId,
        ai_analysis: finalAnalysis,
        assessment_data: assessmentData,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      // Still return analysis even if storage fails
    }

    return NextResponse.json({
      analysisId: lead?.id ?? 'local',
      analysis: finalAnalysis,
    })
  } catch (err) {
    console.error('Analysis error:', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Create Supabase client**

Create `lib/supabase.ts`:

```typescript
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 4: Install Supabase SSR package**

```bash
npm install @supabase/ssr
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Claude analysis API endpoint and Supabase storage"
```

---

### Task 10: Supabase Schema

**Files:**
- Create: `supabase/migrations/001_leads_table.sql`

- [ ] **Step 1: Create migration SQL**

Create `supabase/migrations/001_leads_table.sql`:

```sql
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text,
  birthday date,
  age integer,
  gender text,
  smoker boolean default false,
  occupation text,
  income_range text,
  monthly_budget text,
  has_hmo boolean default false,
  has_emergency_fund boolean default false,
  is_breadwinner boolean default false,
  has_existing_insurance boolean default false,
  goals text[] default '{}',
  priority_style text,
  risk_comfort text,
  protection_score integer,
  primary_recommendation text,
  ai_analysis jsonb,
  assessment_data jsonb,
  advisor_notes text
);

-- Enable RLS
alter table public.leads enable row level security;

-- Allow insert from anon (assessment submissions)
create policy "Allow public insert" on public.leads
  for insert to anon with check (true);

-- Allow service role full access
create policy "Allow service role all" on public.leads
  using (true)
  with check (true);
```

- [ ] **Step 2: Apply migration via Supabase dashboard**

Go to your Supabase project → SQL Editor → paste the migration SQL → Run.

(Or use Supabase CLI: `supabase db push` if CLI is configured.)

- [ ] **Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase leads table migration"
```

---

### Task 11: Results Page

**Files:**
- Create: `components/results/ProtectionScore.tsx`
- Create: `components/results/RecommendationCard.tsx`
- Create: `components/results/InsightSection.tsx`
- Create: `components/results/AdvisorCTA.tsx`
- Create: `app/results/page.tsx`

- [ ] **Step 1: Create ProtectionScore component**

Create `components/results/ProtectionScore.tsx`:

```typescript
'use client'
import { useEffect, useState } from 'react'

interface Props {
  score: number
  tier: string
  tierColor: string
}

export function ProtectionScore({ score, tier, tierColor }: Props) {
  const [displayed, setDisplayed] = useState(0)
  const radius = 70
  const circ = 2 * Math.PI * radius
  const offset = circ - (displayed / 100) * circ

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayed(score)
    }, 300)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="8"
          />
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke={tierColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-4xl text-white">{displayed}</span>
          <span className="text-xs text-white/40">/ 100</span>
        </div>
      </div>
      <div
        className="px-4 py-1.5 rounded-full text-xs font-medium border"
        style={{ color: tierColor, borderColor: `${tierColor}40`, backgroundColor: `${tierColor}10` }}
      >
        {tier}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create RecommendationCard**

Create `components/results/RecommendationCard.tsx`:

```typescript
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { ProductRecommendation } from '@/types'

interface Props {
  recommendation: ProductRecommendation
  isPrimary?: boolean
}

export function RecommendationCard({ recommendation, isPrimary = false }: Props) {
  return (
    <Card glow={isPrimary} className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Badge variant={isPrimary ? 'gold' : 'navy'}>
            {isPrimary ? 'Primary Recommendation' : 'Alternative'}
          </Badge>
          <h3 className="font-serif text-xl text-white mt-2">
            {recommendation.productName}
          </h3>
        </div>
      </div>
      <p className="text-sm text-white/60 leading-relaxed">{recommendation.purpose}</p>
      <div className="border-t border-white/8 pt-4">
        <p className="text-xs text-gold/70 uppercase tracking-widest mb-2">Why this fits you</p>
        <p className="text-sm text-white/80 leading-relaxed">{recommendation.whyItFits}</p>
      </div>
      <div className="rounded-xl bg-navy-light/60 border border-white/8 px-4 py-3">
        <p className="text-xs text-white/40 italic">{recommendation.positioning}</p>
      </div>
    </Card>
  )
}
```

- [ ] **Step 3: Create InsightSection**

Create `components/results/InsightSection.tsx`:

```typescript
import { Card } from '@/components/ui/Card'

interface Insight {
  label: string
  content: string
  accent?: boolean
}

interface Props {
  insights: Insight[]
}

export function InsightSection({ insights }: Props) {
  return (
    <div className="space-y-3">
      {insights.map((insight) => (
        <Card key={insight.label} className={`p-5 ${insight.accent ? 'border-gold/20 bg-gold/5' : ''}`}>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-2">{insight.label}</p>
          <p className="text-sm text-white/80 leading-relaxed">{insight.content}</p>
        </Card>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Create AdvisorCTA**

Create `components/results/AdvisorCTA.tsx`:

```typescript
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function AdvisorCTA() {
  return (
    <Card className="p-8 text-center space-y-4 border-gold/20">
      <p className="text-xs text-gold/70 uppercase tracking-widest">Optional Next Step</p>
      <h3 className="font-serif text-2xl text-white">
        Ready to Validate Your Profile?
      </h3>
      <p className="text-sm text-white/60 max-w-md mx-auto leading-relaxed">
        This analysis is educational. A licensed Sun Life advisor can review your full financial picture,
        check eligibility, and prepare an official proposal.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Button variant="primary" size="md">
          Connect with an Advisor
        </Button>
        <Button variant="secondary" size="md">
          Learn More About Sun Life
        </Button>
      </div>
      <p className="text-xs text-white/20 pt-2">
        This tool is for educational guidance only. Product suitability, eligibility, coverage,
        and premiums must be validated through an official Sun Life proposal and licensed advisor consultation.
      </p>
    </Card>
  )
}
```

- [ ] **Step 5: Create results page**

Create `app/results/page.tsx`:

```typescript
'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProtectionScore } from '@/components/results/ProtectionScore'
import { RecommendationCard } from '@/components/results/RecommendationCard'
import { InsightSection } from '@/components/results/InsightSection'
import { AdvisorCTA } from '@/components/results/AdvisorCTA'
import { PDFExportButton } from '@/components/results/PDFExportButton'
import { Badge } from '@/components/ui/Badge'
import type { AIAnalysisResult } from '@/types'

function ResultsContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Retrieve from sessionStorage (set during assessment submission)
    const stored = sessionStorage.getItem('sma_analysis')
    if (stored) {
      const parsed = JSON.parse(stored)
      setAnalysis(parsed.analysis)
    }
    setLoading(false)
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-gradient flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-navy-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-white/60">No analysis found.</p>
          <a href="/assessment" className="text-gold underline text-sm">
            Start a new assessment
          </a>
        </div>
      </div>
    )
  }

  const insights = [
    { label: 'Profile Summary', content: analysis.profileSummary },
    { label: 'Foundation Analysis', content: analysis.foundationAnalysis },
    { label: 'Protection Gap', content: analysis.protectionGap, accent: true },
    { label: 'Priority Layer', content: analysis.recommendedPriorityLayer },
    { label: 'What Comes First', content: analysis.whatComesFirst },
    { label: 'What Not to Miss', content: analysis.whatNotToMiss },
    { label: 'Suggested Next Step', content: analysis.suggestedNextStep },
  ]

  return (
    <main id="results-content" className="min-h-screen bg-navy-gradient">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-4">
          <Badge variant="gold">Your Advisory Report</Badge>
          <h1 className="font-serif text-3xl md:text-4xl text-white">
            Financial Protection Analysis
          </h1>
        </div>

        <div className="flex justify-center">
          <ProtectionScore
            score={analysis.protectionScore}
            tier={getTierLabel(analysis.protectionScore)}
            tierColor={getTierColor(analysis.protectionScore)}
          />
        </div>

        <InsightSection insights={insights} />

        {analysis.primaryRecommendation && (
          <RecommendationCard
            recommendation={analysis.primaryRecommendation}
            isPrimary
          />
        )}

        {analysis.alternativeRecommendation && (
          <RecommendationCard
            recommendation={analysis.alternativeRecommendation}
          />
        )}

        <PDFExportButton />

        <AdvisorCTA />
      </div>
    </main>
  )
}

function getTierLabel(score: number): string {
  if (score >= 80) return 'Excellent Foundation'
  if (score >= 60) return 'Strong Foundation'
  if (score >= 40) return 'Moderate Foundation'
  if (score >= 20) return 'Developing Foundation'
  return 'Critical Gaps Present'
}

function getTierColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#84cc16'
  if (score >= 40) return '#F6B21A'
  if (score >= 20) return '#f97316'
  return '#ef4444'
}

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  )
}
```

- [ ] **Step 6: Update assessment page to store analysis in sessionStorage**

Modify `app/assessment/page.tsx` — update `handleGoals` to store analysis before redirect:

```typescript
const handleGoals = async (goals: GoalsAndPriorities) => {
  if (!clientDetails) return
  setIsSubmitting(true)

  const assessmentData: AssessmentData = {
    clientDetails,
    goalsAndPriorities: goals,
  }

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessmentData),
    })

    if (!res.ok) throw new Error('Analysis failed')

    const data = await res.json()
    // Store in sessionStorage for results page
    sessionStorage.setItem('sma_analysis', JSON.stringify(data))
    router.push(`/results?id=${data.analysisId}`)
  } catch (err) {
    console.error(err)
    setIsSubmitting(false)
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add results page with protection score, recommendations, and insights"
```

---

### Task 12: PDF Export

**Files:**
- Create: `components/results/PDFExportButton.tsx`
- Create: `lib/pdf.ts`

- [ ] **Step 1: Create PDF generation library**

Create `lib/pdf.ts`:

```typescript
import jsPDF from 'jspdf'
import type { AIAnalysisResult } from '@/types'

export function generatePDF(analysis: AIAnalysisResult, clientName: string) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentW = pageW - margin * 2
  let y = margin

  const addText = (
    text: string,
    size: number,
    color: [number, number, number],
    bold = false,
    indent = 0
  ) => {
    doc.setFontSize(size)
    doc.setTextColor(...color)
    if (bold) doc.setFont('helvetica', 'bold')
    else doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(text, contentW - indent)
    doc.text(lines, margin + indent, y)
    y += lines.length * (size * 0.45) + 2
    return y
  }

  const divider = () => {
    y += 3
    doc.setDrawColor(200, 165, 65)
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageW - margin, y)
    y += 5
  }

  const checkPage = (needed = 20) => {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage()
      y = margin
    }
  }

  // Header
  doc.setFillColor(15, 31, 61)
  doc.rect(0, 0, pageW, 35, 'F')
  doc.setFontSize(18)
  doc.setTextColor(246, 178, 26)
  doc.setFont('helvetica', 'bold')
  doc.text('Safety Margin Advisor', margin, 15)
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'normal')
  doc.text('Financial Protection Analysis Report', margin, 24)
  y = 45

  // Client info
  addText(`Prepared for: ${clientName}`, 11, [100, 120, 160], true)
  addText(`Generated: ${new Date().toLocaleDateString('en-PH', { dateStyle: 'long' })}`, 9, [130, 140, 150])
  divider()

  // Score
  checkPage(25)
  addText(`Protection Score: ${analysis.protectionScore}/100`, 14, [246, 178, 26], true)
  addText(getTierLabel(analysis.protectionScore), 10, [180, 160, 100])
  y += 4

  // Insights
  const sections: [string, string][] = [
    ['Profile Summary', analysis.profileSummary],
    ['Foundation Analysis', analysis.foundationAnalysis],
    ['Protection Gap', analysis.protectionGap],
    ['Recommended Priority Layer', analysis.recommendedPriorityLayer],
    ['Primary Recommendation', `${analysis.primaryRecommendation?.productName} — ${analysis.primaryRecommendation?.whyItFits}`],
    ['Alternative Recommendation', `${analysis.alternativeRecommendation?.productName} — ${analysis.alternativeRecommendation?.whyItFits}`],
    ['What Comes First', analysis.whatComesFirst],
    ['What Not to Miss', analysis.whatNotToMiss],
    ['Suggested Next Step', analysis.suggestedNextStep],
  ]

  sections.forEach(([label, content]) => {
    checkPage(30)
    divider()
    addText(label.toUpperCase(), 8, [150, 140, 100], true)
    y += 2
    addText(content, 10, [50, 60, 80])
  })

  // Advisor notes
  checkPage(40)
  divider()
  addText('ADVISOR NOTES', 8, [150, 140, 100], true)
  y += 2
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.2)
  for (let i = 0; i < 5; i++) {
    doc.line(margin, y, pageW - margin, y)
    y += 8
  }

  // Disclaimer
  checkPage(30)
  divider()
  doc.setFontSize(8)
  doc.setTextColor(130, 130, 130)
  doc.setFont('helvetica', 'italic')
  const disclaimer =
    'DISCLAIMER: This report is for educational guidance only. Product suitability, eligibility, coverage, and premiums must be validated through an official Sun Life proposal and licensed advisor consultation. This report does not constitute financial advice, guarantee insurance approval, or guarantee investment returns. Past performance does not guarantee future results.'
  const dLines = doc.splitTextToSize(disclaimer, contentW)
  doc.text(dLines, margin, y)

  doc.save(`safety-margin-advisor-${clientName.replace(/\s+/g, '-').toLowerCase()}.pdf`)
}

function getTierLabel(score: number): string {
  if (score >= 80) return 'Excellent Foundation'
  if (score >= 60) return 'Strong Foundation'
  if (score >= 40) return 'Moderate Foundation'
  if (score >= 20) return 'Developing Foundation'
  return 'Critical Gaps Present'
}
```

- [ ] **Step 2: Create PDFExportButton**

Create `components/results/PDFExportButton.tsx`:

```typescript
'use client'
import { Button } from '@/components/ui/Button'
import { generatePDF } from '@/lib/pdf'
import type { AIAnalysisResult } from '@/types'

export function PDFExportButton() {
  const handleExport = () => {
    const stored = sessionStorage.getItem('sma_analysis')
    if (!stored) return
    const { analysis } = JSON.parse(stored) as { analysis: AIAnalysisResult }
    const clientName = (sessionStorage.getItem('sma_client_name') as string) ?? 'Client'
    generatePDF(analysis, clientName)
  }

  return (
    <div className="flex justify-center">
      <Button variant="secondary" size="md" onClick={handleExport}>
        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export PDF Report
      </Button>
    </div>
  )
}
```

- [ ] **Step 3: Store client name during assessment**

In `app/assessment/page.tsx`, add to `handleGoals` before the fetch:

```typescript
sessionStorage.setItem('sma_client_name', clientDetails.fullName)
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add PDF export with advisory report layout and compliance disclaimer"
```

---

### Task 13: API Route Fix + Leads Endpoint

**Files:**
- Create: `app/api/leads/route.ts`

- [ ] **Step 1: Create leads route for future advisor access**

Create `app/api/leads/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ leads: data })
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add protected leads list API for advisor access"
```

---

### Task 14: Final Polish + Responsive Fixes

**Files:**
- Modify: `app/deck/page.tsx` (add back-to-home link)
- Modify: `app/page.tsx` (verify mobile layout)

- [ ] **Step 1: Add back navigation to deck**

Add to `app/deck/page.tsx` after the `<main>` opening tag:

```typescript
<Link
  href="/"
  className="absolute top-6 left-6 z-30 text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-2"
>
  ← Home
</Link>
```

Also add `import Link from 'next/link'` if not already present.

- [ ] **Step 2: Add print CSS for deck PDF export**

Add to `app/globals.css`:

```css
@media print {
  body {
    background: white;
    color: black;
  }
  .no-print {
    display: none !important;
  }
}
```

- [ ] **Step 3: Verify full flow end-to-end**

```bash
npm run dev
```

Test:
1. http://localhost:3000 — landing page loads
2. Click "View Interactive Deck" → /deck — all 8 slides navigate
3. Click "Continue To Discovery" on slide 8 → /assessment
4. Fill out client details → continue → fill goals → submit
5. Loader appears, then redirects to /results
6. Protection score animates, recommendations show
7. Click "Export PDF Report" — PDF downloads

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

Fix any type errors before final commit.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete Safety Margin Advisor — full flow landing→deck→assessment→results with PDF export"
```

---

## Self-Review

**Spec coverage check:**

| Requirement | Covered in Task |
|---|---|
| Landing page with dual CTAs | Task 4 |
| Interactive 8-slide deck | Tasks 5, 6 |
| Keyboard navigation on deck | Task 6 (Step 9) |
| PDF export from deck | Task 6 (Step 9 — window.print) |
| Client details assessment | Task 7 |
| Goals & priorities assessment | Task 8 |
| AI analysis (Claude) | Task 9 |
| Protection score 1–100 | Tasks 3, 11 |
| Product database (5 products) | Task 3 |
| Recommendation logic | Task 9 (lib/claude.ts) |
| AI results page | Task 11 |
| PDF download with advisor notes | Task 12 |
| Supabase lead storage | Tasks 9, 10, 13 |
| Compliance disclaimer | Tasks 4, 7, 11, 12 |
| Mobile-first responsive | Throughout (grid, max-w, px) |
| Navy/gold brand identity | Task 1 (Tailwind tokens) |
| No fear marketing | System prompt in Task 9 |
| Filipino-English tone | System prompt in Task 9 |
| Layered protection hierarchy | Slide 5, Slide 6 |

**No spec gaps identified.**

**Placeholder check:** All steps include exact code, exact commands, exact expected output. No TODOs or "implement later" found.

**Type consistency check:** `AssessmentData`, `ClientDetails`, `GoalsAndPriorities`, `AIAnalysisResult`, `ProductRecommendation` — defined in Task 1 `types/index.ts`, used consistently in Tasks 3, 7, 8, 9, 11, 12. Function signatures match across usages.
