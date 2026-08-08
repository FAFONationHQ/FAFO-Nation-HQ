import { describe, expect, test } from "vitest";

import { authorizeOperatorBoundary } from "../../lib/domain/operator-authorization.ts";

const now = new Date("2026-08-08T20:00:00.000Z");
const policy = {
  permission: "deployment.publish" as const,
  requireMfa: true,
  maximumAuthenticationAgeMs: 15 * 60 * 1000,
};

describe("operator authorization boundary", () => {
  test("authentication alone grants no operator privilege", () => {
    expect(authorizeOperatorBoundary({
      memberId: "member-1",
      fafoRoles: ["MEMBER"],
      authenticatedAt: now,
      mfaVerifiedAt: now,
    }, policy, now)).toMatchObject({ allowed: false, reason: "MISSING_PERMISSION" });
  });

  test("unknown provider-controlled roles are ignored", () => {
    expect(authorizeOperatorBoundary({
      memberId: "member-1",
      fafoRoles: ["admin", "OWNER"],
      authenticatedAt: now,
      mfaVerifiedAt: now,
    }, policy, now)).toMatchObject({ allowed: false, reason: "NO_OPERATOR_ROLE" });
  });

  test("requires MFA and recent authentication", () => {
    const base = {
      memberId: "operator-1",
      fafoRoles: ["DEPLOYMENT_PUBLISHER"],
      authenticatedAt: now,
      mfaVerifiedAt: null,
    };
    expect(authorizeOperatorBoundary(base, policy, now)).toMatchObject({
      allowed: false,
      reason: "MFA_REQUIRED",
    });
    expect(authorizeOperatorBoundary({
      ...base,
      authenticatedAt: new Date("2026-08-08T19:30:00.000Z"),
      mfaVerifiedAt: new Date("2026-08-08T19:30:00.000Z"),
    }, policy, now)).toMatchObject({ allowed: false, reason: "STEP_UP_REQUIRED" });
  });

  test("aggregates FAFO roles and marks privileged success as auditable", () => {
    expect(authorizeOperatorBoundary({
      memberId: "owner-1",
      fafoRoles: ["MEMBER", "OWNER_OPERATOR"],
      authenticatedAt: now,
      mfaVerifiedAt: now,
    }, policy, now)).toEqual({
      allowed: true,
      memberId: "owner-1",
      roles: ["MEMBER", "OWNER_OPERATOR"],
      permission: "deployment.publish",
      auditRequired: true,
    });
  });
});
