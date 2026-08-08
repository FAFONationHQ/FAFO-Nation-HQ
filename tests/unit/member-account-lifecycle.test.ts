import { describe, expect, test } from "vitest";

import { createAccountAnonymizationPlan } from "../../lib/domain/account-lifecycle.ts";
import {
  exportOwnMemberAccount,
  MemberSelfServiceAccessError,
  previewOwnAccountDeletion,
  requestOwnAccountDeletion,
} from "../../lib/domain/services/member-account-lifecycle.ts";
import { InMemoryMemberRepositories } from "../doubles/in-memory-member-repositories.ts";
import type { MemberRepositoryUnitOfWork } from "../../lib/domain/persistence/member-repositories.ts";

async function memberFixture() {
  const repositories = new InMemoryMemberRepositories();
  const member = await repositories.ensureMemberForVerifiedIdentity({
    provider: "workos",
    providerSubject: "shift-five-export",
    verifiedAt: new Date("2026-08-08T22:00:00.000Z"),
    ageEligibility: {
      attestedAt: new Date("2026-08-08T22:00:00.000Z"),
      policyVersion: "member-eligibility-v1",
    },
  });
  await repositories.savePrivateProfile({
    memberId: member.id,
    callsign: "export-member",
    displayName: "Synthetic Member",
    visibility: "PUBLIC",
  });
  await repositories.append({
    memberId: member.id,
    purpose: "PUBLIC_MEMBER_PROFILE",
    status: "GRANTED",
    policyVersion: "member-privacy-v1",
    source: "PROFILE_SETTINGS",
    decidedAt: new Date("2026-08-08T22:01:00.000Z"),
  });
  return { repositories, member };
}

describe("member account lifecycle foundation", () => {
  test("exports only the explicit V1 self-service allow-list", async () => {
    const { repositories, member } = await memberFixture();
    const exported = await exportOwnMemberAccount({
      authenticatedMemberId: member.id,
      requestedMemberId: member.id,
      exportedAt: new Date("2026-08-08T22:05:00.000Z"),
    }, repositories, repositories, repositories);

    expect(exported.member.id).toBe(member.id);
    expect(exported.profile?.callsign).toBe("export-member");
    expect(exported.consentHistory).toHaveLength(1);
    expect(JSON.stringify(exported)).not.toMatch(/providerSubject|email|password|secret|token/i);
  });

  test("denies incorrect-member export and deletion preview without enumeration detail", async () => {
    const { repositories, member } = await memberFixture();
    await expect(exportOwnMemberAccount({
      authenticatedMemberId: member.id,
      requestedMemberId: "another-member",
    }, repositories, repositories, repositories)).rejects.toBeInstanceOf(MemberSelfServiceAccessError);
    await expect(previewOwnAccountDeletion({
      authenticatedMemberId: member.id,
      requestedMemberId: "another-member",
    }, repositories)).rejects.toThrow("The requested member operation is unavailable.");
  });

  test("deletion request closes publication, appends revocation, and marks status", async () => {
    const { repositories, member } = await memberFixture();
    const unitOfWork: MemberRepositoryUnitOfWork = {
      execute: async (operation) =>
        operation({ identities: repositories, profiles: repositories, consents: repositories }),
    };
    const updated = await requestOwnAccountDeletion({
      authenticatedMemberId: member.id,
      requestedMemberId: member.id,
      requestedAt: new Date("2026-08-08T22:10:00.000Z"),
    }, unitOfWork);

    expect(updated.status).toBe("DELETION_REQUESTED");
    expect((await repositories.findPrivateProfileByMemberId(member.id))?.visibility).toBe("PRIVATE");
    expect((await repositories.listForMember(member.id)).map(({ status }) => status)).toEqual([
      "GRANTED",
      "REVOKED",
    ]);
  });

  test("deletion preview and anonymization plan avoid invented retention periods", async () => {
    const { repositories, member } = await memberFixture();
    const preview = await previewOwnAccountDeletion({
      authenticatedMemberId: member.id,
      requestedMemberId: member.id,
    }, repositories);
    expect(preview.retention).toEqual({
      consentHistory: "RETAIN_PENDING_APPROVED_POLICY",
      finalPeriod: null,
    });
    expect(createAccountAnonymizationPlan()).toMatchObject({ executable: false });
  });
});
