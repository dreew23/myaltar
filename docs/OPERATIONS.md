# Operations and local development

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous (public) key for browser and server client |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Enables Sentry error reporting when set |
| `SENTRY_ORG` | No | Sentry org slug for source map upload in CI/Vercel |
| `SENTRY_PROJECT` | No | Sentry project slug for source map upload |
| `SENTRY_AUTH_TOKEN` | No | Auth token for uploading source maps (keep secret; set in Vercel/CI only) |

Never expose the Supabase **service role** key to the client or commit it to the repo.

## Database migrations

SQL migrations live in `supabase/migrations/`. Apply them in order against your Supabase project (SQL editor or Supabase CLI) so RLS policies and tables match what the app expects.

## Deploy flow (v0 → GitHub → Vercel)

1. Changes from [v0.app](https://v0.app) sync to this GitHub repository when configured.
2. Vercel builds from the connected branch; ensure the same env vars are set in the Vercel project.
3. After enabling Sentry uploads, add `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` in Vercel for readable stack traces.

## Known local issues

- **OneDrive** (or other sync folders) hosting the repo can lock files under `.next` and cause flaky builds. Prefer a non-synced directory or run `npm run dev:clean` if the dev server misbehaves.
- **Stale PWA cache**: see [PWA.md](./PWA.md).

## CI

GitHub Actions runs `lint`, `tsc --noEmit`, `vitest`, and `next build` on pushes and pull requests. The build step uses placeholder Supabase env vars so compilation succeeds without real secrets.
