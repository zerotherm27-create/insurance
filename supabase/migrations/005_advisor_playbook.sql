-- Per-lead advisor playbook: AI-generated talking points, product
-- recommendations, and objection handlers for Jojo's private use.
-- Generated on-demand from the admin dashboard.

alter table public.funnel_leads
  add column if not exists advisor_playbook jsonb;
