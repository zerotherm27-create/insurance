-- 027_segment_copy_em_dashes.sql
-- Quiz leads now receive their segment's follow-up (followup_N_<segment>), so
-- fix the two segment templates that still had em dashes (project copy rule).
-- Run in Supabase SQL editor: project xcifmbfxatkunsjoozyv

update public.email_templates
set paragraphs = array(select replace(p, ' — ', ', ') from unnest(paragraphs) with ordinality as t(p, i) order by i)
where id = 'followup_4_ofw';

update public.email_templates
set paragraphs = array(select replace(p, ' — those keep going', '. Those keep going') from unnest(paragraphs) with ordinality as t(p, i) order by i)
where id = 'followup_2_entrepreneur';
