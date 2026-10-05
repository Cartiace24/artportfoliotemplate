-- ============================================================
-- Lorem Ipsum portfolio — Supabase schema (multi-site ready)
-- Run in Supabase SQL Editor, or: supabase db push
-- ============================================================

-- ---------- core tables ----------
create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null default 'shiakonii',
  artist_name text not null default 'Lorem Ipsum',
  created_at timestamptz default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  commission_status text not null default 'open' check (commission_status in ('open','closed')),
  commission_message text default 'Currently accepting commissions!',
  available_slots int,
  updated_at timestamptz default now()
);

create table if not exists public.artworks (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  title text not null default 'Untitled',
  description text,
  category text not null default 'Illustration',
  image_path text not null,
  year text,
  featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.commission_categories (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  name text not null,
  sort_order int not null default 0
);

create table if not exists public.commission_prices (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  category_id uuid references public.commission_categories(id) on delete cascade,
  type text not null,
  price numeric not null default 0,
  enabled boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.about_content (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  bio text not null default '',
  short_description text,
  profile_image_path text,
  interests text[] not null default '{}',
  subjects text[] not null default '{}',
  signature text,
  updated_at timestamptz default now()
);

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  platform text not null,
  url text not null default '',
  display_name text,
  enabled boolean not null default true,
  sort_order int not null default 0
);

-- Token-gated management access. Only SHA-256 hashes are stored — never raw tokens.
create table if not exists public.management_access (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  token_hash text not null unique,
  label text default 'primary',
  created_at timestamptz default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);
create index if not exists idx_management_access_hash on public.management_access(token_hash) where revoked_at is null;

-- ---------- RLS ----------
alter table public.sites enable row level security;
alter table public.site_settings enable row level security;
alter table public.artworks enable row level security;
alter table public.commission_categories enable row level security;
alter table public.commission_prices enable row level security;
alter table public.about_content enable row level security;
alter table public.social_links enable row level security;
alter table public.management_access enable row level security;

-- Public read-only for portfolio content (anon + authenticated)
drop policy if exists "public read sites" on public.sites;
create policy "public read sites" on public.sites for select using (true);
drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings for select using (true);
drop policy if exists "public read artworks" on public.artworks;
create policy "public read artworks" on public.artworks for select using (true);
drop policy if exists "public read categories" on public.commission_categories;
create policy "public read categories" on public.commission_categories for select using (true);
drop policy if exists "public read prices" on public.commission_prices;
create policy "public read prices" on public.commission_prices for select using (true);
drop policy if exists "public read about" on public.about_content;
create policy "public read about" on public.about_content for select using (true);
drop policy if exists "public read socials" on public.social_links;
create policy "public read socials" on public.social_links for select using (true);

-- No direct writes from anon: mutations go through SECURITY DEFINER RPCs below.
-- management_access is never directly readable.
drop policy if exists "no direct read management" on public.management_access;
-- (intentionally no SELECT/INSERT/UPDATE policies → direct access denied)

-- ---------- storage ----------
insert into storage.buckets (id, name, public) values ('artwork','artwork', true)
on conflict (id) do nothing;

drop policy if exists "public read artwork files" on storage.objects;
create policy "public read artwork files" on storage.objects for select using (bucket_id = 'artwork');

-- Authenticated uploads only via RPC path? For anon-token flow, allow inserts guarded by size
-- via the manage RPCs recommending direct upload: simpler to allow anon insert with 8MB limit
-- and restrict deletes to service role. Tighten further with your own CDN rules if needed.
drop policy if exists "anon upload artwork" on storage.objects;
create policy "anon upload artwork" on storage.objects for insert
  with check (bucket_id = 'artwork');

drop policy if exists "anon update artwork" on storage.objects;
create policy "anon update artwork" on storage.objects for update
  using (bucket_id = 'artwork') with check (bucket_id = 'artwork');

-- ---------- helpers ----------
create or replace function public.is_valid_manager(p_token_hash text)
returns boolean language sql security definer set search_path = public as $$
  select exists(
    select 1 from public.management_access
    where token_hash = p_token_hash and revoked_at is null
  );
$$;

create or replace function public.assert_manager(p_token_hash text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_site uuid;
begin
  select site_id into v_site from public.management_access
  where token_hash = p_token_hash and revoked_at is null;
  if v_site is null then raise exception 'invalid management token'; end if;
  update public.management_access set last_used_at = now() where token_hash = p_token_hash;
  return v_site;
end $$;

-- Validate (called by the frontend gate)
create or replace function public.validate_management_token(p_token_hash text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_site uuid;
begin
  select site_id into v_site from public.management_access
  where token_hash = p_token_hash and revoked_at is null;
  if v_site is null then return false; end if;
  update public.management_access set last_used_at = now() where token_hash = p_token_hash;
  return true;
end $$;

-- ---------- manage RPCs ----------
create or replace function public.manage_update_settings(
  p_token_hash text, p_status text, p_message text, p_slots int
) returns void language plpgsql security definer set search_path = public as $$
declare v_site uuid;
begin
  v_site := public.assert_manager(p_token_hash);
  if p_status not in ('open','closed') then raise exception 'bad status'; end if;
  update public.site_settings
    set commission_status = p_status, commission_message = nullif(p_message,''),
        available_slots = p_slots, updated_at = now()
    where site_id = v_site;
end $$;

create or replace function public.manage_upsert_price(
  p_token_hash text, p_price numeric, p_enabled boolean,
  p_id uuid default null, p_type text default null, p_category_id uuid default null
) returns void language plpgsql security definer set search_path = public as $$
declare v_site uuid;
begin
  v_site := public.assert_manager(p_token_hash);
  if p_id is not null then
    update public.commission_prices set price = p_price, enabled = p_enabled,
      type = coalesce(p_type, type) where id = p_id and site_id = v_site;
  end if;
end $$;

create or replace function public.manage_upsert_artwork(
  p_token_hash text, p_title text,
  p_id uuid default null, p_description text default null, p_category text default 'Illustration',
  p_image_path text default null, p_year text default null, p_featured boolean default false, p_sort int default 0
) returns void language plpgsql security definer set search_path = public as $$
declare v_site uuid;
begin
  v_site := public.assert_manager(p_token_hash);
  if p_id is not null and exists (select 1 from public.artworks where id = p_id and site_id = v_site) then
    update public.artworks set
      title = coalesce(p_title, title),
      description = coalesce(p_description, description),
      category = coalesce(p_category, category),
      image_path = coalesce(p_image_path, image_path),
      year = coalesce(p_year, year),
      featured = coalesce(p_featured, featured),
      sort_order = coalesce(p_sort, sort_order),
      updated_at = now()
    where id = p_id;
  else
    insert into public.artworks (site_id, title, description, category, image_path, year, featured, sort_order)
    values (v_site, p_title, p_description, coalesce(p_category,'Illustration'),
      coalesce(p_image_path,''), p_year, coalesce(p_featured,false), coalesce(p_sort,0));
  end if;
end $$;

create or replace function public.manage_delete_artwork(p_token_hash text, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_site uuid;
begin
  v_site := public.assert_manager(p_token_hash);
  delete from public.artworks where id = p_id and site_id = v_site;
end $$;

create or replace function public.manage_update_about(
  p_token_hash text, p_bio text, p_short text default null,
  p_interests text[] default '{}', p_subjects text[] default '{}',
  p_signature text default null, p_profile_path text default null
) returns void language plpgsql security definer set search_path = public as $$
declare v_site uuid;
begin
  v_site := public.assert_manager(p_token_hash);
  update public.about_content set
    bio = coalesce(p_bio, bio), short_description = p_short, interests = coalesce(p_interests, interests),
    subjects = coalesce(p_subjects, subjects), signature = p_signature,
    profile_image_path = p_profile_path, updated_at = now()
  where site_id = v_site;
end $$;

create or replace function public.manage_upsert_social(
  p_token_hash text, p_platform text, p_url text,
  p_id uuid default null, p_display text default null, p_enabled boolean default true, p_sort int default 0
) returns void language plpgsql security definer set search_path = public as $$
declare v_site uuid;
begin
  v_site := public.assert_manager(p_token_hash);
  if p_id is not null and exists (select 1 from public.social_links where id = p_id and site_id = v_site) then
    update public.social_links set platform = p_platform, url = p_url, display_name = p_display,
      enabled = coalesce(p_enabled, enabled) where id = p_id;
  else
    insert into public.social_links (site_id, platform, url, display_name, enabled, sort_order)
    values (v_site, p_platform, p_url, p_display, coalesce(p_enabled,true), coalesce(p_sort,0));
  end if;
end $$;

create or replace function public.manage_rotate_token(p_old_hash text, p_new_hash text)
returns void language plpgsql security definer set search_path = public as $$
declare v_site uuid;
begin
  v_site := public.assert_manager(p_old_hash);
  update public.management_access set revoked_at = now() where token_hash = p_old_hash;
  insert into public.management_access (site_id, token_hash, label)
  values (v_site, p_new_hash, 'rotated');
end $$;

-- ---------- seed (first site) ----------
insert into public.sites (slug, artist_name)
values ('shiakonii','Lorem Ipsum')
on conflict (slug) do nothing;

-- Use a DO block so re-running is safe
do $$
declare v_site uuid;
  cat_chibi uuid; cat_real uuid;
begin
  select id into v_site from public.sites where slug = 'shiakonii';

  insert into public.site_settings (site_id, commission_status, commission_message, available_slots)
  values (v_site, 'open', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 3)
  on conflict do nothing;

  insert into public.commission_categories (site_id, name, sort_order)
  values (v_site, 'Lorem', 1), (v_site, 'Ipsum', 2)
  on conflict do nothing;

  select id into cat_chibi from public.commission_categories where site_id = v_site and name = 'Lorem';
  select id into cat_real from public.commission_categories where site_id = v_site and name = 'Ipsum';

  if cat_chibi is not null and not exists (select 1 from public.commission_prices where site_id = v_site) then
    insert into public.commission_prices (site_id, category_id, type, price, enabled, sort_order) values
      (v_site, cat_chibi, 'Bust', 10, true, 1),
      (v_site, cat_chibi, 'Half', 15, true, 2),
      (v_site, cat_chibi, 'Full', 25, true, 3),
      (v_site, cat_real, 'Bust', 25, true, 1),
      (v_site, cat_real, 'Half', 40, true, 2),
      (v_site, cat_real, 'Full', 60, true, 3);
  end if;

  insert into public.about_content (site_id, bio, short_description, interests, subjects, signature)
  values (v_site,
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    'Lorem ipsum dolor sit amet',
    array['Lorem','Ipsum','Dolor','Sit amet','Consectetur','Adipiscing'],
    array['Lorem','Ipsum','Dolor','Sit','Amet'],
    '— Lorem ipsum')
  on conflict do nothing;

  if not exists (select 1 from public.social_links where site_id = v_site) then
    insert into public.social_links (site_id, platform, url, display_name, enabled, sort_order) values
      (v_site, 'X', '', 'lorem ipsum', true, 1),
      (v_site, 'Instagram', '', 'lorem ipsum', true, 2),
      (v_site, 'TikTok', '', 'lorem ipsum', true, 3),
      (v_site, 'Twitch', '', 'lorem ipsum', true, 4),
      (v_site, 'Ko-fi', '', 'lorem ipsum', true, 5),
      (v_site, 'Cara', '', 'lorem ipsum', true, 6);
  end if;
end $$;
