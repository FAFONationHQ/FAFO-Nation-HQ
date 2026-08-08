export const AUDIT_ACTIONS = [
  "PERMISSION_CHANGED",
  "PROFILE_VISIBILITY_CHANGED",
  "CALLSIGN_CHANGED",
  "DEPLOYMENT_PUBLICATION_CHANGED",
  "CONTENT_PUBLICATION_CHANGED",
  "MODERATION_ACTION_TAKEN",
  "REFUND_ACTION_TAKEN",
  "ADMINISTRATIVE_CHANGE",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];
export type AuditOutcome = "SUCCEEDED" | "DENIED" | "FAILED";

export type AuditActor =
  | { kind: "MEMBER" | "OPERATOR"; actorId: string }
  | { kind: "SYSTEM"; actorId: "SYSTEM" };

export type AuditTarget = {
  type: "MEMBER" | "DEPLOYMENT" | "CONTENT" | "ORDER" | "PERMISSION" | "SYSTEM";
  targetId: string;
};

type AuditMetadataValue = string | number | boolean | null;

const ALLOWED_METADATA_KEYS = {
  PERMISSION_CHANGED: ["permission", "change", "reasonCode"],
  PROFILE_VISIBILITY_CHANGED: ["from", "to", "reasonCode"],
  CALLSIGN_CHANGED: ["reasonCode", "moderated"],
  DEPLOYMENT_PUBLICATION_CHANGED: ["from", "to", "reasonCode"],
  CONTENT_PUBLICATION_CHANGED: ["contentType", "from", "to"],
  MODERATION_ACTION_TAKEN: ["moderationType", "reasonCode"],
  REFUND_ACTION_TAKEN: ["refundState", "currency", "minorUnits", "reasonCode"],
  ADMINISTRATIVE_CHANGE: ["changeType", "reasonCode"],
} as const satisfies Record<AuditAction, readonly string[]>;

const FORBIDDEN_METADATA_KEY = /(password|secret|token|credential|authorization|cookie)/i;

export type AuditEvent = {
  eventId: string;
  actor: AuditActor;
  action: AuditAction;
  target: AuditTarget;
  occurredAt: string;
  requestId: string;
  outcome: AuditOutcome;
  metadata: Readonly<Record<string, AuditMetadataValue>>;
};

export type CreateAuditEventInput = Omit<AuditEvent, "metadata"> & {
  metadata?: Readonly<Record<string, unknown>>;
};

export function createAuditEvent(input: CreateAuditEventInput): AuditEvent {
  const allowedKeys = new Set<string>(ALLOWED_METADATA_KEYS[input.action]);
  const metadata: Record<string, AuditMetadataValue> = {};

  for (const [key, value] of Object.entries(input.metadata ?? {})) {
    if (!allowedKeys.has(key) || FORBIDDEN_METADATA_KEY.test(key)) continue;
    if (typeof value === "number" && !Number.isFinite(value)) continue;
    if (value === null || ["string", "number", "boolean"].includes(typeof value)) {
      metadata[key] = typeof value === "string" ? value.slice(0, 200) : value as number | boolean | null;
    }
  }

  return { ...input, metadata };
}
