-- Extend automation flow targeting to event_tag and lead source, matching
-- the facets nurture_templates already filters on. Same pattern as segments
-- and professions: empty array = no filter on that facet.

alter table public.automation_flows
  add column if not exists event_tags text[] not null default '{}'::text[];

alter table public.automation_flows
  add column if not exists sources text[] not null default '{}'::text[];
