# Setup checklist

Takes about 10 minutes. You need a Supabase account and a Vercel account.

## 1. Supabase project

1. Create a project at supabase.com.
2. Copy **Project URL** and **anon key** (Project Settings → API).

## 2. Database

In Supabase **SQL Editor**, run these in order (each is safe to re-run):

1. `supabase/migrations/001_schema.sql` — tables, RLS, storage bucket, seed content
2. `supabase/migrations/002_hardening.sql` — least-privilege grants, storage lockdown, reorder + social-delete RPCs
3. `supabase/migrations/003_cms_extras.sql` — terms, site config, request inbox

## 3. Management link

```bash
node scripts/generate-manage-token.mjs
```

Insert **only the printed hash**:

```sql
insert into management_access (site_id, token_hash)
values ((select id from sites where slug='shiakonii'), '<hash>');
```

Your studio lives at `https://your-site.com/manage/<token>`. Store it in a password manager.

## 4. Commission request inbox (optional but recommended)

The public request form needs the edge function, otherwise it shows
"unavailable" and asks visitors to use a social link instead.

```bash
supabase functions deploy commission-request
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=... DISCORD_WEBHOOK_URL=...
```

Notifications: set `DISCORD_WEBHOOK_URL` for Discord DMs, or `RESEND_API_KEY` + `NOTIFY_EMAIL` for email. Requests are always stored and visible in **Studio → Inbox** regardless.

## 5. Token-bound uploads (optional)

```bash
supabase functions deploy manage-upload
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
```

The studio tries this first and falls back to direct upload automatically.
Once deployed, you can drop the anon INSERT storage policy so uploads only
work through the token-checked path.

## 6. Deploy

Vercel, framework **Vite**. Build `npm run build`, output `dist`.
Set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in Vercel → Environment Variables.
