export const AUDIT_ACTIONS = [
  "PERMISSION_CHANGED",
  "PROFILE_VISIBILITY_CHANGED",
  "CALLSIGN_CHANGED",
  "CONSENT_DECISION_RECORDED",
  "DEPLOYMENT_PUBLICATION_CHANGED",
  "CONTENT_PUBLICATION_CHANGED",
  "MODERATION_ACTION_TAKEN",
  "REFUND_ACTION_TAKEN",
  "ADMINISTRATIVE_CHANGE",
  "OPERATOR_AUTHORIZATION_EVALUATED",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];
export type AuditOutcome = "SUCCEEDED" | "DENIED" | "FAILED";

const AUDIT_OUTCOMES = ["SUCCEEDED", "DENIED", "FAILED"] as const;
const AUDIT_ACTOR_KINDS = ["MEMBER", "OPERATOR", "SYSTEM"] as const;
const AUDIT_TARGET_TYPES = [
  "MEMBER",
  "DEPLOYMENT",
  "CONTENT",
  "ORDER",
  "PERMISSION",
  "SYSTEM",
] as const;

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
  CONSENT_DECISION_RECORDED: ["purpose", "status", "source", "policyVersion"],
  DEPLOYMENT_PUBLICATION_CHANGED: ["from", "to", "reasonCode"],
  CONTENT_PUBLICATION_CHANGED: ["contentType", "from", "to"],
  MODERATION_ACTION_TAKEN: ["moderationType", "reasonCode"],
  REFUND_ACTION_TAKEN: ["refundState", "currency", "minorUnits", "reasonCode"],
  ADMINISTRATIVE_CHANGE: ["changeType", "reasonCode"],
  OPERATOR_AUTHORIZATION_EVALUATED: ["permission", "reasonCode"],
} as const satisfies Record<AuditAction, readonly string[]>;

const FORBIDDEN_METADATA_KEY = /(password|secret|token|credential|authorization|cookie)/i;
const FORBIDDEN_METADATA_VALUE = /(bearer\s|sk_(?:test|live)_|password|secret|token|cookie)/i;

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

export class AuditValidationError extends Error {
  constructor() {
    super("Invalid audit event input.");
    this.name = "AuditValidationError";
  }
}

function safeIdentifier(value: string, maximumLength = 200): boolean {
  return value.length > 0 &&
    value === value.trim() &&
    value.length <= maximumLength &&
    !/\p{Cc}/u.test(value);
}

function includesRuntimeValue(values: readonly string[], value: unknown): value is string {
  return typeof value === "string" && values.includes(value);
}

export function createAuditEvent(input: CreateAuditEventInput): AuditEvent {
  const occurredAt = new Date(input.occurredAt);
  if (
    !includesRuntimeValue(AUDIT_ACTIONS, input.action) ||
    !includesRuntimeValue(AUDIT_OUTCOMES, input.outcome) ||
    !includesRuntimeValue(AUDIT_ACTOR_KINDS, input.actor.kind) ||
    !includesRuntimeValue(AUDIT_TARGET_TYPES, input.target.type) ||
    !safeIdentifier(input.eventId) ||
    !safeIdentifier(input.actor.actorId) ||
    !safeIdentifier(input.target.targetId) ||
    !safeIdentifier(input.requestId) ||
    Number.isNaN(occurredAt.getTime()) ||
    occurredAt.toISOString() !== input.occurredAt ||
    (input.actor.kind === "SYSTEM" && input.actor.actorId !== "SYSTEM") ||
    (input.actor.kind !== "SYSTEM" && input.actor.actorId === "SYSTEM")
  ) throw new AuditValidationError();

  const allowedKeys = new Set<string>(ALLOWED_METADATA_KEYS[input.action]);
  const metadata: Record<string, AuditMetadataValue> = {};

  for (const [key, value] of Object.entries(input.metadata ?? {})) {
    if (!allowedKeys.has(key) || FORBIDDEN_METADATA_KEY.test(key)) continue;
    if (typeof value === "number" && !Number.isFinite(value)) continue;
    if (value === null || ["string", "number", "boolean"].includes(typeof value)) {
      if (typeof value === "string" && (
        FORBIDDEN_METADATA_VALUE.test(value) ||
        /\p{Cc}/u.test(value)
      )) continue;
      metadata[key] = typeof value === "string" ? value.slice(0, 200) : value as number | boolean | null;
    }
  }

  return Object.freeze({
    ...input,
    actor: Object.freeze({ ...input.actor }),
    target: Object.freeze({ ...input.target }),
    metadata: Object.freeze(metadata),
  });
}
