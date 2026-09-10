-- Reusable image library ("art cards" — promo graphics, event flyers,
-- business card designs) uploaded via Vercel Blob and embedded inline in
-- outgoing emails. This table stores metadata only; the file itself lives
-- in Blob storage at blob_pathname.
create table if not exists public.art_cards (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  blob_pathname text not null,
  filename text not null,
  created_at timestamptz not null default now()
);

-- Which art card (if any) is embedded in each template's email.
alter table public.email_templates add column if not exists image_url text;
alter table public.nurture_templates add column if not exists image_url text;
