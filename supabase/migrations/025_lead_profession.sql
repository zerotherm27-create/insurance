-- Free-text profession tag on leads (e.g. "Doctor", "Engineer") — same
-- open-ended pattern as event_tag — so leads met at a profession-specific
-- expo can be targeted directly, including by a dedicated automation flow.
alter table public.funnel_leads
  add column if not exists profession text;

create index if not exists funnel_leads_profession_idx on public.funnel_leads (profession);

-- Automation flows can now also target specific professions, alongside
-- segments (024_automation_flow_segments.sql). Empty = doesn't filter by
-- profession. A flow matches a lead only if BOTH its segments filter and
-- its professions filter pass (each is a no-op when empty), so a flow can
-- target a segment, a profession, or the combination of both.
alter table public.automation_flows
  add column if not exists professions text[] not null default '{}'::text[];
