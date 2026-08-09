import { describe, expect, test } from "vitest";

import {
  AuditValidationError,
  createAuditEvent,
  type CreateAuditEventInput,
} from "../../lib/domain/audit.ts";
import {
  appendAuditEvent,
  AuditQueryValidationError,
  readAuditEvents,
} from "../../lib/domain/persistence/audit-repository.ts";
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

  test("rejects malformed runtime enums, actors, identifiers, and timestamps", () => {
    const valid: CreateAuditEventInput = {
      eventId: "audit-runtime-validation",
      actor: { kind: "SYSTEM", actorId: "SYSTEM" },
      action: "ADMINISTRATIVE_CHANGE",
      target: { type: "SYSTEM", targetId: "authorization" },
      occurredAt: "2026-08-08T20:00:00.000Z",
      requestId: "request-runtime-validation",
      outcome: "DENIED",
    };
    const malformed = [
      { ...valid, action: "UNKNOWN_ACTION" },
      { ...valid, outcome: "UNKNOWN_OUTCOME" },
      { ...valid, actor: { kind: "SYSTEM", actorId: "not-system" } },
      { ...valid, actor: { kind: "OPERATOR", actorId: "SYSTEM" } },
      { ...valid, target: { type: "UNKNOWN_TARGET", targetId: "target" } },
      { ...valid, eventId: " audit-with-whitespace" },
      { ...valid, occurredAt: "2026-08-08T20:00:00Z" },
    ];
    for (const input of malformed) {
      expect(() => createAuditEvent(input as unknown as CreateAuditEventInput))
        .toThrow(AuditValidationError);
    }
  });

  test("drops metadata values containing control characters", () => {
    const event = createAuditEvent({
      eventId: "audit-control-character",
      actor: { kind: "SYSTEM", actorId: "SYSTEM" },
      action: "ADMINISTRATIVE_CHANGE",
      target: { type: "SYSTEM", targetId: "authorization" },
      occurredAt: "2026-08-08T20:00:00.000Z",
      requestId: "request-control-character",
      outcome: "DENIED",
      metadata: {
        changeType: "BOUNDARY\nINJECTION",
        reasonCode: "VALID_REASON",
      },
    });
    expect(event.metadata).toEqual({ reasonCode: "VALID_REASON" });
  });

  test("reads bounded audit pages with stable exclusive cursors", async () => {
    const repository = new InMemoryAuditEventRepository();
    for (const sequence of [1, 2, 3]) {
      await appendAuditEvent(repository, {
        eventId: `audit-page-${sequence}`,
        actor: { kind: "OPERATOR", actorId: "operator-page" },
        action: "CONTENT_PUBLICATION_CHANGED",
        target: { type: "CONTENT", targetId: "content-page" },
        occurredAt: `2026-08-08T20:00:0${sequence}.000Z`,
        requestId: `request-page-${sequence}`,
        outcome: "SUCCEEDED",
      });
    }

    const first = await readAuditEvents(repository, {
      actorId: "operator-page",
      target: { type: "CONTENT", targetId: "content-page" },
      limit: 2,
    });
    expect(first.items.map((event) => event.eventId)).toEqual([
      "audit-page-3",
      "audit-page-2",
    ]);
    expect(first.nextCursor).toEqual({
      occurredAt: "2026-08-08T20:00:02.000Z",
      eventId: "audit-page-2",
    });

    const second = await readAuditEvents(repository, {
      actorId: "operator-page",
      cursor: first.nextCursor!,
      limit: 2,
    });
    expect(second.items.map((event) => event.eventId)).toEqual(["audit-page-1"]);
    expect(second.nextCursor).toBeNull();
  });

  test("rejects unbounded or malformed audit queries", async () => {
    const repository = new InMemoryAuditEventRepository();
    await expect(readAuditEvents(repository, { limit: 101 }))
      .rejects.toBeInstanceOf(AuditQueryValidationError);
    await expect(readAuditEvents(repository, { actorId: " operator" }))
      .rejects.toBeInstanceOf(AuditQueryValidationError);
    await expect(readAuditEvents(repository, {
      cursor: { occurredAt: "2026-08-08T20:00:00Z", eventId: "audit" },
    })).rejects.toBeInstanceOf(AuditQueryValidationError);
  });
});
