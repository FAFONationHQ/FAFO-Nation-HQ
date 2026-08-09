# Dynamic Platform Readiness

Date: 2026-08-08

## Implemented foundation

The repository now has a tested member/privacy vertical slice: managed WorkOS integration code, verified identity association, adult-attestation gating, a private-by-default V1 schema, server-only repositories, private profile and consent controls, and allowlisted public profiles. Local non-production WorkOS Staging credentials and isolated PostgreSQL databases are configured outside Git. A synthetic owner-controlled Staging signup, email verification, callback, private profile save, identity/member persistence, and session invalidation have been proven. WorkOS still needs a default local sign-out redirect so provider logout returns home instead of its safe configuration-error page.

FAFO World remains static publicly but has a tested database-projection adapter, V2 proposal, and optional local raster PMTiles protocol path. Operator authorization and audit persistence contracts exist; their tables and user interface do not.

## Readiness matrix

| System | Current state | Next safe gate |
| --- | --- | --- |
| Authentication | Live Staging signup/email/callback/session and local session invalidation proven; signed-out account routes are proxy-guarded | Set default Staging sign-out redirect to `http://localhost:3000/`, retest provider return, then test recovery and expiry |
| Member profiles | Private edit/save, preview, public preference, protected routes, and real PostgreSQL persistence proven with a synthetic Staging member | Add broader authenticated browser coverage and complete moderation/rename policy |
| Consent/privacy | Purpose-specific append/revoke UI/services and public fail-closed projection implemented; deletion revokes every V1 purpose atomically | Complete export/retention workflows and independent privacy review |
| Public profiles | Dynamic allowlisted callsign route implemented | Authenticated database integration, moderation/rename policy, enumeration/rate review |
| Database | Local PostgreSQL 18.4 `fafo_dev`/`fafo_test` use V1 migration history and least-privilege roles; test rebuild and repository integration pass | Execute the prepared disposable PostgreSQL CI job on a future approved GitHub run; design backup/restore before production |
| Operator/auth audit | Default-deny/MFA/step-up/audit contracts and V2 proposal | Approve V2 schema, persistence, operating roles, and provider MFA configuration |
| FAFO World | Seven static records active; DB adapter/proposal ready | Approve V2 schema/workflow and validate parity in an isolated database |
| PMTiles | Same-origin local raster integration path implemented | Approve licensed archive/style, measure it, then design object storage/CDN |
| Testing | 87 unit, 8 integration (real local PostgreSQL plus installed AuthKit), and 72 Chromium tests pass, including 12 axe scans; live Staging signup/persistence/sign-out evidence recorded | Provider sign-out return retest, first disposable PostgreSQL CI run, and broader manual accessibility |
| Commerce/fulfillment | Domain planning only; not live | Separate approved data/provider/policy package |
| Operations/admin | Contracts only; no portal or persistent grants | V2 operator/audit foundation and explicit workflow ownership |
| FAFO Cares | Landing only; ten intentional blockers | Approved content, jurisdiction, ownership, review, and emergency language |

## Environment and activation rules

Development and staging templates list names only and contain placeholders. Placeholder validation prevents false readiness. Real local values remain in ignored environment files and must never be committed. Preview/local environments must never inherit production database or WorkOS values. Migration automation must positively identify an isolated, owned target before mutation.

## Highest-value next queue

1. In the WorkOS Staging application Redirects settings, set the default sign-out redirect to `http://localhost:3000/`; retest provider return, then verify recovery, replay, expiry, and suspension behavior.
2. Run the prepared disposable PostgreSQL integration job during a future approved GitHub Actions execution and retain the first-run evidence.
3. Connect a production-grade shared rate-limit store and complete abuse testing before opening member access.
4. Approve or revise the V2 audit/operator proposal; implement persistent grants/events before any privileged portal.
5. Approve the FAFO World V2 consent/moderation/data model; run static/database shadow parity before switching.
6. Select a licensed map archive/style and geographic/zoom budget; complete local visual/byte-range measurement before object-storage/CDN approval.
7. Complete manual accessibility, CSP/monitoring/recovery, deletion/export, retention, and independent security/privacy review before production activation.

Commerce, payments, fulfillment, uploads, DNS, deployment, and production service activation remain outside this foundation.
