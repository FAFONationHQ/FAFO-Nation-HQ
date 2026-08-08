import type {
  AuditEvent,
  CreateAuditEventInput,
} from "../audit.ts";
import { createAuditEvent } from "../audit.ts";

/**
 * Append is intentionally the only mutation. A future database adapter must
 * not expose update or delete methods for retained audit events.
 */
export interface AuditEventRepository {
  append(event: AuditEvent): Promise<void>;
}

export async function appendAuditEvent(
  repository: AuditEventRepository,
  input: CreateAuditEventInput,
): Promise<AuditEvent> {
  const event = createAuditEvent(input);
  await repository.append(event);
  return event;
}
