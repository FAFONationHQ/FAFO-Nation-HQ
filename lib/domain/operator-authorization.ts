import {
  authorize,
  isRoleName,
  permissionsForRoles,
  type Permission,
  type RoleName,
} from "./authorization.ts";

export type OperatorSession = {
  memberId: string;
  fafoRoles: readonly string[];
  authenticatedAt: Date;
  mfaVerifiedAt: Date | null;
};

export type OperatorBoundaryPolicy = {
  permission: Permission;
  requireMfa: boolean;
  maximumAuthenticationAgeMs: number;
};

export type OperatorAuthorizationDecision =
  | {
      allowed: true;
      memberId: string;
      roles: readonly RoleName[];
      permission: Permission;
      auditRequired: true;
    }
  | {
      allowed: false;
      permission: Permission;
      reason:
        | "UNAUTHENTICATED"
        | "NO_OPERATOR_ROLE"
        | "MISSING_PERMISSION"
        | "MFA_REQUIRED"
        | "STEP_UP_REQUIRED";
    };

const MAX_CLOCK_SKEW_MS = 60_000;

export function authorizeOperatorBoundary(
  session: OperatorSession | null | undefined,
  policy: OperatorBoundaryPolicy,
  now = new Date(),
): OperatorAuthorizationDecision {
  if (!session) {
    return { allowed: false, permission: policy.permission, reason: "UNAUTHENTICATED" };
  }

  const roles = session.fafoRoles.filter(isRoleName);
  if (roles.length === 0) {
    return { allowed: false, permission: policy.permission, reason: "NO_OPERATOR_ROLE" };
  }

  const permissionDecision = authorize(
    { subjectId: session.memberId, permissions: permissionsForRoles(roles) },
    policy.permission,
  );
  if (!permissionDecision.allowed) {
    return { allowed: false, permission: policy.permission, reason: "MISSING_PERMISSION" };
  }

  if (policy.requireMfa && !session.mfaVerifiedAt) {
    return { allowed: false, permission: policy.permission, reason: "MFA_REQUIRED" };
  }

  const nowMs = now.getTime();
  const authenticatedAtMs = session.authenticatedAt.getTime();
  const authenticationAge = nowMs - authenticatedAtMs;
  const invalidTimestamp =
    !Number.isFinite(authenticationAge) || authenticationAge < -MAX_CLOCK_SKEW_MS;
  if (
    invalidTimestamp ||
    authenticationAge > policy.maximumAuthenticationAgeMs ||
    policy.maximumAuthenticationAgeMs < 0
  ) {
    return { allowed: false, permission: policy.permission, reason: "STEP_UP_REQUIRED" };
  }

  if (policy.requireMfa) {
    const mfaAge = nowMs - session.mfaVerifiedAt!.getTime();
    if (!Number.isFinite(mfaAge) || mfaAge < -MAX_CLOCK_SKEW_MS || mfaAge > policy.maximumAuthenticationAgeMs) {
      return { allowed: false, permission: policy.permission, reason: "STEP_UP_REQUIRED" };
    }
  }

  return {
    allowed: true,
    memberId: session.memberId,
    roles,
    permission: policy.permission,
    auditRequired: true,
  };
}
