-- Automation flow definitions for the visual email automation builder.
-- Each row stores the full React Flow graph (nodes + edges) as JSONB.
-- Only one flow can be active at a time (enforced by partial unique index).

create table if not exists public.automation_flows (
  id         uuid        default gen_random_uuid() primary key,
  name       text        not null default 'My Flow',
  is_active  boolean     not null default false,
  flow_json  jsonb       not null default '{"nodes":[],"edges":[]}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists automation_flows_one_active
  on public.automation_flows (is_active)
  where (is_active = true);

create trigger automation_flows_updated_at
  before update on public.automation_flows
  for each row execute function public.handle_updated_at();

alter table public.automation_flows enable row level security;

create policy "Service role full access" on public.automation_flows
  to service_role using (true) with check (true);
