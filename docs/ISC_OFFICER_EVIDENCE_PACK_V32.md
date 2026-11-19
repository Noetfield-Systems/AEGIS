# AEGIS v3.2 — ISC Officer Evidence Pack (reproducible, synthetic)

**Product:** Noetfield AEGIS | Challenge EN578-24ISC4/100 | **Evidence status:** engineering experiment, not independently certified.  
**Source-of-truth implementation:** `assurance/officer-pack.mjs`; run `node scripts/officer-evidence-pack.mjs > officer-pack.json` after `npm install`.  
**Workbench:** authenticated `/workbench` → **ISC coverage** → **Download Officer Evidence Pack (JSON)**. Private API: `GET /api/assurance/officer-pack`.

The same bounded fixture is recomputed server-side on every pack request. No private customer evidence is copied into this pack; no private ISC readiness score is credited. The SHA-256 receipt is **content integrity**, not third-party signature, legal review or independent ground truth.

## 10-step acceptance trace

| Stage | Current executable proof | Missing for independent acceptance |
| --- | --- | --- |
| 01. Official source | Six federal publication references, URLs and checked excerpts in `source-registry.mjs` | Authoritative original bytes, applicable effective version, archive digest and legal-source confirmation |
| 02. Source-to-control | First-party synthetic clause/control compiler | Qualified policy expert's signed applicability and mapping decision |
| 03. Systems | Fixed two-system technical inventory; unaffected systems explicitly represented | Representative client-owned inventories and organization scope |
| 04. Data/model/output | `native.mjs`, `advanced-native.mjs`, `test/native.test.mjs` | Representative data, fair/robustness/semantic assessments and approved thresholds |
| 05. Change impact | `policy.mjs`, `impact-experiment.mjs` and source-version diff | Blinded independent labels with official versioned changes |
| 06. Historical + lifecycle | `replay.mjs`, `governed-lifecycle.mjs` | External completed/in-progress/new assessments and reviewer-authorized reassessment |
| 07. Human review | `review-journal.mjs` internal operator comments and hash chain | Identity-backed distinct reviewer, authorization and independent signature |
| 08. Before/after | `integrated.mjs`, deterministic measured control changes | Independently evaluated operational data and calibrated control acceptance |
| 09. Verification | Native receipts, replay regeneration and GitHub CI | Independent rerun with attested environment/person, source and label provenance |
| 10. Report | Print-ready EN/FR `integrated-report.mjs` and downloadable JSON | External report acceptance, accessibility review and official-procurement validation |

## Observed **synthetic** regression baseline (recalculate from script)

- Two synthetic AI systems; one affected, one unaffected.
- Two controls changed; one historical assessment recomputed; two technical findings changed.
- Eight self-authored impact reference cases, precision **0.75**, recall **0.75**, with **1 false negative and 1 false positive**. Wilson intervals are calculated by the engine, **not** proof of generalization.
- E1–E6 fully evidenced/independently accepted: **0 of 6**. The specific tests and missing evidence are embedded in `ops/isc-e1-e6-matrix.json`.
- Policy/legal determination: `UNABLE_TO_DETERMINE`; independently identified Reviewer: **none**; independently established TRL 5: **no**; Canadian data residency: **not verified** (current production Railway region `sfo`).
- All scores in the private ISC Readiness Studio remain subject to separately reviewed, original evidence; this pack never adds points.

## Reproduction and falsification

```bash
npm install --ignore-scripts --no-audit --no-fund
npm test
node scripts/officer-evidence-pack.mjs > /tmp/aegis-officer-a.json
node scripts/officer-evidence-pack.mjs > /tmp/aegis-officer-b.json
cmp /tmp/aegis-officer-a.json /tmp/aegis-officer-b.json
```

CI separately records the same output as an artifact. Inspect `technicalExperiment`, `lifecycleExperiment`, `syntheticBenchmark`, `sourceReferences`, `humanReview`, `essentialOutcomes` and `limitations`. The verifier should **attempt invalid inputs, changed labels and missing source proof**, not merely replay the successful fixture.

## Real proof still required

Commission a policy expert to approve exact official source clauses and archived snapshot versions; obtain independent labelled cases, a controlled manual baseline and one real-client integrated demonstration. Record named human reviewer, title, date, input hashes, operating environment, limitations, false negatives and negative tests. Only then update individual E1–E6 states with traceable evidence. Do **not** mark the complete system TRL5 based on local CI alone.
