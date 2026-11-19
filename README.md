# Noetfield AEGIS — English/French Evidence Operations + Experimental AI Assurance

**Official product source: `Noetfield-Systems/AEGIS`**. Live private workspace: https://aegis-isc-web-production.up.railway.app/.

Dedicated EN/FR premium, private, evidence-gated operational application for **EN578-24ISC4/100**, with a separate experimental native AI evaluation lab and venture Company OS operating context. It is an internal estimate, **not a federal ISC assessment**. Scenario values 43/102/120 are analytical hypotheticals and do not seed real evidence.

## Current scope

- **Readiness Studio (deployed):** Evidence review, score/gates, 30-day milestones, team, tasks, interviews and commercialization records, protected login, audit/export.
- **Native Evaluation Lab (experimental):** authenticated stateless `POST /api/assurance/run`, four modes (`data`, `classifier`, `output`, `replay`) and isolated tests. No ISC evidence score or mandatory gate is granted by experiments.
- **Company OS (partial):** specialist roles, venture manifest, task/receipt schemas, real GitHub Actions scheduled daily work queue, first successful dispatch; no verified full autonomous coding chain or Sina OS endpoint.
- **Commercial Enterprise Assurance Engine:** planned, not released or TRL certified.

Canonical docs: [Product](docs/PRODUCT_SSOT.md), [Architecture](docs/ARCHITECTURE.md), [ISC evidence and benchmarks](docs/ISC_EVIDENCE_AND_BENCHMARKS.md), [Company OS](docs/COMPANY_OS.md), [30-day plan](docs/ROADMAP_30_DAY.md), [Design system](docs/UX_DESIGN_SYSTEM.md), [Current status](docs/CURRENT_STATUS.md).

## Run

Node 22+ (no third-party packages). Set `ADMIN_PASSWORD` (12+ characters), `SESSION_SECRET` (32+ chars), and `DATA_DIR` (persistent, writable path). `npm start`; visit `http://localhost:3000`. For Railway, mount a **persistent volume at `/data`**, set `DATA_DIR=/data`, and use one replica. `GET /api/health` is public; all data endpoints require a signed, HttpOnly, SameSite=Strict session.

## Evidence and score contract

- The **actual internal score** starts at 0/130 until manually reviewed, dated, linked, non-hypothetical evidence is registered and criterion scoring is assessed using allowed government score bins.
- Q3b requires reviewed benchmark evidence; Q1b is capped by reviewed A1–A4 coverage; Q7 requires signed documented availability; Q8's 20-point path requires directory evidence.
- Mandatory gates E1–E6, eligibility, TRL, innovation and state-of-the-art remain separate from the >=65 numerical threshold.
- Metadata links in `referenceEvidence` are **leads for verification** and never counted automatically.
- `status=reviewed` means reviewer-attested in the cockpit. No automatic file authenticity or independent third-party validation is implied.
- Every mutation is appended to audit and score-history. Export JSON and CSV; no personally identifying evidence is sent to external providers.
- This is a **single-admin pilot**. The owner labels track accountability; they are not multi-user sign-in accounts. One service replica with a mounted volume is required for durability.

## Scope & official sources

Official challenge: https://ised-isde.canada.ca/site/innovative-solutions-canada/en/artificial-intelligence-ai-decision-making-process-visibility-traceability-and-compliance-governance
Notice/amendments: https://canadabuys.canada.ca/en/tender-opportunities/tender-notice/cb-189-51083224
Deadline: 22 Dec 2026, 14:00 ET. Pass: 65/130 **and all mandatory criteria**. Government rules and amendments supersede this internal cockpit.

## QA

`npm test` tests evidence gating, scenario isolation, criterion scoring, team availability, and special Q8 conditions.
## Website language policy
Website and login use **English (en-CA) as the default** and **French (fr-CA) as the only other locale**. Previous localStorage `fa` preferences are ignored in favour of English. The public-facing and private workspace UI is LTR in both languages. Persian is restricted to internal conversation/planning, never a website language option. Changing language must not mutate the persisted evidence store.

## Public read-only evaluator demonstration (pre-submission)

Open `/tour` to view the same engine's **precomputed synthetic integrated assurance result** without signing in. The independent evaluator can see a fictional policy version change, affected/unaffected systems, measured before/after technical findings, completed/active/planned work states and a deterministic content receipt. The page uses **en-CA / fr-CA only**, with English default, and adopts the approved Obsidian/Champagne system without redesigning the private workspace.

The endpoint `GET /api/public/demo` returns **only** the fixed synthetic result calculated at service start. It does not accept input, expose sources, review journal or evidence, set a cookie, award ISC points or claim government acceptance. All `/api/assurance/*` endpoints and the internal application remain authenticated. See `test/server.integration.test.mjs` and `test/tour.test.mjs` for acceptance tests. This tour is not a TRL 5 demonstration or external scientific review.
