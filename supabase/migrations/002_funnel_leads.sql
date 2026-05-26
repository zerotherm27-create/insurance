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
