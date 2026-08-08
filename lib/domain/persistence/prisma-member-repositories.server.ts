import "server-only";

import { Prisma, type PrismaClient } from "@prisma/client";

import { BIOGRAPHY_MAX_LENGTH, normalizeCallsign, validateCallsign, validateOptionalDisplayName } from "../member.ts";
import type { ConsentPurpose, ConsentStatus } from "../consent.ts";
import {
  PersistenceConflictError,
  PersistenceValidationError,
  type AppendConsentDecisionInput,
  type ConsentDecisionRepository,
  type MemberIdentityRepository,
  type MemberProfileRepository,
  type MemberRecord,
  type PublicMemberCandidate,
  type SaveMemberProfileInput,
  type StoredConsentDecision,
  type VerifiedIdentityInput,
} from "./member-repositories.ts";

function memberRecord(member: {
  id: string;
  status: MemberRecord["status"];
  ageEligibilityAttestedAt: Date | null;
  eligibilityPolicyVersion: string | null;
  createdAt: Date;
  updatedAt: Date;
}): MemberRecord {
  return member;
}

function validateIdentity(identity: VerifiedIdentityInput): void {
  if (!identity.providerSubject.trim() || Number.isNaN(identity.verifiedAt.getTime())) {
    throw new PersistenceValidationError("verified identity");
  }
}

function validateProfile(input: SaveMemberProfileInput): SaveMemberProfileInput & { callsign: string } {
  const callsign = validateCallsign(input.callsign);
  if (!callsign.valid) throw new PersistenceValidationError("callsign");

  const displayName = validateOptionalDisplayName(input.displayName);
  if (!displayName.valid) throw new PersistenceValidationError("displayName");

  const biography = input.biography?.normalize("NFKC").trim();
  if (biography && (biography.length > BIOGRAPHY_MAX_LENGTH || /\p{Cc}/u.test(biography))) {
    throw new PersistenceValidationError("biography");
  }

  const location = input.cityLevelLocation;
  if (location && Object.values(location).some((value) => !value.trim() || value.length > 100 || /\p{Cc}/u.test(value))) {
    throw new PersistenceValidationError("cityLevelLocation");
  }

  return {
    ...input,
    callsign: callsign.callsign,
    displayName: displayName.value ?? undefined,
    biography: biography || undefined,
    cityLevelLocation: location
      ? { city: location.city.trim(), region: location.region.trim(), country: location.country.trim() }
      : undefined,
  };
}

function storedConsent(decision: {
  id: string;
  memberId: string;
  purpose: ConsentPurpose;
  decision: ConsentStatus;
  policyVersion: string;
  decidedAt: Date;
  source: string;
}): StoredConsentDecision {
  return {
    id: decision.id,
    memberId: decision.memberId,
    purpose: decision.purpose,
    status: decision.decision,
    policyVersion: decision.policyVersion,
    decidedAt: decision.decidedAt.toISOString(),
    source: decision.source as StoredConsentDecision["source"],
  };
}

export class PrismaMemberIdentityRepository implements MemberIdentityRepository {
  constructor(private readonly client: PrismaClient) {}

  async findMemberByIdentity(identity: Pick<VerifiedIdentityInput, "provider" | "providerSubject">) {
    const match = await this.client.authIdentity.findUnique({
      where: { provider_providerSubject: identity },
      select: { member: true },
    });
    return match ? memberRecord(match.member) : null;
  }

  async ensureMemberForVerifiedIdentity(identity: VerifiedIdentityInput) {
    validateIdentity(identity);
    const existing = await this.findMemberByIdentity(identity);
    if (existing) return existing;

    try {
      const created = await this.client.member.create({
        data: {
          identities: {
            create: {
              provider: identity.provider,
              providerSubject: identity.providerSubject.trim(),
              verifiedAt: identity.verifiedAt,
            },
          },
        },
      });
      return memberRecord(created);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const raced = await this.findMemberByIdentity(identity);
        if (raced) return raced;
        throw new PersistenceConflictError("identity");
      }
      throw error;
    }
  }

  async attestAdultEligibility(memberId: string, attestedAt: Date, policyVersion: string) {
    if (Number.isNaN(attestedAt.getTime()) || !policyVersion.trim()) {
      throw new PersistenceValidationError("age eligibility attestation");
    }
    return memberRecord(await this.client.member.update({
      where: { id: memberId },
      data: {
        ageEligibilityAttestedAt: attestedAt,
        eligibilityPolicyVersion: policyVersion.trim(),
      },
    }));
  }
}

export class PrismaMemberProfileRepository implements MemberProfileRepository {
  constructor(private readonly client: PrismaClient) {}

  async findPrivateProfileByMemberId(memberId: string) {
    const profile = await this.client.memberProfile.findUnique({ where: { memberId } });
    if (!profile) return null;
    return {
      memberId: profile.memberId,
      publicId: profile.publicId,
      callsign: profile.callsign,
      displayName: profile.displayName ?? undefined,
      biography: profile.biography ?? undefined,
      avatarUrl: profile.avatarUrl ?? undefined,
      cityLevelLocation: profile.city && profile.region && profile.country
        ? { city: profile.city, region: profile.region, country: profile.country }
        : undefined,
      visibility: profile.visibility,
    };
  }

  async savePrivateProfile(rawInput: SaveMemberProfileInput) {
    const input = validateProfile(rawInput);
    const location = input.cityLevelLocation;
    try {
      await this.client.memberProfile.upsert({
        where: { memberId: input.memberId },
        create: {
          memberId: input.memberId,
          callsign: input.callsign,
          displayName: input.displayName,
          biography: input.biography,
          avatarUrl: input.avatarUrl,
          city: location?.city,
          region: location?.region,
          country: location?.country,
          visibility: input.visibility ?? "PRIVATE",
        },
        update: {
          callsign: input.callsign,
          displayName: input.displayName,
          biography: input.biography,
          avatarUrl: input.avatarUrl,
          city: location?.city ?? null,
          region: location?.region ?? null,
          country: location?.country ?? null,
          visibility: input.visibility,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new PersistenceConflictError("callsign");
      }
      throw error;
    }
    const profile = await this.findPrivateProfileByMemberId(input.memberId);
    if (!profile) throw new Error("Profile persistence did not return the saved record.");
    return profile;
  }

  async findPublicCandidateByCallsign(rawCallsign: string): Promise<PublicMemberCandidate | null> {
    const callsign = normalizeCallsign(rawCallsign);
    const profile = await this.client.memberProfile.findFirst({
      where: { callsign, visibility: "PUBLIC", member: { status: "ACTIVE" } },
      include: { member: { select: { consents: { orderBy: [{ decidedAt: "asc" }, { id: "asc" }] } } } },
    });
    if (!profile) return null;
    return {
      profile: {
        memberId: profile.memberId,
        publicId: profile.publicId,
        callsign: profile.callsign,
        displayName: profile.displayName ?? undefined,
        biography: profile.biography ?? undefined,
        avatarUrl: profile.avatarUrl ?? undefined,
        cityLevelLocation: profile.city && profile.region && profile.country
          ? { city: profile.city, region: profile.region, country: profile.country }
          : undefined,
        visibility: profile.visibility,
      },
      consent: profile.member.consents.map((decision) => ({
        purpose: decision.purpose,
        status: decision.decision,
        decidedAt: decision.decidedAt.toISOString(),
        policyVersion: decision.policyVersion,
      })),
    };
  }
}

export class PrismaConsentDecisionRepository implements ConsentDecisionRepository {
  constructor(private readonly client: PrismaClient) {}

  async listForMember(memberId: string) {
    const decisions = await this.client.consentDecision.findMany({
      where: { memberId },
      orderBy: [{ decidedAt: "asc" }, { id: "asc" }],
    });
    return decisions.map(storedConsent);
  }

  async append(input: AppendConsentDecisionInput) {
    if (!input.policyVersion.trim()) throw new PersistenceValidationError("policyVersion");
    const decidedAt = input.decidedAt ?? new Date();
    if (Number.isNaN(decidedAt.getTime())) throw new PersistenceValidationError("decidedAt");
    const created = await this.client.consentDecision.create({
      data: {
        memberId: input.memberId,
        purpose: input.purpose,
        decision: input.status,
        policyVersion: input.policyVersion.trim(),
        source: input.source,
        decidedAt,
      },
    });
    return storedConsent(created);
  }
}
