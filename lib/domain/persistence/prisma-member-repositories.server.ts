import "server-only";

import { Prisma, type PrismaClient } from "@prisma/client";

import { BIOGRAPHY_MAX_LENGTH, normalizeCallsign, validateCallsign, validateOptionalDisplayName } from "../member.ts";
import type { ConsentPurpose, ConsentStatus } from "../consent.ts";
import {
  PersistenceConflictError,
  PersistenceOperationError,
  PersistenceUnavailableError,
  PersistenceValidationError,
  type AppendConsentDecisionInput,
  type ConsentDecisionRepository,
  type MemberIdentityRepository,
  type MemberProfileRepository,
  type MemberRecord,
  type MemberRepositorySet,
  type MemberRepositoryUnitOfWork,
  type PublicMemberCandidate,
  type SaveMemberProfileInput,
  type StoredConsentDecision,
  type VerifiedIdentityInput,
} from "./member-repositories.ts";

type MemberPrismaClient = Pick<
  Prisma.TransactionClient,
  "authIdentity" | "member" | "memberProfile" | "consentDecision"
>;

const RETRYABLE_PRISMA_CODES = new Set([
  "P1000",
  "P1001",
  "P1002",
  "P1008",
  "P1017",
  "P2024",
  "P2034",
]);

function prismaErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const candidate = error as { code?: unknown; errorCode?: unknown };
  if (typeof candidate.code === "string") return candidate.code;
  return typeof candidate.errorCode === "string" ? candidate.errorCode : undefined;
}

export function normalizePrismaPersistenceError(error: unknown): Error {
  if (
    error instanceof PersistenceConflictError ||
    error instanceof PersistenceValidationError ||
    error instanceof PersistenceUnavailableError ||
    error instanceof PersistenceOperationError
  ) return error;
  return RETRYABLE_PRISMA_CODES.has(prismaErrorCode(error) ?? "")
    ? new PersistenceUnavailableError()
    : new PersistenceOperationError();
}

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
  if (identity.ageEligibility && (
    Number.isNaN(identity.ageEligibility.attestedAt.getTime()) ||
    !identity.ageEligibility.policyVersion.trim()
  )) {
    throw new PersistenceValidationError("age eligibility attestation");
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
  constructor(private readonly client: MemberPrismaClient) {}

  async findMemberByIdentity(identity: Pick<VerifiedIdentityInput, "provider" | "providerSubject">) {
    try {
      const match = await this.client.authIdentity.findUnique({
        where: {
          provider_providerSubject: {
            provider: identity.provider,
            providerSubject: identity.providerSubject,
          },
        },
        select: { member: true },
      });
      return match ? memberRecord(match.member) : null;
    } catch (error) {
      throw normalizePrismaPersistenceError(error);
    }
  }

  async findMemberById(memberId: string) {
    try {
      const member = await this.client.member.findUnique({ where: { id: memberId } });
      return member ? memberRecord(member) : null;
    } catch (error) {
      throw normalizePrismaPersistenceError(error);
    }
  }

  async ensureMemberForVerifiedIdentity(identity: VerifiedIdentityInput) {
    validateIdentity(identity);
    const existing = await this.findMemberByIdentity(identity);
    if (existing) {
      if (identity.ageEligibility && !existing.ageEligibilityAttestedAt) {
        return this.attestAdultEligibility(
          existing.id,
          identity.ageEligibility.attestedAt,
          identity.ageEligibility.policyVersion,
        );
      }
      return existing;
    }

    try {
      const created = await this.client.member.create({
        data: {
          ageEligibilityAttestedAt: identity.ageEligibility?.attestedAt,
          eligibilityPolicyVersion: identity.ageEligibility?.policyVersion.trim(),
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
      throw normalizePrismaPersistenceError(error);
    }
  }

  async attestAdultEligibility(memberId: string, attestedAt: Date, policyVersion: string) {
    if (Number.isNaN(attestedAt.getTime()) || !policyVersion.trim()) {
      throw new PersistenceValidationError("age eligibility attestation");
    }
    try {
      return memberRecord(await this.client.member.update({
        where: { id: memberId },
        data: {
          ageEligibilityAttestedAt: attestedAt,
          eligibilityPolicyVersion: policyVersion.trim(),
        },
      }));
    } catch (error) {
      if (prismaErrorCode(error) === "P2025") throw new PersistenceValidationError("member");
      throw normalizePrismaPersistenceError(error);
    }
  }

  async requestDeletion(memberId: string, requestedAt?: Date) {
    if (!memberId.trim() || (requestedAt && Number.isNaN(requestedAt.getTime()))) {
      throw new PersistenceValidationError("deletion request");
    }
    try {
      return memberRecord(await this.client.member.update({
        where: { id: memberId },
        data: {
          status: "DELETION_REQUESTED",
          ...(requestedAt ? { updatedAt: requestedAt } : {}),
        },
      }));
    } catch (error) {
      if (prismaErrorCode(error) === "P2025") throw new PersistenceValidationError("member");
      throw normalizePrismaPersistenceError(error);
    }
  }
}

export class PrismaMemberProfileRepository implements MemberProfileRepository {
  constructor(private readonly client: MemberPrismaClient) {}

  async findPrivateProfileByMemberId(memberId: string) {
    try {
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
    } catch (error) {
      throw normalizePrismaPersistenceError(error);
    }
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
      throw normalizePrismaPersistenceError(error);
    }
    const profile = await this.findPrivateProfileByMemberId(input.memberId);
    if (!profile) throw new PersistenceOperationError();
    return profile;
  }

  async findPublicCandidateByCallsign(rawCallsign: string): Promise<PublicMemberCandidate | null> {
    try {
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
    } catch (error) {
      throw normalizePrismaPersistenceError(error);
    }
  }
}

export class PrismaConsentDecisionRepository implements ConsentDecisionRepository {
  constructor(private readonly client: MemberPrismaClient) {}

  async listForMember(memberId: string) {
    try {
      const decisions = await this.client.consentDecision.findMany({
        where: { memberId },
        orderBy: [{ decidedAt: "asc" }, { id: "asc" }],
      });
      return decisions.map(storedConsent);
    } catch (error) {
      throw normalizePrismaPersistenceError(error);
    }
  }

  async append(input: AppendConsentDecisionInput) {
    if (!input.policyVersion.trim()) throw new PersistenceValidationError("policyVersion");
    const decidedAt = input.decidedAt ?? new Date();
    if (Number.isNaN(decidedAt.getTime())) throw new PersistenceValidationError("decidedAt");
    try {
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
    } catch (error) {
      if (prismaErrorCode(error) === "P2003") throw new PersistenceValidationError("member");
      throw normalizePrismaPersistenceError(error);
    }
  }
}

export function createPrismaMemberRepositorySet(client: MemberPrismaClient): MemberRepositorySet {
  return {
    identities: new PrismaMemberIdentityRepository(client),
    profiles: new PrismaMemberProfileRepository(client),
    consents: new PrismaConsentDecisionRepository(client),
  };
}

export class PrismaMemberRepositoryUnitOfWork implements MemberRepositoryUnitOfWork {
  constructor(private readonly client: PrismaClient) {}

  async execute<T>(operation: (repositories: MemberRepositorySet) => Promise<T>): Promise<T> {
    try {
      return await this.client.$transaction(
        (transaction) => operation(createPrismaMemberRepositorySet(transaction)),
      );
    } catch (error) {
      throw normalizePrismaPersistenceError(error);
    }
  }
}
