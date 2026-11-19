# AEGIS Integrated Assurance v0.1 — execution and scientific boundary

Status: SYNTHETIC ENGINEERING DEMONSTRATION. **No TRL 5 / federal compliance / formal policy review / independent verifier claim.**

## What was actually implemented

- A connected Policy Impact -> Native Historical Replay runner in `assurance/integrated.mjs`. The engine requires identical source-policy versions, changed control identifiers, per-control metric contracts, affected and unaffected systems, and completed assessment coverage.
- Deterministic data/model/output metrics are executed through existing `assurance/native.mjs` first-party kernels. Changed findings retain the original recorded finding, recomputed prior finding and recomputed technical finding.
- Different reassessment work for completed, ongoing and planned jobs; rejects inconsistent coverage rather than awarding favorable results.
- Bounded decision-what-if simulator uses fixed scores and thresholds; its outputs are not causal impact estimates or a replay of a deployed AI model.
- Label-based precision, recall, specificity, accuracy and 95% Wilson intervals for a bounded benchmark dataset. Labels, independence and representative sampling require external proof.
- Append-only, content-hash-chained review journal in a separate `/data/aegis-assurance-reviews.json` file. This private application currently uses ONE shared admin account: reviewer display names are **not independently authenticated** and review events are operator assertions, not authoritative government approvals.
- EN/FR LTR internal audit HTML export. No Persian website locale, no auto-translation of user evidence. This export is not a validated accessible PDF.

## Reproduce locally (Node 22+)

    npm test
    node scripts/integrated-assurance-demo.mjs > /tmp/aegis-int-a.json
    node scripts/integrated-assurance-demo.mjs > /tmp/aegis-int-b.json
    cmp /tmp/aegis-int-a.json /tmp/aegis-int-b.json

## Authenticated routes

| Route | Method | Effect |
| --- | --- | --- |
| `/api/assurance/demo` | GET | Return synthetic fixture, no state changes |
| `/api/assurance/run` | POST | Existing stateless modes plus `integrated`, `decision-what-if`, `impact-benchmark`; no state changes |
| `/api/assurance/cases` | POST | Run synthetic integrated scenario and store summary/hash only; no score updates |
| `/api/assurance/cases` | GET | View case summaries and review events |
| `/api/assurance/reviews` | POST | Append internal admin review event, validated receipt target, reason and hash chain |
| `/api/assurance/report?lang=en|fr` | GET | Download case review HTML in EN or FR |

## Official source and applicability boundaries

The Directive on Automated Decision-Making and the Algorithmic Impact Assessment must be interpreted in context. AIA review is relevant when a covered system's scope/function changes; not every experimental AI system or organizational decision is under the directive. This implementation still uses **synthetic clauses**, not an independently verified archived federal policy source.

Official reference: https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32592
Official AIA lifecycle instructions: https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/automated-decision-making/algorithmic-impact-assessment.html
Official scope guide: https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/automated-decision-making/guide-scope-directive-automated-decision-making.html
Official ISC challenge: https://www.ised-isde.canada.ca/site/innovative-solutions-canada/en/artificial-intelligence-ai-decision-making-process-visibility-traceability-and-compliance-governance

## Acceptance matrix (not yet satisfied by demonstration)

| Requirement | Current bounded proof | Still needed |
| --- | --- | --- |
| E1 policy alignment | Synthetic policy impact and historical native replay identity joined | Expert-validated real federal source capture, revisions, applicability, executable rules |
| E2 interoperability | Authenticated JSON API in this application | Three genuine end-to-end third-party adapters, contract and negative tests |
| E3 access & data lifecycle | Single-admin cookie + separate local review ledger | Per-user identity, tenant isolation, RBAC, retention/export/delete and controlled Canadian/on-prem deployment |
| E4 frameworks/five states | Five source URLs and five native finding-state labels | Five independently reviewed control mappings with actual policy provenance |
| E5 human oversight | Internal operator append-only review history and bilingual HTML | Actual role-bound multi-reviewer workflow, immutable audit store, independent signatures, appeal process |
| E6 native evaluation | Data schema, duplicate, classifier and phrase-rule first-party metrics | Context-specific calibration, drift, fairness, robustness, safety and uncertainty benchmark |
| TRL 5 | Unit / API integration CI and Railway service health | Integrated representative environment test, named external tester, full dated method, results, reproducibility dossier |
| Q1b additional outcomes | Two-language UI and basic export | Portable deployment, organizational isolation, complete bilingual workflow/report accessibility, integration alerts |
| Q3 innovation | Novel design hypothesis only | Baseline measured manual and actual commercial equivalents; blinded labels, statistical intervals and validated methods |

### Stored-data constraints

No existing readiness evidence is migrated, overwritten, translated, or credited. The review journal is a **separate file on the existing persisted Railway volume**, and its metadata hashes are not external cryptographic signatures. A production service can demonstrate this workflow without being an approved government platform.

### Next implementation sequence

1. Capture exact published source snapshots, SHA-256 and effective dates; obtain independent qualified policy mapping review and a genuine applicability decision.
2. Per-user reviewer identity and tenant isolation with negative access tests; integrate Shield/Verification through explicit adapters, without merging their repositories.
3. Benchmark 50+ blinded policy change cases, varying true changes and nonchanges, with reference labels signed by an independent evaluator; calibrate Precision/Recall CI.
4. Three real integration adapters and on-prem/private/Canadian-hosted staging proof; EN/FR full workflow browser evidence and accessible exports.
5. Prepare TRL Dossier, labor/cost budget, named qualified specialists and ISC application answer-to-evidence crosswalk before the December 22 deadline.
## AIA applicability and change-triggered reassessment triage

New `aia-scope` native mode accepts explicit caller-asserted federal jurisdiction, deployment stage, nature of the administrative decision, AI's role in decision-making, prior AIA review date and changed functionality/scope/model/data/automation/context.

Outputs are strictly provisional: `POTENTIALLY_IN_SCOPE_REQUIRES_REVIEW`, `LIKELY_OUT_OF_SCOPE_REQUIRES_DEPARTMENTAL_CONFIRMATION` or `UNABLE_TO_DETERMINE`. Every case's compliance `finding` remains `UNABLE_TO_DETERMINE` until a qualified departmental authority checks the record. An in-scope material change flags `SCHEDULE_AUTHORIZED_AIA_REVIEW` without creating or modifying an actual AIA questionnaire.

The system must never infer that human-in-the-loop automatically excludes the Directive: assisting an administrative decision can still be within scope. Conversely, research-only and non-administrative systems should not be automatically placed under every federal requirement.

Official references:
- [Guide on the Scope of the Directive on Automated Decision-Making](https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/automated-decision-making/guide-scope-directive-automated-decision-making.html)
- [Algorithmic Impact Assessment](https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/automated-decision-making/algorithmic-impact-assessment.html)

This is **not** the mandatory 65-risk-question AIA questionnaire, not a federal policy interpretation certification, and not an automated legal opinion.
