# Observed vs Planned — AEGIS
Updated 2026-11-13.
OBSERVED IN SOURCE: Internal ISC scoring engine, evidence CRUD, gate checks, score recalculation, audit export, task/pilot records, single operator login; FA interface + an English string translation adapter; premium theme implemented in CSS; original 8 scoring unit tests pass locally.
OBSERVED IN RAILWAY BEFORE MIGRATION: production service aegis-isc-web, successful deployment, /data 512MB mounted persistent volume; service originally sourced from Noetfield-Systems/Noetfield deploy/aegis-isc.
PENDING VERIFICATION: source rewire to Noetfield-Systems/AEGIS, deployed UI assets and live HTTP readiness, GitHub scheduled workflow execution, browser testing and EN completeness.
PLANNED: enterprise customer assurance engine, native metrics, historic replay, qualified TRL evidence, full EN/FR external edition, multi-tenant and Company OS autonomous PR→CI→verifier→deploy. No automated coding loop may be claimed until a full independently checked receipt exists.
