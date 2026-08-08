# Prisma V2 Proposal — Immutable Audit and Operator Grants

Date: 2026-08-08
Status: proposal only; not added to `schema.prisma`, no migration created or applied

## Objective

Migration V1 intentionally contains only member identity, private profile, and consent history. The first privileged workflow needs a separate reviewed migration for FAFO-controlled role grants and retained audit events. Authentication provider attributes must not become operator authority.

## Minimal change set

- `OperatorRoleGrant`: member ID, enumerated FAFO role, grant state, granted/revoked timestamps, granting actor, reason code, and optimistic version. Unique active membership should be enforced per member/role.
- `AuditEvent`: immutable event ID, actor kind/ID, enumerated action/outcome, target type/ID, request ID, occurred timestamp, and minimized JSON metadata.
- Index audit reads by `(targetType, targetId, occurredAt)` and `(actorId, occurredAt)`; make request ID searchable.
- Use application and database permissions that allow `INSERT`/`SELECT` but deny `UPDATE`/`DELETE` for retained audit rows.

## Implementation-ready field boundary

`OperatorRoleGrant` should contain only: opaque ID, `memberId`, enumerated FAFO role, `ACTIVE`/`REVOKED` state, `grantedAt`, nullable `revokedAt`, `grantedByMemberId`, reason code, and integer version. It must not copy email, WorkOS claims, or provider organization membership. Enforce one active grant per member/role with a reviewed PostgreSQL partial unique index; Prisma cannot express that index directly, so it belongs explicitly in the migration SQL.

`AuditEvent` should contain only: opaque ID, actor kind/ID, enumerated action/outcome, target type/ID, request ID, timestamp, and minimized JSON metadata. The application adapter exposes append/read only. The runtime role receives `SELECT, INSERT`; it receives no `UPDATE`, `DELETE`, `TRUNCATE`, trigger, or migration privileges. PUBLIC receives none.

The smallest migration also needs indexes on `(targetType, targetId, occurredAt, id)`, `(actorId, occurredAt, id)`, and `requestId`. Foreign-key deletion must not erase retained audit history; actor and target references therefore remain opaque rather than cascading member foreign keys.

## Required invariants

- Roles are FAFO-owned records; WorkOS identity, email, organization membership, or arbitrary claims never imply a role.
- Privileged boundaries require permission evaluation and may require recent authentication and MFA.
- Every allowed privileged mutation emits an audit event in the same transaction where feasible. Failed/denied attempts use a safe non-transactional security-event path.
- Metadata is allow-listed and excludes credentials, tokens, cookies, raw authorization headers, and unnecessary personal data.
- Retention, anonymization, legal access, and database-level immutability need owner/legal/security approval before implementation.

## Transaction and denial behavior

- An allowed privileged mutation and its success audit event should share one transaction.
- A denied operation writes a separate minimized security event and performs no domain mutation.
- Failure to write a required denial event remains fail-closed; it never converts denial to allowance.
- MFA and recent-auth timestamps are evaluated against server time with a bounded clock-skew policy.
- Runtime event objects are immutable and metadata values are filtered as well as metadata keys.

## Decisions still required before migration approval

- Final audit and consent retention schedules.
- Which operator roles can grant or revoke each role.
- Whether any break-glass workflow exists and how it is independently audited.
- The approved database-level immutability mechanism and restoration procedure.

## Verification required before approval

Disposable-database migration/rebuild, grant uniqueness and revocation, default-deny checks, audit append-only enforcement, transaction rollback tests, metadata minimization, index review, and authorization bypass tests.
