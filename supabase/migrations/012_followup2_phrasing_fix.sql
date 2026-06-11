-- Fix followup_2 phrasing: "not millions" reads wrong when the starter
-- amount itself is in the millions (e.g. family income replacement ₱5.4M).

update public.email_templates set
  paragraphs = ARRAY[
    'It''s not about not saving enough. It''s about saving before protecting.',
    'Most Filipinos I talk to have their priorities flipped. They''re building savings and investments, but they haven''t secured the foundation yet.',
    'Here''s the thing: if something happens to you before that foundation is set, everything you''ve built can disappear overnight.',
    'Your score was {score}/100. The gap we flagged, {topGapName}, is exactly this kind of foundation risk. And you can start closing it at {topGapStarter}, much more reachable than you might think.',
    'Let''s fix that before we talk about anything else.'
  ],
  updated_at = now()
where id = 'followup_2';
