-- 028_funnel_leads_source_allow_all.sql
-- Adding a lead from the dashboard (source 'manual') failed with
-- "violates check constraint funnel_leads_source_check". The constraint on the
-- shared funnel_leads table had been replaced (by the jojocruzado site's
-- migrations) with a list that adds 'protection_gap_calculator' and 'chatbot'
-- but no longer includes 'manual'. Allow every source in use.
-- NOT VALID: enforced for new/updated rows, existing rows are not re-checked.
-- Run in Supabase SQL editor: project xcifmbfxatkunsjoozyv
alter table public.funnel_leads
  drop constraint if exists funnel_leads_source_check;

alter table public.funnel_leads
  add constraint funnel_leads_source_check
  check (source = any (array[
    'quiz'::text,
    'contact_form'::text,
    'business_card'::text,
    'manual'::text,
    'protection_gap_calculator'::text,
    'chatbot'::text
  ])) not valid;
