-- Allow multiple simultaneously active automation flows, each targeting a
-- specific set of lead segments (e.g. one drip for "ofw", another for
-- "family"). An empty segments array means catch-all: the flow applies to
-- any lead whose segment isn't claimed by a more specific active flow.
-- Replaces the old one-active-flow-total constraint.

alter table public.automation_flows
  add column if not exists segments text[] not null default '{}'::text[];

drop index if exists automation_flows_one_active;
