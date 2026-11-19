# AEGIS policy-impact experiment — reproducible benchmark methodology v0.1

## What is being measured

The tested system is **the actual `compilePolicyImpact()` first-party implementation**, not a hand-entered predicted label. Every case includes a fully versioned synthetic policy change, a target AI system and a separately supplied Boolean reference label. The engine determines whether that system appears in `impactedSystems`. The experiment compares the resulting prediction with the reference label.

## Test inputs and deliberate label disagreements

Fixture: `fixtures/impact-experiment.mjs`, dataset `synthetic-benchmark-demo-v1`. Eight controlled source/system cases explore a modified control clause, an unchanged policy, a change affecting multiple systems and a retired clause. Two labels (`changed-B` and `owner-B`) deliberately disagree with the compiler result to demonstrate nonzero false negatives and false positives. **These are not external domain-expert labels** and must not be reported as achieved accuracy on Canadian government systems.

On this authored illustration, the expected confusion counts are TP=3, FP=1, TN=3, FN=1; precision, recall and specificity each 0.75. These figures describe only this synthetic experiment. The application calculates them at execution time; no outcome is hardcoded into the user interface.

## Statistics

Precision = TP/(TP+FP); recall = TP/(TP+FN); specificity = TN/(TN+FP). When a denominator is zero, return null instead of claiming 100% accuracy. Confidence intervals are 95% Wilson score intervals under an independent Bernoulli model. They do not correct for dependent examples, selection bias or unreliable reference labels.

## Execution

    npm test
    node --test test/impact-experiment.test.mjs

Private authenticated API:

    GET  /api/assurance/impact-experiment-demo
    POST /api/assurance/run  {"mode":"impact-experiment","input":{...}}

Private Workbench: `/workbench` → ISC coverage → Benchmark Studio → Run policy benchmark. The JSON export preserves native per-case predictions, source hashes, reference labels, metric calculations and method limitations.

## Evidence and authority boundary

- The reference labels are caller-authored and **NOT verified by an external independent evaluator**.
- No external manual or competing technology baseline is measured.
- The fixture is synthetic and deliberately limited in size and source diversity.
- An authored synthetic dataset cannot establish ISO/IEC 42001, AI safety performance, statutory compliance, a TRL level, a government decision or procurement success.
- This research instrument is a precursor to a blinded, representative study with named expert annotators, documented independent labels, stratified sampling, failure taxonomy and versioned original source documents.

Guidance: Canadian AI Safety Institute, *What information should AI evaluators share?* https://ised-isde.canada.ca/site/ised/en/canadian-artificial-intelligence-safety-institute/what-information-should-ai-evaluators-share — explicitly document evaluation method, limitations, uncertainty and test set contamination.

Challenge: https://www.ised-isde.canada.ca/site/innovative-solutions-canada/en/artificial-intelligence-ai-decision-making-process-visibility-traceability-and-compliance-governance

English/fr-CA website languages only; no Persian website copy.