-- Tracks which node each lead is currently sitting at in the active flow,
-- and when they entered that node (for Wait node countdown).

create table if not exists public.lead_flow_state (
  id              uuid        default gen_random_uuid() primary key,
  lead_id         uuid        not null references public.funnel_leads(id) on delete cascade,
  flow_id         uuid        not null references public.automation_flows(id) on delete cascade,
  current_node_id text        not null,
  entered_node_at timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (lead_id)
);

create index if not exists lead_flow_state_node_idx on public.lead_flow_state (current_node_id);
create index if not exists lead_flow_state_flow_idx on public.lead_flow_state (flow_id);

create trigger lead_flow_state_updated_at
  before update on public.lead_flow_state
  for each row execute function public.handle_updated_at();

alter table public.lead_flow_state enable row level security;

create policy "Service role full access" on public.lead_flow_state
  to service_role using (true) with check (true);
