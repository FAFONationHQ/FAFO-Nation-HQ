import type { OperatorAuthorizationDecision } from "../domain/operator-authorization.ts";
import {
  validateDeploymentRecord,
  type PrivateDeploymentRecord,
} from "./domain.ts";

export type DeploymentReviewDecision = "APPROVE" | "REJECT";

export class DeploymentWorkflowError extends Error {
  constructor(readonly reason:
    | "INVALID_RECORD"
    | "REVIEW_PERMISSION_REQUIRED"
    | "PUBLISH_PERMISSION_REQUIRED"
    | "VERIFICATION_REQUIRED"
    | "PUBLICATION_CONSENT_REQUIRED"
    | "MEMBER_ASSOCIATION_CONSENT_REQUIRED") {
    super("Deployment workflow transition denied.");
    this.name = "DeploymentWorkflowError";
  }
}

function validTimestamp(value: Date): string {
  if (Number.isNaN(value.getTime())) throw new DeploymentWorkflowError("INVALID_RECORD");
  return value.toISOString();
}

export function reviewDeployment(
  record: PrivateDeploymentRecord,
  decision: DeploymentReviewDecision,
  authorization: OperatorAuthorizationDecision,
  reviewedAt = new Date(),
): PrivateDeploymentRecord {
  if (!validateDeploymentRecord(record).valid) throw new DeploymentWorkflowError("INVALID_RECORD");
  if (!authorization.allowed || authorization.permission !== "deployment.review") {
    throw new DeploymentWorkflowError("REVIEW_PERMISSION_REQUIRED");
  }
  const timestamp = validTimestamp(reviewedAt);
  return {
    ...record,
    verificationState: decision === "APPROVE" ? "VERIFIED" : "REJECTED",
    ...(decision === "REJECT"
      ? { publicationState: "UNPUBLISHED" as const }
      : {}),
    timeline: {
      ...record.timeline,
      updatedAt: timestamp,
      ...(decision === "REJECT" ? { publishedAt: null } : {}),
    },
  };
}

export function publishDeployment(
  record: PrivateDeploymentRecord,
  authorization: OperatorAuthorizationDecision,
  publishedAt = new Date(),
): PrivateDeploymentRecord {
  if (!validateDeploymentRecord(record).valid) throw new DeploymentWorkflowError("INVALID_RECORD");
  if (!authorization.allowed || authorization.permission !== "deployment.publish") {
    throw new DeploymentWorkflowError("PUBLISH_PERMISSION_REQUIRED");
  }
  if (record.verificationState !== "VERIFIED") {
    throw new DeploymentWorkflowError("VERIFICATION_REQUIRED");
  }
  if (record.publicDeploymentConsent !== "GRANTED") {
    throw new DeploymentWorkflowError("PUBLICATION_CONSENT_REQUIRED");
  }
  if (record.category === "MEMBER_LOCATION" && record.memberAssociation?.consent !== "GRANTED") {
    throw new DeploymentWorkflowError("MEMBER_ASSOCIATION_CONSENT_REQUIRED");
  }
  const timestamp = validTimestamp(publishedAt);
  return {
    ...record,
    publicationState: "PUBLISHED",
    timeline: { ...record.timeline, updatedAt: timestamp, publishedAt: timestamp },
  };
}

export function closeDeploymentPublication(
  record: PrivateDeploymentRecord,
  changedAt = new Date(),
): PrivateDeploymentRecord {
  const timestamp = validTimestamp(changedAt);
  return {
    ...record,
    publicationState: "UNPUBLISHED",
    timeline: { ...record.timeline, updatedAt: timestamp, publishedAt: null },
  };
}
