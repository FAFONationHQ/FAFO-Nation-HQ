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

## Required invariants

- Roles are FAFO-owned records; WorkOS identity, email, organization membership, or arbitrary claims never imply a role.
- Privileged boundaries require permission evaluation and may require recent authentication and MFA.
- Every allowed privileged mutation emits an audit event in the same transaction where feasible. Failed/denied attempts use a safe non-transactional security-event path.
- Metadata is allow-listed and excludes credentials, tokens, cookies, raw authorization headers, and unnecessary personal data.
- Retention, anonymization, legal access, and database-level immutability need owner/legal/security approval before implementation.

## Verification required before approval

Disposable-database migration/rebuild, grant uniqueness and revocation, default-deny checks, audit append-only enforcement, transaction rollback tests, metadata minimization, index review, and authorization bypass tests.
