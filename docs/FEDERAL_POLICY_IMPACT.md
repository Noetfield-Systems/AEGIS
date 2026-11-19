# AEGIS-103 — Federal source-to-control impact compiler v0.1

Status: experimental synthetic vertical slice. Source URLs are referenced, but the actual policy bytes, effective revisions, section content and legal applicability are NOT independently attested. No ISC evidence credit is awarded.

## Reproduction (Node 22+)

    npm test
    node scripts/policy-impact-demo.mjs > /tmp/impact-a.json
    node scripts/policy-impact-demo.mjs > /tmp/impact-b.json
    cmp /tmp/impact-a.json /tmp/impact-b.json

## What this build actually does

- Registers five official federal sources, each labeled as POLICY, DIRECTIVE, ASSESSMENT_GUIDANCE, STRATEGY or GUIDANCE; none are falsely called an archived verified instrument.
- Takes caller-provided, content-hashed policy snapshots, section references and candidate metric-to-control mappings.
- Computes a deterministic clause diff, which proposed controls and AI systems are impacted, and queues COMPLETED / IN_PROGRESS / PLANNED work separately.
- Identifies unaffected systems explicitly, preserves source input records and emits a reproducible SHA-256 receipt.
- Never marks a mapping approved, never activates controls and never reports compliance MET. All proposed controls are UNABLE_TO_DETERMINE pending authorized expert review.

## Sources

1. Policy on Service and Digital: https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32603
2. Directive on Automated Decision-Making: https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32592
3. Algorithmic Impact Assessment: https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/automated-decision-making/algorithmic-impact-assessment.html
4. AI Strategy for the Federal Public Service 2025–2027: https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/gc-ai-strategy-overview.html
5. AI ethics and responsibilities: https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/ai-ethics-responsibilities.html

The sample selects the AIA source ID but uses entirely **synthetic** text. A source reference is not proof of a captured policy version.

## Interoperability

The existing authenticated, stateless POST /api/assurance/run supports mode policy-impact. It returns an EXPERIMENTAL_ONLY envelope. It does not write to /data, ratings, gates or recorded evidence. This planning compiler complements but does not replace the existing native golden-replay mode, which performs separate historical metric reassessments.

## Next research and engineering acceptance

1. Archive exact policy bytes, effective dates, section identifiers and SHA-256; independent policy reviewer confirms applicability and approved mappings.
2. Persist authorized reviewer sign-off, exceptions and immutable lineage; do not fabricate qualifications or approvals.
3. Integrate approved mappings with native historical evaluation, active/future work propagation and explicit five-state findings.
4. Validate when the DADM/AIA is applicable, including non-applicable cases.
5. Measure policy-impact precision and recall on blind reference labels, repeatability, missed-change error and independent verification.
6. Prove tenancy isolation, retention/deletion, portable deployment and tested EN/FR UI, workflows and reports.
7. Record a representative integrated-environment test with dated inputs/results and named qualified tester for any TRL 5 claim.

ISC challenge: https://www.ised-isde.canada.ca/site/innovative-solutions-canada/en/artificial-intelligence-ai-decision-making-process-visibility-traceability-and-compliance-governance
2026-11-18 GC AI Register consultation: https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/advancing-ai/progress/consultations-government-canada-ai-register-what-we-heard.html

AEGIS web UI remains English (en-CA) and French (fr-CA) only.