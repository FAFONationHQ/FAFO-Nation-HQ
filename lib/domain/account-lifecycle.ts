import type { MemberProfile } from "./member.ts";
import type {
  MemberRecord,
  StoredConsentDecision,
} from "./persistence/member-repositories.ts";

export const ACCOUNT_EXPORT_SCHEMA_VERSION = "fafo-member-export-v1";

export type MemberAccountExport = {
  schemaVersion: typeof ACCOUNT_EXPORT_SCHEMA_VERSION;
  exportedAt: string;
  member: {
    id: string;
    status: MemberRecord["status"];
    ageEligibilityAttestedAt: string | null;
    eligibilityPolicyVersion: string | null;
    createdAt: string;
    updatedAt: string;
  };
  profile: Omit<MemberProfile, "memberId"> | null;
  consentHistory: readonly StoredConsentDecision[];
};

export type AccountDeletionPreview = {
  memberId: string;
  currentStatus: MemberRecord["status"];
  requestedStatus: "DELETION_REQUESTED";
  immediateEffects: readonly [
    "PUBLIC_PROFILE_DISABLED",
    "MEMBER_AUTHORIZATION_DENIED",
  ];
  retention: {
    consentHistory: "RETAIN_PENDING_APPROVED_POLICY";
    finalPeriod: null;
  };
  deferredActions: readonly [
    "AUTH_PROVIDER_ACCOUNT_ACTION",
    "IDENTITY_ANONYMIZATION",
    "FINAL_RECORD_DELETION",
  ];
};

export type AccountAnonymizationPlan = {
  executable: false;
  profileFieldsToClear: readonly [
    "displayName",
    "biography",
    "avatarUrl",
    "city",
    "region",
    "country",
  ];
  profileVisibility: "PRIVATE";
  callsignAction: "REPLACE_WITH_NON_IDENTIFYING_UNIQUE_VALUE";
  authIdentityAction: "REQUIRES_PROVIDER_AND_RETENTION_APPROVAL";
  consentHistoryAction: "RETAIN_MINIMIZED_PENDING_APPROVED_POLICY";
};

export function createMemberAccountExport(
  member: MemberRecord,
  profile: MemberProfile | null,
  consentHistory: readonly StoredConsentDecision[],
  exportedAt = new Date(),
): MemberAccountExport {
  if (Number.isNaN(exportedAt.getTime())) throw new Error("Invalid account export timestamp.");
  return {
    schemaVersion: ACCOUNT_EXPORT_SCHEMA_VERSION,
    exportedAt: exportedAt.toISOString(),
    member: {
      id: member.id,
      status: member.status,
      ageEligibilityAttestedAt: member.ageEligibilityAttestedAt?.toISOString() ?? null,
      eligibilityPolicyVersion: member.eligibilityPolicyVersion,
      createdAt: member.createdAt.toISOString(),
      updatedAt: member.updatedAt.toISOString(),
    },
    profile: profile ? {
      publicId: profile.publicId,
      callsign: profile.callsign,
      displayName: profile.displayName,
      biography: profile.biography,
      avatarUrl: profile.avatarUrl,
      cityLevelLocation: profile.cityLevelLocation,
      visibility: profile.visibility,
    } : null,
    consentHistory: consentHistory.map((decision) => ({ ...decision })),
  };
}

export function createAccountDeletionPreview(member: MemberRecord): AccountDeletionPreview {
  return {
    memberId: member.id,
    currentStatus: member.status,
    requestedStatus: "DELETION_REQUESTED",
    immediateEffects: ["PUBLIC_PROFILE_DISABLED", "MEMBER_AUTHORIZATION_DENIED"],
    retention: {
      consentHistory: "RETAIN_PENDING_APPROVED_POLICY",
      finalPeriod: null,
    },
    deferredActions: [
      "AUTH_PROVIDER_ACCOUNT_ACTION",
      "IDENTITY_ANONYMIZATION",
      "FINAL_RECORD_DELETION",
    ],
  };
}

export function createAccountAnonymizationPlan(): AccountAnonymizationPlan {
  return {
    executable: false,
    profileFieldsToClear: [
      "displayName",
      "biography",
      "avatarUrl",
      "city",
      "region",
      "country",
    ],
    profileVisibility: "PRIVATE",
    callsignAction: "REPLACE_WITH_NON_IDENTIFYING_UNIQUE_VALUE",
    authIdentityAction: "REQUIRES_PROVIDER_AND_RETENTION_APPROVAL",
    consentHistoryAction: "RETAIN_MINIMIZED_PENDING_APPROVED_POLICY",
  };
}
