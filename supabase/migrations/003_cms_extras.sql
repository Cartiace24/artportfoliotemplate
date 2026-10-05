-- ============================================================
-- 003_cms_extras — terms sections, site config, request inbox
-- Run AFTER 002_hardening.sql. Safe to re-run (idempotent).
-- ============================================================

-- ---------- tables ----------
create table if not exists public.terms_sections (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  title text not null default 'Lorem ipsum',
  body text not null default '',
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.site_config (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade unique,
  site_name text not null default 'Lorem Ipsum',
  tagline text not null default 'Lorem ipsum dolor sit amet',
  hero_title text not null default 'It’s Lorem!',
  updated_at timestamptz default now()
);

-- Commission request inbox. NO public policies on purpose: browsers never
-- touch this table directly. Writes go through the edge function (service
-- role); reads/deletes go through token-scoped RPCs below.
create table if not exists public.commission_requests (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  name text not null default '',
  contact text not null default '',
  type text not null default '',
  details text not null default '',
  ip text,
  created_at timestamptz default now()
);
create index if not exists idx_commission_requests_site on public.commission_requests(site_id, created_at desc);
create index if not exists idx_commission_requests_ip on public.commission_requests(ip, created_at desc);

-- ---------- RLS ----------
alter table public.terms_sections enable row level security;
alter table public.site_config enable row level security;
alter table public.commission_requests enable row level security;

drop policy if exists "public read terms" on public.terms_sections;
create policy "public read terms" on public.terms_sections for select using (true);
drop policy if exists "public read site config" on public.site_config;
create policy "public read site config" on public.site_config for select using (true);
-- commission_requests: intentionally no policies → direct access denied.

revoke all on public.terms_sections from anon, authenticated;
revoke all on public.site_config from anon, authenticated;
revoke all on public.commission_requests from anon, authenticated;
grant select on public.terms_sections to anon, authenticated;
grant select on public.site_config to anon, authenticated;
-- no grant on commission_requests.

-- ---------- RPCs (all derive site_id from the token hash) ----------
create or replace function public.manage_upsert_terms(
  p_token_hash text, p_title text, p_body text,
  p_id uuid default null, p_sort int default 0
) returns void language plpgsql security definer set search_path = public as $$
declare v_site uuid;
begin
  v_site := public.assert_manager(p_token_hash);
  if p_id is not null and exists (select 1 from public.terms_sections where id = p_id and site_id = v_site) then
    update public.terms_sections set title = p_title, body = p_body
    where id = p_id;
  else
    insert into public.terms_sections (site_id, title, body, sort_order)
    values (v_site, p_title, p_body, coalesce(p_sort, 0));
  end if;
end $$;

create or replace function public.manage_delete_terms(p_token_hash text, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_site uuid;
begin
  v_site := public.assert_manager(p_token_hash);
  delete from public.terms_sections where id = p_id and site_id = v_site;
end $$;

create or replace function public.manage_update_config(
  p_token_hash text, p_site_name text, p_tagline text, p_hero_title text
) returns void language plpgsql security definer set search_path = public as $$
declare v_site uuid;
begin
  v_site := public.assert_manager(p_token_hash);
  insert into public.site_config (site_id, site_name, tagline, hero_title)
  values (v_site, p_site_name, p_tagline, p_hero_title)
  on conflict (site_id) do update set
    site_name = excluded.site_name,
    tagline = excluded.tagline,
    hero_title = excluded.hero_title,
    updated_at = now();
end $$;

create or replace function public.manage_get_requests(p_token_hash text)
returns table (
  id uuid, name text, contact text, type text, details text, created_at timestamptz
) language plpgsql security definer set search_path = public as $$
declare v_site uuid;
begin
  v_site := public.assert_manager(p_token_hash);
  return query select r.id, r.name, r.contact, r.type, r.details, r.created_at
    from public.commission_requests r
    where r.site_id = v_site
    order by r.created_at desc
    limit 200;
end $$;

create or replace function public.manage_delete_request(p_token_hash text, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_site uuid;
begin
  v_site := public.assert_manager(p_token_hash);
  delete from public.commission_requests where id = p_id and site_id = v_site;
end $$;

grant execute on function public.manage_upsert_terms(text, text, text, uuid, int) to anon, authenticated;
grant execute on function public.manage_delete_terms(text, uuid) to anon, authenticated;
grant execute on function public.manage_update_config(text, text, text, text) to anon, authenticated;
grant execute on function public.manage_get_requests(text) to anon, authenticated;
grant execute on function public.manage_delete_request(text, uuid) to anon, authenticated;

-- ---------- seed ----------
do $$
declare v_site uuid;
begin
  select id into v_site from public.sites where slug = 'shiakonii';
  if v_site is null then return; end if;

  insert into public.site_config (site_id, site_name, tagline, hero_title)
  values (v_site, 'Lorem Ipsum', 'Lorem ipsum dolor sit amet', 'It’s Lorem!')
  on conflict (site_id) do nothing;

  if not exists (select 1 from public.terms_sections where site_id = v_site) then
    insert into public.terms_sections (site_id, title, body, sort_order) values
      (v_site, '1. Lorem ipsum', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 1),
      (v_site, '2. Dolor sit', 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', 2),
      (v_site, '3. Amet consectetur', 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', 3),
      (v_site, '4. Adipiscing elit', 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 4),
      (v_site, '5. Sed do eiusmod', 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.', 5),
      (v_site, '6. Tempor incididunt', 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur.', 6),
      (v_site, '7. Ut labore', 'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.', 7);
  end if;
end $$;
