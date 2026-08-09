import type {
  AuditEvent,
  AuditTarget,
  CreateAuditEventInput,
} from "../audit.ts";
import { createAuditEvent } from "../audit.ts";

export type AuditEventCursor = {
  occurredAt: string;
  eventId: string;
};

export type AuditEventQueryInput = {
  actorId?: string;
  target?: AuditTarget;
  requestId?: string;
  cursor?: AuditEventCursor;
  limit?: number;
};

export type AuditEventQuery = Omit<AuditEventQueryInput, "limit"> & {
  limit: number;
};

export type AuditEventPage = {
  items: readonly AuditEvent[];
  nextCursor: AuditEventCursor | null;
};

export class AuditQueryValidationError extends Error {
  constructor() {
    super("Invalid audit query input.");
    this.name = "AuditQueryValidationError";
  }
}

/**
 * Append is intentionally the only mutation. A future database adapter must
 * not expose update or delete methods for retained audit events.
 */
export interface AuditEventAppender {
  append(event: AuditEvent): Promise<void>;
}

export interface AuditEventReader {
  list(query: AuditEventQuery): Promise<AuditEventPage>;
}

export interface AuditEventRepository extends AuditEventAppender, AuditEventReader {}

function safeQueryIdentifier(value: string): boolean {
  return value.length > 0 &&
    value === value.trim() &&
    value.length <= 200 &&
    !/\p{Cc}/u.test(value);
}

function canonicalTimestamp(value: string): boolean {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
}

export async function readAuditEvents(
  repository: AuditEventReader,
  input: AuditEventQueryInput = {},
): Promise<AuditEventPage> {
  const limit = input.limit ?? 50;
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    (input.actorId !== undefined && !safeQueryIdentifier(input.actorId)) ||
    (input.requestId !== undefined && !safeQueryIdentifier(input.requestId)) ||
    (input.target !== undefined && (
      !safeQueryIdentifier(input.target.type) ||
      !safeQueryIdentifier(input.target.targetId)
    )) ||
    (input.cursor !== undefined && (
      !safeQueryIdentifier(input.cursor.eventId) ||
      !canonicalTimestamp(input.cursor.occurredAt)
    ))
  ) throw new AuditQueryValidationError();

  return repository.list(Object.freeze({
    actorId: input.actorId,
    target: input.target ? Object.freeze({ ...input.target }) : undefined,
    requestId: input.requestId,
    cursor: input.cursor ? Object.freeze({ ...input.cursor }) : undefined,
    limit,
  }));
}

export async function appendAuditEvent(
  repository: AuditEventAppender,
  input: CreateAuditEventInput,
): Promise<AuditEvent> {
  const event = createAuditEvent(input);
  await repository.append(event);
  return event;
}
