# AEGIS — Benchmark-Driven Enterprise Product UI Matrix

**19 Nov 2026 · Owner: Noetfield Systems Inc. / AEGIS only**
**Scope:** The request concerns the user's AEGIS screenshot and comparison with Rhindon Cyber and Bankr. This is a **product-design reference matrix**, not an assertion of equivalent capabilities or independent competitor UX testing.

## The design failure being corrected

The old `/tour` was a sparse, linear marketing page with an oversized Hero, stacked text/panels, minimal navigation, no true interactive product information architecture and weak visual comparison with multi-view enterprise consoles. Passable software tests did **not** establish visual parity with mature products.

The new public homepage `/` (alias `/tour`) is a functional EN/FR assurance command center with seven screens, real native-derived charts, data tables, policy source version comparison, evidence graph, action queue, search/filter, and public-only JSON export. Authentication remains separate at `/login`; advanced replay remains private at `/workbench`.

## 12 benchmark sources and patterns

| Benchmark | Sources | Specific observable pattern | AEGIS original implementation | Not yet matched |
| --- | --- | --- | --- | --- |
| **Rhindon Cyber RAIC** | https://raic.rhindoncyber.com/for-executives ; user-provided Executive Summary screenshot | Clear left product navigation, compact executive KPIs, risk distribution, approval states, board-level reports | Fixed rail navigation, compact metrics, control-state chart, action queue | Real portfolio/risk distribution, incidents, interactive geographic/risk classification; cannot invent from two synthetic records |
| **Bankr** | https://bankr.bot ; user-provided actual chat screenshot | Restrained dark console, grouped navigation, crisp action icons, clear central interaction and composable functions | Permanent grouped product navigation, differentiated actions, consistent custom outline iconography | General assistant chat and action execution are not an AEGIS requirement or supported public behavior |
| **ModelOp Center** | https://www.modelop.com/ai-governance-software ; https://modelopdocs.atlassian.net/wiki/spaces/MDHV/pages/3159982166 | Executive dashboard, use-case/model inventory, lifecycle and risk breakdown | Connected KPIs, public synthetic system register and impact filters, evaluation status | Customer-created systems, enterprise portfolio, control ownership, monitoring |
| **Credo AI** | https://www.credo.ai/product | AI use-case inventory and continuous policy/control governance | Policy-version intelligence, impact graph, public inventory | Verified source snapshots, authoritative policy-pack mapping, enterprise questionnaire coverage |
| **IBM watsonx.governance** | https://www.ibm.com/products/watsonx-governance/model-governance | Model information, state transitions, evaluation and monitoring views | Native before/after control measurements + regulation not-determined status | Drift monitoring in production and real model telemetry |
| **Holistic AI** | https://www.gov.uk/ai-assurance-techniques/holistic-ai-governance-risk-and-compliance-platform | Lifecycle risk posture with role-based reporting | Dedicated areas for governance, policy intelligence and technical evaluations | Complete risk posture, organization roles and validated legal controls |
| **Arize Phoenix** | https://arize.com/phoenix ; https://github.com/Arize-ai/phoenix | Trace and evaluation drilldown, source dataset, instrumentation | Clickable six-node policy-to-result evidence graph; actual raw result receipt | OpenTelemetry event-level trace, dataset management and production span instrumentation |
| **LangSmith** | https://www.langchain.com/langsmith | Dataset experiments, evaluation comparison, trace inspection | Native result comparison, receipt-linked output and private experiments | Rich longitudinal experiments, evaluator datasets and human annotation queues |
| **Vanta** | https://www.vanta.com/products/trust-center ; https://help.vanta.com/en/articles/11345504-risk-snapshots-and-reports | Risk snapshots, exportable trust posture and controlled evidence sharing | Public/privacy-separated evidence export, versioned result UI, explicit research boundaries | Permission-scoped client Trust Center, verified security evidence sharing |
| **Drata** | https://drata.com | Evidence automation, status dashboards and remediation work | Change-driven action queue and private evidence/workflow access | Validated control integrations, remediation ticketing, reviewer and control ownership |
| **Galileo AI** | https://galileo.ai | AI evaluation, production observability and debugging workflows | Native evaluation page and test-result status visualization | Real input/response traces, user-specific contextual quality metrics |
| **Arthur AI** | https://www.arthur.ai | Monitoring and risk governance of AI/ML models | Per-control technical findings and policy impact inventory | Production-grade monitoring, incident response, customer model access |

## UX design system — implement, do not imitate branding

- **Surface:** low-glare near-black (#0a0b0e) rather than purple/blue decorative gradient. Distinguish rail, top bar, cards and content areas with 1px neutral borders and deliberate material elevation.
- **Primary accent:** restrained champagne (#e4bd72) for focus, primary actions and measured policy change. Use red only for actual measured failed technical outcomes; green only for actual `MET` outcomes.
- **Typography:** Manrope for strong headings and operational labels; DM Sans for readable body. Avoid 9px labels in critical content, keep icons crisp by inline SVG symbols, and use focus states.
- **Immediate time-to-value:** real product KPIs + chart + impact table above the fold. Remove the 600px marketing Hero that users criticized.
- **Real interaction:** functional 7-view left rail; search/filter; contextual evaluation and policy views; click-to-inspect six-node evidence chain; download real synthetic evidence JSON; native API refresh.
- **Public/private separation:** public `GET /api/public/demo` stays precomputed, read-only and synthetic; `/login` requires administrator session; `/workbench` uses authenticated native evaluators.
- **Responsive integrity:** 1440 and 390px browser tests, mobile menu and backdrop, no horizontal overflow in test view, English default and French alternate.

## Release acceptance / follow-up

**P0 verified in CI (must cite actual run):** correct data provenance, no invented risk values, seven navigable screens, French switch, public read-only boundary, private login and native workbench, desktop/mobile screenshot artifact.

**P1 still open:** true multi-organization AI system and control registration, enterprise user permissions, full AIA / source-policy mapping, production monitoring, externally validated performance and comparative UX testing with actual Canadian government evaluators.

**Do not claim:** model-compliance certification, paid customer adoption, scientific TRL level, representative real-world benchmark, 1:1 feature parity or government endorsement from this sprint. Visual comparisons are qualitative, grounded in the source screenshots and public product documentation.
