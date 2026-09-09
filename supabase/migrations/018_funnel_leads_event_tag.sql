-- Let the admin "Add Lead" form tag which specific in-person event a lead
-- came from — e.g. "Insurance Seminar Jan 2027" — distinct from the general
-- source: 'manual' tag added in 017_funnel_leads_manual_source.sql. Free
-- text, nullable: quiz/contact_form/business_card leads will never have one.
alter table public.funnel_leads
  add column if not exists event_tag text;

create index if not exists funnel_leads_event_tag_idx on public.funnel_leads (event_tag);
