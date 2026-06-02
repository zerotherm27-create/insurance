-- Funnel redesign: per-segment tailored questions.
-- Answers are now stored as flexible JSON (different fields per segment),
-- plus a `segment` column for filtering/analytics.

alter table public.funnel_leads
  add column if not exists segment text,
  add column if not exists answers jsonb;

-- The old fixed per-question columns no longer apply to every segment.
-- Make them nullable so inserts that only use segment + answers succeed.
alter table public.funnel_leads alter column age_range drop not null;
alter table public.funnel_leads alter column family_status drop not null;
alter table public.funnel_leads alter column income_range drop not null;
alter table public.funnel_leads alter column life_insurance drop not null;
alter table public.funnel_leads alter column health_coverage drop not null;
alter table public.funnel_leads alter column biggest_worry drop not null;
alter table public.funnel_leads alter column employment drop not null;

create index if not exists funnel_leads_segment_idx on public.funnel_leads (segment);
