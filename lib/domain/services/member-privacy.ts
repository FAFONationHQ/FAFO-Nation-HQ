import { MEMBER_ELIGIBILITY_POLICY_VERSION } from "../../auth/member-signup-state.ts";
import {
  PersistenceValidationError,
  type ConsentDecisionRepository,
  type MemberProfileRepository,
  type MemberRepositoryUnitOfWork,
} from "../persistence/member-repositories.ts";

export const MEMBER_PRIVACY_POLICY_VERSION = "member-privacy-v1";

export async function changePublicConsent(
  input: {
    memberId: string;
    purpose: "PUBLIC_MEMBER_PROFILE" | "PUBLIC_MEMBER_LOCATION";
    status: "GRANTED" | "REVOKED";
    decidedAt?: Date;
  },
  profiles: MemberProfileRepository,
  consents: ConsentDecisionRepository,
) {
  const profile = await profiles.findPrivateProfileByMemberId(input.memberId);
  if (!profile) throw new PersistenceValidationError("profile");
  if (
    input.purpose === "PUBLIC_MEMBER_LOCATION" &&
    input.status === "GRANTED" &&
    !profile.cityLevelLocation
  ) throw new PersistenceValidationError("cityLevelLocation");

  if (input.purpose === "PUBLIC_MEMBER_PROFILE" && input.status === "REVOKED") {
    await profiles.savePrivateProfile({ ...profile, visibility: "PRIVATE" });
  }

  const decision = await consents.append({
    memberId: input.memberId,
    purpose: input.purpose,
    status: input.status,
    policyVersion: MEMBER_PRIVACY_POLICY_VERSION,
    source: "PROFILE_SETTINGS",
    decidedAt: input.decidedAt,
  });

  if (input.purpose === "PUBLIC_MEMBER_PROFILE" && input.status === "GRANTED") {
    await profiles.savePrivateProfile({ ...profile, visibility: "PUBLIC" });
  }
  return decision;
}

export async function changePublicConsentTransactionally(
  input: Parameters<typeof changePublicConsent>[0],
  unitOfWork: MemberRepositoryUnitOfWork,
) {
  return unitOfWork.execute(({ profiles, consents }) =>
    changePublicConsent(input, profiles, consents),
  );
}

// Keep the eligibility policy import visible to dependency checks: privacy
// controls are available only after the separate adult attestation boundary.
export const REQUIRED_ELIGIBILITY_POLICY_VERSION = MEMBER_ELIGIBILITY_POLICY_VERSION;
