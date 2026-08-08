import type { MemberIdentityRepository, MemberRecord } from "../domain/persistence/member-repositories.ts";
import { parseMemberSignUpState } from "./member-signup-state.ts";

export type WorkOsIdentityCandidate = {
  id: string;
  emailVerified: boolean;
};

export class UnverifiedWorkOsEmailError extends Error {
  constructor() {
    super("A verified WorkOS email is required before member association.");
    this.name = "UnverifiedWorkOsEmailError";
  }
}

export class MissingEligibilityAttestationError extends Error {
  constructor() {
    super("A valid adult eligibility attestation is required for a new member.");
    this.name = "MissingEligibilityAttestationError";
  }
}

export async function associateVerifiedWorkOsUser(
  user: WorkOsIdentityCandidate,
  repository: MemberIdentityRepository,
  options: { observedAt?: Date; state?: string } = {},
): Promise<MemberRecord> {
  if (!user.emailVerified) throw new UnverifiedWorkOsEmailError();
  const existing = await repository.findMemberByIdentity({
    provider: "workos",
    providerSubject: user.id,
  });
  if (existing) return existing;

  const signUpState = parseMemberSignUpState(options.state);
  if (!signUpState) throw new MissingEligibilityAttestationError();
  const observedAt = options.observedAt ?? new Date();
  return repository.ensureMemberForVerifiedIdentity({
    provider: "workos",
    providerSubject: user.id,
    verifiedAt: observedAt,
    ageEligibility: {
      attestedAt: observedAt,
      policyVersion: signUpState.policyVersion,
    },
  });
}
