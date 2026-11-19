# AEGIS E6 v0.2 — first-party bounded risk metrics

These three standalone native evaluators extend the existing AEGIS `assurance/native.mjs`; they are not production-scale or scientific validation of the full ISC Essential Outcome 6.

## Data: Population Stability Index

Mode: `distribution-shift`. Input: `datasetVersion`, `modelVersion`, `baseline[]`, `current[]`, optional bin count and PSI threshold. Returns a smoothed univariate PSI, histogram and mean difference; null if either population is empty. No inferential drift conclusion is made. Statistical sampling and data ranges must be reviewed.

## Model: binary probability calibration

Mode: `binary-calibration`. Input: binary labels, bounded probabilities, dataset/model versions, bin count and optional Brier threshold. Returns exact first-party Brier score and fixed-bin Expected Calibration Error, with bin counts and observed rates. Unknown or invalid labels are rejected; empty data yields null.

## Output: explicitly labelled factual grounding

Mode: `grounded-claims`. Input: controlled cases, each with exact `referenceFacts`, `outputClaims`, and `abstained` boolean; dataset/model versions. Returns exact-match supported and unsupported claim counts, claim precision and abstention accuracy. This is not semantic entailment, a universal hallucination detector, factual source validation or a safety assessment. Zero claims makes grounded precision null.

## Evidence contract

All results are deterministic and include `evaluationId`, `evaluatorVersion`, `inputHash`, `datasetVersion`, `modelVersion`, `metricDefinition`, `measuredValue`, `threshold`, `generatedEvidenceRef`, measured details and explicit limitations. An optional technical threshold is not a legal compliance control. All compliance findings remain UNABLE_TO_DETERMINE and ISC evidence credit is always false.

## Reproduction

    npm test
    node --test test/advanced-native.test.mjs

API under the existing session: POST `/api/assurance/run` with `mode` set to the name above and `input` to a bounded JSON fixture. Existing web UI is en-CA/fr-CA only. No new production persistence or database migration.

Independent validation still needed: representative real-life data distributions, domain calibration intervals, expert-labelled grounded-output datasets, fairness and safety evaluation, error analysis, R&D experiment design and named independent reviewer. These are intentionally not claimed here.