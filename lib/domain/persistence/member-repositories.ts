import type { ConsentDecision, ConsentPurpose, ConsentStatus } from "../consent.ts";
import type { MemberProfile, MemberProfileVisibility } from "../member.ts";

export type ManagedAuthProvider = "workos";
export type PersistentMemberStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "DELETION_REQUESTED"
  | "ANONYMIZED";

export type MemberRecord = {
  id: string;
  status: PersistentMemberStatus;
  ageEligibilityAttestedAt: Date | null;
  eligibilityPolicyVersion: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type VerifiedIdentityInput = {
  provider: ManagedAuthProvider;
  providerSubject: string;
  verifiedAt: Date;
};

export interface MemberIdentityRepository {
  findMemberByIdentity(identity: Pick<VerifiedIdentityInput, "provider" | "providerSubject">): Promise<MemberRecord | null>;
  ensureMemberForVerifiedIdentity(identity: VerifiedIdentityInput): Promise<MemberRecord>;
  attestAdultEligibility(memberId: string, attestedAt: Date, policyVersion: string): Promise<MemberRecord>;
}

export type SaveMemberProfileInput = {
  memberId: string;
  callsign: string;
  displayName?: string;
  biography?: string;
  avatarUrl?: string;
  cityLevelLocation?: { city: string; region: string; country: string };
  visibility?: MemberProfileVisibility;
};

export type PublicMemberCandidate = {
  profile: MemberProfile;
  consent: readonly ConsentDecision[];
};

export interface MemberProfileRepository {
  findPrivateProfileByMemberId(memberId: string): Promise<MemberProfile | null>;
  savePrivateProfile(input: SaveMemberProfileInput): Promise<MemberProfile>;
  findPublicCandidateByCallsign(callsign: string): Promise<PublicMemberCandidate | null>;
}

export type ConsentDecisionSource = "JOIN_FLOW" | "PROFILE_SETTINGS" | "OPERATOR_REVIEW";

export type AppendConsentDecisionInput = {
  memberId: string;
  purpose: ConsentPurpose;
  status: ConsentStatus;
  policyVersion: string;
  source: ConsentDecisionSource;
  decidedAt?: Date;
};

export type StoredConsentDecision = ConsentDecision & {
  id: string;
  memberId: string;
  source: ConsentDecisionSource;
};

export interface ConsentDecisionRepository {
  listForMember(memberId: string): Promise<readonly StoredConsentDecision[]>;
  append(input: AppendConsentDecisionInput): Promise<StoredConsentDecision>;
}

export class PersistenceConflictError extends Error {
  constructor(readonly field: "identity" | "callsign") {
    super(`A persistent ${field} conflict occurred.`);
    this.name = "PersistenceConflictError";
  }
}

export class PersistenceValidationError extends Error {
  constructor(readonly field: string) {
    super(`Invalid persistence input: ${field}.`);
    this.name = "PersistenceValidationError";
  }
}
