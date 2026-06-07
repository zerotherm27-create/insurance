-- Nurture email templates: ongoing story/education emails after the main flow completes
create table public.nurture_templates (
  id          uuid default gen_random_uuid() primary key,
  position    int not null,
  label       text not null,
  subject     text not null,
  heading     text not null,
  paragraphs  jsonb not null default '[]',
  cta_text    text not null,
  wait_days   int not null default 3,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (position)
);

create or replace function handle_nurture_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger nurture_templates_updated_at
  before update on public.nurture_templates
  for each row execute procedure handle_nurture_updated_at();

-- Track which nurture email a lead is on and when they last received one
alter table public.funnel_leads
  add column if not exists nurture_step int not null default 0,
  add column if not exists last_nurtured_at timestamptz;
