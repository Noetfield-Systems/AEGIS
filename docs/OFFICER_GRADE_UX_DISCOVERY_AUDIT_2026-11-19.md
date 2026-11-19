# AEGIS / Officer-Grade Product Discovery & Remediation Audit

**Date:** 19 November 2026 (Vancouver) · **Product:** AEGIS (Noetfield Systems Inc.) · **Status:** evidence-grounded engineering and UX audit, NOT a customer/ISC endorsement.

## Executive verdict

The pre-ISC AEGIS experience was not yet nationally distinctive or procurement-ready. The new Workbench and synthetic tour already provide a credible design direction, but code inspection revealed a first-visit language mismatch, single-case demo bias, lack of a visible decision provenance signature, weak human-verification boundaries and report printing incompatibility with the application CSP. These are fixable product issues; independent policy review, customer onboarding and TRL evidence are distinct outstanding scientific/operational work.

This audit combines (A) direct GitHub source inspection, (B) CI and Railway statuses, (C) official Canada ISC challenge outcomes and (D) documented product mechanisms of mature platforms. **An automated browser test is included in the same PR, but independently verified visual design, usability sessions and WCAG 2.2 AA certification are NOT claimed.** Screenshots produced by Chrome CI cover a synthetic local session only.

## Competitive learning, without copying any competitor

| Reference | Publicly documented product pattern | Original AEGIS translation |
| --- | --- | --- |
| [Credo AI](https://www.credo.ai/webinar/ai-governance-101-ai-governance-starts-with-a-registry) | AI use-case registry → policy controls → evidence validation and change tracking | AI system inventory + source-to-control provenance + measured replay |
| [IBM watsonx.governance](https://www.ibm.com/products/watsonx-governance/model-governance) | Model factsheets, historical lineage, monitoring and documentation | Reviewer-ready native metric facts and reproducible case dossiers |
| [Vanta](https://www.vanta.com/products/trust-center) | Continuously updated buyer-facing evidence and tailored trust-center views | Separate public demonstrator from private original evidence; verify status labels |
| [LangSmith](https://www.langchain.com/resources/what-is-langsmith) | Structured traces, evaluators, datasets, annotation queues and regression coverage | Interactive evidence chain, guided evaluation, reviewed experiments |
| [Holistic AI](https://www.holisticai.com/) | AI inventory, testing and risk assessment through the lifecycle | Assess system → changed policy → technical risks → human review |
| [Drata](https://help.drata.com/en/articles/7963882-operational-compliance-dashboard) | Priority issues, active controls, tasks and operational readiness | Prioritized evidence gaps with concrete owners and action reasons |

All are patterns to learn from, not proof that AEGIS already equals their scale or capabilities.

## Four observer journeys

**1. ISC evaluator:** Can I understand the differentiated technical method in 60 seconds? Can I execute a truthful end-to-end scenario and contrast an unchanged and changed result? Where are the source versions, mapping signatures, previous and recomputed metrics, human review and claim boundaries? **Improvements:** signature-grade decision lineage + three synthetic cases + honest report. **Still missing:** complete official source capture and representative independent TRL trial.

**2. Enterprise buyer:** Can I register my organization and AI systems, connect existing inventory, set the responsible reviewer, control privacy/retention and receive an exportable report? **Improvements:** guided source→result journey, report readability, mobile responsive UX. **Still missing:** true multi-user/tenant onboarding, external connectors, custom system intake, retained cases at enterprise scale.

**3. Investor/VC:** What proprietary wedge is more than a styled compliance dashboard? Can the product explain policy changes and regenerate native evidence more quickly/accurately than incumbent workflows? **Improvements:** visible original policy-control-system lineage and actual compiler-driven method sandbox. **Still missing:** blind baseline study, comparative speed/cost/accuracy data, paid pilot conversion.

**4. Technical auditor/security reviewer:** Do API calls enforce identity? Are findings deterministic? Can I reproduce original and proposed scores? Can user content inject scripts into reports? Are there hidden synthetic claims? **Improvements:** receipt-bound evaluation, escaped report, CSP-safe print, CI browser journey. **Still missing:** independent authenticated production read/write smoke, role-signed reviewer attestations, external security review.

## Prioritized detailed findings

| ID | Severity | Evidence / observed source-level issue | Action | State in this sprint |
| --- | --- | --- | --- | --- |
| UX-01 | P0 | Legacy login initially outputs Persian HTML despite public EN/FR-only contract | Replace actual first-paint text and nav with English, map fr-CA | Implemented; browser QA gate pending |
| UX-02 | P0 | One synthetic scenario falsely suggests fixed, preprogrammed success | Three mutually consistent, distinct native evaluation fixtures | Implemented |
| UX-03 | P0 | No distinctive navigable visualization of complete policy→review lineage | Six-node evidence chain on public tour and private Workbench with server-derived numbers | Implemented |
| UX-04 | P0 | Print button in report contained inline JavaScript blocked by CSP | Eliminate inline handler, provide no-script EN/FR browser Print guidance; isolated CSS CSP | Implemented |
| UX-05 | P0 | No real representative policy snapshot mapped to certified technical control | Archive official bytes and effective dates; qualified signed applicability review | Open — original external evidence required |
| UX-06 | P0 | Technical review is a single administrator display name, not an independent reviewer | Per-person authentication, actual role authority, signed review | Open |
| UX-07 | P0 | Data residency is Railway `sfo` and not Canadian | Private/on-prem/Canadian deployment qualification, migration plan | Open |
| UX-08 | P0 | ISC TRL 5 claim unsupported by representative, independent test | Named external trial, method, environment, data and results | Open |
| UX-09 | P0 | No proven real third-party connector suite | Add three adapters with real acceptance tests and evidence | Open |
| UX-10 | P0 | Synthetic results may be mistaken for actual policy compliance | Explicit fake-data legend, scientific and legal disclaimers, zero evidence credit | Existing + reinforced |
| UX-11 | P1 | Very small 9–11px metadata reduces professional legibility | Increase critical caption fonts, 44px controls and contrast | Implemented; independent WCAG audit open |
| UX-12 | P1 | No screenshot/run-based UI gate was present in existing CI | Headless Chrome EN/FR, native replay, mobile and screenshot artifact | Implemented in CI; pass to be independently checked |
| UX-13 | P1 | No mobile cross-browser evidence (Safari, Firefox, Android devices) | Browser matrix and actual-device QA with screenshots | Open |
| UX-14 | P1 | Workbench lacks user-owned system/policy registration and management | Tenant-scoped CRUD, intake forms, data provenance and policy selection | Open |
| UX-15 | P1 | Reviewer history shows simplified latest event; no full drill-down | Case timeline and diff of edits with reviewer role/receipt | Open |
| UX-16 | P1 | Experimental benchmark labels are self-authored, not independent ground truth | Blind externally labelled corpus and matched manual/baseline tasks | Open |
| UX-17 | P1 | Risk metrics limited: univariate PSI, Brier/ECE, exact fact matching | Contextual fairness, robustness, shift, causal/semantic safety tests with validation | Open |
| UX-18 | P1 | Report is self-contained HTML, PDF requires browser Print | Deterministic, accessible PDF with proper pagination and evidence attachments | Open |
| UX-19 | P1 | Evidence lifecycle retention/deletion is not organization-controlled | Tenant deletion, export, retention schedule and negative tests | Open |
| UX-20 | P1 | Bilingual dictionaries rely on post-render text replacement in legacy studio | Migrate to semantic UI message keys, CI missing-key checks and expert FR QA | Partially improved; migration open |
| UX-21 | P1 | Top-level root is a password wall, not a complete public commercial overview | Distinct public company/product positioning, technical walkthrough and buyer CTA | Partial — existing public /tour |
| UX-22 | P1 | No measured first-time completion or error-recovery study | 5 evaluator + 5 buyer moderated testing sessions with completion metrics | Open |
| UX-23 | P1 | No published supported connector matrix/version contract | Document and test interoperability boundaries | Open |
| UX-24 | P2 | Source badges / generic trust claims can sound certified | Keep “research”, “synthetic”, “not validated” unambiguous | Maintained |
| UX-25 | P2 | Visual polish still lacks external screenshot and design-system signoff | Compare Chrome screenshots at desktop/mobile in CI and test font/contrast | Technical automation implemented; human signoff open |

## Product signature and visual direction

**AEGIS · SEE THE DECISION. TRACE THE EVIDENCE.** Not another generic purple enterprise dashboard. Preserve existing obsidian, slate, muted champagne and ivory with restrained motion, generous spacing, legible value hierarchy and signature six-node provenance ribbon. Expose source → changed control → impacted systems → completed native replay → changed technical finding → pending human review. A user can select a node and navigate to the detailed evidence. The values must come from the native computation and not be decorative placeholder statistics.

## Acceptance gates for “top national-tier product”

1. The first paint of public tour, private login and Workbench uses English; French switch shows correct, native-quality French; no Persian site text.
2. Each publicly shown quantitative number is derived from a server-side deterministic experiment with an explicit synthetic / independent label.
3. An evaluator executes two different examples and observes **different** genuine native findings, including a changed rule that does not produce a false technical failure.
4. Desktop 1440px and mobile 390px headless Chrome tests pass without overflow or scripting exceptions, and screenshots are inspectable; Safari/Firefox/manual QA still required.
5. Downloadable report is safe against HTML/script injection, includes full native trace fields, clear review authority boundary and readable EN/FR print.
6. Public site cannot create cases or invoke private evaluation and records without authentication.
7. ISC Q1a/Q2/Q3a/Q3b responses have linked original, independently assessed scientific and business evidence. UI polish **never substitutes** for TRL 5 or true innovation evidence.

## Next high-value implementation packets after this release

**P0 engineering:** build real tenant-scoped organization + system intake + control mapping, with explicit existing synthetic isolation, then a per-user RBAC reviewer. **P0 research:** exact federal policy version bytes and qualified applicability signoff; scientifically valid, representative case study with independent evaluator. **P1 commercial:** buyer-facing product explainer and contact flow; pilot intake, deliverable and proof-of-value report. **P1 quality:** complete WCAG 2.2 AA, Firefox/Safari/real Android screen-reader validation, full EN/FR terminology check and manual review of GitHub Chrome screenshot artifact.

## Primary references

- [Official ISC challenge](https://www.ised-isde.canada.ca/site/innovative-solutions-canada/en/artificial-intelligence-ai-decision-making-process-visibility-traceability-and-compliance-governance)
- [Directive on Automated Decision-Making](https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32592)
- [Algorithmic Impact Assessment](https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/automated-decision-making/algorithmic-impact-assessment.html)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [LangSmith capabilities](https://www.langchain.com/resources/what-is-langsmith)
- [IBM model governance](https://www.ibm.com/products/watsonx-governance/model-governance)

**Claims:** “fixed in branch” means a code change has been made, not necessarily verified in production. Final release receipt must include the successful PR CI, separate browser run/screenshots and exact Railway deployment SHA before describing a deployed fix.
