-- ============================================================
-- 002_hardening — least-privilege + storage lockdown + missing RPCs
-- Run AFTER 001_schema.sql. Safe to re-run (all statements idempotent).
-- ============================================================

-- ---------- 1. Explicitly revoke direct access ----------
-- Anon/authenticated clients must NEVER write portfolio tables directly;
-- all management writes go through the SECURITY DEFINER RPCs below, which
-- derive the authorized site_id from the token hash server-side.
revoke all on public.sites from anon, authenticated;
revoke all on public.site_settings from anon, authenticated;
revoke all on public.artworks from anon, authenticated;
revoke all on public.commission_categories from anon, authenticated;
revoke all on public.commission_prices from anon, authenticated;
revoke all on public.about_content from anon, authenticated;
revoke all on public.social_links from anon, authenticated;
revoke all on public.management_access from anon, authenticated;

grant select on public.sites to anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant select on public.artworks to anon, authenticated;
grant select on public.commission_categories to anon, authenticated;
grant select on public.commission_prices to anon, authenticated;
grant select on public.about_content to anon, authenticated;
grant select on public.social_links to anon, authenticated;
-- NOTE: no grant at all on management_access (hashes never leave the DB).

-- RPC execution grants (validation + management). SECURITY DEFINER
-- functions run as owner, so callers only need EXECUTE.
grant execute on function public.validate_management_token(text) to anon, authenticated;
grant execute on function public.is_valid_manager(text) to anon, authenticated;
grant execute on function public.manage_update_settings(text, text, text, int) to anon, authenticated;
grant execute on function public.manage_upsert_price(text, numeric, boolean, uuid, text, uuid) to anon, authenticated;
grant execute on function public.manage_upsert_artwork(text, text, uuid, text, text, text, text, boolean, int) to anon, authenticated;
grant execute on function public.manage_delete_artwork(text, uuid) to anon, authenticated;
grant execute on function public.manage_update_about(text, text, text, text[], text[], text, text) to anon, authenticated;
grant execute on function public.manage_upsert_social(text, text, text, uuid, text, boolean, int) to anon, authenticated;
grant execute on function public.manage_rotate_token(text, text) to anon, authenticated;

-- Harden functions: fixed search_path + owner-only where possible is
-- handled at deploy; ensure they are not callable with crafted search_path.
-- (SET search_path = public is already set on each function in 001.)

-- ---------- 2. Storage lockdown ----------
-- Public reads stay (the gallery needs them). Writes are tightened:
--  - DROP the permissive anon UPDATE policy (uploads are immutable; edits
--    create new objects. No overwrites => no defacement of others' files).
--  - Restrict anon INSERT to the `art/` prefix with image extensions only.
--  - No DELETE policy for anon/authenticated: storage objects can only be
--    removed with the service-role key (server-side). Orphaned files from
--    deleted artworks are harmless (unreferenced, tiny) — see note below.
--
-- NOTE on per-site paths: a pure-RLS policy cannot verify an opaque bearer
-- token (Supabase storage policies see only JWT claims, and this app has no
-- login). The binding is enforced one layer up: the frontend MUST call
-- validate_management_token before uploading (see uploadArtworkFile), and the
-- artworks table row — the actual source of truth for what the site renders —
-- can only be created through token-scoped RPCs. An attacker who uploads a
-- stray file cannot attach it to any site. For stronger guarantees (signed
-- upload URLs bound to site_id), add a small edge function later; the client
-- path layout (`art/...`) is already compatible.

drop policy if exists "anon update artwork" on storage.objects;

drop policy if exists "anon upload artwork" on storage.objects;
create policy "anon upload artwork" on storage.objects for insert
  with check (
    bucket_id = 'artwork'
    and name like 'art/%'
    and (
      name ilike '%.jpg' or name ilike '%.jpeg' or name ilike '%.png'
      or name ilike '%.webp' or name ilike '%.avif' or name ilike '%.gif'
    )
  );

-- ---------- 3. Token rotation hardening ----------
create or replace function public.manage_rotate_token(p_old_hash text, p_new_hash text)
returns void language plpgsql security definer set search_path = public as $$
declare v_site uuid;
begin
  -- Hashes are lowercase hex SHA-256 (64 chars). Reject anything else so a
  -- bug or attacker can't plant a trivially-guessable token.
  if p_old_hash is null or p_old_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid management token';
  end if;
  if p_new_hash is null or p_new_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid new token';
  end if;
  if p_new_hash = p_old_hash then raise exception 'new token must differ'; end if;

  v_site := public.assert_manager(p_old_hash);
  -- Invalidate FIRST so there is no window with two live tokens.
  update public.management_access set revoked_at = now() where token_hash = p_old_hash;
  insert into public.management_access (site_id, token_hash, label)
  values (v_site, p_new_hash, 'rotated');
end $$;

-- ---------- 4. Missing RPCs the studio needs ----------
-- Reorder artworks in one atomic, site-scoped call.
create or replace function public.manage_reorder_artworks(p_token_hash text, p_ids uuid[])
returns void language plpgsql security definer set search_path = public as $$
declare v_site uuid; i int;
begin
  v_site := public.assert_manager(p_token_hash);
  if p_ids is null or array_length(p_ids, 1) is null then return; end if;
  if array_length(p_ids, 1) > 500 then raise exception 'too many artworks'; end if;
  for i in 1 .. array_length(p_ids, 1) loop
    update public.artworks set sort_order = i, updated_at = now()
    where id = p_ids[i] and site_id = v_site;
  end loop;
end $$;

-- Delete a social link (studio "remove" previously only edited locally).
create or replace function public.manage_delete_social(p_token_hash text, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_site uuid;
begin
  v_site := public.assert_manager(p_token_hash);
  delete from public.social_links where id = p_id and site_id = v_site;
end $$;

grant execute on function public.manage_reorder_artworks(text, uuid[]) to anon, authenticated;
grant execute on function public.manage_delete_social(text, uuid) to anon, authenticated;
