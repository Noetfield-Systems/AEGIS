# AEGIS Golden Assurance Replay — executable test contract

Status: **experimental synthetic vertical slice**, not a Canadian-government policy determination, independent audit, TRL certification, or ISC score. Work items: AEGIS-102 and AEGIS-104; supporting negative-evidence work for AEGIS-103.

## Reproduce

Requirements: Node.js 22+. No provider keys, remote services or production data required.

```bash
npm test
node scripts/golden-assurance-demo.mjs > /tmp/aegis-golden-replay.json
```

The second command must exit zero and emit a JSON object with `methodVersion=golden-replay-v0.1.0`, a stable `sourceInputHash`, and a stable `receiptHash`. Inspect `assessmentsReplayed[].controlChanges` for original recorded findings, independently recomputed prior findings, and recomputed findings under the changed policy. Run twice and compare output bytes to check deterministic regeneration. A hash confirms exact bytes of this calculated record; it does **not** establish an external signature, authorized review or scientific validity.

## Synthetic Golden scenario

- Two systems: synthetic-A and synthetic-B.
- Three controls: duplicate rate, classifier accuracy and deterministic output phrase pass rate.
- Completed assessments recorded under synthetic-policy-v1, all with MET recorded findings.
- Change to synthetic-policy-v2 tightens data duplicate-rate tolerance from <=0.5 to <=0 and output pass-rate tolerance from >=0.5 to >=1.0.
- Native evaluators recompute duplicateRate=0.333333 and passRate=0.5 on input fixtures bound to their original SHA-256 hashes.
- Only synthetic-A is affected, producing two NOT_MET technical results; synthetic-B is explicitly unaffected.
- Source assessment is preserved exactly; a distinct replay record contains changes, hashes, rationale and PENDING_HUMAN_REVIEW.
- Missing, invalid or input-unbound evidence cannot yield MET.
- Changes to historical input values are rejected by the stored input hashes.

`fixtures/golden.mjs` is the canonical fixture constructor. It uses artificial test data, NOT approved controls from any Canadian policy instrument. No record is added to the persisted internal readiness store.

## Interface and guardrails

Existing authenticated API:

```http
POST /api/assurance/run
Content-Type: application/json

{"mode":"golden-replay","input":{...synthetic fixture...}}
```

The existing response envelope remains `{status:"EXPERIMENTAL_ONLY", evidenceCredited:false, result}`. The only new `runNative` mode is `golden-replay`; existing `data`, `classifier`, `output`, and `replay` remain unchanged.

`replayCompleted(input, evaluators)` is deterministic and stateless. It accepts bounded policy versions, controls, systems, completed assessments, input hashes and per-control evidence. Only `data` / `classifier` / `output` native evaluator metrics can create a technical finding. No LLM judges metric values.

Every technical finding is provisional. Actual Canadian-policy applicability, approved control mappings, qualified independent reviewer signatures, transactionally persisted versioned assessments, multi-tenant RBAC, comprehensive model evaluation, performance benchmarks and a defensible integrated TRL dossier remain separate open tasks.

## Scientific verification still required

1. Expert-reviewed real-source policy clauses, version metadata and applicability conditions.
2. Blinded ground-truth change-impact dataset with precision/recall confidence intervals and error analysis.
3. Native model/output quality cases matching the intended government decision scenarios.
4. Authorized human review workflow, external verifier, storage/audit lineage and resilience testing.
5. Equivalent measured manual baseline and independently documented competitive comparisons.
6. Tested interoperability and federal EN/FR coverage.
7. Realistic environment demonstration appropriate to the claimed current TRL.

**ISC acceptance claim: none.** This commit demonstrates a bounded reproducible technique, not completion of essential outcomes E1–E6.
