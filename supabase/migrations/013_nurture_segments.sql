-- Add segment targeting to nurture templates
-- segments = [] (empty array) means the template sends to ALL segments
-- segments = ["hnw","business"] means only those leads receive it

ALTER TABLE public.nurture_templates
  ADD COLUMN IF NOT EXISTS segments jsonb NOT NULL DEFAULT '[]';
