# Architecture & Engineering Blueprint v1.0

## Today (implemented)
Node.js 22+ HTTP service; zero runtime dependencies; /api/auth/login protected by HttpOnly SameSite=Strict HMAC-signed cookie; /api/state and record CRUD; single serial file store under DATA_DIR; atomic tmp rename; evidence-gated scoring; JSON/CSV export; audit history; protected source-backed record definitions. Bilingual UI presentation adapter + dark premium visual skin. 8 existing unit tests for score integrity.
Railway project noetfield-aegis-isc; existing production service aegis-isc-web; mounted volume /data. Preserve data during repo source switch.

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
