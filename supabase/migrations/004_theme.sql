-- ============================================================
-- 004_theme — public portfolio theme selection (classic/painterly)
-- Run AFTER 003_cms_extras.sql. Safe to re-run (idempotent).
-- Only adds a cosmetic site_config column + extends manage_update_config
-- with an optional, validated theme parameter. Security model unchanged:
-- site_id is still derived server-side from the token hash.
-- ============================================================

alter table public.site_config
  add column if not exists theme text not null default 'classic';

-- Recreate with the extra parameter (signature change needs drop + create).
drop function if exists public.manage_update_config(text, text, text, text);

create or replace function public.manage_update_config(
  p_token_hash text, p_site_name text, p_tagline text, p_hero_title text,
  p_theme text default null
) returns void language plpgsql security definer set search_path = public as $$
declare v_site uuid;
begin
  v_site := public.assert_manager(p_token_hash);
  -- Only allow known themes; null/unknown leaves the stored theme untouched.
  if p_theme is not null and p_theme not in ('classic', 'painterly') then
    raise exception 'unknown theme';
  end if;
  insert into public.site_config (site_id, site_name, tagline, hero_title, theme)
  values (v_site, p_site_name, p_tagline, p_hero_title, coalesce(p_theme, 'classic'))
  on conflict (site_id) do update set
    site_name = excluded.site_name,
    tagline = excluded.tagline,
    hero_title = excluded.hero_title,
    theme = case when p_theme is null then public.site_config.theme else p_theme end,
    updated_at = now();
end $$;

grant execute on function public.manage_update_config(text, text, text, text, text) to anon, authenticated;
