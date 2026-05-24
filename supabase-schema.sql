-- Run this in your Supabase SQL Editor

-- Create memes table
create table if not exists memes (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  prompt text not null,
  x_handle text,
  image_url text,
  meme_output_url text not null,
  meme_caption text not null default '',
  top_text text,
  bottom_text text,
  created_at timestamptz default now() not null
);

-- Index for ordering by time
create index if not exists idx_memes_created_at on memes(created_at desc);

-- Index for slug lookup
create index if not exists idx_memes_slug on memes(slug);

-- Enable Row Level Security
alter table memes enable row level security;

-- Allow public read
create policy "Public read"
  on memes for select
  using (true);

-- Allow inserts from service role only (handled by API)
create policy "Service insert"
  on memes for insert
  with check (true);

-- ── Storage ──────────────────────────────────────────────
-- In Supabase dashboard → Storage → New bucket:
--   Name: memes
--   Public: true
--   Allowed MIME types: image/jpeg, image/png, image/webp
--   Max file size: 10MB

-- Or via SQL:
insert into storage.buckets (id, name, public)
values ('memes', 'memes', true)
on conflict do nothing;

-- Allow public read of meme files
create policy "Public meme read"
  on storage.objects for select
  using (bucket_id = 'memes');

-- Allow service role to upload
create policy "Service upload"
  on storage.objects for insert
  with check (bucket_id = 'memes');
