-- Email open / delivery / bounce tracking
-- Events are posted by the Resend webhook at /api/webhooks/resend

create table if not exists public.email_events (
  id             uuid primary key default gen_random_uuid(),
  lead_id        uuid references public.funnel_leads(id) on delete cascade,
  resend_email_id text,                        -- Resend's internal message ID
  event_type     text not null,                -- 'opened' | 'delivered' | 'bounced' | 'clicked'
  template_id    text,                         -- e.g. 'report', 'followup_1'
  occurred_at    timestamptz not null,
  created_at     timestamptz not null default now()
);

create index if not exists email_events_lead_id_idx      on public.email_events(lead_id);
create index if not exists email_events_event_type_idx   on public.email_events(event_type);
create index if not exists email_events_occurred_at_idx  on public.email_events(occurred_at desc);
