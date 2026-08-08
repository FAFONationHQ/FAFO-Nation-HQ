import { describe, expect, test } from "vitest";
import { findConsentControlledPublicMember } from "../../lib/domain/services/public-member-profile.ts";
import { InMemoryMemberRepositories } from "../doubles/in-memory-member-repositories.ts";

describe("public member lookup", () => {
  test("returns only the consent-controlled projection", async () => {
    const repositories = new InMemoryMemberRepositories();
    const member = await repositories.ensureMemberForVerifiedIdentity({
      provider: "workos", providerSubject: "user_public", verifiedAt: new Date(),
      ageEligibility: { attestedAt: new Date(), policyVersion: "member-eligibility-v1" },
    });
    await repositories.savePrivateProfile({
      memberId: member.id,
      callsign: "public-member",
      displayName: "Public Member",
      cityLevelLocation: { city: "Victoria", region: "British Columbia", country: "Canada" },
      visibility: "PUBLIC",
    });
    await repositories.append({ memberId: member.id, purpose: "PUBLIC_MEMBER_PROFILE", status: "GRANTED", policyVersion: "member-privacy-v1", source: "PROFILE_SETTINGS" });
    const profile = await findConsentControlledPublicMember(" Public_Member ", repositories);
    expect(profile).toEqual({
      publicId: expect.any(String),
      callsign: "public-member",
      displayName: "Public Member",
    });
    expect(JSON.stringify(profile)).not.toMatch(/user_public|memberId|email|provider/i);
  });
});
