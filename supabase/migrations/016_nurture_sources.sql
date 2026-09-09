-- Add lead-origin targeting to nurture templates, mirroring 013_nurture_segments.sql.
-- sources = [] (empty array) means the template sends to leads from ANY source
-- sources = ["contact_form","business_card"] means only leads from those two
-- intake paths (the jojocruzado.safetymargin.app site) receive it — letting a
-- nurture email be written just for that group instead of the quiz funnel.

ALTER TABLE public.nurture_templates
  ADD COLUMN IF NOT EXISTS sources jsonb NOT NULL DEFAULT '[]';
