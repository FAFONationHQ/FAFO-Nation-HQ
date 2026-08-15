export const DEPLOYMENT_CATEGORIES = [
  "STANDARD_GEAR",
  "GOLD_STAR_CUSTOM",
  "MEMBER_LOCATION",
] as const;

export type DeploymentCategory = (typeof DEPLOYMENT_CATEGORIES)[number];
export type DeploymentVerificationState = "PENDING" | "VERIFIED" | "REJECTED";
export type DeploymentPublicationState = "DRAFT" | "PUBLISHED" | "UNPUBLISHED";
export type DeploymentConsentState = "NOT_GRANTED" | "GRANTED" | "REVOKED";

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
  privateFulfillment?: {
    customerName?: string;
    email?: string;
    streetAddress?: string;
    orderNumber?: string;
    paymentReference?: string;
  };
};

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
      (value) => value.trim().length > 0 && value.length <= 100 && !/\p{Cc}/u.test(value),
    )
  );
}

/**
 * Projects a public deployment through an explicit allow-list. Private
 * fulfillment, account, contact, address, order, and payment fields cannot be
 * serialized by this function.
 */
export function projectPublicDeployment(
  record: PrivateDeploymentRecord,
): PublicDeployment | null {
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
