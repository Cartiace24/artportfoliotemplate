# Art Portfolio Template

Artist portfolio + private no-login studio. React, Vite, Tailwind, Supabase.

## Run

```bash
npm install
npm run dev
```

Demo studio: `/manage/demo-manage-token-please-change-me-0123456789`

## Setup

1. Set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in `.env`
2. Run `supabase/migrations/001_schema.sql`, then `002_hardening.sql` in Supabase SQL Editor
3. Generate a token: `node scripts/generate-manage-token.mjs`, store its hash in `management_access`

## Deploy

Vercel, framework Vite. Build `npm run build`, output `dist`.
