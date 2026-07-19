-- 015_utm_tracking.sql
-- Adds first-touch marketing-attribution columns to funnel_leads.
-- Nullable: organic/direct leads have no UTM params.

alter table public.funnel_leads
  add column utm_source text,
  add column utm_medium text,
  add column utm_campaign text,
  add column utm_content text,
  add column utm_term text;
