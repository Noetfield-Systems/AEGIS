# AEGIS — TRL & Independent Scientific Evidence Dossier v3.2

**Date:** 19 Nov 2026 · **Classification:** in-progress self-assessed experimental dossier · **Not a TRL certificate**.

## Proposed integrated technology

AEGIS combines source-cited policy obligation references, a versioned control-impact compiler, first-party data/classifier/output measurements, historical assessment replay, governed lifecycle actions, operator review journal, and evidence receipts. The experimental path runs in one Node 22 service on Railway. The public and private demos use **synthetic** input; the deployed service is not a representative Government of Canada operational environment.

## Technical method actually executable

Run `node scripts/officer-evidence-pack.mjs` twice and compare bytes. `test/officer-evidence-pack.test.mjs` asserts all essential-outcome claims remain partial; `test/security-remediation.test.mjs` covers logout revocation, lockouts and CSV formulas; `test/server.integration.test.mjs` covers authentication, bounded native evaluation, export, source and finding provenance. Save CI commit SHA, job logs, Node version, schema, exact fixture digests, tool versions, invalid cases and report/receipt artifacts for each execution.

## Experimental observations (not population performance)

| Experiment | Existing synthetic observation | Scientific limitation |
| --- | --- | --- |
| Impact selection | 8 labelled cases, TP=3, FP=1, TN=3, FN=1; precision = recall = 0.75 | Labels deliberately synthetic and not independently audited; small correlated sample |
| Integrated replay | Changed controls 2; impacted systems 1; original assessment replayed 1; changed technical findings 2 | Controlled fixed fixtures, not real federal applicability |
| Lifecycle | A completed assessment replay plus distinct in-progress/planned reassessment handling | Technical planning not an authorized real-world case workflow |
| Review journal | Hash-linked comments under one authenticated administrator | No per-person independent reviewer identity or external signature |
| Security | New revocable session model, scoped rate guard, CSV hardening, negative tests | Single-instance implementation; not multitenant enterprise IAM, penetration test or recovery proof |
| Deployment | GitHub CI + Railway app/volume + web demo | Railway `sfo` is **not** proof of Canadian data residency, Canadian federal authorization, or representative pilot |

## Evidence required for a defensible current TRL claim

1. **Use context:** identify a representative organization, its AI inventory, intended decision consequence, its access policies and named environment operator.
2. **Authoritative policy:** archive complete source text/PDF, effective date and section identifiers; independent policy expert must sign exact applicability and controls.
3. **Independently labelled impact dataset:** freeze case IDs, input sources and blind expert labels; register protocol before reviewing predictions. Include negative/edge cases, class imbalance and false-negative cost.
4. **Manual baseline:** run the same inputs and output contract manually with time/quality logs, blinded to AEGIS predictions. Disclose all failed and excluded cases. Any competitor comparison requires permission and equivalent scope.
5. **Statistical reporting:** report TP/FP/TN/FN, precision, recall, specificity, Wilson uncertainty with independence caveat, per-case latency, system/resource consumption and variance across scenarios.
6. **Distinct authorized reviewer:** independently authenticated reviewer decision and exact binding to source/input/metric receipts; test tamper and revoked credential cases.
7. **Data controls:** distinct tenants, negative authorization tests, retention/deletion, encrypted backups and an actual restore rehearsal; choose a suitable private or Canadian deployment for the actual requirements.
8. **Validation:** named people/title/date, independent rerun log, code SHA, host and dependency versions, replay receipts and a clearly stated environment fidelity justification.

## Claim matrix (current)

- TRL5 formally/independently substantiated: **NO**.
- E1–E6 fully verified: **0/6**; implementation is **partial on every essential outcome**.
- Independently signed expert mappings: **none verified**.
- External labelled truth set and blind review: **none verified**.
- State-of-the-art superiority (Q3b): **not measured**.
- Actual partner/site, contract authorization and real client pilot: **not verified**.

**Use in Q2/Q3:** This dossier supports honest reporting of completed R&D and a clear research-validation plan. It does not authorize stating TRL5, guaranteed eligibility or superiority over IBM/Credo/Microsoft/ModelOp. The Founder should verify any formal programme interpretation against official amendments before submission.
