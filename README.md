# Applied AI Engineer — 20-day sprint

A **free-first, zero-dependency static learning website** for a practical 20-day Applied AI Engineer bootcamp. The website is the interactive companion, not an AI code generator. The learner writes and tests the core Python/SQL/Spark/FastAPI logic.

**Dates:** November 6–25, 2026 (Asia/Kolkata). Six hours per day. Publish **five complete days of learning content per midnight batch** for the first four nights. Only Day 1–5 materials are prepared in this initial delivery. Subsequent batches must be authored and reviewed before their scheduled publication.

## Features

- 20-day roadmap across foundations, ML pipeline, customer assistant, bounded QLoRA, and hiring/FDE interviews.
- Five daily learning sections: LEARN → BUILD → BREAK IT → REVIEW → SHIP.
- Three escalating hints plus reference code behind a **self-confirmed attempt / 20-minute stuck acknowledgment**.
- Five-question quizzes with answers hidden until submission, cheat sheets, three interview prompts per lesson.
- Local-only checklists, notes, optional coach scores, progress dashboard, export/reset controls, and a focus timer.
- Free-tier notes and official documentation links (recheck availability before each lab).
- Reviewed lessons published in batches using a 12:00 AM **Asia/Kolkata** scheduled GitHub Action.
- No database, LLM API keys, cookies, cloud account or dependency install for the website itself.

## Run locally (free)

Requires Node.js 20+.

```bash
npm test
npm run dev
```

Expected: tests pass; site opens at `http://127.0.0.1:4173`. Until a release is run, the first batch is locked in the local public build.

To **preview** the first five prepared lessons in a local build without releasing files to Git:

```bash
npm run preview
```

Expected: `dist/` contains the local preview catalog. The page still checks the **actual IST date**; after November 6 you can navigate the lessons. The preview command is never used in CI.

To simulate the initial publication **after checking the date and content**:

```bash
npm run release -- --date=2026-11-06
npm test
npm run dev
```

Expected: `content/live/day-01.json` through `day-05.json` are written, and catalog shows five days. **Do not commit a simulated early release before its real date.** Use this for review or in a disposable copy.

## Deploy to Vercel (Hobby, no paid services)

1. The GitHub repository `ishuu9837/applied-ai-engineer` is the source of truth, with production branch `main`.
2. The Vercel Git-linked project uses `vercel.json`: framework **Other** (no framework), build command `npm run build`, and output directory `dist`.
3. Every push to `main` creates a new production build automatically. Vercel should be used only for hosting; it must not generate lessons or require any secret API keys.
4. GitHub Actions (not Vercel Cron) runs at `00:00 Asia/Kolkata`. It validates the prepared five-day batch, commits released lesson JSON files to `content/live`, and keeps the schedule marker. The next Git push is intended to trigger the Vercel deployment.
5. Verify Git-generated commits actually deploy in the connected Vercel Hobby project, especially the GitHub Actions bot-authored release commits; use the Vercel dashboard to redeploy the release manually if necessary.
6. GitHub Actions schedules are **best effort**: the workflow may run late or be dropped. Use the workflow's **Run workflow** button to recover a missed release.
7. The first production build can show the roadmap before November 6, while Days 1–5 remain locked until they are actually published. There is **no requirement to enable GitHub Pages**.

**Security:** Only `dist/` files are served. The build script does not copy `content/queue` into the site. The GitHub repository is public, so queued lesson content is visible in source before its release. Never commit API keys or private customer data.

## Batch queue: prepare, review, release

- `content/queue/2026-11-06.json` holds only the initial **Day 1–5** prepared batch.
- The scheduled release copies it into `content/live/day-01.json` through `day-05.json` and updates `catalog.json`.
- Before the following releases, add reviewed batches: `content/queue/2026-11-07.json` (Days 6–10), `2026-11-08.json` (Days 11–15) and `2026-11-09.json` (Days 16–20).
- Each file must match the same schema and contain exactly five day lessons. The release script fails rather than generating fake lesson content if a required batch is missing. This means **future content publication is not autonomous** unless someone prepares and commits the other three batches on time.
- Avoid queueing secret/private materials; this is a **public repository** and queue files are visible in its source before release, even though the website build excludes the queue.
- `npm test` includes release-date and batch-shape checks. The script itself checks number and sequence of days; content accuracy and free-tier API usage still require human review.

## What the website does *not* do

- Execute Python, SQL, notebook cells, or grade code. It asks for an honest self-check and points to ChatGPT for code review.
- Know personal progress on other browsers; localStorage is per device/browser.
- Create new lessons using AI at midnight. We deliberately require reviewed material.
- Guarantee a midnight deployment to the second or guarantee future unprepared batches.
- Provide real ML metrics, trained models, public demonstrations, or fictional resume achievements.

## Layout

```text
applied-ai-engineer/
├── index.html                 # Single-page website
├── assets/                    # Design system and favicon
├── src/                       # Browser UI and 20-day roadmap
├── content/
│   ├── queue/                 # Five-day batches awaiting publication
│   └── live/                  # Only published lessons and schedule marker
├── scripts/                   # Deterministic release/build/dev server
├── tests/                     # Release, date, content, public-build checks
└── .github/workflows/publish.yml
```

## Coding-ownership policy

1. Read the goal and concept.
2. Try alone; use hints one at a time.
3. Reference code unlocks only after self-confirmed attempt or 20 minutes stuck (not automatically verified).
4. Always run real tests locally and paste your implementation for critical review.
5. Never claim a benchmark or resume metric without actual measured evidence.

## Cost, reliability and security

- **Site hosting:** Vercel Hobby is available at no charge for personal/non-commercial use, subject to usage quotas. GitHub Actions provides the small scheduled publishing job.
- **Databricks:** Free Edition is fair-use/serverless with compute shutdowns when quotas are reached. Verify current workspace restrictions before every Spark lab.
- **Docker:** Docker Desktop has licence conditions; Podman is a free local alternative.
- **LLMs:** Paid keys are not required by this site. Do not put any API key in JavaScript, Git, README or customer examples.
- **Privacy:** Browser-local state only. Progress export is a local file; do not paste confidential content into a public repo.
- **Reliability:** GitHub Actions scheduled triggers may be delayed or dropped. The manual `workflow_dispatch` rerun is the fallback.

## Verified official resources

- https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onschedule
- https://vercel.com/docs/git
- https://vercel.com/docs/project-configuration/vercel-json
- https://vercel.com/docs/plans/hobby
- https://docs.databricks.com/aws/en/getting-started/free-edition-limitations
- https://docs.docker.com/subscription/desktop-license/

## Roadmap status (initial delivery)

| Batch | Date (IST) | Days | State |
|---|---|---|---|
| 1 | Nov 6 | 1–5 | Authored and queued; pending midnight release |
| 2 | Nov 7 | 6–10 | Not yet authored |
| 3 | Nov 8 | 11–15 | Not yet authored |
| 4 | Nov 9 | 16–20 | Not yet authored |

## Resume bullets

Do not write measured project outcomes until the learner has completed and verified their own runs. Drafts inside each lesson have placeholders for actual numbers.
