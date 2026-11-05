# Applied AI Engineer — Field Academy

An interactive 20-day, 120-hour AI Engineering bootcamp with missions, quizzes, XP, project challenges, and staged lesson releases.

## Open access — no authentication

The website opens directly into the mission dashboard. There are **no login or signup pages**, user accounts, password requirements, sessions, or cloud progress endpoints.

Progress, XP, notes and self-checks are stored **only in the current browser's localStorage**. Use **Settings → Export JSON backup** to keep a copy. Clearing browser data or changing devices will not automatically transfer progress.

The legacy authentication and private API routes are disabled and return HTTP 404. Cloudflare D1 and R2 are **not required**. Existing D1 records are not deleted by this code change; if no longer needed, remove the database separately in the Cloudflare dashboard after reviewing its contents.

## Cloudflare deployment

- Repository: `ishuu9837/applied-ai-engineer`
- Root directory: `/`
- Production branch: `main`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

The root `wrangler.jsonc` serves built static assets from `dist/` through the Worker. The Worker returns 404 for all `/api/*` routes.

Live URL: https://applied-ai-engineer.eswaryadav8543.workers.dev

## Development

```sh
npm test
npm run build
npm run dev
```

Lessons are published in reviewed batches. The first prepared batch contains Days 1–3; further content is not automatically fabricated. See `content/live/catalog.json` for what is actually published.

## Privacy and limitations

Learning progress remains in browser storage; no cross-device synchronization or private artifact locker is provided. This is a self-guided learning companion, not a server-verified grading system.
