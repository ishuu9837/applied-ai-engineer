# Applied AI Engineer — Field Academy

An interactive 20-day, 120-hour AI Engineering bootcamp, gamified with XP and missions. Initial reviewed release covers Days 1–3. Further three-day batches require authorship and review before publication.

## You're on Cloudflare's “Set up your Worker project” screen

| Field | Value |
|---|---|
| GitHub repository | ishuu9837/applied-ai-engineer |
| Root directory | / (repo root) |
| Build command | npm run build |
| Deploy command | npx wrangler deploy |
| Production branch | main |

The root `wrangler.jsonc` config serves static assets from `dist/` and routes `/api/*` to the Worker. **If you want Cloudflare Pages instead**, create a Pages project from GitHub and set build `npm run build`, output directory `dist`. Pages Functions under `functions/api/[[path]].js` provide the same Worker-based API. Use one hosting approach, not both.

## REQUIRED Cloudflare configuration for real signup/login

By design, signup fails with HTTP 503 until a D1 database binding named **DB** is configured and migrations run.

1. Create D1 database `applied-ai-academy` in Cloudflare dashboard.
2. Run SQL from `worker/migrations/0001_init.sql`, then `worker/migrations/0002_auth.sql` in the D1 Console.
3. Bind D1 to your deployed project using the exact binding name `DB`, and redeploy. For Git-driven Workers, add the real DB UUID to `wrangler.jsonc` under `d1_databases` (the checked-in config deliberately has no invented UUID).
4. Optional: Create private R2 bucket `applied-ai-academy-private`; bind it as `ARTIFACTS`. Needed for private study notes, not for signup.
5. Visit `/api/health` (expect `database: true`), then signup at `/#/signup` and log in at `/#/login`.

Use same-origin API routes only: `/api/auth/signup`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`, `/api/v1/progress`, `/api/v1/artifacts`.

## Security notes and limitations

Passwords are salted and stretched using WebCrypto PBKDF2-SHA256; random session tokens are stored as SHA-256 digests in D1; browser sessions use Secure HttpOnly SameSite=Lax cookies. Unsafe methods check Origin, and signup/login have D1-backed IP/email throttling. D1 progress and R2 files are scoped to a signed-in user. No passwords/tokens live in client-side JavaScript or browser localStorage.

**MVP only:** Email ownership verification, password reset, CAPTCHA/Turnstile and independent production security review have not been implemented. Users can register addresses they do not own. Cloudflare Workers Free has a **10 ms CPU limit per request**, so measure real-world authentication time before relying on password stretching on that tier; a managed identity provider is preferable before inviting public users. Do not place Cloudflare Access in front of the entire public site if you expect users to reach open signup.

## Test and build

~~~sh
npm test
npm run build
~~~

The tests validate release behavior; authentication also needs live D1 integration validation after the bindings are configured. Never fabricate user accounts or claim deployments occurred until Cloudflare confirms success.

## Docs

- https://developers.cloudflare.com/workers/static-assets/binding/
- https://developers.cloudflare.com/workers/ci-cd/builds/
- https://developers.cloudflare.com/pages/configuration/git-integration/
- https://developers.cloudflare.com/pages/functions/bindings/
- https://developers.cloudflare.com/d1/get-started/
