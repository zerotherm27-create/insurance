-- Lets the admin schedule a one-off "Send Custom Email" blast for a future
-- date/time instead of sending immediately. Recipients are re-matched
-- against `criteria` at send time (not frozen at schedule time), same as an
-- immediate send — so a lead added or tagged between scheduling and send
-- time is still included.
create table if not exists public.scheduled_emails (
  id uuid primary key default gen_random_uuid(),
  criteria jsonb not null,
  content jsonb not null,
  scheduled_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'canceled')),
  result jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists scheduled_emails_due_idx
  on public.scheduled_emails (scheduled_at)
  where status = 'pending';
