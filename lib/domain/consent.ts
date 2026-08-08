export const CONSENT_PURPOSES = [
  "PUBLIC_MEMBER_PROFILE",
  "PUBLIC_MEMBER_LOCATION",
  "PUBLIC_DEPLOYMENT",
  "MEMBER_LINKED_DEPLOYMENT",
  "CUSTOM_SHOP_GALLERY",
  "MEDIA_MEMBER_SPOTLIGHT",
] as const;

export type ConsentPurpose = (typeof CONSENT_PURPOSES)[number];
export type ConsentStatus = "GRANTED" | "REVOKED";

export type ConsentDecision = {
  purpose: ConsentPurpose;
  status: ConsentStatus;
  decidedAt: string;
  policyVersion: string;
};

function isValidTimestamp(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

export function latestConsentDecision(
  decisions: readonly ConsentDecision[],
  purpose: ConsentPurpose,
): ConsentDecision | null {
  return decisions
    .filter((decision) => decision.purpose === purpose && isValidTimestamp(decision.decidedAt))
    .reduce<ConsentDecision | null>((latest, decision) => {
      if (!latest) return decision;
      const comparison = Date.parse(decision.decidedAt) - Date.parse(latest.decidedAt);
      if (comparison > 0) return decision;
      if (comparison === 0 && decision.status === "REVOKED") return decision;
      return latest;
    }, null);
}

export function hasActiveConsent(
  decisions: readonly ConsentDecision[],
  purpose: ConsentPurpose,
): boolean {
  return latestConsentDecision(decisions, purpose)?.status === "GRANTED";
}

export function consentPurposesAreIndependent(
  decisions: readonly ConsentDecision[],
  requiredPurposes: readonly ConsentPurpose[],
): boolean {
  return requiredPurposes.every((purpose) => hasActiveConsent(decisions, purpose));
}
