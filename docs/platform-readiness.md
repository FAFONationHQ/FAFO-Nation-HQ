# Dynamic Platform Readiness

Date: 2026-08-08

## Implemented foundation

The repository now has a tested member/privacy vertical slice: managed WorkOS integration code, verified identity association, adult-attestation gating, a private-by-default V1 schema, server-only repositories, private profile and consent controls, and allowlisted public profiles. Runtime activation remains blocked by missing non-production WorkOS credentials and an isolated PostgreSQL database.

FAFO World remains static publicly but has a tested database-projection adapter, V2 proposal, and optional local raster PMTiles protocol path. Operator authorization and audit persistence contracts exist; their tables and user interface do not.

## Readiness matrix

| System | Current state | Next safe gate |
| --- | --- | --- |
| Authentication | WorkOS routes/session association implemented; configuration-gated | Configure an official dev/staging environment and run live sandbox lifecycle tests |
| Member profiles | Private edit, preview, public preference, and protected routes implemented | Apply V1 migration to an isolated database and test authenticated persistence |
| Consent/privacy | Purpose-specific append/revoke UI/services and public fail-closed projection implemented | Database transaction/invalidation and deletion/export workflows |
| Public profiles | Dynamic allowlisted callsign route implemented | Authenticated database integration, moderation/rename policy, enumeration/rate review |
| Database | V1 schema and SQL artifact; Prisma repositories implemented | Owner-approved isolated database, migration/rebuild/restore verification |
| Operator/auth audit | Default-deny/MFA/step-up/audit contracts and V2 proposal | Approve V2 schema, persistence, operating roles, and provider MFA configuration |
| FAFO World | Seven static records active; DB adapter/proposal ready | Approve V2 schema/workflow and validate parity in an isolated database |
| PMTiles | Same-origin local raster integration path implemented | Approve licensed archive/style, measure it, then design object storage/CDN |
| Testing | 43 unit/integration and 62 Chromium tests, including eight axe scans | Disposable DB integration, live auth sandbox tests, broader manual accessibility |
| Commerce/fulfillment | Domain planning only; not live | Separate approved data/provider/policy package |
| Operations/admin | Contracts only; no portal or persistent grants | V2 operator/audit foundation and explicit workflow ownership |
| FAFO Cares | Landing only; ten intentional blockers | Approved content, jurisdiction, ownership, review, and emergency language |

## Environment and activation rules

Development and staging templates list names only and contain placeholders. Placeholder validation prevents false readiness. Preview/local environments must never inherit production database or WorkOS values. No migration should run until the target is positively identified as isolated, owned, and disposable/recoverable.

## Highest-value next queue

1. Provision an isolated non-production PostgreSQL database; review and apply V1, test rebuild/restore, constraints, transactions, and repository behavior with synthetic fixtures.
2. Configure a WorkOS development environment; verify registration, email verification, callback error/replay behavior, recovery, sign-out, session expiry, and suspended member handling.
3. Add abuse/rate controls and database-backed security regression tests before opening member access.
4. Approve or revise the V2 audit/operator proposal; implement persistent grants/events before any privileged portal.
5. Approve the FAFO World V2 consent/moderation/data model; run static/database shadow parity before switching.
6. Select a licensed map archive/style and geographic/zoom budget; complete local visual/byte-range measurement before object-storage/CDN approval.
7. Complete manual accessibility, CSP/monitoring/recovery, deletion/export, retention, and independent security/privacy review before production activation.

Commerce, payments, fulfillment, uploads, DNS, deployment, and production service activation remain outside this foundation.
