# FIELD ACADEMY · Applied AI Engineer 20-Day Sprint

A **game-based, beginner-friendly, free-first** applied AI engineering learning website. Theme: cinematic midnight space mission control inspired by the supplied Orbit design prompt, adapted into a responsive teaching app. All mission tasks require learner-written logic before a staged solution unlock.

**Start:** 2026-11-06 | **Finish:** 2026-11-25 | **Schedule:** 6 hours per learning day | **Time zone:** Asia/Kolkata | **Learner:** Python comfortable, SQL basic, Spark new.

## What's new in the Cloudflare migration branch

- Cinematic space/planet mission dashboard, side navigation, responsive mobile layouts and reduced-motion support.
- **Game loop:** quests → staged hint ladder → tested submission (self-report) → Bug Hunt → five-question quiz → ship. XP and ranks are local motivational points, not professional certification or evidence of skill.
- **Expanded teaching content:** nine detailed Day 1–3 chapters, mental models, common pitfalls, tasks and solution-code vaults for **all 11 labs**. Reference solutions require the learner to reveal three hints and confirm an attempt (or 20 minutes stuck). The website cannot independently verify a real attempt.
- **Quality-first release:** up to **three lessons per midnight batch**, not five, with no automatic model-generated lesson content. First prepared batch is Days 1–3 only. Days 4–20 need additional editorial work; no fake lesson placeholders will be published.
- **Cloudflare-ready architecture:** Pages frontend, separate Workers API, D1 progress, private R2 artifacts, Cloudflare Access owner authentication and Cloudflare DNS/WAF for an optional custom domain. Browser-local guest mode works without any Cloudflare account.

## Run and test locally

Node.js 20+; no npm packages are required to run or build the static frontend.

```bash
npm test
npm run dev
```

Expected: 12 Node tests pass; local app is served at `http://127.0.0.1:4173` (when ports are available). The normal production build does not expose unpublished lesson files.

To preview the first three missions without publishing them:

```bash
npm run preview
```

`npm run preview` injects reviewed content into a **local-only dist preview**; route availability still checks the actual date in Asia/Kolkata. It is NOT a deployment action.

**Important**: Only test the release command with a disposable local copy until the real release date. The GitHub Actions scheduled release does the real publishing, preserving the batch gate.

```bash
npm run release -- --date=2026-11-06
npm test
npm run build
```

Expected: lessons `day-01.json` to `day-03.json` are copied to `content/live`, and the release catalog includes `[1,2,3]`. Do **not** commit those files ahead of schedule.

## Deploy frontend to Cloudflare Pages

1. Log in to Cloudflare, select **Workers & Pages → Create → Pages → Connect to Git**.
2. Authorize GitHub repository `ishuu9837/applied-ai-engineer` (default branch: `main`).
3. Project name: `applied-ai-engineer` (or a unique available name). Framework preset: **None/Other**. Root directory: `/`. Build command: `npm run build`. Build output: `dist`.
4. Run the initial build; the site appears at a project-specific `*.pages.dev` URL. Do **not** claim a live Cloudflare link before the dashboard reports a successful build and the URL responds.
5. Configure a custom domain under **Pages → Custom domains** if desired. At the registrar, switch nameservers only after checking existing DNS records and whether the domain already hosts email/apps. Cloudflare DNS is a routing service, not an authentication boundary.
6. Test dashboard, lesson locking, accessibility, loading on mobile and absence of `content/queue` at public URLs.

Git integration automatically builds from commits. Github Actions content release commits can also trigger a Git deployment, but **do not assume the scheduled GitHub bot commit is always mirrored to the Pages build**; verify the first release and use `npx wrangler pages deploy dist --project-name <name>` as a manual fallback after Cloudflare authentication.

## Workers + D1 + R2 (optional owner-only cloud sync)

The Worker implementation is at [`worker/index.mjs`](worker/index.mjs). The database schema is in [`worker/migrations/0001_init.sql`](worker/migrations/0001_init.sql). Setup instructions: [`worker/README.md`](worker/README.md).

Private API routes require a Cloudflare Access application on the Worker hostname. Authentication is checked with `ctx.access.getIdentity()`, and the account email must match the separate server-side `ALLOWED_EMAIL` secret. D1 is accessed only in the Worker, with parameterized queries; the R2 bucket is private. If Access is not configured or credentials do not match, private requests are rejected.

**To enable syncing**, after validating the API and Access flow, set the `apiBase` HTTPS URL in `public-config.json` and redeploy Pages. In **Settings**, save or restore progress explicitly, upload private text/JSON study notes to R2 (1 MiB maximum), and list/download your own artifacts. The default local mode avoids paid infrastructure and works even when the API is unavailable. Do not hardcode Access tokens, R2 credentials or secrets in frontend files.

The Worker has mock tests for Access denial, owner authorization, input size bounds, D1 reads/writes, R2 artifact storage and CORS. These tests do not replace a live Cloudflare integration test.

## Release schedule (Asia/Kolkata, 00:00, best effort)

| Release | Content | Preparation |
|---|---|---|
| Nov 06 | Days 1–3 | Authored, solution code included; awaiting real release |
| Nov 07 | Days 4–6 | Not yet authored/reviewed |
| Nov 08 | Days 7–9 | Not yet authored/reviewed |
| Nov 09 | Days 10–12 | Not yet authored/reviewed |
| Nov 10 | Days 13–15 | Not yet authored/reviewed |
| Nov 11 | Days 16–18 | Not yet authored/reviewed |
| Nov 12 | Days 19–20 | Not yet authored/reviewed |

The GitHub workflow attempts publishing daily. GitHub Actions runs can be delayed or dropped. It does not invent lessons and intentionally fails closed when the next batch is missing. The proper fallback is to prepare and review the batch, then run the workflow manually. Browser-based completion remains one day at a time.

## Learning quality policy

Each day should contain: simple-to-deep explanations, a diagram, hands-on quests with hints, reference code and expected output, a failure-debugging challenge, a five-question quiz, a cheat sheet, three interview questions, and GitHub/project deliverables. Every solution in later batches requires the same verification as the initial set. Free-tier services, library APIs and versions must be rechecked at the time of each lab. The learner should not replace their work with assistant solutions or claim simulated XP as evidence of real ML results.

## Cloudflare free tier (as of 2026-11-05)

| Service | Free allowances / important limitations |
|---|---|
| Pages | 500 builds/month; 1 concurrent build; 20k site files; 25 MiB per file |
| Workers | 100,000 requests/day; 10 ms CPU time/request |
| D1 | 5m rows read/day; 100k rows written/day; 5 GB total storage; 500 MB maximum for each free DB |
| R2 Standard | 10 GB-month free/month; 1m Class A and 10m Class B operations monthly |
| Cloudflare Access | Free tier for teams under 50 users; configure identity policies before enabling sync |

These are allowances, **not unlimited free production infrastructure**. Usage limits, eligibility and billing setup may change. Read official docs before enabling services.

Official references:

- https://developers.cloudflare.com/pages/configuration/git-integration/
- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/workers/configuration/cloudflare-access/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/dns/get-started/
- https://developers.cloudflare.com/waf/get-started/

## Security/reliability

- **Cloudflare DNS is not 'security'.** Use HTTPS/TLS, Cloudflare WAF, Cloudflare Access for protected endpoints, least privilege, strict CORS, authentication and rate limits.
- Do not publish raw customer documents, API keys, R2 bucket credentials, or confidential data in the public GitHub repo. Private R2 objects must be accessed through owner-scoped Worker endpoints.
- The site does not execute untrusted Python or notebook code; learner solutions are run in their own Colab, Kaggle, Databricks or local environment.
- Local browser progress is exportable to JSON. Until Access is configured, it does not synchronize across devices.
- XP is a self-reported game mechanic, not a test result, certification or hiring guarantee.
