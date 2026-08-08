import { describe, expect, test } from "vitest";
import {
  changePublicConsent,
  changePublicConsentTransactionally,
} from "../../lib/domain/services/member-privacy.ts";
import { projectPublicMemberProfile } from "../../lib/domain/public-member.ts";
import { PersistenceUnavailableError } from "../../lib/domain/persistence/member-repositories.ts";
import { findConsentControlledPublicMember } from "../../lib/domain/services/public-member-profile.ts";
import { InMemoryMemberRepositories } from "../doubles/in-memory-member-repositories.ts";

describe("member privacy service", () => {
  test("public lookup fails closed when persistence is unavailable", async () => {
    const repository = {
      findPublicCandidateByCallsign: async () => { throw new PersistenceUnavailableError(); },
    };
    await expect(findConsentControlledPublicMember(
      "privacy-member",
      repository as never,
    )).resolves.toBeNull();
  });

  test("transactional consent changes use only transaction-scoped repositories", async () => {
    const repositories = new InMemoryMemberRepositories();
    const member = await repositories.ensureMemberForVerifiedIdentity({
      provider: "workos", providerSubject: "user_transaction", verifiedAt: new Date(),
    });
    await repositories.savePrivateProfile({ memberId: member.id, callsign: "transaction-member" });
    let executions = 0;
    const unitOfWork = {
      execute: async <T>(operation: (repositorySet: {
        identities: InMemoryMemberRepositories;
        profiles: InMemoryMemberRepositories;
        consents: InMemoryMemberRepositories;
      }) => Promise<T>) => {
        executions += 1;
        return operation({ identities: repositories, profiles: repositories, consents: repositories });
      },
    };
    await changePublicConsentTransactionally({
      memberId: member.id,
      purpose: "PUBLIC_MEMBER_PROFILE",
      status: "GRANTED",
    }, unitOfWork);
    expect(executions).toBe(1);
  });

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
