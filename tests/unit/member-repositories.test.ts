import type { PrismaClient } from "@prisma/client";
import { describe, expect, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { projectPublicMemberProfile } from "../../lib/domain/public-member.ts";
import {
  normalizePrismaPersistenceError,
  PrismaMemberIdentityRepository,
} from "../../lib/domain/persistence/prisma-member-repositories.server.ts";
import {
  PersistenceConflictError,
  PersistenceOperationError,
  PersistenceUnavailableError,
} from "../../lib/domain/persistence/member-repositories.ts";
import { InMemoryMemberRepositories } from "../doubles/in-memory-member-repositories.ts";

const verifiedIdentity = {
  provider: "workos" as const,
  providerSubject: "user_01",
  verifiedAt: new Date("2026-08-08T18:00:00.000Z"),
};

describe("member repository contract double", () => {
  test("normalizes connection and unknown database failures without leaking details", () => {
    const unavailable = normalizePrismaPersistenceError({
      code: "P1001",
      message: "secret database host and credential detail",
    });
    expect(unavailable).toBeInstanceOf(PersistenceUnavailableError);
    expect(unavailable.message).not.toMatch(/secret|host|credential/i);

    const operation = normalizePrismaPersistenceError(new Error("raw query and database detail"));
    expect(operation).toBeInstanceOf(PersistenceOperationError);
    expect(operation.message).not.toMatch(/raw query|database detail/i);
  });

  test("connection failures from repository reads become stable retryable errors", async () => {
    const repositories = new PrismaMemberIdentityRepository({
      authIdentity: {
        findUnique: vi.fn().mockRejectedValue({ code: "P1017", message: "connection closed" }),
      },
    } as unknown as PrismaClient);

    await expect(repositories.findMemberByIdentity({
      provider: "workos",
      providerSubject: "user_01",
    })).rejects.toMatchObject({
      name: "PersistenceUnavailableError",
      retryable: true,
    });
  });

  test("Prisma identity lookup passes only compound unique selector fields", async () => {
    const findUnique = vi.fn().mockResolvedValue({
      member: {
        id: "member_01",
        status: "ACTIVE",
        ageEligibilityAttestedAt: null,
        eligibilityPolicyVersion: null,
        createdAt: new Date("2026-08-08T18:00:00.000Z"),
        updatedAt: new Date("2026-08-08T18:00:00.000Z"),
      },
    });
    const repositories = new PrismaMemberIdentityRepository({
      authIdentity: { findUnique },
    } as unknown as PrismaClient);

    await repositories.ensureMemberForVerifiedIdentity(verifiedIdentity);

    expect(findUnique).toHaveBeenCalledWith({
      where: {
        provider_providerSubject: {
          provider: "workos",
          providerSubject: "user_01",
        },
      },
      select: { member: true },
    });
  });

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
