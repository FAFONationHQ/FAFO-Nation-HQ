import type { AuditEvent } from "../../lib/domain/audit.ts";
import type { AuditEventRepository } from "../../lib/domain/persistence/audit-repository.ts";

export class InMemoryAuditEventRepository implements AuditEventRepository {
  readonly #events: AuditEvent[] = [];

  async append(event: AuditEvent): Promise<void> {
    this.#events.push(structuredClone(event));
  }

  snapshot(): readonly AuditEvent[] {
    return structuredClone(this.#events);
  }
}
