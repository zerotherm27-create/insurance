-- Expand funnel_leads.status from 3 → 6 values:
-- new, contacted, engaged, decision_pending, closed_won, closed_lost
--
-- Migrates existing data: 'converted' → 'closed_won' (preserves history)

-- Drop old constraint
alter table public.funnel_leads
  drop constraint if exists funnel_leads_status_check;

-- Migrate existing rows: converted is now "closed (won)"
update public.funnel_leads
  set status = 'closed_won'
  where status = 'converted';

-- Add new constraint with expanded enum
alter table public.funnel_leads
  add constraint funnel_leads_status_check
  check (status in ('new', 'contacted', 'engaged', 'decision_pending', 'closed_won', 'closed_lost'));
