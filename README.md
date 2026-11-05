# Applied AI Engineer · Field Academy

**Learn beyond theory. Build what matters.**

A free, browser-based **20-day / 120-hour Applied AI Engineering learning experience** with hands-on missions, coding exercises, projects, quizzes, progress tracking and XP-based achievements.

The site combines a cinematic, animated space-themed landing page with an interactive learning workspace. It is a static web application: **no login, account, backend API or database required**.

## What's inside

- **Landing page:** animated space background, responsive navigation and a **Start learning** button.
- **Mission dashboard:** overview of your learning sprint, available lessons and progress.
- **20-day roadmap:** structured AI engineering curriculum with staged releases.
- **Hands-on learning:** lesson concepts, exercises, hints, reference material and project challenges.
- **Quizzes and gamification:** knowledge checks, XP, ranks and achievements.
- **Progress tools:** task completion, notes and browser-local progress storage.
- **Responsive layout:** desktop and mobile navigation.

## Get started

Requirements: **Node.js 20+**. No framework installation or API keys are needed.

```bash
git clone https://github.com/ishuu9837/applied-ai-engineer.git
cd applied-ai-engineer
npm run dev
```

Open the local URL printed by the development server. The root URL displays the landing page; **Start learning** enters the academy.

| Route | Destination |
| --- | --- |
| `/` or `/#/` | Landing page |
| `/#/home` | Learning dashboard |
| `/#/curriculum` | Curriculum and missions |
| `/#/projects` | Projects |
| `/#/progress` | Progress and achievements |
| `/#/settings` | Local progress settings |

## Commands

```bash
npm run dev       # Build and serve the site locally
npm test          # Run automated tests
npm run build     # Generate the deployable dist/ directory
npm run preview   # Local preview with the prepared first lesson batch
npm run release   # Publish eligible reviewed lessons from content/queue/
```

**Important:** `npm run preview` is for local testing, not production publication.

## Deployment

This project is **static-hosting agnostic**. To publish it:

1. Run `npm test` and `npm run build`.
2. Upload or deploy the generated **`dist/`** directory using a static web host.
3. Serve `index.html` as the entry point.

The app uses hash-based routes (`/#/home`, etc.), so these routes do not require server-side rewrites.

There are no Cloudflare Worker, Wrangler, Vercel, D1, R2 or server-side authentication files in the current repository.

### External landing-page assets

The landing page references a remotely hosted background video and fallback poster. They are **not bundled in the repository**; if the remote host becomes unavailable, the animated artwork may not load. The Inter font is also requested externally, with local fallback fonts.

## Lesson publishing

Lessons are published from **reviewed content**, rather than generated automatically at runtime.

- `content/queue/` contains prepared release batches.
- `content/live/` contains the public lesson catalog and published lessons.
- `scripts/release.mjs` handles eligible releases.
- `.github/workflows/publish.yml` validates the project and schedules publication.

The first prepared batch covers **Days 1–3**, scheduled for **November 6, 2026 (IST)**. The presence of a prepared batch does **not** mean those lessons are already live. Check `content/live/catalog.json` for the actual `releasedDays` list. As of November 6, 2026 (IST), **Days 1–3 are published** in `content/live/`.

Additional lessons require prepared, reviewed content before release.

## Progress and privacy

No registration or login is required. Progress, notes, quiz results and XP-related state are stored in your browser's **localStorage** under `aae-bootcamp-progress-v1`.

- Data is **not automatically synced** across browsers or devices.
- Clearing site data can permanently remove local progress.
- Use **Settings → Export JSON backup** to download a copy of your progress.
- The site is a self-guided learning environment, **not** a server-verified assessment platform.
- Remote video and font providers may receive normal browser requests when their assets load; do not interpret the absence of a custom tracking system as a guarantee of zero third-party requests.

## Repository layout

```text
assets/                 Site styles, landing page styles, favicon
content/live/           Public release catalog and published lessons
content/queue/          Reviewed lesson batches awaiting publication
scripts/build.mjs       Static production build
scripts/serve.mjs       Local development server
scripts/release.mjs     Reviewed lesson release process
src/app.js              Learning workspace and routing
src/roadmap.js          Curriculum and release schedule
src/gamification.js     XP and achievement logic
tests/site.test.mjs     Site and content tests
index.html              Landing page and application entry point
```

## Credits

**Made by [I⚡️H](https://ishuu.me)**

[GitHub repository](https://github.com/ishuu9837/applied-ai-engineer)

---

*The project is an educational learning companion. Its curriculum availability and published lesson content are governed by the release catalog.*
