-- Safety Margin Advisor: Leads table
-- Stores assessment submissions and AI analysis results

create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text,
  birthday date,
  age integer,
  gender text check (gender in ('male', 'female')),
  smoker boolean default false,
  occupation text,
  income_range text,
  monthly_budget text,
  has_hmo boolean default false,
  has_emergency_fund boolean default false,
  is_breadwinner boolean default false,
  has_existing_insurance boolean default false,
  goals text[] default '{}',
  priority_style text check (priority_style in ('start_small', 'balanced', 'maximize_protection')),
  risk_comfort text check (risk_comfort in ('conservative', 'moderate', 'growth_oriented')),
  protection_score integer check (protection_score >= 0 and protection_score <= 100),
  primary_recommendation text,
  ai_analysis jsonb,
  assessment_data jsonb,
  advisor_notes text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for common queries
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_primary_recommendation_idx on public.leads (primary_recommendation);

-- Enable RLS
alter table public.leads enable row level security;

-- Allow anonymous insert (assessment form submissions)
create policy "Allow anonymous insert" on public.leads
  for insert to anon with check (true);

-- Allow service role full access for advisor queries
create policy "Service role full access" on public.leads
  to service_role
  using (true)
  with check (true);

-- Function to auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on public.leads
  for each row execute procedure public.handle_updated_at();
