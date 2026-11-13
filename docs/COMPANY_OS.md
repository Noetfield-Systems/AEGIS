# AEGIS Venture Company OS v1.0 — supervised autonomy contract

**Canonical chain:** Founder -> Sina Founder OS (portfolio goals, priorities, budgets, policy) -> existing Company OS (venture manager & work queue) -> Paperclip/Agent Fabric specialized workers -> existing Runway execution -> independent verification -> GitHub PR/CI -> Railway release -> Receipt -> Founder/Company Floor.

AEGIS Company OS is a **tenant/context** of the existing multi-venture operating system, not another runtime implementation and not a legally separate company. Its scoped repository is Noetfield-Systems/AEGIS. No unauthorized access to secrets, contracts or other company tenants.

## Team registry — roles, not staffed human commitments
General Manager: choose next revenue/technical bottleneck daily; maintain priorities. Product/Design Lead: FA/EN UX and usability; Engineering Lead: code, API, tests, source packaging; AI Assurance Scientist: native metrics and experimental design; Policy SME: source mapping and amendments; GTM Lead: buyer interviews and paid pilot proposals; QA/Independent Verifier: acceptance/negative tests and receipts; Operations/Finance: runway and collected revenue only from reconciled evidence.

## WorkPacket schema
id, venture_id='aegis', company_os_id, objective, source_issue_url, owner_role, priority, dependencies, acceptance_criteria[], work_scope[], due_at, budget_limit, auth_scope, evidence_requirements[], target_environment, created_at.
WorkReceipt schema: workpacket_id, source_commit, pr_url, ci_run_url, test_results, verifier_id, verifier_verdict, deployment_id, health_url, evidence_refs[], actual_cost, next_action, blocker, timestamp, signature_ref.

## Daily cycle
1. Read current GitHub state, production health and evidence ledger (with authenticated API only); label each field observed vs assumed.
2. Pick one P0/P1 unblocked issue. Prioritize customer proof, critical ISC gaps and actual implementation before cosmetic backlog.
3. Dispatch to appropriate role with resource budget and acceptance tests.
4. Implement in a scoped branch/PR, run unit/integration/accessibility/i18n/negative tests.
5. Independent QA reads source/results; after approval deploy via Railway; verify actual URL and state; write receipt; sync to Sina OS.
6. If blocked, log exact cause, alternative owner and next timestamp. Do not infer autonomous success from a schedule or an issue alone.

## Current integration status
Automated context + task specification can be stored here. On 2026-11-13 Railway Automations is unavailable on this connected account. Existing Sina OS dispatch endpoint/auth was not furnished or verified. Thus **autonomous multi-agent coding is not yet wired or proven**. Repository CI/daily operations provide deterministic tracking; they are not equivalent to an AI coding loop.
