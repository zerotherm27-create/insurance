-- The jojocruzado.safetymargin.app site shares this same funnel_leads table
-- and, at some point after 017_funnel_leads_manual_source.sql ran, its own
-- migration dropped and recreated funnel_leads_source_check with
-- 'protection_gap_calculator' in the allow-list instead of 'manual' —
-- silently reverting 017's fix. Any edit to a lead with source = 'manual'
-- (added via this repo's admin "Add Lead" form) then fails, because Postgres
-- re-validates every check constraint on any row update, not just the
-- changed column.
--
-- This restores 'manual' alongside 'protection_gap_calculator' so both
-- apps' valid source values coexist. NOT VALID matches the constraint's
-- current live state (added without validating pre-existing rows).
alter table public.funnel_leads
  drop constraint if exists funnel_leads_source_check;

alter table public.funnel_leads
  add constraint funnel_leads_source_check
  check (source = any (array['quiz'::text, 'contact_form'::text, 'business_card'::text, 'manual'::text, 'protection_gap_calculator'::text]))
  not valid;
