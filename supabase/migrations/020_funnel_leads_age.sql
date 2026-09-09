-- Age isn't asked by the quiz (which only buckets an ageRange answer inside
-- the jsonb `answers` column) and isn't captured by the contact/card intake
-- forms either. The admin "Add Lead" form wants a plain numeric age for
-- leads Jojo adds himself in person. Free-standing column, nullable.
alter table public.funnel_leads
  add column if not exists age smallint;
