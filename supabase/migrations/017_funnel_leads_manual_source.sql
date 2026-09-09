-- Allow the admin dashboard's new "Add Lead" form to insert leads directly
-- (e.g. someone met in person, a phone inquiry, a referral) without going
-- through the quiz or either jojocruzado intake path. Mirrors the same
-- additive pattern as the jojocruzado repo's own
-- 0003_funnel_leads_business_card_source.sql — only ADDS 'manual' to the
-- allow-list; 'quiz', 'contact_form' and 'business_card' are untouched.
alter table public.funnel_leads
  drop constraint if exists funnel_leads_source_check;

alter table public.funnel_leads
  add constraint funnel_leads_source_check
  check (source = any (array['quiz'::text, 'contact_form'::text, 'business_card'::text, 'manual'::text]));
