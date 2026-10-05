# Art Portfolio Template

Artist portfolio + private no-login studio. React, Vite, Tailwind, Supabase.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Cartiace24/artportfoliotemplate)

## Run

```bash
npm install
npm run dev
```

Demo studio: `/manage/demo-manage-token-please-change-me-0123456789`

## Setup

Full checklist in [`docs/SETUP.md`](docs/SETUP.md). Short version:

1. Set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in `.env`
2. Run `supabase/migrations/001_schema.sql`, `002_hardening.sql`, `003_cms_extras.sql`, `004_theme.sql` in Supabase SQL Editor
3. Generate a token: `node scripts/generate-manage-token.mjs`, store its hash in `management_access`

## Deploy

Vercel, framework Vite. Build `npm run build`, output `dist`.
