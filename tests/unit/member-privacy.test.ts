import { describe, expect, test } from "vitest";
import { changePublicConsent } from "../../lib/domain/services/member-privacy.ts";
import { projectPublicMemberProfile } from "../../lib/domain/public-member.ts";
import { InMemoryMemberRepositories } from "../doubles/in-memory-member-repositories.ts";

describe("member privacy service", () => {
  test("grant opens only after consent exists and revoke closes first", async () => {
    const repositories = new InMemoryMemberRepositories();
    const member = await repositories.ensureMemberForVerifiedIdentity({
      provider: "workos", providerSubject: "user_privacy", verifiedAt: new Date(),
      ageEligibility: { attestedAt: new Date(), policyVersion: "member-eligibility-v1" },
    });
    await repositories.savePrivateProfile({ memberId: member.id, callsign: "privacy-member" });
    await changePublicConsent(
      { memberId: member.id, purpose: "PUBLIC_MEMBER_PROFILE", status: "GRANTED", decidedAt: new Date("2026-08-08T20:00:00Z") },
      repositories, repositories,
    );
    let candidate = await repositories.findPublicCandidateByCallsign("privacy-member");
    expect(candidate && projectPublicMemberProfile(candidate.profile, candidate.consent)).not.toBeNull();
    await changePublicConsent(
      { memberId: member.id, purpose: "PUBLIC_MEMBER_PROFILE", status: "REVOKED", decidedAt: new Date("2026-08-08T20:01:00Z") },
      repositories, repositories,
    );
    candidate = await repositories.findPublicCandidateByCallsign("privacy-member");
    expect(candidate).toBeNull();
    expect(await repositories.listForMember(member.id)).toHaveLength(2);
  });
});
