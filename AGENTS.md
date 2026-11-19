# AEGIS — Agent Execution Contract v1.0

Canonical owner: Noetfield Systems Inc. Product: AEGIS. Repository: Noetfield-Systems/AEGIS.

## Read order
1. docs/PRODUCT_SSOT.md
2. docs/COMPANY_OS.md
3. docs/ARCHITECTURE.md
4. docs/ISC_EVIDENCE_AND_BENCHMARKS.md
5. docs/ROADMAP_30_DAY.md
6. docs/DESIGN_SYSTEM.md — binding UI foundation before every design edit

## Public interface language — binding Founder decision (November 18, 2026)
- **AEGIS web interface: English (en-CA) by default and French (fr-CA) as the only alternative.** No Persian / FA locale, Persian language toggle, or RTL pages on the website.
- This applies to the login, readiness workspace, Assurance Engine, labels, forms, errors, status messaging and report previews.
- Protect existing user-entered data: changing UI language must never rewrite stored evidence or free-text records.
- English/French UI availability is not in itself evidence that the federal additional bilingual outcome has been completely tested.
- Spoken/planning communications with the Founder may be in Persian; this does not authorize a Persian public interface.

## Rules
- Work here; do not relocate product ownership to Noetfield's website repository, TrustField, BuildRelay, or Cairn.
- Sina Founder OS is supervisory authority. AEGIS Company OS is the venture-specific orchestration context. Existing Company OS, Runway, Paperclip, and Verifier execute through explicit contracts; do not duplicate their runtimes.
- Each daily iteration: verify current state; select highest-impact unblocked task; implement; test; open PR; independent verify; merge/deploy only when validated; record exact receipts and next action.
- Never make up interviews, commitments, paying customers, government approvals, TRL ratings, published benchmarks, or collected funds.
- Baseline weak/evidence-built/stretch scores 43/102/120 are hypothetical; score only internally reviewed real evidence.
- Product viability and sales are priorities. Security of evidence, project isolation, access authorization and correct financial effects remain necessary.
- Do not reset or overwrite persistent Railway volume. Do not publish secrets or credentials.
- Avoid status-only work when a real code, evidence, customer, or shipment action is available.
- Each report: actual commit SHA, tests, deployment, blocker, evidence URL, next owner/action/due.

## Permanent Design System Lock — November 19, 2026
- All public console, login, private ISC and Assurance Workbench changes **MUST** follow [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).
- Use real pinned MIT Tabler UI v1.5.1, original Tabler Icons, and AEGIS graphite/porcelain design tokens. No ad hoc AI-generated generic themes, purple/brown gradients, inconsistent icon packs or oversized static Hero components.
- Dark / Light / System are required and persistent across pages. Reuse one source of truth; never implement isolated color pickers.
- Mobile layouts must pass real Chrome tests at 320px and 390px, with keyboard and focus behavior, no horizontal document overflow and usable offcanvas controls. Preserve EN/FR and native technical evidence calculation.
- Before claiming a premium release, review actual screenshots AND run authenticated and unauthenticated E2E; CI success alone does not equal aesthetic parity with the best market products.
