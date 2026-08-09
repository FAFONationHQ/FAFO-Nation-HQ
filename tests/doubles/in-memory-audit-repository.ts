import type { AuditEvent } from "../../lib/domain/audit.ts";
import type {
  AuditEventPage,
  AuditEventQuery,
  AuditEventRepository,
} from "../../lib/domain/persistence/audit-repository.ts";

export class InMemoryAuditEventRepository implements AuditEventRepository {
  readonly #events: AuditEvent[] = [];

  async append(event: AuditEvent): Promise<void> {
    this.#events.push(structuredClone(event));
  }

  async list(query: AuditEventQuery): Promise<AuditEventPage> {
    const ordered = this.#events
      .filter((event) => !query.actorId || event.actor.actorId === query.actorId)
      .filter((event) => !query.requestId || event.requestId === query.requestId)
      .filter((event) => !query.target || (
        event.target.type === query.target.type &&
        event.target.targetId === query.target.targetId
      ))
      .filter((event) => !query.cursor || (
        event.occurredAt < query.cursor.occurredAt ||
        (event.occurredAt === query.cursor.occurredAt && event.eventId < query.cursor.eventId)
      ))
      .sort((left, right) =>
        right.occurredAt.localeCompare(left.occurredAt) ||
        right.eventId.localeCompare(left.eventId));
    const items = ordered.slice(0, query.limit).map((event) => structuredClone(event));
    const last = items.at(-1);
    return {
      items,
      nextCursor: ordered.length > query.limit && last
        ? { occurredAt: last.occurredAt, eventId: last.eventId }
        : null,
    };
  }

  snapshot(): readonly AuditEvent[] {
    return structuredClone(this.#events);
  }
}
