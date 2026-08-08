import type { MemberIdentityRepository, MemberRecord } from "../domain/persistence/member-repositories.ts";

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

export async function associateVerifiedWorkOsUser(
  user: WorkOsIdentityCandidate,
  repository: MemberIdentityRepository,
  observedAt: Date = new Date(),
): Promise<MemberRecord> {
  if (!user.emailVerified) throw new UnverifiedWorkOsEmailError();
  return repository.ensureMemberForVerifiedIdentity({
    provider: "workos",
    providerSubject: user.id,
    verifiedAt: observedAt,
  });
}
