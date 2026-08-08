import { describe, expect, test } from "vitest";

import { appendAuditEvent } from "../../lib/domain/persistence/audit-repository.ts";
import { InMemoryAuditEventRepository } from "../doubles/in-memory-audit-repository.ts";

describe("append-only audit persistence boundary", () => {
  test("creates a minimized event and appends it once", async () => {
    const repository = new InMemoryAuditEventRepository();
    const event = await appendAuditEvent(repository, {
      eventId: "audit-1",
      actor: { kind: "MEMBER", actorId: "member-1" },
      action: "CONSENT_DECISION_RECORDED",
      target: { type: "MEMBER", targetId: "member-1" },
      occurredAt: "2026-08-08T20:00:00.000Z",
      requestId: "request-1",
      outcome: "SUCCEEDED",
      metadata: {
        purpose: "PUBLIC_MEMBER_PROFILE",
        status: "REVOKED",
        token: "must-never-persist",
        unexpected: "must-never-persist",
      },
    });

    expect(event.metadata).toEqual({
      purpose: "PUBLIC_MEMBER_PROFILE",
      status: "REVOKED",
    });
    expect(repository.snapshot()).toEqual([event]);
  });

  test("the persistence contract exposes no destructive mutation", () => {
    const repository = new InMemoryAuditEventRepository() as unknown as Record<string, unknown>;
    expect(repository.update).toBeUndefined();
    expect(repository.delete).toBeUndefined();
    expect(repository.remove).toBeUndefined();
  });

  test("audit events and minimized metadata are immutable at runtime", async () => {
    const repository = new InMemoryAuditEventRepository();
    const event = await appendAuditEvent(repository, {
      eventId: "audit-frozen",
      actor: { kind: "SYSTEM", actorId: "SYSTEM" },
      action: "ADMINISTRATIVE_CHANGE",
      target: { type: "SYSTEM", targetId: "authorization" },
      occurredAt: "2026-08-08T20:00:00.000Z",
      requestId: "request-frozen",
      outcome: "DENIED",
      metadata: {
        changeType: "BOUNDARY_CHECK",
        reasonCode: "sk_test_must_not_persist",
      },
    });
    expect(Object.isFrozen(event)).toBe(true);
    expect(Object.isFrozen(event.actor)).toBe(true);
    expect(Object.isFrozen(event.target)).toBe(true);
    expect(Object.isFrozen(event.metadata)).toBe(true);
    expect(event.metadata).toEqual({ changeType: "BOUNDARY_CHECK" });
  });
});
