import { describe, expect, test } from "vitest";

import { projectPublicMemberProfile } from "../../lib/domain/public-member.ts";
import { PersistenceConflictError } from "../../lib/domain/persistence/member-repositories.ts";
import { InMemoryMemberRepositories } from "../doubles/in-memory-member-repositories.ts";

const verifiedIdentity = {
  provider: "workos" as const,
  providerSubject: "user_01",
  verifiedAt: new Date("2026-08-08T18:00:00.000Z"),
};

describe("member repository contract double", () => {
  test("verified identity association is idempotent and stores no credentials", async () => {
    const repositories = new InMemoryMemberRepositories();
    const first = await repositories.ensureMemberForVerifiedIdentity(verifiedIdentity);
    const second = await repositories.ensureMemberForVerifiedIdentity(verifiedIdentity);
    expect(second.id).toBe(first.id);
    expect(JSON.stringify(first)).not.toMatch(/email|password|secret|token/i);
  });

  test("profiles start private and callsigns are normalized and unique", async () => {
    const repositories = new InMemoryMemberRepositories();
    const first = await repositories.ensureMemberForVerifiedIdentity(verifiedIdentity);
    const second = await repositories.ensureMemberForVerifiedIdentity({
      ...verifiedIdentity,
      providerSubject: "user_02",
    });
    const profile = await repositories.savePrivateProfile({ memberId: first.id, callsign: " Maple Guard " });
    expect(profile.visibility).toBe("PRIVATE");
    expect(profile.callsign).toBe("maple-guard");
    await expect(repositories.savePrivateProfile({ memberId: second.id, callsign: "maple_guard" }))
      .rejects.toBeInstanceOf(PersistenceConflictError);
  });

  test("consent decisions append and revocation closes public projection", async () => {
    const repositories = new InMemoryMemberRepositories();
    const member = await repositories.ensureMemberForVerifiedIdentity(verifiedIdentity);
    await repositories.savePrivateProfile({
      memberId: member.id,
      callsign: "maple-guard",
      visibility: "PUBLIC",
    });
    await repositories.append({
      memberId: member.id,
      purpose: "PUBLIC_MEMBER_PROFILE",
      status: "GRANTED",
      policyVersion: "privacy-v1",
      source: "PROFILE_SETTINGS",
      decidedAt: new Date("2026-08-08T18:01:00.000Z"),
    });
    const granted = await repositories.findPublicCandidateByCallsign("maple-guard");
    expect(granted && projectPublicMemberProfile(granted.profile, granted.consent)).not.toBeNull();
    await repositories.append({
      memberId: member.id,
      purpose: "PUBLIC_MEMBER_PROFILE",
      status: "REVOKED",
      policyVersion: "privacy-v1",
      source: "PROFILE_SETTINGS",
      decidedAt: new Date("2026-08-08T18:02:00.000Z"),
    });
    const revoked = await repositories.findPublicCandidateByCallsign("maple-guard");
    expect(revoked && projectPublicMemberProfile(revoked.profile, revoked.consent)).toBeNull();
    expect((await repositories.listForMember(member.id))).toHaveLength(2);
  });
});
