import { describe, expect, test } from "vitest";

import { authorizeOperatorBoundary } from "../../lib/domain/operator-authorization.ts";
import { authorizeOperatorOperation } from "../../lib/domain/services/operator-boundary.ts";
import { InMemoryAuditEventRepository } from "../doubles/in-memory-audit-repository.ts";

const now = new Date("2026-08-08T20:00:00.000Z");
const policy = {
  permission: "deployment.publish" as const,
  requireMfa: true,
  maximumAuthenticationAgeMs: 15 * 60 * 1000,
};

describe("operator authorization boundary", () => {
  test("records minimized denied-operation security events", async () => {
    const audits = new InMemoryAuditEventRepository();
    const decision = await authorizeOperatorOperation({
      memberId: "member-1",
      fafoRoles: ["MEMBER", "provider-admin-claim"],
      authenticatedAt: now,
      mfaVerifiedAt: now,
    }, policy, {
      eventId: "audit-denied-1",
      requestId: "request-denied-1",
      target: { type: "DEPLOYMENT", targetId: "deployment-1" },
    }, audits, now);

    expect(decision).toMatchObject({ allowed: false, reason: "MISSING_PERMISSION" });
    expect(audits.snapshot()).toMatchObject([{
      outcome: "DENIED",
      metadata: {
        permission: "deployment.publish",
        reasonCode: "MISSING_PERMISSION",
      },
    }]);
    expect(JSON.stringify(audits.snapshot())).not.toMatch(/provider-admin-claim/);
  });

  test("never grants when denied-operation audit persistence fails", async () => {
    await expect(authorizeOperatorOperation(null, policy, {
      eventId: "audit-denied-2",
      requestId: "request-denied-2",
      target: { type: "DEPLOYMENT", targetId: "deployment-2" },
    }, {
      append: async () => { throw new Error("audit unavailable"); },
    }, now)).rejects.toThrow("audit unavailable");
  });

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
