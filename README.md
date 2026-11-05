# Applied AI Engineer — Field Academy

An interactive 20-day, 120-hour AI Engineering bootcamp with missions, quizzes, XP, project challenges, and staged lesson releases.

## Open access — no authentication

The website opens to an animated, Orbit-inspired landing page. Select **Start learning** to enter the mission dashboard at `/#/home`. There are **no login or signup pages**, user accounts, password requirements, sessions, or cloud progress endpoints.

Progress, XP, notes and self-checks are stored **only in the current browser's localStorage**. Use **Settings → Export JSON backup** to keep a copy. Clearing browser data or changing devices will not automatically transfer progress.

The old authentication and private API code has been removed. No server-side progress or account storage is provided. Previously provisioned external infrastructure is not deleted by these repository changes.

## Static-site deployment

Build with `npm run build` and publish the generated `dist/` directory to any static hosting provider. No Cloudflare Worker, Wrangler, D1, R2, or server API is required.

The learning dashboard is available at `/#/home`, and the animated landing page appears at the root URL. Progress remains browser-local.

## Development

```sh
npm test
npm run build
npm run dev
```

Lessons are published in reviewed batches. The first prepared batch contains Days 1–3; further content is not automatically fabricated. See `content/live/catalog.json` for what is actually published.

## Privacy and limitations

Learning progress remains in browser storage; no cross-device synchronization or private artifact locker is provided. This is a self-guided learning companion, not a server-verified grading system.
