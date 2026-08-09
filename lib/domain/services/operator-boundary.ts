import type {
  AuditEventAppender,
} from "../persistence/audit-repository.ts";
import { appendAuditEvent } from "../persistence/audit-repository.ts";
import {
  authorizeOperatorBoundary,
  type OperatorAuthorizationDecision,
  type OperatorBoundaryPolicy,
  type OperatorSession,
} from "../operator-authorization.ts";
import type { AuditTarget } from "../audit.ts";

export type OperatorBoundaryAuditContext = {
  eventId: string;
  requestId: string;
  target: AuditTarget;
  occurredAt?: Date;
};

/**
 * Authorization is evaluated before any operation. Denials must be recorded;
 * if the security-event sink fails, this function throws and remains closed.
 */
export async function authorizeOperatorOperation(
  session: OperatorSession | null | undefined,
  policy: OperatorBoundaryPolicy,
  auditContext: OperatorBoundaryAuditContext,
  auditRepository: AuditEventAppender,
  now = new Date(),
): Promise<OperatorAuthorizationDecision> {
  const decision = authorizeOperatorBoundary(session, policy, now);
  if (decision.allowed) return decision;

  await appendAuditEvent(auditRepository, {
    eventId: auditContext.eventId,
    actor: session
      ? { kind: "MEMBER", actorId: session.memberId }
      : { kind: "SYSTEM", actorId: "SYSTEM" },
    action: "OPERATOR_AUTHORIZATION_EVALUATED",
    target: auditContext.target,
    occurredAt: (auditContext.occurredAt ?? now).toISOString(),
    requestId: auditContext.requestId,
    outcome: "DENIED",
    metadata: {
      permission: decision.permission,
      reasonCode: decision.reason,
    },
  });
  return decision;
}
