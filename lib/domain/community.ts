export type CommunityRecognitionType = "CONTRIBUTION" | "ACHIEVEMENT" | "RANK";
export type RecognitionVisibility = "PRIVATE" | "PUBLIC";
export type RecognitionModerationState = "PENDING" | "APPROVED" | "REJECTED" | "REMOVED";

export type CommunityRecognition = {
  id: string;
  publicMemberId: string;
  type: CommunityRecognitionType;
  title: string;
  description?: string;
  sourceReference: string;
  visibility: RecognitionVisibility;
  moderationState: RecognitionModerationState;
  awardedAt?: string;
};

export type SpotlightEligibility = {
  publicProfileVisible: boolean;
  spotlightConsentGranted: boolean;
  moderationState: RecognitionModerationState;
  hasPublishableContribution: boolean;
};

export function isEligibleForMemberSpotlight(
  eligibility: SpotlightEligibility,
): boolean {
  return (
    eligibility.publicProfileVisible &&
    eligibility.spotlightConsentGranted &&
    eligibility.moderationState === "APPROVED" &&
    eligibility.hasPublishableContribution
  );
}

/**
 * Service information is deliberately separate from generic community
 * recognition and must never be inferred from achievements, ranks, purchases,
 * deployments, or profile content.
 */
export type PrivateServiceVerification = {
  memberId: string;
  standardVersion: string;
  verificationState: "NOT_REQUESTED" | "PENDING" | "VERIFIED" | "REJECTED" | "REVOKED";
  privateEvidenceReference?: string;
  publicLabelConsent: "NOT_GRANTED" | "GRANTED" | "REVOKED";
};
