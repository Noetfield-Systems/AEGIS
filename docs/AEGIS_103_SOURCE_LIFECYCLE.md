# AEGIS v3.1 — AEGIS-103 Controlled Policy Provenance and Lifecycle

**State: experimental, synthetic end-to-end vertical slice; not verified TRL 5, official policy control approval or ISC acceptance.**

## Verified public source anchors (reviewed November 18, 2026)

Public catalogue: `assurance/source-registry.mjs`. There are six official source URLs: five requested ISC instruments and the supporting Directive scope guide. The registry contains three short excerpts anchored to official sections (Directive 5.1, AIA guidance 3.1, and Scope Guide introduction). Short-excerpt SHA-256 is not a checksum of the full governmental document. Version/effective dates and complete source bytes are unverified and intentionally null.

- Directive on Automated Decision-Making, section 5.1: https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32592
- Algorithmic Impact Assessment guidance, section 3.1: https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/automated-decision-making/algorithmic-impact-assessment.html
- Guide on the Scope of the Directive: https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/automated-decision-making/guide-scope-directive-automated-decision-making.html

These are source extracts and metadata, **not approved technical metric mappings**. The synthetic metrics in the reproduction fixtures are explicitly unrelated to the actual DADM/AIA legal compliance obligations.

## Three lifecycle states without duplicating the Golden Replay

Flow: official source reference → short excerpt → *proposed* control mapping → signed technical reviewer assertion when an explicit trusted Ed25519 public key is configured → policy diff → original Golden Replay (`assurance/replay.mjs`) → completed/native replay result, active rebase plan and future version selection → audit digest. A cryptographically valid signature proves only that a configured key signed exactly this mapping, not the reviewer's professional qualification, departmental authorization or applicability of a source.

Completed cases: native assessment rerun with fixed original fixtures and original state retained. In-progress cases: a new version is only assigned in the work plan when all impacted controls possess valid signatures from explicitly trusted keys; existing work is never auto-overwritten. Planned future cases: the policy version is selected by schedule and effective date, subject to technical mapping trust; no unexecuted future assessment is marked done.

Missing, tampered and expired evidence returns UNABLE_TO_DETERMINE; stale source digests invalidate previous technical-review signatures. All regulatory compliance results remain UNABLE_TO_DETERMINE. The application never changes existing readiness points, evidence history or customer data in this stateless experimental pathway.

## Reproduce and inspect

    npm test
    node scripts/governed-lifecycle-demo.mjs > /tmp/replay-first.json
    node scripts/governed-lifecycle-demo.mjs > /tmp/replay-second.json
    cmp /tmp/replay-first.json /tmp/replay-second.json

Existing authenticated workspace: `/api/assurance/run` POST `{mode:"governed-lifecycle",input:{...}}`. Read-only, auth-required: `/api/assurance/sources` and `/api/assurance/governed-demo`. The production process must read trusted reviewer key **only** from `AEGIS_TRUSTED_REVIEW_KEYS_JSON` configured server-side. By default it is unset, so the approval list is empty and no active policy version is authorized by technical mapping. Test private keys are generated ephemerally inside unit tests and are never deployed.

## Acceptance matrix and TRL

Machine-readable specific E1–E6 matrix: `ops/isc-e1-e6-matrix.json`. TRL evidence must describe original research method, datasets, environment, person/title, raw observations, scientific metrics, failure cases, and independent reproduction. CI is technical verification only, not independent human scientific or federal policy review.

### Current evidence inventory

| Artifact | Technical purpose | Evidentiary limitation |
| --- | --- | --- |
| `assurance/source-registry.mjs` | Section-based official URL and excerpt catalogue | Not full-source bytes/version attestation |
| `assurance/governed-lifecycle.mjs` | Signed mapping trust and active/future planning over Golden Replay | Technical signatures do not certify policy applicability |
| `assurance/replay.mjs` | Native deterministic historical metric recalculation | Synthetic, bounded first-party metrics |
| `test/governed-lifecycle.test.mjs` | Signature, tamper, expiry, lifecycle and negative cases | CI runner, not independent reviewer |
| `test/server.integration.test.mjs` | Authenticated service requests and zero evidence credit | Local server test, not public production authenticated POST |
| `scripts/governed-lifecycle-demo.mjs` | Byte-stable reproduction | Illustrative fixtures, not customer cases |
| `ops/isc-e1-e6-matrix.json` | Traceable requirement and evidence owners | Self-assessed, not government scoring |

### Current blocking proof absent

No archived official instrument versions with whole-file SHA-256, independently signed federal source-to-metric mapping approval, cross-tenant RBAC, representative integrated technical trial by an independent named evaluator, government-linked identity provider, or buyer receipt is demonstrated here. This product may continue deploying and selling tightly scoped pilots without making those claims.

## Current Canadian government challenge

https://www.ised-isde.canada.ca/site/innovative-solutions-canada/en/artificial-intelligence-ai-decision-making-process-visibility-traceability-and-compliance-governance

Specific challenge closing: **December 22, 2026, 14:00 Eastern**. Internal target: **December 18**. Official CanadaBuys tender prevails where wording differs. The source registry is read-only and does not fetch live policy webpages during customer requests. Website languages remain EN/FR only.

## Next P0

1. Archive and hash whole approved original federal source document versions; obtain review by a qualified named policy practitioner before treating a metric mapping as an official control.
2. Connect authenticated per-user reviewer identity / tenant separation and test negative scenarios.
3. Run a realistic multi-system, multi-organizational benchmark with expert reference labels and accurate time/cost baseline.
4. Capture independent environment and tester evidence and integrate into the exact ISC submission answers. Do not mark TRL 5 until demonstrated.