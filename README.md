# Noetfield AEGIS — English/French Evidence Operations + Experimental AI Assurance

**Official product source: `Noetfield-Systems/AEGIS`**. Public product console: https://aegis-isc-web-production.up.railway.app/ · Private login: https://aegis-isc-web-production.up.railway.app/login · Assurance Workbench: https://aegis-isc-web-production.up.railway.app/workbench.

Dedicated EN/FR premium, private, evidence-gated operational application for **EN578-24ISC4/100**, with a separate experimental native AI evaluation lab and venture Company OS operating context. It is an internal estimate, **not a federal ISC assessment**. Scenario values 43/102/120 are analytical hypotheticals and do not seed real evidence.

## Current scope

- **Readiness Studio (deployed):** Evidence review, score/gates, 30-day milestones, team, tasks, interviews and commercialization records, protected login, audit/export.
- **Native Evaluation Lab (experimental):** authenticated stateless `POST /api/assurance/run`, versioned policy impact, historical native replay, AIA scoping, distribution shift, binary calibration and exact-reference output checks. No ISC evidence score or mandatory gate is granted by experiments.
- **Company OS (partial):** specialist roles, venture manifest, task/receipt schemas, real GitHub Actions scheduled daily work queue, first successful dispatch; no verified full autonomous coding chain or Sina OS endpoint.
- **Assurance Workbench (private, experimental):** six guided EN/FR stages from system context and policy diff through native replay, case review, bilingual print-ready technical dossier and E1–E6 acceptance gaps. This is not a validated commercial multi-tenant or TRL-certified product.

Canonical docs: [Product](docs/PRODUCT_SSOT.md), [Architecture](docs/ARCHITECTURE.md), [ISC evidence and benchmarks](docs/ISC_EVIDENCE_AND_BENCHMARKS.md), [Company OS](docs/COMPANY_OS.md), [30-day plan](docs/ROADMAP_30_DAY.md), [Canonical Tabler Design System v1.0](docs/DESIGN_SYSTEM.md), [Current status](docs/CURRENT_STATUS.md).

## Run

Node 22+; `npm install` loads the pinned MIT-licensed Tabler UI stylesheet (`@tabler/core@1.5.1`), served locally. No external CDN dependency. Set `ADMIN_PASSWORD` (12+ characters), `SESSION_SECRET` (32+ chars), and `DATA_DIR` (persistent, writable path). `npm start`; visit `http://localhost:3000`. For Railway, mount a **persistent volume at `/data`**, set `DATA_DIR=/data`, and use one replica. `GET /api/health` is public; all data endpoints require a signed, HttpOnly, SameSite=Strict session.

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

Open `/tour` to view the same engine's **precomputed synthetic integrated assurance result** without signing in. The independent evaluator can see a fictional policy version change, affected/unaffected systems, measured before/after technical findings, completed/active/planned work states and a deterministic content receipt. The page uses **en-CA / fr-CA only**, with English default, and adopts the canonical Tabler-backed AEGIS Graphite/Porcelain design system, with Dark/Light/System and shared iconography.

The endpoint `GET /api/public/demo` returns **only** the fixed synthetic result calculated at service start. It does not accept input, expose sources, review journal or evidence, set a cookie, award ISC points or claim government acceptance. All `/api/assurance/*` endpoints and the internal application remain authenticated. See `test/server.integration.test.mjs` and `test/tour.test.mjs` for acceptance tests. This tour is not a TRL 5 demonstration or external scientific review.

## Premium Guided Assurance Workbench — pre-ISC submission update

Access the private guided flow at `/workbench` after logging in via `/`. The page preserves the deployed Obsidian/Champagne institutional style and is fully separate from the public fixed-input demonstration at `/tour`.

### Working paths

- `GET /api/assurance/demo`: pre-existing synthetic scenario with policy versions, system inventory, native inputs and bound evidence.
- `POST /api/assurance/run`: first-party integrated native replay; no persistence or ISC score changes.
- `POST /api/assurance/cases`: preserve a computed-case receipt and derived summary in the existing hash-linked internal journal; raw input is not persisted here.
- `POST /api/assurance/reviews`: record an **internal operator** decision, required rationale and hash-linked audit event; display names are not independently authenticated.
- `POST /api/assurance/report-detail`: recompute the submitted bounded scenario under private authentication and download a detailed EN/FR HTML dossier with matched internal review event. Printing to PDF is available through the browser; no official endorsement is asserted.
- `GET /api/assurance/isc-matrix`: view project-owned, explicitly self-assessed E1–E6 proof gaps and next steps.

All report and evidence routes are authenticated and accept no language other than `en` and `fr`. The internal readiness evidence score is untouched. A successful guided demonstration is only technical validation on synthetic fixtures, not a representative TRL 5 study or complete federal compliance approval.

Research references: [Official ISC challenge](https://www.ised-isde.canada.ca/site/innovative-solutions-canada/en/artificial-intelligence-ai-decision-making-process-visibility-traceability-and-compliance-governance), [DADM Scope Guide](https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/automated-decision-making/guide-scope-directive-automated-decision-making.html), [AIA](https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/automated-decision-making/algorithmic-impact-assessment.html), and [Canadian AI Safety Institute guidance for evaluation reporting](https://ised-isde.canada.ca/site/ised/en/canadian-artificial-intelligence-safety-institute/what-information-should-ai-evaluators-share).


## Policy impact Benchmark Studio — compiler-derived experimental measurements

The private Workbench's **ISC coverage** stage now includes Benchmark Studio. The authenticated `GET /api/assurance/impact-experiment-demo` returns eight synthetic policy-change cases, including two intentionally conflicting synthetic reference labels. The `POST /api/assurance/run` native `impact-experiment` mode invokes the **actual** Policy Impact Compiler for each case, compares the compiler-derived prediction to its caller-supplied reference label, and reports TP/FP/TN/FN, precision, recall, specificity, Wilson 95% intervals and reproducible hashes. Downloadable JSON includes each comparison. Results are explicitly **not independently verified** and make no TRL 5 or competitive performance claim.

[Method, test protocol and limitations](docs/IMPACT_BENCHMARK_METHOD.md).

## Enterprise command-center experience (19 November 2026)

The public homepage **`/`** (also `/tour`) is now a genuine, EN/FR-only, interactive, dark enterprise assurance console — not a text-heavy landing or an image of a dashboard. The legacy authenticated ISC workspace is retained at **`/login`**, and the six-stage authenticated advanced assurance workbench remains at **`/workbench`**. The protected API and case/evidence storage are unchanged.

### Visible, interactive public functions

- Left-rail navigation across seven real views: Command center, AI Systems, Policy Intelligence, Evaluation Lab, Evidence Ledger, Reports & Exports, and Methodology.
- A four-metric overview derived **only** from `GET /api/public/demo` — source-policy changes, affected AI systems, completed historical native replays, and changed technical findings.
- CSS-generated control-outcome doughnut calculated from genuine native `findingsTrace` statuses, with an explicit metric legend.
- Search and scope filtering for the exact affected/unaffected synthetic AI system identifiers in the returned result. The UI never invents owner/vendor/risk values.
- Changed control evaluation table with before/after statuses and actual native metric values.
- Six-stage clickable policy → changed controls → impacted systems → replay → findings → receipt evidence graph with detailed explanations.
- Downloadable, **public synthetic-only** JSON receipt containing the server-calculated result and factual limitations; private records are never included.
- English Canadian default, French Canadian alternate; responsive mobile drawer and compact 390px layouts, keyboard labels and focus states, explicit research-only disclosure and revised headline hierarchy.

Benchmark directions: ModelOp Center (inventory and risk portfolios), Credo AI (system policy/control inventory), Rhindon RAIC (executive operational density), IBM watsonx.governance (evaluation and risk monitoring), Arize Phoenix and LangSmith (trace/metric drill-down), Vanta/Drata (trust and action workflows). These are design and product references, not capability parity or official endorsement.

**Boundary:** The public site reads only a frozen precomputed synthetic fixture from its existing safe endpoint. The exposed result makes no independent scientific claim, government compliance assertion, multi-tenant claim, TRL 5 certification or real customer statement.

### Manual acceptance and go-live

`npm test` and the automated Chromium browser-quality job validate the seven-view public console, real backend values, impacted-only filter, linked evaluation table, private login and workbench isolation, EN/FR and responsive 390px mobile. Review the captured screenshots before assigning visual quality signoff. No paid customer or real external policy change is implied by the acceptance evidence.

## Canonical institutional design system (binding, November 19)

AEGIS uses the **real, pinned MIT Tabler UI v1.5.1** and MIT Tabler Icons, not a fresh hand-built theme per task. Read [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) before changing public console, login or Workbench visuals. All three surfaces support persistent Dark / Light / System appearance, use the same icon family and spacing scale, and keep EN/FR only. Workbench uses a mobile drawer and responsive native components; do not alter API authorization, evidence metrics, ownership or persisted state when changing appearance.
