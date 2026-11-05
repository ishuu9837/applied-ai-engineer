# Cloudflare Worker API — explicitly opt-in

This API is **not deployed** until a Cloudflare account owner configures D1, R2, a Worker hostname, and Cloudflare Access. The site continues in browser-only guest mode safely without it.

## Verified endpoints

- `GET /health` public readiness probe; does not expose private data.
- `GET /v1/progress` / `PUT /v1/progress` D1-backed, single-user progress.
- `GET /v1/artifacts` / `POST /v1/artifacts` / `GET /v1/artifacts/:id` protected R2 attachment storage (1 MiB text/JSON max).

All private routes need **Cloudflare Access** protection on the Worker hostname and `ctx.access.getIdentity()` to identify the user. `ALLOWED_EMAIL` is an extra server-side owner allowlist. Without both, requests fail closed. Configure the Access application to protect **all paths** under the Worker host. Do not bypass Access to make cross-origin requests succeed.

## Create resources (Cloudflare login required)

```bash
npm install -g wrangler
npx wrangler login
npx wrangler d1 create applied-ai-academy
npx wrangler r2 bucket create applied-ai-academy-private
cp worker/wrangler.example.toml worker/wrangler.toml
# Replace database_id in worker/wrangler.toml with the ID printed by d1 create.
# Set PUBLIC_ORIGIN to the exact origin that hosts the Pages site.
npx wrangler d1 migrations apply applied-ai-academy --remote --config worker/wrangler.toml
npx wrangler secret put ALLOWED_EMAIL --config worker/wrangler.toml
npx wrangler deploy --config worker/wrangler.toml
```

**Expected outcomes:** D1 and R2 create operations return identifiers; remote migrations report one applied file; deploy reports a Worker URL. Exact IDs/URLs are environment-specific and must not be fabricated.

After deployment, in Cloudflare Zero Trust, create an Access self-hosted application protecting the **entire Worker hostname** and allow only your own email. Verify unauthenticated `GET /v1/progress` returns Access login/denial rather than data. In local `wrangler dev`, `ctx.access` is absent, so private endpoints intentionally return 401; use the unit test mocks to validate behavior until Access is configured.

If you use a custom domain (recommended for same-site browser cookies), add it in Workers Custom Domains and create the corresponding Access application. With a `pages.dev` website and `workers.dev` API on different sites, Access cookies may be blocked by browser privacy settings. Do not promise cloud sync works across origins until the actual login round-trip is tested. Use local guest mode in the meantime.

**Threats handled:** owner allowlist, fail-closed Access, bounded JSON body, strict artifact MIME/size checks, scoped D1 queries, random R2 keys, no public bucket, limited CORS, no secrets in browser, no public raw notes. Add Cloudflare WAF and per-route rate limiting as a follow-up; DNS alone does not stop app attacks.

## Limits (checked November 5, 2026)

Workers Free: **100,000 requests/day**, 10 ms CPU/request (Cloudflare docs); D1 Free: **5 million rows read/day**, **100,000 rows written/day**, **5 GB total across the account** with **500 MB maximum per DB**; R2 Standard Free **10 GB-month storage/month**, **1m Class A**, **10m Class B ops/month**. Some features require payment method enablement even when usage is free. Check current dashboard limits before deploying.

Docs:
- https://developers.cloudflare.com/workers/configuration/cloudflare-access/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/workers/wrangler/configuration/
