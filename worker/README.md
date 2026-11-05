# Cloudflare signup/login API

Deploy via either root Worker `wrangler.jsonc` (Static Assets) or Cloudflare Pages Functions. The UI calls the same-origin `/api/auth/*` routes, not a cross-site API.

Create D1 database `applied-ai-academy`; run `migrations/0001_init.sql` followed by `migrations/0002_auth.sql` in the D1 Console; bind as `DB`. Optional R2 bucket binding: `ARTIFACTS`. The app returns 503 for account endpoints until DB exists.

Security: Requires HTTPS, 12+ character signup passwords, uses salted PBKDF2 and HttpOnly session cookies, guards mutations with same-origin checks. Email verification/password recovery are not yet available. Add Turnstile and managed identity before broader public use. Workers Free CPU is 10ms/request; test actual auth latency.
