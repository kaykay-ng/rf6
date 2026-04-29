-- Clash of Camps — Supabase schema
-- Run this in the Supabase SQL editor for your project

create table camps (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null,
  address    text not null,
  bio        text not null default '',
  vibe_tags  text[] not null default '{}',
  pin_hash   text not null,
  flag_image_url text,

  constraint camps_name_unique    unique (name),
  constraint camps_address_unique unique (address),
  constraint camps_name_length    check (char_length(name) >= 3),
  constraint camps_bio_length     check (char_length(bio) <= 200),
  constraint camps_vibe_count     check (array_length(vibe_tags, 1) between 3 and 10),
  constraint camps_address_format check (address ~ '^C([1-9]|[1-9][0-9]|100)-([1-9]|10)$')
);

-- Row Level Security
alter table camps enable row level security;

create policy "Anyone can read camps"
  on camps for select using (true);

create policy "Anyone can register a camp"
  on camps for insert with check (true);

create policy "Anyone can delete a camp"
  on camps for delete using (true);
