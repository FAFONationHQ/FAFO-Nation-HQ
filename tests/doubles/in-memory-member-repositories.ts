import type {
  AppendConsentDecisionInput,
  ConsentDecisionRepository,
  MemberIdentityRepository,
  MemberProfileRepository,
  MemberRecord,
  PublicMemberCandidate,
  SaveMemberProfileInput,
  StoredConsentDecision,
  VerifiedIdentityInput,
} from "../../lib/domain/persistence/member-repositories.ts";
import { PersistenceConflictError, PersistenceValidationError } from "../../lib/domain/persistence/member-repositories.ts";
import { normalizeCallsign, validateCallsign } from "../../lib/domain/member.ts";

export class InMemoryMemberRepositories implements MemberIdentityRepository, MemberProfileRepository, ConsentDecisionRepository {
  private sequence = 0;
  private readonly members = new Map<string, MemberRecord>();
  private readonly identities = new Map<string, string>();
  private readonly profiles = new Map<string, Awaited<ReturnType<MemberProfileRepository["savePrivateProfile"]>>>();
  private readonly consents: StoredConsentDecision[] = [];

  private nextId(prefix: string) {
    this.sequence += 1;
    return `${prefix}-${this.sequence}`;
  }

  async findMemberByIdentity(identity: Pick<VerifiedIdentityInput, "provider" | "providerSubject">) {
    const memberId = this.identities.get(`${identity.provider}:${identity.providerSubject}`);
    return memberId ? this.members.get(memberId) ?? null : null;
  }

  async ensureMemberForVerifiedIdentity(identity: VerifiedIdentityInput) {
    if (!identity.providerSubject.trim() || Number.isNaN(identity.verifiedAt.getTime())) {
      throw new PersistenceValidationError("verified identity");
    }
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
    const now = new Date(identity.verifiedAt);
    const member: MemberRecord = {
      id: this.nextId("member"),
      status: "ACTIVE",
      ageEligibilityAttestedAt: identity.ageEligibility?.attestedAt ?? null,
      eligibilityPolicyVersion: identity.ageEligibility?.policyVersion ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.members.set(member.id, member);
    this.identities.set(`${identity.provider}:${identity.providerSubject}`, member.id);
    return member;
  }

  async attestAdultEligibility(memberId: string, attestedAt: Date, policyVersion: string) {
    const member = this.members.get(memberId);
    if (!member || !policyVersion.trim()) throw new PersistenceValidationError("age eligibility attestation");
    const updated = { ...member, ageEligibilityAttestedAt: attestedAt, eligibilityPolicyVersion: policyVersion, updatedAt: attestedAt };
    this.members.set(memberId, updated);
    return updated;
  }

  async findPrivateProfileByMemberId(memberId: string) {
    return this.profiles.get(memberId) ?? null;
  }

  async savePrivateProfile(input: SaveMemberProfileInput) {
    const callsign = validateCallsign(input.callsign);
    if (!callsign.valid) throw new PersistenceValidationError("callsign");
    const conflict = [...this.profiles.values()].some(
      (profile) => profile.memberId !== input.memberId && profile.callsign === callsign.callsign,
    );
    if (conflict) throw new PersistenceConflictError("callsign");
    const existing = this.profiles.get(input.memberId);
    const profile = {
      memberId: input.memberId,
      publicId: existing?.publicId ?? this.nextId("public-member"),
      callsign: callsign.callsign,
      displayName: input.displayName,
      biography: input.biography,
      avatarUrl: input.avatarUrl,
      cityLevelLocation: input.cityLevelLocation,
      visibility: input.visibility ?? existing?.visibility ?? "PRIVATE",
    } as const;
    this.profiles.set(input.memberId, profile);
    return profile;
  }

  async findPublicCandidateByCallsign(rawCallsign: string): Promise<PublicMemberCandidate | null> {
    const profile = [...this.profiles.values()].find(
      (candidate) => candidate.callsign === normalizeCallsign(rawCallsign) && candidate.visibility === "PUBLIC",
    );
    if (!profile) return null;
    return { profile, consent: await this.listForMember(profile.memberId) };
  }

  async listForMember(memberId: string) {
    return this.consents.filter((decision) => decision.memberId === memberId);
  }

  async append(input: AppendConsentDecisionInput) {
    const decision: StoredConsentDecision = {
      id: this.nextId("consent"),
      memberId: input.memberId,
      purpose: input.purpose,
      status: input.status,
      policyVersion: input.policyVersion,
      source: input.source,
      decidedAt: (input.decidedAt ?? new Date()).toISOString(),
    };
    this.consents.push(decision);
    return decision;
  }
}
