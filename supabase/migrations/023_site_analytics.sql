-- 023_site_analytics.sql
-- First-party site analytics: one row per visit session, one row per
-- pageview. Written only by /api/site/visit and /api/site/heartbeat via the
-- service-role client, so (like email_events and later migrations) no RLS
-- is needed -- the anon key never touches these tables.

create table if not exists public.site_sessions (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),  -- session start
  last_seen_at      timestamptz not null default now(),  -- bumped on each pageview/heartbeat
  duration_seconds  int not null default 0,               -- denormalized: last_seen_at - created_at
  landing_path      text not null,
  page_count        int not null default 1,
  device_type       text not null default 'unknown'
                       check (device_type in ('mobile', 'tablet', 'desktop', 'bot', 'unknown')),
  os                text,
  browser           text,
  country           text,
  region            text,
  city              text,
  referrer          text,
  utm_source        text,
  utm_medium        text,
  utm_campaign      text,
  utm_content       text,
  utm_term          text,
  lead_id           uuid references public.funnel_leads(id) on delete set null
);

create index if not exists site_sessions_created_at_idx  on public.site_sessions(created_at desc);
create index if not exists site_sessions_device_type_idx on public.site_sessions(device_type);
create index if not exists site_sessions_country_idx     on public.site_sessions(country);
create index if not exists site_sessions_lead_id_idx     on public.site_sessions(lead_id);
create index if not exists site_sessions_utm_source_idx  on public.site_sessions(utm_source) where utm_source is not null;

create table if not exists public.site_pageviews (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references public.site_sessions(id) on delete cascade,
  path         text not null,
  occurred_at  timestamptz not null default now()
);

create index if not exists site_pageviews_session_id_idx  on public.site_pageviews(session_id);
create index if not exists site_pageviews_path_idx        on public.site_pageviews(path);
create index if not exists site_pageviews_occurred_at_idx on public.site_pageviews(occurred_at desc);
