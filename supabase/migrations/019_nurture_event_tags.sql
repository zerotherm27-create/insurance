-- Add event-tag targeting to nurture templates, mirroring
-- 013_nurture_segments.sql / 016_nurture_sources.sql exactly.
-- event_tags = [] (empty array) means the template ignores event tags
-- event_tags = ["Insurance Seminar Jan 2027"] means only leads tagged with
-- that specific event receive it — lets a one-off email composed for an
-- event's attendees be saved as a nurture template pre-targeted at the same
-- group for future matching leads.

alter table public.nurture_templates
  add column if not exists event_tags jsonb not null default '[]';
