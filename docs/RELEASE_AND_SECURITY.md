# Production Readiness Contract / No False Green
Current private app only. Access uses one admin secret and signed cookie; not customer multi-tenant production. Railway persistent volume survives code redeploy; migrate source without deleting service/volume/variables.

## Required release verification
1. GitHub target branch latest SHA and tests. 2. Explicit unchanged DATA_DIR=/data and mounted volume. 3. Read-only Railway deployment config validation. 4. Published HTTPS 200 for /api/health, application HTML, /style.css, /premium.css, /locale.js, /app.js. 5. Unauthorized GET /api/state returns 401. 6. Login/record mutation smoke only in isolated test database to avoid modifying user production evidence. 7. Prior state not reset, no "admin" default credentials. 8. Detect runtime errors and roll back on bad deploy; audit actual deployment status.
Daily automation: do not infer agent success from cron, issue creation, green CI or a prompt. Require commit, PR, tests, independent verifier, deploy and receipt before saying an autonomous coding cycle completed.
Gaps before external SaaS: per-user auth, tenant isolation, durable rate limit, encrypted backups, access reviews, CSRF hardening, source snapshots, immutable audit, browser E2E, WCAG/i18n verification, security negative testing, recovery drill.
