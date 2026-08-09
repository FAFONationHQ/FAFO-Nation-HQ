# Shift #7 Overnight Readiness

Date: 2026-08-09
Status: **OVERNIGHT READY**

## Authoritative starting state

- Branch: `chore/baseline-stabilization-1`; local commits only; GitHub remote CI deferred.
- Worktree was clean at preflight.
- Local PostgreSQL 18.4 service `postgresql-x64-18` is running and listening only on `127.0.0.1` and `::1` at port 5432.
- Credential Manager contains the local admin, `fafo_dev_owner`, `fafo_dev_app`, `fafo_test_owner`, and `fafo_test_app` targets. No credential value was read.
- `fafo_dev` and `fafo_test` contain the reviewed V1 migration history and least-privilege application roles.
- WorkOS Staging signup, verified callback, repeat-login deduplication, private profile persistence, logout/home return, and post-logout protection are proven. Local secrets remain ignored.
- Last full evidence: 87 unit tests, 8 integration tests, 72 Chromium tests, 12 axe scans, production build, lint, TypeScript, Prisma generation, route integrity, and zero audit findings.
- Current Prisma scope remains V1: `Member`, `AuthIdentity`, `MemberProfile`, and `ConsentDecision`. V2A/V2B do not exist yet.
- No PMTiles archive exists. Java/Maven/Docker are absent; Java 21 plus a pinned non-Docker toolchain is approved for the local proof.

## Cleared owner gates

- V2A/V2B local-only migration authority and destructive-test boundaries
- Operator role/grant, audit immutability, restoration, and dev/test retention policy
- FAFO World entities, consent ownership, coordinate precision, reason-code boundary, source/fallback, and shadow-only rollout
- Northern Response Digital Creations internal reusable-module boundary
- Vector-PMTiles local proof direction and toolchain authority
- Mock-only WorkOS recovery/expiry/MFA/step-up coverage
- Reversible account export/deletion-request scope
- Provider-neutral rate-limit scope
- Explicit deferral of GitHub push/CI and every remote/production activation

## Mandatory safety sequence

1. Positively verify repository, PostgreSQL version, loopback host, database name, owner role, migration history, and target contents before each database mutation.
2. Back up `fafo_dev` before V2A and retain the backup outside Git.
3. Implement and verify V2A before V2B so deployment review/publish workflows can depend on persisted grants and audit events.
4. Apply migrations with the matching owner role; never use `postgres` or an application role for application migrations.
5. Recompute narrow application grants after each migration and prove prohibited operations fail.
6. Use synthetic fixtures only. Keep current static FAFO World records as the active public source.
7. Destructive rebuild testing is allowed only for positively identified `fafo_test`.
8. Stop the affected task on any identity conflict, unexpected object, migration drift, secret exposure risk, real/remote data, or unapproved schema requirement; document it and continue a safe lower tier.

## Tier 1 — Primary: Operator/Audit V2A

1. Reconcile the approved persisted-role vocabulary with provider-neutral authorization modules.
2. Add reviewed `OperatorRoleGrant` and append-only `AuditEvent` schema/migration artifacts.
3. Enforce one active member/role grant with reviewed PostgreSQL partial uniqueness.
4. Enforce runtime and database append-only audit behavior, including update/delete/truncate negative tests.
5. Implement server-only Prisma grant, append, and bounded read adapters.
6. Implement audited grant/revoke and privileged-operation transaction boundaries.
7. Apply to `fafo_dev`/`fafo_test`, restore least-privilege grants, run integration/authorization-bypass tests, and rebuild `fafo_test` from history.

## Tier 2 — Secondary: FAFO World V2B

1. Add the approved four-entity schema and migration after V2A is green.
2. Implement explicit private selects and server-only repositories.
3. Connect independent deployment/member consent and review/publish authorization to immutable audit events.
4. Exercise controlled reason codes, city-centroid precision, corrections, revocations, duplicate rejection, and timeline pagination with synthetic fixtures.
5. Run static/database snapshot parity and shadow comparison; do not change the active public source.
6. Reapply least-privilege grants, run negative privacy/authorization tests, and include V2B in `fafo_test` rebuild proof.

## Tier 3 — Tertiary failsafe

- Account export and deletion-request entry points with immediate authorization/publication shutdown
- Mocked WorkOS recovery, expiry, MFA, step-up, callback replay, and suspended-member behavior
- Provider-neutral rate-limit wiring, opaque key design, concurrency/failure contracts, and route tests
- Authenticated member browser coverage through safe mocks
- PostgreSQL backup/restore procedure and isolated recovery rehearsal
- CI guard improvements that remain locally testable without push
- CSP, secret-scanning, privacy, accessibility, and reliability defect remediation
- Reconciliation of stale Shift #4 documentation and environment-template role names

## Tier 4 — Deep reserve

- Internal NRDC-neutral kernels for permission evaluation, audit envelopes, consent ledgers, rate-limit ports, cursor contracts, and publication workflows; FAFO terminology/configuration remains in adapters
- Vector-PMTiles small-area toolchain pinning, reproducible manifest, style/assets boundary, attribution, byte-range behavior, and resource measurements
- Large synthetic audit/timeline/parity datasets and deterministic fault injection using existing dependencies
- Authorization matrix and separation-of-duties completeness tests
- PostgreSQL rollback, retry, transaction, and permission fault cases
- Route-checker regression fixtures, error/not-found QA, responsive/accessibility expansion, and documentation linting

## Tier 5 — Closeout, intelligence, and handoff

1. Stop all temporary servers/processes and confirm PostgreSQL remains loopback-only.
2. Run Prisma generation, unit/integration/E2E/axe, lint, TypeScript, production build, dependency audit, route checks, `git diff --check`, and secret-tracking checks appropriate to completed tiers.
3. Record exact migrations, tables, enums, indexes, triggers, grants, negative privilege results, rebuild results, mapping measurements, defects, and local commits.
4. Reconcile README, architecture, decision register, proposals, readiness matrix, and test counts with the actual final state.
5. Produce a concise next-shift handoff: completed work, unresolved defects, intentionally deferred gates, rollback points, reserve status, and the single highest-value next action.
6. Confirm no push, PR, merge, deployment, production/remote access, real customer data, unapproved dependency, or committed secret occurred.

## Expected owner-interaction state

The approved Tier 1 through Tier 5 work can proceed without foreseeable owner interaction. Mapping tool installation/downloads, migration credentials, WorkOS simulations, PostgreSQL rebuilds, and local verification are implementation steps within the approved boundaries. A task must be skipped rather than expanded if it encounters a new architecture choice, external account, billing requirement, real-data question, or remote/production dependency.
