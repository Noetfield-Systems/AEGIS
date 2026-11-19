# Architecture & Engineering Blueprint v1.0

## Today (implemented)
Node.js 22+ HTTP service; pinned @tabler/core@1.5.1 design dependency (self-hosted stylesheet); /api/auth/login protected by HttpOnly SameSite=Strict HMAC-signed cookie; /api/state and record CRUD; single serial file store under DATA_DIR; atomic tmp rename; evidence-gated scoring; JSON/CSV export; audit history; protected source-backed record definitions. Bilingual UI presentation adapter + dark premium visual skin. 8 existing unit tests for score integrity.
Railway project noetfield-aegis-isc; existing production service aegis-isc-web; mounted volume /data. Preserve data during repo source switch.

## Experimental native evaluation kernel (implemented, not full ISC E6)
Authenticated POST /api/assurance/run supports four stateless modes: data, classifier, output, replay. Implements deterministic metrics and conservative replay invalidation but does not evaluate semantic output truth, comprehensive fairness, five complete policy instruments or independently certify AI quality. It never mutates readiness evidence or grants ISC points. Verified by unit and HTTP integration tests. Policy replay is impact-planning, not completed native reassessment.

## Next architecture (not shipped)
Clients -> edge auth -> AEGIS API -> transactional PostgreSQL -> evidence object store (encrypted, versioned) -> policy obligation graph -> model/data/output evaluators -> replay scheduler -> independent verifier -> findings/events -> action queue.
Store entities: Organization, User, Role, AIAsset, PolicyInstrument, PolicyVersion, Control, ModelRun, Assessment, Finding, Evidence, EvidenceReview, ChangeEvent, ReplayRun, Benchmark, Risk, Task, Milestone, Engagement, Contract, Receipt.
Every record includes tenant_id and source lineage. Every mutation includes actor identity, timestamp, old/new hashes and idempotency key. Keep source content, reviewer action and model execution separate.
Five assessment states: MET, NOT_MET, PARTIALLY_MET, UNABLE_TO_DETERMINE, NOT_APPLICABLE with provenance and confidence / reviewer.
Policy replay must affect completed, in-progress and new assessments, and preserve historical originals.

## Contracts
- GET /api/health: liveness only, not evidence of assurance capability.
- GET /api/state: authenticated internal readiness state.
- POST /api/record, /api/rating, /api/gate, /api/delete: operator mutations with recalculation.
- GET /api/export: internal evidence JSON/CSV.
- Future POST /v1/assessments/replay, POST /v1/metrics/native, GET /v1/evidence-bundles/:id — **planned, not implemented**.
- Future POST /v1/org/work-packets + GET /v1/org/receipts/:id — integration design only.

## Security, continuity & release criteria
Current mode single-operator only; must not be marketed as customer multitenant. Add accounts/OIDC, CSRF defences, rate limiting durable across replicas, encrypted backups and restore drills, environment/tenant isolation, signed receipts and measured latency before external SaaS release. Protect personally identifying data and user-uploaded evidence. Use HTTPS-only domains, strict CSP, deploy/health checks, automatic rollback if failed. Data migration must be additive, versioned and reversible.

## v3.2 security boundary
`security/auth.mjs` uses signed anonymous client identifiers for per-client login attempt windows, and a separately persisted `DATA_DIR/aegis-auth-sessions.json` active-session registry. Logouts remove the stored session before acknowledging; credential/secret changes reset session generations on restart; the prior stateless session cookie is no longer accepted. This persists on the existing volume, without editing `aegis-isc.json` or `aegis-assurance-reviews.json`. Throttling is in-memory and **single-replica only**, not distributed identity protection. The CSV export neutralizes formula prefixes but preserves original values in JSON. Product is still single-admin, not multi-tenant.

`assurance/officer-pack.mjs` can recompute a reviewer-oriented synthetic dossier via authenticated `GET /api/assurance/officer-pack`; it never credits independent E1–E6 acceptance or ISC TRL. See [Officer Pack](ISC_OFFICER_EVIDENCE_PACK_V32.md) and [TRL dossier](TRL_EVIDENCE_DOSSIER_V32.md).

## E2 interoperability and public privacy contract (v3.4 branch)

`assurance/interop.mjs` validates three versioned, **synthetic reference exchange formats** via authenticated `GET /api/assurance/adapters`, `GET /api/assurance/adapters/examples`, and `POST /api/assurance/adapters/validate`. Data normalization is read-only and explicitly drops non-allowlisted OTel attributes such as raw prompts/completions. No external live connection or enterprise ingestion is claimed. Public `GET /api/public/workbench`, `GET /api/public/workbench-result?scenario=<fixed-id>`, `GET /api/public/impact-preview`, `GET /api/public/workbench-report` serve ONLY server-precomputed synthetic results and never read private application evidence. `GET /api/auth/status` returns only whether the current session is authenticated; it never returns user secrets. This restores meaningful public product walkthrough while protecting the existing DATA_DIR and review journal.
