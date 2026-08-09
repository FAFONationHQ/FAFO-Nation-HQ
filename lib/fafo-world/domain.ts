export const DEPLOYMENT_CATEGORIES = [
  "STANDARD_GEAR",
  "GOLD_STAR_CUSTOM",
  "MEMBER_LOCATION",
] as const;

export type DeploymentCategory = (typeof DEPLOYMENT_CATEGORIES)[number];
export type DeploymentVerificationState = "PENDING" | "VERIFIED" | "REJECTED";
export type DeploymentPublicationState = "DRAFT" | "PUBLISHED" | "UNPUBLISHED";
export type DeploymentConsentState = "NOT_GRANTED" | "GRANTED" | "REVOKED";

const DEPLOYMENT_VERIFICATION_STATES = ["PENDING", "VERIFIED", "REJECTED"] as const;
const DEPLOYMENT_PUBLICATION_STATES = ["DRAFT", "PUBLISHED", "UNPUBLISHED"] as const;
const DEPLOYMENT_CONSENT_STATES = ["NOT_GRANTED", "GRANTED", "REVOKED"] as const;
const DEPLOYMENT_PROVENANCE_SOURCES = [
  "MANUAL_REVIEW",
  "FULFILLMENT_EVENT",
  "MEMBER_SUBMISSION",
  "STATIC_IMPORT",
] as const;

export type DeploymentProvenance = {
  source: "MANUAL_REVIEW" | "FULFILLMENT_EVENT" | "MEMBER_SUBMISSION" | "STATIC_IMPORT";
  sourceReference: string;
  recordedAt: string;
};

export type DeploymentTimeline = {
  createdAt: string | null;
  updatedAt: string | null;
  publishedAt: string | null;
};

export type DeploymentLocation = {
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
};

export type PrivateDeploymentRecord = {
  id: string;
  location: DeploymentLocation;
  category: DeploymentCategory;
  publicLabel: string;
  verificationState: DeploymentVerificationState;
  publicationState: DeploymentPublicationState;
  publicDeploymentConsent: DeploymentConsentState;
  memberAssociation?: {
    publicRole?: string;
    publicCallsign?: string;
    consent: DeploymentConsentState;
  };
  timeline: DeploymentTimeline;
  provenance?: DeploymentProvenance;
  privateFulfillment?: {
    customerName?: string;
    email?: string;
    streetAddress?: string;
    orderNumber?: string;
    paymentReference?: string;
  };
};

export type DeploymentValidationResult =
  | { valid: true }
  | { valid: false; reasons: readonly string[] };

type PublicDeploymentBase = DeploymentLocation & {
  id: string;
  publicLabel: string;
  timeline: DeploymentTimeline;
};

export type PublicGearDeployment = PublicDeploymentBase & {
  category: "STANDARD_GEAR" | "GOLD_STAR_CUSTOM";
  markerType: "standard-deployment" | "gold-star-fafo";
};

export type PublicMemberLocation = PublicDeploymentBase & {
  category: "MEMBER_LOCATION";
  markerType: "fafo-member-location";
  role: string;
  callsign?: string;
};

export type PublicDeployment = PublicGearDeployment | PublicMemberLocation;

function locationIsPublicSafe(location: DeploymentLocation): boolean {
  return (
    Number.isFinite(location.latitude) &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    Number.isFinite(location.longitude) &&
    location.longitude >= -180 &&
    location.longitude <= 180 &&
    [location.city, location.region, location.country].every(
      (value) => value.length > 0 &&
        value === value.trim() &&
        value.length <= 100 &&
        !/\p{Cc}/u.test(value),
    )
  );
}

function validOptionalTimestamp(value: string | null): boolean {
  if (value === null) return true;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
}

function runtimeValue(values: readonly string[], value: unknown): boolean {
  return typeof value === "string" && values.includes(value);
}

function safeOptionalPublicText(value: string | undefined, maximumLength: number): boolean {
  return value === undefined || (
    value.length > 0 &&
    value === value.trim() &&
    value.length <= maximumLength &&
    !/\p{Cc}/u.test(value)
  );
}

function timelineIsCoherent(record: PrivateDeploymentRecord): boolean {
  const { createdAt, updatedAt, publishedAt } = record.timeline;
  if (![createdAt, updatedAt, publishedAt].every(validOptionalTimestamp)) return false;
  if (createdAt && updatedAt && createdAt > updatedAt) return false;
  if (createdAt && publishedAt && createdAt > publishedAt) return false;
  if (publishedAt && updatedAt && publishedAt > updatedAt) return false;
  return record.publicationState !== "PUBLISHED" || publishedAt !== null;
}

function memberAssociationIsPublicSafe(record: PrivateDeploymentRecord): boolean {
  const association = record.memberAssociation;
  if (!association) return record.category !== "MEMBER_LOCATION";
  return runtimeValue(DEPLOYMENT_CONSENT_STATES, association.consent) &&
    safeOptionalPublicText(association.publicRole, 80) &&
    (association.publicCallsign === undefined || (
      association.publicCallsign.length >= 3 &&
      association.publicCallsign.length <= 24 &&
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(association.publicCallsign)
    ));
}

export function validateDeploymentRecord(record: PrivateDeploymentRecord): DeploymentValidationResult {
  const reasons: string[] = [];
  if (!record.id || record.id !== record.id.trim() || record.id.length > 200 || /\p{Cc}/u.test(record.id)) {
    reasons.push("INVALID_ID");
  }
  if (
    !record.publicLabel ||
    record.publicLabel !== record.publicLabel.trim() ||
    record.publicLabel.length > 120 ||
    /\p{Cc}/u.test(record.publicLabel)
  ) {
    reasons.push("INVALID_PUBLIC_LABEL");
  }
  if (
    !runtimeValue(DEPLOYMENT_CATEGORIES, record.category) ||
    !runtimeValue(DEPLOYMENT_VERIFICATION_STATES, record.verificationState) ||
    !runtimeValue(DEPLOYMENT_PUBLICATION_STATES, record.publicationState) ||
    !runtimeValue(DEPLOYMENT_CONSENT_STATES, record.publicDeploymentConsent)
  ) reasons.push("INVALID_WORKFLOW_STATE");
  if (!locationIsPublicSafe(record.location)) reasons.push("INVALID_PUBLIC_LOCATION");
  if (!timelineIsCoherent(record)) reasons.push("INVALID_TIMELINE");
  if (record.provenance && (
    !runtimeValue(DEPLOYMENT_PROVENANCE_SOURCES, record.provenance.source) ||
    !record.provenance.sourceReference ||
    record.provenance.sourceReference !== record.provenance.sourceReference.trim() ||
    record.provenance.sourceReference.length > 200 ||
    !validOptionalTimestamp(record.provenance.recordedAt)
  )) reasons.push("INVALID_PROVENANCE");
  if (!memberAssociationIsPublicSafe(record)) reasons.push("INVALID_MEMBER_ASSOCIATION");
  return reasons.length === 0 ? { valid: true } : { valid: false, reasons };
}

/**
 * Projects a public deployment through an explicit allow-list. Private
 * fulfillment, account, contact, address, order, and payment fields cannot be
 * serialized by this function.
 */
export function projectPublicDeployment(
  record: PrivateDeploymentRecord,
): PublicDeployment | null {
  if (!validateDeploymentRecord(record).valid) return null;
  if (
    record.verificationState !== "VERIFIED" ||
    record.publicationState !== "PUBLISHED" ||
    record.publicDeploymentConsent !== "GRANTED" ||
    !locationIsPublicSafe(record.location)
  ) {
    return null;
  }

  const base: PublicDeploymentBase = {
    id: record.id,
    ...record.location,
    publicLabel: record.publicLabel,
    timeline: { ...record.timeline },
  };

  if (record.category === "STANDARD_GEAR") {
    return { ...base, category: record.category, markerType: "standard-deployment" };
  }

  if (record.category === "GOLD_STAR_CUSTOM") {
    return { ...base, category: record.category, markerType: "gold-star-fafo" };
  }

  if (record.memberAssociation?.consent !== "GRANTED") return null;

  return {
    ...base,
    category: "MEMBER_LOCATION",
    markerType: "fafo-member-location",
    role: record.memberAssociation.publicRole ?? "FAFO Member",
    ...(record.memberAssociation.publicCallsign
      ? { callsign: record.memberAssociation.publicCallsign }
      : {}),
  };
}
